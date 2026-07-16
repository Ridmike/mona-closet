// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth }      from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage }   from "firebase/storage";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

// Primary app — used for the logged-in admin session
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;

// ── Secondary app ─────────────────────────────────────────────────────────────
// A separate Firebase instance used ONLY for creating new user accounts from the
// admin panel. Signing in/out on this instance never affects the main admin session.
const SECONDARY_APP_NAME = "admin-user-creator";
const secondaryApp =
  getApps().find((a) => a.name === SECONDARY_APP_NAME) ??
  initializeApp(firebaseConfig, SECONDARY_APP_NAME);

export const secondaryAuth = getAuth(secondaryApp);
