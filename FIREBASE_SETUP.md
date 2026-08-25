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

4. Configure Firebase for all devices (recommended)
   - Edit `public/firebase-config.js` and fill your Firebase web config.
   - This file is loaded at runtime by the browser, so GitHub Pages works without requiring Actions secrets.
   - Required fields: `apiKey`, `databaseURL`, `projectId`.

   Example:

{
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
}

   - Optional alternative: keep using `VITE_FIREBASE_*` environment variables.

5. Initialize the database initial value (optional)
   - You can open the Realtime Database data view and write the initial `prizePool` JSON:

{
   "🏆 特等奖": 1,
   "🥇 一等奖": 2,
   "🥈 二等奖": 3,
   "🥉 三等奖": 37,
   "🎁 参与奖": 57
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
