# 86 Your Dignity — Hapa × Motomaki Holiday Showdown

A mobile-friendly, live multiplayer trivia game with 20 questions, automatic timed reveals, synchronized leaderboards, and private host controls.

## Easiest deployment (Render + GitHub)

1. Upload all files in this folder to a **private GitHub repository** (keep `public/`, `server.js`, `questions.json`, `package.json`, and `render.yaml` in the root).
2. Sign in at https://dashboard.render.com and choose **New > Blueprint**, connect the repository, and apply `render.yaml`. Alternatively create a **Web Service**, Node runtime, build command `npm install`, start command `npm start`.
3. Choose a **paid Starter instance** for the party so the service doesn't sleep. Set the environment variable `HOST_PIN` to a strong secret PIN/password. Never share it with players.
4. Wait for deployment and open the Render URL (such as `https://your-service.onrender.com`). The QR code will automatically use your live domain.
5. Player link: `https://YOUR-DOMAIN/`. Host controls: `https://YOUR-DOMAIN/?host`. Big-screen display: `https://YOUR-DOMAIN/?screen`.
6. Test with 3+ phones and a laptop before the event. Use one host browser tab to control the game and a separate projector tab for the screen.

## Local test

Requires Node.js 20+.

```bash
npm install
HOST_PIN=your-secret npm start
```

Then visit http://localhost:3000/?host and enter your secret. Other devices on the same network can join using your computer's local IP instead of localhost.

## Gameplay

- Players choose nickname and restaurant/location in the lobby.
- Host presses **Start Game**. New players cannot join once the game begins.
- Each question has 20 seconds; correct answers score 50–100% of base points depending on response speed.
- Host can reveal an answer early, then click **Next Question**. Questions auto-reveal after 20 seconds.
- Last four questions are double points.
- The projector page displays the question and live leaderboard.
- Host **Reset Game** clears the lobby and all scores.

## Customizing

Edit `questions.json` to change questions, correct answer index (0=A, 1=B, 2=C, 3=D), round names, and point values. Update the `<select id="team">` in `public/app.js` to match your exact locations. Add official logos after obtaining approved logo assets.

## Important limitations

This is a ready-to-deploy source project, **not yet hosted**. Game state is held in the Node process's memory: restarting or redeploying loses players and scores. Run **one instance only**; do not enable multiple replicas or autoscaling. For large crowds or guaranteed persistence, add a shared database (e.g. Redis) and Socket.IO adapter. A host PIN protects controls, but this is intended for a friendly party, not high-stakes anti-cheat competition. Player reconnect IDs are saved in browser local storage; players should avoid switching browsers during the game. Test venue Wi-Fi/cellular coverage and display connectivity beforehand.
