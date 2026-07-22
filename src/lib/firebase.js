import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = {
  ...(typeof process !== "undefined" ? process.env : {}),
  ...import.meta.env
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKey_FallbackForPreviewOnly123",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "medstore.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://medstore-demo.firebaseio.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "medstore-demo",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "medstore-demo.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890abcdef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
