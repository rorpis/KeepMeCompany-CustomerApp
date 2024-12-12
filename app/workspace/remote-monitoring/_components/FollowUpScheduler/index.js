 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganisation } from '../../../../../lib/contexts/OrganisationContext';
import { useAuth } from '../../../../../lib/firebase/authContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import PresetModal from './PresetModal';
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';

const callingCodes = [
  { code: "44", country: "UK (+44)" },
  { code: "33", country: "FR (+33)" },
  { code: "34", country: "ES (+34)" },
  { code: "49", country: "DE (+49)" },
  { code: "56", country: "CL (+56)" }
];

export const FollowUpScheduler = () => {
  const router = useRouter();
  const { organisationDetails } = useOrganisation();
  const { user } = useAuth();
  
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState(new Map());
  const [objectives, setObjectives] = useState([]);
  const [scheduledDates, setScheduledDates] = useState(new Set());
  const [scheduledTimes, setScheduledTimes] = useState({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [instructions, setInstructions] = useState('');
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);

  // Preset related state
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(null);

  const handleSavePreset = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/save_preset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          title: presetName,
          objectives: objectives,
        }),
      });

      if (response.ok) {
        setShowPresetModal(false);
        setPresetName('');
      }
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  };

  const handleEditPreset = async () => {
    try {
      const updatedPresets = [...organisationDetails.settings.remoteMonitoring.presets];
      updatedPresets[selectedPresetIndex] = {
        title: presetName,
        objectives: objectives,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/update_presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          presets: updatedPresets,
        }),
      });

      if (response.ok) {
        setShowPresetModal(false);
        setPresetName('');
        setIsEditingPreset(false);
        setSelectedPresetIndex(null);
      }
    } catch (error) {
      console.error('Error updating preset:', error);
    }
  };

  const handleDeletePreset = async (presetIndex) => {
    if (!window.confirm('Are you sure you want to delete this preset?')) return;

    try {
      const updatedPresets = [...organisationDetails.settings.remoteMonitoring.presets];
      updatedPresets.splice(presetIndex, 1);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/update_presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          presets: updatedPresets,
        }),
      });

      if (response.ok) {
        setSelectedPresetIndex(null);
        setObjectives([]);
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  };

  const handleScheduleCall = async () => {
    setIsScheduling(true);
    try {
      const patients = Array.from(selectedPatients.entries()).map(([patientId, data]) => {
        const patientDetails = organisationDetails?.patientList?.find(
          patient => `${patient.customerName} - ${patient.dateOfBirth}` === patientId
        );
        return {
          patientId,
          patientName: patientDetails.customerName,
          patientDateOfBirth: patientDetails.dateOfBirth,
          phoneNumber: `+${data.countryCode}${data.phoneNumber}`
        };
      });

      const scheduledFor = Array.from(scheduledDates).map(dateStr => ({
        date: dateStr,
        time: scheduledTimes[dateStr] || "10:00"
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/schedule_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          patients,
          objectives,
          scheduledFor
        }),
      });

      if (response.ok) {
        router.push('/workspace/remote-monitoring');
      }
    } catch (error) {
      console.error('Error scheduling calls:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-bg-elevated rounded-lg p-8">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-semibold text-text-primary">Schedule Follow-up Call</h2>
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full ${currentStep >= 1 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-4 h-4 rounded-full ${currentStep >= 2 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-4 h-4 rounded-full ${currentStep >= 3 ? 'bg-primary-blue' : 'bg-border-main'}`} />
        </div>
      </div>

      {currentStep === 1 && (
        <StepOne
          organisationDetails={organisationDetails}
          selectedPatients={selectedPatients}
          setSelectedPatients={setSelectedPatients}
          onNext={() => setCurrentStep(2)}
          callingCodes={callingCodes}
        />
      )}

      {currentStep === 2 && (
        <StepTwo
          objectives={objectives}
          setObjectives={setObjectives}
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
          onShowPresetModal={() => setShowPresetModal(true)}
          organisationDetails={organisationDetails}
          user={user}
          selectedPresetIndex={selectedPresetIndex}
          setSelectedPresetIndex={setSelectedPresetIndex}
          setPresetName={setPresetName}
          setIsEditingPreset={setIsEditingPreset}
          handleDeletePreset={handleDeletePreset}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          instructions={instructions}
          setInstructions={setInstructions}
          isGeneratingObjectives={isGeneratingObjectives}
          setIsGeneratingObjectives={setIsGeneratingObjectives}
        />
      )}

      {currentStep === 3 && (
        <StepThree
          scheduledDates={scheduledDates}
          setScheduledDates={setScheduledDates}
          scheduledTimes={scheduledTimes}
          setScheduledTimes={setScheduledTimes}
          onBack={() => setCurrentStep(2)}
          onSchedule={handleScheduleCall}
          isScheduling={isScheduling}
        />
      )}

      {showPresetModal && (
        <PresetModal
          presetName={presetName}
          setPresetName={setPresetName}
          isEditingPreset={isEditingPreset}
          objectives={objectives}
          onClose={() => {
            setShowPresetModal(false);
            setPresetName('');
            setIsEditingPreset(false);
          }}
          onSave={handleSavePreset}
          onUpdate={handleEditPreset}
        />
      )}
    </div>
  );
};