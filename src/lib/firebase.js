import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these with the values from your Firebase project settings
// (Project settings -> General -> Your apps -> SDK setup and configuration)
const firebaseConfig = {
  apiKey: "AIzaSyA0JbwtUDXXUNQzGFL4KpmSCAPRn1wniAY",
  authDomain: "medishop-skkve.firebaseapp.com",
  databaseURL: "https://medishop-skkve-default-rtdb.firebaseio.com",
  projectId: "medishop-skkve",
  storageBucket: "medishop-skkve.firebasestorage.app",
  messagingSenderId: "570352320082",
  appId: "1:570352320082:web:85a2850399f360fc3de98b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
