'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganisation } from '../../../../../lib/contexts/OrganisationContext';
import { useAuth } from '../../../../../lib/firebase/authContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import CallTypeSelector from './steps/CallTypeSelector';
import { scheduleCall } from './api';

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
  const [presetName, setPresetName] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(null);

  // Add this to the existing state declarations (around line 31-40)
  const [isCallingNow, setIsCallingNow] = useState(false);

  const handleScheduleCall = async () => {
    setIsScheduling(true);
    try {
      const patients = Array.from(selectedPatients.entries()).map(([patientId]) => ({
        patientId: patientId
      }));

      const scheduledFor = Array.from(scheduledDates).map(dateStr => ({
        date: dateStr,
        time: scheduledTimes[dateStr] || "10:00"
      }));

      const { success, error } = await scheduleCall({
        organisationId: organisationDetails.id,
        patients,
        objectives,
        scheduledFor,
        user
      });

      if (success) {
        router.push('/workspace/remote-monitoring');
      } else {
        throw error;
      }
    } catch (error) {
      console.error(t('workspace.remoteMonitoring.scheduler.errors.schedulingError'), error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCallNow = async () => {
    if (isCallingNow) return;
    setIsCallingNow(true);
    
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = currentDate.toTimeString().slice(0, 5);
    
    const dates = new Set([dateStr]);
    const times = { [dateStr]: timeStr };
    
    setScheduledDates(dates);
    setScheduledTimes(times);
    
    try {
      setIsScheduling(true);
      const patients = Array.from(selectedPatients.entries()).map(([patientId]) => ({
        patientId: patientId
      }));

      const scheduledFor = [{
        date: dateStr,
        time: timeStr
      }];

      const { success, error } = await scheduleCall({
        organisationId: organisationDetails.id,
        patients,
        objectives,
        scheduledFor,
        user
      });

      if (success) {
        router.push('/workspace/remote-monitoring');
      } else {
        throw error;
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
          organisationDetails={organisationDetails}
          user={user}
          selectedPresetIndex={selectedPresetIndex}
          setSelectedPresetIndex={setSelectedPresetIndex}
          setPresetName={setPresetName}
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
    </div>
  );
};