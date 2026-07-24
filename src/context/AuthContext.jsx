import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check for admin privileges in three different ways:
        // 1. Fallback / configured admin emails — Check synchronously first to short-circuit network requests!
        const adminEmails = ["admin@medstore.com", "admin@example.com"];
        const emailIsAdmin = u.email && adminEmails.includes(u.email.toLowerCase());

        if (emailIsAdmin) {
          // If fallback admin email, short-circuit and set immediately, avoiding expensive network requests
          setIsAdmin(true);
        } else {
          // For other users, parallelize Custom Claims and Firestore document checks using Promise.all to avoid sequential awaits!
          try {
            const [tokenResult, userDoc] = await Promise.all([
              getIdTokenResult(u).catch((err) => {
                console.error("Error fetching token claims:", err);
                return null;
              }),
              getDoc(doc(db, "users", u.uid)).catch((err) => {
                console.error("Error fetching user document:", err);
                return null;
              }),
            ]);

            const claimIsAdmin = tokenResult && (tokenResult.claims?.admin === true || tokenResult.claims?.role === "admin");
            const docIsAdmin = userDoc && userDoc.exists() && userDoc.data()?.role === "admin";

            setIsAdmin(!!(claimIsAdmin || docIsAdmin));
          } catch (err) {
            console.error("Error in parallel privilege verification flow:", err);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const u = credential.user;

    // Default role based on email or general user
    const adminEmails = ["admin@medstore.com", "admin@example.com"];
    const role = email && adminEmails.includes(email.toLowerCase()) ? "admin" : "user";

    // Initialize user profile in Firestore
    await setDoc(doc(db, "users", u.uid), {
      email: u.email,
      role: role,
      createdAt: new Date().toISOString(),
    });

    return credential;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
