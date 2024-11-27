"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../lib/firebase/authContext";

const OrganisationDashboard = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [organisation, setOrganisation] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    const fetchOrganisationDetails = async () => {
      try {
        const idToken = await user.getIdToken();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const response = await fetch(
          `${backendUrl}/customer_app_api/organisations/${id}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'include',
          }
        );
        
        const data = await response.json();
        setOrganisation(data.organisation);
        setMembers(data.members);
      } catch (error) {
        console.error("Error fetching organisation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisationDetails();
  }, [id, user]);

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/organisations/${id}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ email: inviteEmail }),
        }
      );
      
      if (response.ok) {
        setInviteEmail("");
        alert("Invitation sent successfully!");
      }
    } catch (error) {
      alert("Failed to send invitation");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!organisation) return <div>Organisation not found</div>;

  return (
    <div className="org-dashboard">
      <header className="org-header">
        <h1>{organisation.name}</h1>
        <div className="org-actions">
          <button onClick={() => router.push(`/workbench/organisations/${id}/settings`)}>
            Settings
          </button>
        </div>
      </header>

      <div className="org-details">
        <section className="address-section">
          <h2>Address</h2>
          <p>{organisation.addressLine1}</p>
          {organisation.addressLine2 && <p>{organisation.addressLine2}</p>}
          <p>{organisation.city}, {organisation.postcode}</p>
          <p>{organisation.country}</p>
        </section>

        <section className="numbers-section">
          <h2>Registered Numbers</h2>
          <ul>
            {organisation.registeredNumbers.map((number, index) => (
              <li key={index}>{number}</li>
            ))}
          </ul>
        </section>

        <section className="members-section">
          <h2>Team Members</h2>
          <div className="invite-member">
            <form onSubmit={handleInviteMember}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite"
              />
              <button type="submit">Send Invite</button>
            </form>
          </div>
          
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-card">
                <img 
                  src={member.photoURL || "/default-avatar.png"} 
                  alt={member.displayName} 
                  className="member-avatar"
                />
                <div className="member-info">
                  <h3>{member.displayName || member.email}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrganisationDashboard; 