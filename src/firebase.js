import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const runtimeFirebaseConfig = globalThis.window?.__FIREBASE_CONFIG__ || {};

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseConfig = {
  apiKey: envFirebaseConfig.apiKey || runtimeFirebaseConfig.apiKey || "",
  authDomain: envFirebaseConfig.authDomain || runtimeFirebaseConfig.authDomain || "",
  databaseURL: envFirebaseConfig.databaseURL || runtimeFirebaseConfig.databaseURL || "",
  projectId: envFirebaseConfig.projectId || runtimeFirebaseConfig.projectId || "",
  storageBucket: envFirebaseConfig.storageBucket || runtimeFirebaseConfig.storageBucket || "",
  messagingSenderId:
    envFirebaseConfig.messagingSenderId || runtimeFirebaseConfig.messagingSenderId || "",
  appId: envFirebaseConfig.appId || runtimeFirebaseConfig.appId || "",
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId
);

let firebaseApp = null;

if (hasFirebaseConfig) {
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export const database = firebaseApp ? getDatabase(firebaseApp) : null;
