"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../lib/firebase/authContext";
import { useOrganisation } from '../../../../../lib/contexts/OrganisationContext';

const OrganisationDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedOrgId, organisationDetails, loading } = useOrganisation();
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (!selectedOrgId) {
      router.push('/workbench');
    }
  }, [selectedOrgId, router]);

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
          body: JSON.stringify({ orgId: selectedOrgId, email: inviteEmail, role: "viewer" }),
        }
      );
      
      setInviteEmail("");
      const data = await response.json();
      if (data.invitation_message === "success") {
        alert("Invitation sent successfully!");
      } else {
        setError(data.message || "Failed to send invitation");
      }
    } catch (error) {
      alert("Failed to send invitation");
    }
  };

  if (!selectedOrgId) return null;
  if (loading) return <div>Loading...</div>;
  if (!organisationDetails) return <div>Organisation not found</div>;

  return (
    <div>
      <header>
        <h1>{organisationDetails.name}</h1>
      </header>

      <div>
        <section>
          <h2>Address</h2>
          <p>{organisationDetails.address.addressLine1}</p>
          {organisationDetails.address.addressLine2 && <p>{organisationDetails.address.addressLine2}</p>}
          <p>{organisationDetails.address.city}, {organisationDetails.address.postcode}</p>
          <p>{organisationDetails.address.country}</p>
        </section>

        <section>
          <h2>Registered Numbers</h2>
          <ul>
            {organisationDetails.registeredNumbers.map((number, index) => (
              <li key={index}>{number}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Team Members</h2>
          <div>
            {organisationDetails.members.map((member) => (
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