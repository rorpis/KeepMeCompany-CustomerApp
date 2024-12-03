"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../firebase/authContext";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Wait for everything to be ready
      const backendUrl = "https://keep-me-company-backend-b450f889ef90.herokuapp.com";
      console.log("backend url", process.env.NEXT_PUBLIC_BACKEND_URL);
      if (authLoading || !user || !backendUrl) {
        return;
      }

      try {
        setLoading(true);
        const idToken = await user.getIdToken();
        // const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        // Double check URL is available
        if (!backendUrl) {
          console.error('Backend URL is still not available');
          return;
        }

        const response = await fetch(
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

        const data = await response.json();
        setUserDetails(data.user_details);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure environment variables are loaded
    const timeoutId = setTimeout(fetchUserDetails, 100);

    return () => clearTimeout(timeoutId);
  }, [user, authLoading]);

  // Reset states when user is not available
  useEffect(() => {
    if (!user) {
      setUserDetails(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ userDetails, loading: authLoading || loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 