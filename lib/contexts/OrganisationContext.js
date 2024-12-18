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
  const [orgDetailsLoading, setOrgDetailsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { userDetails, loading: userLoading } = useUser();

  const isLoading = loading || orgDetailsLoading;

  useEffect(() => {
    const fetchOrganisations = async () => {
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
        const backendUrl = "https://keep-me-company-backend-b450f889ef90.herokuapp.com";
        const response = await fetch(
          `${backendUrl}/customer_app_api/user_organisations`,
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
        console.log(data);
        setOrganisations(data.organisations || []);
        
        if (data.organisations?.length > 0 && !selectedOrgId) {
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
  }, [user, userDetails, authLoading, userLoading, selectedOrgId]);

  // Fetch org details when selectedOrgId changes
  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (!selectedOrgId || !user) {
        setOrganisationDetails(null);
        return;
      }

      setOrgDetailsLoading(true);
      try {
        const idToken = await user.getIdToken();
        const backendUrl = "https://keep-me-company-backend-b450f889ef90.herokuapp.com";

        const response = await fetch(
          `${backendUrl}/customer_app_api/organisation_details`,
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
      } finally {
        setOrgDetailsLoading(false);
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
        loading: isLoading 
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