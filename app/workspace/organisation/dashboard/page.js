"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/firebase/authContext";
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { useUser } from '../../../../lib/contexts/UserContext';
import { TeamMembers } from '../_components/TeamMembers';
import { PatientList } from '../_components/PatientList';
import { Settings } from '../_components/Settings';

const OrganisationDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    selectedOrgId, 
    organisationDetails, 
    loading, 
    refreshOrganisationDetails: refreshDetails
  } = useOrganisation();
  const { userDetails, loading: userLoading } = useUser();

  useEffect(() => {
    if (!selectedOrgId) {
      router.push('/workspace');
    }
  }, [selectedOrgId, router]);

  const handleInviteMember = async (email) => {
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
          body: JSON.stringify({ orgId: selectedOrgId, email, role: "viewer" }),
        }
      );
      
      const data = await response.json();
      if (data.invitation_message === "success") {
        alert("Invitation sent successfully!");
      } else {
        alert(data.message || "Failed to send invitation");
      }
    } catch (error) {
      alert("Failed to send invitation");
    }
  };

  const handleUploadPatientList = async (patients) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/upload_patient_list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ 
            orgId: selectedOrgId,
            patient_list: patients
          }),
        }
      );

      const data = await response.json();
      if (data.upload_message === "success") {
        if (typeof refreshDetails === 'function') {
          await refreshDetails();
        } else {
          console.warn('Refresh function not available');
          // Optionally reload the page as fallback
          window.location.reload();
        }
        return true;
      }
      throw new Error(data.message || "Failed to update patient list");
    } catch (error) {
      console.error("Failed to upload patient list:", error);
      throw error;
    }
  };

  const handleUpdateSettings = async (settings) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/update_organisation_settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ 
            organisationId: selectedOrgId,
            settings 
          }),
        }
      );

      const data = await response.json();
      if (data.update_message === "success") {
        if (typeof refreshDetails === 'function') {
          await refreshDetails();
        } else {
          console.warn('Refresh function not available');
          // Optionally reload the page as fallback
          window.location.reload();
        }
        alert("Settings updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings");
    }
  };

  if (!selectedOrgId) return null;
  if (loading) return <div>Loading...</div>;
  if (!organisationDetails) return <div>Organisation not found</div>;

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-bg-elevated rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2 text-text-primary">
            {organisationDetails.name}
          </h1>
          <p className="text-text-secondary">
            {organisationDetails.address.addressLine1}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Card */}
          <div className="bg-bg-elevated rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Address</h2>
            <div className="text-text-secondary">
              <p>{organisationDetails.address.addressLine1}</p>
              {organisationDetails.address.addressLine2 && (
                <p>{organisationDetails.address.addressLine2}</p>
              )}
              <p>{organisationDetails.address.city}, {organisationDetails.address.postcode}</p>
            </div>
          </div>

          {/* Registered Numbers Card */}
          <div className="bg-bg-elevated rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Registered Numbers</h2>
            <div className="text-text-secondary">
              {organisationDetails.registeredNumbers.map((number, index) => (
                <p key={index}>{number}</p>
              ))}
            </div>
          </div>

          {/* Team Members Section */}
          <div className="md:col-span-2">
            <TeamMembers 
              organisationDetails={organisationDetails}
              onInviteMember={handleInviteMember}
            />
          </div>

          {/* Patient List Section */}
          <div className="md:col-span-2">
            <PatientList 
              patientList={organisationDetails.patientList || []}
              onUploadList={handleUploadPatientList}
            />
          </div>

          {/* Settings Section */}
          <div className="md:col-span-2 mt-6">
            <Settings 
              organisationDetails={organisationDetails}
              onUpdateSettings={handleUpdateSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationDashboard; 