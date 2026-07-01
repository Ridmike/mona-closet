// scripts/seed-admin.ts
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Load .env file manually
try {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.substring(0, separatorIndex).trim();
    const value = trimmed.substring(separatorIndex + 1).trim();
    process.env[key] = value;
  });
  console.log("Loaded .env variables successfully.");
} catch (error) {
  console.error("Error reading .env file:", error);
}

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seedAdmin() {
  const email = "admin@monascloset.lk";
  const password = "MonaAdmin2026!";
  
  console.log(`Seeding Admin: ${email}...`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: "Mona Owner",
      phone: "0771234567",
      role: "Owner",
      createdAt: new Date(),
    });
    
    console.log("✅ Owner admin account successfully created!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️ Admin email already exists in Firebase Auth. Attempting to sign in and update Firestore document...");
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: "Mona Owner",
          phone: "0771234567",
          role: "Owner",
          createdAt: new Date(),
        });
        
        console.log("✅ Owner admin Firestore document successfully updated!");
        process.exit(0);
      } catch (signInError: any) {
        console.error("❌ Failed to sign in and update Firestore document:", signInError);
        process.exit(1);
      }
    } else {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    }
  }
}

seedAdmin();
