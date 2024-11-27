"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../lib/firebase/authContext";
import { useOrganisation } from '../../../../../lib/contexts/OrganisationContext';

const OrganisationDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedOrgId } = useOrganisation();
  const [organisation, setOrganisation] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (!selectedOrgId) {
      router.push('/workbench');
      return;
    }

    const fetchOrganisationDetails = async () => {
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
        setOrganisation(data.organisation_details);
        setMembers(data.organisation_details.members);
      } catch (error) {
        console.error("Error fetching organisation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisationDetails();
  }, [selectedOrgId, user, router]);

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/organisation_invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ orgId: selectedOrgId, email: inviteEmail }),
        }
      );
      
      setInviteEmail("");
      alert("Invitation sent successfully!");

    } catch (error) {
      alert("Failed to send invitation");
    }
  };

  if (!selectedOrgId) return null;
  if (loading) return <div>Loading...</div>;
  if (!organisation) return <div>Organisation not found</div>;

  return (
    <div>
      <header>
        <h1>{organisation.name}</h1>
      </header>

      <div>
        <section>
          <h2>Address</h2>
          <p>{organisation.address.addressLine1}</p>
          {organisation.address.addressLine2 && <p>{organisation.address.addressLine2}</p>}
          <p>{organisation.address.city}, {organisation.address.postcode}</p>
          <p>{organisation.address.country}</p>
        </section>

        <section>
          <h2>Registered Numbers</h2>
          <ul>
            {organisation.registeredNumbers.map((number, index) => (
              <li key={index}>{number}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Team Members</h2>
          <div>
            {members.map((member) => (
              <div key={member.id}>
                <img 
                  src={member.photoURL || "/default-avatar.png"} 
                />
                <div>
                  <h3>{member.name} {member.surname} - {member.email}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
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
        </section>
      </div>
    </div>
  );
};

export default OrganisationDashboard; 