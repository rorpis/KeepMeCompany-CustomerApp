"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined' && auth) {
          unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true);
            if (user) {
              setUser(user);
              setEmailVerified(user.emailVerified);
            } else {
              setUser(null);
              setEmailVerified(false);
            }
            setLoading(false);
          }, (error) => {
            console.error("Auth state change error:", error);
            setError(error);
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
