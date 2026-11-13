const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const QRCode=require('qrcode');
const path=require('path');
const crypto=require('crypto');
const app=express();const server=http.createServer(app);const io=new Server(server,{cors:{origin:false}});
app.use(express.static(path.join(__dirname,'public')));
const PIN=process.env.HOST_PIN||'change-me-before-deploy';
const questions=require('./questions.json');
let players=new Map(),phase='lobby',index=-1,deadline=0,answers=new Map(),timer=null;
const publicPlayer=p=>({id:p.id,name:p.name,team:p.team,score:p.score,connected:p.connected});
const leaderboard=()=>[...players.values()].map(publicPlayer).sort((a,b)=>b.score-a.score);
function state(){return {phase,index,total:questions.length,question:index>=0?{text:questions[index].text,options:questions[index].options,round:questions[index].round,points:questions[index].points}:null,deadline,leaderboard:leaderboard(),answered:answers.size,correct:phase==='reveal'&&index>=0?questions[index].correct:null};}
function broadcast(){io.emit('state',state());}
function clearTimer(){if(timer)clearTimeout(timer);timer=null;}
function reveal(){if(phase!=='question')return;clearTimer();phase='reveal';broadcast();}
function startQuestion(){clearTimer();if(index+1>=questions.length){phase='finished';broadcast();return;}index++;phase='question';answers=new Map();deadline=Date.now()+20000;broadcast();timer=setTimeout(reveal,20050);}
function hostAuth(socket,pin){if(typeof pin!=='string'||!crypto.timingSafeEqual(Buffer.from(pin.padEnd(128).slice(0,128)),Buffer.from(PIN.padEnd(128).slice(0,128))))return false;socket.data.host=true;return true;}
io.on('connection',socket=>{
 socket.emit('state',state());
 socket.on('host:auth',(pin,cb)=>{const ok=hostAuth(socket,pin);cb?.({ok});});
 socket.on('host:action',(action,cb)=>{if(!socket.data.host)return cb?.({error:'Unauthorized'});if(action==='start'&&(phase==='lobby'||phase==='reveal'))startQuestion();else if(action==='reveal')reveal();else if(action==='next'&&phase==='reveal')startQuestion();else if(action==='reset'){clearTimer();players=new Map();answers=new Map();phase='lobby';index=-1;deadline=0;broadcast();}else return cb?.({error:'Action not available'});cb?.({ok:true});});
 socket.on('player:join',(data,cb)=>{if(phase==='finished')return cb?.({error:'Game has finished'});const name=String(data?.name||'').trim().slice(0,24),team=String(data?.team||'').trim().slice(0,35);if(!name||!team)return cb?.({error:'Enter a nickname and location'});let id=String(data?.id||'');let p=players.get(id);if(!p){if(phase!=='lobby')return cb?.({error:'Joining closes when the game starts'});if([...players.values()].some(p=>p.name.toLowerCase()===name.toLowerCase()))return cb?.({error:'Nickname already taken'});id=crypto.randomUUID();p={id,name,team,score:0,connected:true};players.set(id,p);}else{p.connected=true;}socket.data.playerId=id;socket.join('player:'+id);cb?.({ok:true,id});broadcast();});
 socket.on('player:answer',(choice,cb)=>{const id=socket.data.playerId,p=players.get(id);if(!p||phase!=='question'||Date.now()>deadline||answers.has(id))return cb?.({error:'Answer closed or already submitted'});if(!Number.isInteger(choice)||choice<0||choice>3)return cb?.({error:'Invalid choice'});const q=questions[index],remaining=Math.max(0,deadline-Date.now());const gained=choice===q.correct?Math.round(q.points*(0.5+0.5*remaining/20000)):0;p.score+=gained;answers.set(id,choice);cb?.({ok:true,correct:choice===q.correct,gained});broadcast();});
 socket.on('disconnect',()=>{const p=players.get(socket.data.playerId);if(p){p.connected=false;broadcast();}});
});
app.get('/api/qr',async(req,res)=>{try{const url=`${req.protocol}://${req.get('host')}/`;const data=await QRCode.toDataURL(url,{width:350,margin:1});res.json({data,url});}catch{res.status(500).json({error:'QR unavailable'});}});
server.listen(process.env.PORT||3000,()=>console.log('Holiday showdown listening'));
