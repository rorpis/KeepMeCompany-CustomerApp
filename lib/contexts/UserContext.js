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
      if (authLoading || !user) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const idToken = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/user_details`,
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

    fetchUserDetails();
  }, [user, authLoading]);

  return (
    <UserContext.Provider value={{ userDetails, loading }}>
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