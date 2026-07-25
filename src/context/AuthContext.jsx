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
        // 1. Fallback / configured admin emails
        const adminEmails = ["admin@medstore.com", "admin@example.com"];
        const emailIsAdmin = u.email && adminEmails.includes(u.email.toLowerCase());

        if (emailIsAdmin) {
          // Optimization: If user is already identified as admin by their fallback email,
          // we can set isAdmin synchronously, short-circuit the async checks,
          // and save up to 2 expensive network calls (token claims and firestore getDoc).
          setIsAdmin(true);
        } else {
          // Optimization: Execute both asynchronous checks in parallel using Promise.all,
          // reducing the overall latency from (t1 + t2) to max(t1, t2).
          let claimIsAdmin = false;
          let docIsAdmin = false;

          const claimsPromise = getIdTokenResult(u)
            .then((tokenResult) => {
              if (tokenResult.claims.admin === true || tokenResult.claims.role === "admin") {
                claimIsAdmin = true;
              }
            })
            .catch((err) => {
              console.error("Error fetching token claims:", err);
            });

          const docPromise = getDoc(doc(db, "users", u.uid))
            .then((userDoc) => {
              if (userDoc.exists() && userDoc.data().role === "admin") {
                docIsAdmin = true;
              }
            })
            .catch((err) => {
              console.error("Error fetching user document:", err);
            });

          await Promise.all([claimsPromise, docPromise]);
          setIsAdmin(claimIsAdmin || docIsAdmin);
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
