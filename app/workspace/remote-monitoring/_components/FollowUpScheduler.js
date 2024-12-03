'use client';

import { useState } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useAuth } from '../../../../lib/firebase/authContext';
import LoadingSpinner from "../../../_components/LoadingSpinner";


export const FollowUpScheduler = () => {
  const { organisationDetails } = useOrganisation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const { user } = useAuth();
  const [instructions, setInstructions] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);

  const handleScheduleCall = async () => {

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/schedule_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          patientId: selectedPatient,
          scheduledFor: scheduledDateTime,
          objectives: objectives,
          questions: questions.map(q => q.text),
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();
      
      // Reset form and show success message
      setCurrentStep(1);
      setSelectedPatient('');
      setObjectives([]);
      setQuestions([]);
      setScheduledDateTime('');
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  };

  const handleGenerateObjectives = async () => {
    if (!instructions.trim()) return;
    
    setIsGeneratingObjectives(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/generate_objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ instructions }),
      });
      
      const data = await response.json();
      setObjectives(data.generated_objectives);
    } catch (error) {
      console.error('Error generating objectives:', error);
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-bg-elevated rounded-lg p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-text-primary">Schedule Follow-up Call</h2>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-primary-blue' : 'bg-border-main'}`} />
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 1: Select Patient</h3>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
          >
            <option value="">Select a patient</option>
            {organisationDetails?.patientList?.map((patient, index) => (
              <option key={index} value={patient.id}>
                {patient.customerName} - {patient.dateOfBirth}
              </option>
            ))}
          </select>
          <div className="flex justify-end mt-6">
            <ActiveButton
              onClick={() => setCurrentStep(2)}
              disabled={!selectedPatient}
            >
              Next
            </ActiveButton>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 2: Set Instructions & Objectives</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column - Instructions */}
            <div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter instructions..."
                className="w-full h-48 bg-bg-secondary border border-border-main rounded p-2 text-text-primary mb-4"
              />
              <div>
                <ActiveButton
                  onClick={handleGenerateObjectives}
                  disabled={!instructions.trim() || isGeneratingObjectives}
                >
                  Generate Objectives
                </ActiveButton>
              </div>
            </div>

            {/* Right Column - Objectives List */}
            <div className="relative">
              {isGeneratingObjectives && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/50">
                  <LoadingSpinner />
                </div>
              )}
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="bg-bg-secondary border border-border-main p-2 rounded flex-grow">
                      {objective}
                    </div>
                    <button
                      onClick={() => {
                        setObjectives(objectives.filter((_, i) => i !== index));
                      }}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add new objective..."
                  className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setObjectives([...objectives, e.target.value.trim()]);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <SecondaryButton onClick={() => setCurrentStep(1)}>
              Back
            </SecondaryButton>
            <ActiveButton
              onClick={() => setCurrentStep(3)}
              disabled={objectives.length === 0}
            >
              Next
            </ActiveButton>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 3: Schedule Call</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
            />
          </div>

          <div className="flex justify-between mt-6">
            <SecondaryButton onClick={() => setCurrentStep(2)}>
              Back
            </SecondaryButton>
            <ActiveButton
              onClick={handleScheduleCall}
              disabled={!scheduledDateTime || !phoneNumber.trim()}
            >
              Schedule Follow-up
            </ActiveButton>
          </div>
        </div>
      )}
    </div>
  );
};
