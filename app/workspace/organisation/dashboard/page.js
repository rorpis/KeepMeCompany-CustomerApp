"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/firebase/authContext";
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { useUser } from '../../../../lib/contexts/UserContext';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import { TeamMembers } from '../_components/TeamMembers';
import { PatientList } from '../_components/patients/PatientList';
import { Settings } from '../_components/Settings';
import { Credits } from '../_components/Credits';

const OrganisationDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    selectedOrgId, 
    organisationDetails, 
    loading, 
    refreshOrganisationDetails
  } = useOrganisation();
  const { userDetails, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState('general');
  const [isPatientListLoading, setIsPatientListLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);

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
          body: JSON.stringify({ organisationId: selectedOrgId, invitedEmail: email, invitedRole: "viewer" }),
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
        const result = {
          stats: data.stats,
          success: true,
          refreshOrganisationDetails
        };
        
        return result;
      }
      throw new Error(data.message || "Failed to update patient list");
    } catch (error) {
      console.error("Failed to upload patient list:", error);
      return {
        success: false,
        error: error.message
      };
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
        if (typeof refreshOrganisationDetails === 'function') {
          await refreshOrganisationDetails();
        } else {
          console.warn('Refresh function not available');
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

  const handleAddPatient = async (patientData) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/add_single_patient`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ 
            orgId: selectedOrgId,
            patient: patientData
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.message === "success") {
        return { 
          success: true,
          patientId: data.patientId 
        };
      }
      
      throw new Error(data.error || data.message || "Failed to add patient");
    } catch (error) {
      console.error("Failed to add patient:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleEditSinglePatient = async (patientId, patientData) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/edit_single_patient`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ 
            orgId: selectedOrgId,
            patient: patientData,
            patientId: patientId
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.message === "success") {
        return { success: true };
      }
      
      throw new Error(data.error || data.message || "Failed to update patient");
    } catch (error) {
      console.error("Failed to update patient:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleDeletePatients = async (patientIds) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/delete_patients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            orgId: selectedOrgId,
            patientIds: Array.isArray(patientIds) ? patientIds : [patientIds]
          })
        }
      );

      const data = await response.json();
      if (data.message === "success") {
        return { success: true };
      }
      throw new Error(data.message || "Failed to delete patient(s)");
    } catch (error) {
      console.error("Failed to delete patient(s):", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleTabChange = async (tabName) => {
    setIsTabLoading(true);
    setActiveTab(tabName);
    
    // If switching to patients tab, we need to wait for the next render cycle
    // to ensure the loading state is displayed
    if (tabName === 'patients') {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    setIsTabLoading(false);
  };

  if (!selectedOrgId) return null;
  if (loading) return <div>{t('workspace.organisation.dashboard.loading')}</div>;
  if (!organisationDetails) return <div>{t('workspace.organisation.dashboard.notFound')}</div>;

  return (
    <div className="bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-border-main mb-6">
          <button
            onClick={() => handleTabChange('general')}
            className={`pb-2 px-4 ${
              activeTab === 'general'
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('workspace.organisation.dashboard.tabs.general')}
          </button>
          <button
            onClick={() => handleTabChange('patients')}
            className={`pb-2 px-4 ${
              activeTab === 'patients'
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('workspace.organisation.dashboard.tabs.patients')}
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`pb-2 px-4 ${
              activeTab === 'settings'
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('workspace.organisation.dashboard.tabs.settings')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Tab Content */}
          {activeTab === 'general' && (
            <>
              {/* Address Card */}
              <div className="bg-bg-elevated rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">
                  {organisationDetails.name}
                </h2>
                <div className="text-text-secondary">
                  <p>{organisationDetails.address.addressLine1}</p>
                  {organisationDetails.address.addressLine2 && (
                    <p>{organisationDetails.address.addressLine2}</p>
                  )}
                  <p>{organisationDetails.address.city}, {organisationDetails.address.country}</p>
                </div>
              </div>

              {/* Registered Numbers Card */}
              <div className="bg-bg-elevated rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">
                  {t('workspace.organisation.dashboard.registeredNumbers.title')}
                </h2>
                <div className="text-text-secondary">
                  {organisationDetails.registeredNumbers?.length > 0 ? (
                    organisationDetails.registeredNumbers.map((number, index) => (
                      <p key={index}>{number}</p>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <p>{t('workspace.organisation.dashboard.registeredNumbers.none')}</p>
                      <p className="text-sm">{t('workspace.organisation.dashboard.registeredNumbers.description')}</p>
                      <button
                        onClick={() => router.push('/workspace/phone-numbers/purchase')}
                        className="px-4 py-2 text-sm bg-primary-blue hover:bg-primary-blue/80 text-white rounded-md transition-colors duration-200"
                      >
                        {t('workspace.intake.purchaseNumber')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Credits Section */}
              <div className="md:col-span-2">
                <Credits credits={organisationDetails.credits || 0} />
              </div>

              {/* Team Members Section */}
              <div className="md:col-span-2">
                <TeamMembers 
                  organisationDetails={organisationDetails}
                  onInviteMember={handleInviteMember}
                />
              </div>
            </>
          )}

          {/* Patients Tab Content */}
          {activeTab === 'patients' && (
            <div className="md:col-span-2">
              {(isTabLoading || isPatientListLoading) ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-blue"></div>
                </div>
              ) : (
                <PatientList 
                  patientList={organisationDetails.patientList || []}
                  onUploadList={handleUploadPatientList}
                  onAddPatient={handleAddPatient}
                  onEditPatient={handleEditSinglePatient}
                  onDeletePatient={handleDeletePatients}
                  isLoading={isPatientListLoading}
                />
              )}
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className="md:col-span-2">
              <Settings 
                organisationDetails={organisationDetails}
                onUpdateSettings={handleUpdateSettings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationDashboard; 