"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../firebase/authContext";

const OrganisationContext = createContext();

export const OrganisationProvider = ({ children }) => {
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [organisationDetails, setOrganisationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch list of organizations
  useEffect(() => {
    const fetchOrganisations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const response = await fetch(
          `${backendUrl}/customer_app_api/user_organisations`,
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({}),
          }
        );
        
        const data = await response.json();
        setOrganisations(data.organisations);
        
        // Set default selected org if not already set
        if (!selectedOrgId && data.organisations.length > 0) {
          setSelectedOrgId(data.organisations[0].id);
        }
      } catch (error) {
        console.error("Error fetching organisations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, [user]);

  // Fetch organization details when selectedOrgId changes
  useEffect(() => {
    const fetchOrganisationDetails = async () => {
      if (!selectedOrgId || !user) {
        setOrganisationDetails(null);
        return;
      }

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
        console.log("organisation details: ", data.organisation_details)
        setOrganisationDetails(data.organisation_details);
      } catch (error) {
        console.error("Error fetching organisation details:", error);
        setOrganisationDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisationDetails();
  }, [selectedOrgId, user]);

  // Get basic org info from the list
  const selectedOrg = organisations.find(org => org.id === selectedOrgId);

  const refreshOrganisationDetails = async () => {
    if (!selectedOrgId || !user) return;
    
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
      console.error("Error refreshing organisation details:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    organisations,
    selectedOrgId,
    setSelectedOrgId,
    organisationDetails,
    loading,
    refreshOrganisationDetails
  };

  // Don't render children until loading is complete
  if (loading) {
    return null;
  }

  return (
    <OrganisationContext.Provider value={value}>
      {children}
    </OrganisationContext.Provider>
  );
};

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error("useOrganisation must be used within an OrganisationProvider");
  }
  return context;
} 