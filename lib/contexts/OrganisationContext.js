"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../firebase/authContext";
import { useUser } from "./UserContext";

const OrganisationContext = createContext();

export function OrganisationProvider({ children }) {
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [organisationDetails, setOrganisationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { userDetails, loading: userLoading } = useUser();

  useEffect(() => {
    const fetchOrganisations = async () => {
      // Don't fetch if auth/user is still loading or there's no user
      if (authLoading || userLoading || !user || !userDetails) {
        setOrganisations([]);
        setSelectedOrgId(null);
        setOrganisationDetails(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const idToken = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/user_organisations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({}),
          }
        );

        const data = await response.json();
        setOrganisations(data.organisations || []);
        
        // Set selected org if there's only one
        if (data.organisations?.length === 1) {
          setSelectedOrgId(data.organisations[0].id);
        }
      } catch (error) {
        console.error("Error fetching organisations:", error);
        setOrganisations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, [user, userDetails, authLoading, userLoading]);

  // Fetch org details when selectedOrgId changes
  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (!selectedOrgId || !user) {
        setOrganisationDetails(null);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/organisation_details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ orgId: selectedOrgId }),
            credentials: 'include',
          }
        );

        const data = await response.json();
        setOrganisationDetails(data.organisation_details);
      } catch (error) {
        console.error("Error fetching organisation details:", error);
        setOrganisationDetails(null);
      }
    };

    fetchOrgDetails();
  }, [selectedOrgId, user]);

  return (
    <OrganisationContext.Provider 
      value={{ 
        organisations, 
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

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
}; 