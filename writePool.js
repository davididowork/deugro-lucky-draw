// writePool.js
// Usage (workflow will run):
// node writePool.js <DATABASE_URL>

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const svcPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(svcPath)) {
  console.error('Missing serviceAccountKey.json in repository root. The GitHub Actions workflow will create it from repo secret.');
  process.exit(1);
}

const databaseURL = process.argv[2];
if (!databaseURL) {
  console.error('Please pass the Realtime Database URL as the first argument.');
  process.exit(1);
}

const serviceAccount = require(svcPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
});

const db = admin.database();

const initialPool = {
  "🏆 特等奖": 3,
  "🥇 一等奖": 10,
  "🥈 二等奖": 20,
  "🥉 三等奖": 30,
  "🎁 参与奖": 37
};

async function writeInitialPool() {
  try {
    await db.ref('prizePool').set(initialPool);
    console.log('✅ Wrote /prizePool:', JSON.stringify(initialPool, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Write failed:', err);
    process.exit(2);
  }
}

writeInitialPool();
