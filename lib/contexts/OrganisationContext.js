"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from "../firebase/authContext";

export const OrganisationContext = createContext();

export function OrganisationProvider({ children }) {
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [organisationDetails, setOrganisationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!selectedOrgId || !user) {
      setOrganisationDetails(null);
      return;
    }

    const fetchOrganisationDetails = async () => {
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const response = await fetch(
          `${backendUrl}/customer_app_api/organisation_details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({ orgId: selectedOrgId }),
          }
        );
        
        const data = await response.json();
        setOrganisationDetails(data.organisation_details);
      } catch (error) {
        console.error("Error fetching organisation:", error);
        setOrganisationDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisationDetails();
  }, [selectedOrgId, user]);

  return (
    <OrganisationContext.Provider 
      value={{ 
        selectedOrgId, 
        setSelectedOrgId,
        organisationDetails,
        loading 
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
}

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
} 