"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";
import { useOrganisation } from '../../../lib/contexts/OrganisationContext';

const WorkbenchDashboard = () => {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const { setSelectedOrgId } = useOrganisation();

  useEffect(() => {
    const fetchOrganisations = async () => {
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
        console.log(data);
        setOrganisations(data.organisations);
      } catch (error) {
        console.error("Error fetching organisations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, [user]);

  const handleOrgClick = (orgId) => {
    setSelectedOrgId(orgId);
    router.push('/workbench/organisations/dashboard');
  };

  return (
    <div className="dashboard">
      <h1>Your Organisations</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="org-grid">
          {organisations.map((org) => (
            <div key={org.id} className="org-card" onClick={() => handleOrgClick(org.id)}>
              <h3>{org.name}</h3>
              <p>{org.address.city}, {org.address.country}</p>
              {/* <p>Role: {org.members.find(member => member.member === user.uid)?.role || 'Unknown'}</p> */}
            </div>
          ))}
        </div>
      )}
      <button   
        onClick={() => router.push("/workbench/organisations/create")}
      >
        Create New Organization
      </button>
    </div>
  );
};

export default WorkbenchDashboard; 