# Firebase setup for deugro-lucky-draw (Realtime Database)

The app uses Firebase Realtime Database to share the prize pool across devices. Draw is enabled only after cloud sync is ready, so all devices stay consistent.

Steps to enable realtime cross-device updates

1. Create a Firebase project
   - Go to https://console.firebase.google.com and create or select a project.

2. Add a Web app and copy config
   - In Project Settings -> Your apps, add a Web app (if not already). Copy the config values (apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId).

3. Enable Realtime Database
   - In the Firebase console choose Realtime Database -> Create database -> select a location.
   - For testing you can temporarily set the rules to allow reads/writes:

{
  "rules": {
    ".read": true,
    ".write": true
  }
}

  Do NOT leave these rules open in production. See "Security" below.

4. Set environment variables
   - Create a local file named `.env` in the project root (or set environment variables in your hosting platform) and add the keys from `.env.example` with real values.
   - For GitHub Pages, add each `VITE_FIREBASE_*` value as a repository secret under Settings -> Secrets and variables -> Actions. The deployment workflow passes them to the Vite build.

5. Initialize the database initial value (optional)
   - You can open the Realtime Database data view and write the initial `prizePool` JSON:

{
  "🏆 特等奖": 3,
  "🥇 一等奖": 10,
  "🥈 二等奖": 20,
  "🥉 三等奖": 30,
  "🎁 参与奖": 37
}

   - If you do not initialize it, the front-end writes the initial value when it first connects.

6. Install dependencies and run locally
   - npm install
   - npm run dev

7. Test cross-device
   - Open the app on device A and device B. When device A performs a draw and updates the pool, device B will receive realtime updates from the Realtime Database and show the decreased counts.

Security

- Do not commit your Firebase keys to a public repository. Use `.env` (ignored by git) or your hosting provider's environment variable management.
- For production, restrict database writes using Firebase Authentication or limit writes to a trusted backend service. Example rule snippet for authenticated users only:

{
  "rules": {
    "prizePool": {
      ".read": true,
      ".write": "auth != null && auth.token.email.endsWith('@yourdomain.com')"
    }
  }
}

If you want me to also add a deploy workflow (Vercel/Netlify) or write the initial prizePool to database programmatically, tell me and I can add that in a follow-up commit.
