"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./config";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const setupUser = async (firebaseUser) => {
    try {
      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend configuration error');
      }

      const idToken = await firebaseUser.getIdToken();
      
      try {
        const checkUserResponse = await fetch(
          `${backendUrl}/customer_app_api/user_details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'include',
          }
        );

        if (!checkUserResponse.ok) {
          const signupResponse = await fetch(`${backendUrl}/customer_app_api/user_signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              userInfo: {
                email: firebaseUser.email,
                name: firebaseUser.displayName?.split(' ')[0] || '',
                surname: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              }
            })
          });

          if (!signupResponse.ok) {
            throw new Error('Backend service unavailable');
          }
        }

        setUser(firebaseUser);
        setEmailVerified(firebaseUser.emailVerified);
      } catch (backendError) {
        console.error("Backend error:", backendError);
        router.push('/error');
        setUser(null);
      }
    } catch (error) {
      console.error("User setup error:", error);
      setError(error);
      router.push('/error');
      setUser(null);
    }
  };

  useEffect(() => {
    let unsubscribe;
    
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined' && auth) {
          unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            await setupUser(firebaseUser);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setEmailVerified(false);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide loading and error states to consumers
  const value = {
    user,
    loading,
    emailVerified,
    error,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
