"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/firebase/authContext";
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { useUser } from '../../../../lib/contexts/UserContext';
import { TeamMembers } from '../_components/TeamMembers';
import { PatientList } from '../_components/PatientList';

const OrganisationDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedOrgId, organisationDetails, loading } = useOrganisation();
  const { userDetails, loading: userLoading } = useUser();
  const [patientList, setPatientList] = useState([]);

  useEffect(() => {
    if (!selectedOrgId) {
      router.push('/workspace');
    }
  }, [selectedOrgId, router]);

  useEffect(() => {
    const fetchPatientList = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/get_patient_list`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ orgId: selectedOrgId }),
          }
        );
        const data = await response.json();
        setPatientList(data.patientList);
      } catch (error) {
        console.error("Failed to fetch patient list", error);
      }
    };

    if (selectedOrgId) {
      fetchPatientList();
    }
  }, [selectedOrgId, user]);

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

  const handleUploadPatientList = async (file, columnMapping) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("orgId", selectedOrgId);
    formData.append("nameColumn", columnMapping.nameColumn);
    formData.append("dobColumn", columnMapping.dobColumn);

    const idToken = await user.getIdToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/upload_patient_list`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      }
    );
    const data = await response.json();
    if (data.success) {
      setPatientList(data.patientList);
      return true;
    }
    throw new Error("Failed to update patient list");
  };

  if (!selectedOrgId) return null;
  if (loading) return <div>Loading...</div>;
  if (!organisationDetails) return <div>Organisation not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">{organisationDetails.name}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
            <div className="text-gray-600">
              <p>{organisationDetails.address.addressLine1}</p>
              {organisationDetails.address.addressLine2 && <p>{organisationDetails.address.addressLine2}</p>}
              <p>{organisationDetails.address.city}, {organisationDetails.address.postcode}</p>
              <p>{organisationDetails.address.country}</p>
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Registered Numbers</h2>
            <ul className="text-gray-600">
              {organisationDetails.registeredNumbers.map((number, index) => (
                <li key={index}>{number}</li>
              ))}
            </ul>
          </section>

          <TeamMembers 
            organisationDetails={organisationDetails}
            onInviteMember={handleInviteMember}
          />

          <PatientList 
            patientList={patientList}
            onUploadList={handleUploadPatientList}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganisationDashboard; 