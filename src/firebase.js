import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredFirebaseEnvironment = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
];

const missingFirebaseEnvironment = requiredFirebaseEnvironment
  .filter(([, value]) => typeof value !== "string" || value.trim() === "")
  .map(([name]) => name);

if (missingFirebaseEnvironment.length > 0) {
  throw new Error(
    "Firebase configuration is missing. Set these Vite variables before starting or building Growthify: " +
      missingFirebaseEnvironment.join(", "),
  );
}

export const firebaseConfigured = true;
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firebaseApp = app;
export const auth = getAuth(app);
export const db = getFirestore(app);
