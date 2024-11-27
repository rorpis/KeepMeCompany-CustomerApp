"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";

const WorkbenchDashboard = () => {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const idToken = await user.getIdToken();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const response = await fetch(
          `${backendUrl}/customer_app_api/user_organisations`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'include',
          }
        );
        
        const data = await response.json();
        setOrganisations(data.organisations);
      } catch (error) {
        console.error("Error fetching organisations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, [user]);

  return (
    <div className="dashboard">
      <h1>Your Organizations</h1>
      
      <button 
        className="create-org-button"
        onClick={() => router.push("/workbench/organisations/create")}
      >
        Create New Organization
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="org-grid">
          {organisations.map((org) => (
            <div key={org.id} className="org-card" onClick={() => router.push(`/workbench/organisations/${org.id}`)}>
              <h3>{org.name}</h3>
              <p>{org.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkbenchDashboard; 