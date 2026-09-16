import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, isFallback } from "../lib/firebase";

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

  // Optimization: Memoize authentication functions to maintain stable references
  // across components and prevent downstream consumers from re-rendering.
  const signup = useCallback(async (email, password) => {
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
  }, []);

  const login = useCallback((email, password) =>
    signInWithEmailAndPassword(auth, email, password), []);

  const loginWithGoogle = useCallback(async () => {
    if (isFallback) {
      // Fallback demo user for local preview when live API keys are unavailable
      const fakeUser = {
        uid: "google-demo-user-123",
        email: "demo.user@google.com",
        displayName: "Google Demo User",
        photoURL: "https://lh3.googleusercontent.com/a/default-user",
      };
      setUser(fakeUser);
      setIsAdmin(false);
      return { user: fakeUser };
    }

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;

    // Sync user doc in Firestore if it doesn't exist yet
    try {
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const adminEmails = ["admin@medstore.com", "admin@example.com"];
        const role = u.email && adminEmails.includes(u.email.toLowerCase()) ? "admin" : "user";
        await setDoc(userRef, {
          email: u.email,
          displayName: u.displayName || "",
          photoURL: u.photoURL || "",
          role: role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Could not sync Google user profile to Firestore:", err);
    }

    return result;
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  // Optimization: Memoize the entire context value object. Without this, a new object reference
  // is created on every render, triggering rendering in all components consuming AuthContext.
  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  }), [user, isAdmin, loading, signup, login, loginWithGoogle, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
