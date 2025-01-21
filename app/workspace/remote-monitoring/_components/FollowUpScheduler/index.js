'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganisation } from '../../../../../lib/contexts/OrganisationContext';
import { useAuth } from '../../../../../lib/firebase/authContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import PresetModal from './PresetModal';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import CallTypeSelector from './steps/CallTypeSelector';

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
  const { t } = useLanguage();
  
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

  // Add this to the existing state declarations (around line 31-40)
  const [isCallingNow, setIsCallingNow] = useState(false);

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
      console.error(t('workspace.remoteMonitoring.scheduler.errors.savingPresetError'), error);
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
      console.error(t('workspace.remoteMonitoring.scheduler.errors.updatingPresetError'), error);
    }
  };

  const handleDeletePreset = async (presetIndex) => {
    if (!window.confirm(t('workspace.remoteMonitoring.scheduler.deletePresetConfirm'))) return;

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
      console.error(t('workspace.remoteMonitoring.scheduler.errors.deletingPresetError'), error);
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

      console.log(scheduledFor);

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
      console.error(t('workspace.remoteMonitoring.scheduler.errors.schedulingError'), error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCallNow = async () => {
    if (isCallingNow) return; // Prevent multiple clicks
    setIsCallingNow(true);
    
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = currentDate.toTimeString().slice(0, 5);
    
    // Create the scheduled data
    const dates = new Set([dateStr]);
    const times = { [dateStr]: timeStr };
    
    // Set the state
    setScheduledDates(dates);
    setScheduledTimes(times);
    
    // Create the scheduledFor array directly instead of relying on state
    const scheduledFor = Array.from(dates).map(date => ({
      date: date,
      time: times[date]
    }));
    
    // Call handleScheduleCall with the data we just created
    try {
      setIsScheduling(true);
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
      console.error(t('workspace.remoteMonitoring.scheduler.errors.schedulingError'), error);
    } finally {
      setIsScheduling(false);
      setIsCallingNow(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-bg-elevated rounded-lg p-8">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-semibold text-text-primary">
          {t('workspace.remoteMonitoring.scheduler.title')}
        </h2>
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full ${currentStep >= 1 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-4 h-4 rounded-full ${currentStep >= 2 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-4 h-4 rounded-full ${currentStep >= 3 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-4 h-4 rounded-full ${currentStep >= 4 ? 'bg-primary-blue' : 'bg-border-main'}`} />
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
        <CallTypeSelector
          onCallNow={handleCallNow}
          onSchedule={() => setCurrentStep(4)}
          isCallingNow={isCallingNow}
        />
      )}

      {currentStep === 4 && (
        <StepThree
          scheduledDates={scheduledDates}
          setScheduledDates={setScheduledDates}
          scheduledTimes={scheduledTimes}
          setScheduledTimes={setScheduledTimes}
          onBack={() => setCurrentStep(3)}
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