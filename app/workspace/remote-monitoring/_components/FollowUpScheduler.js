'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useAuth } from '../../../../lib/firebase/authContext';
import LoadingSpinner from "../../../_components/LoadingSpinner";
import TwoWeekCalendar from "../../../_components/CalendarPicker";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [objectives, setObjectives] = useState([]);
  const { user } = useAuth();
  const [instructions, setInstructions] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);
  const [scheduledDates, setScheduledDates] = useState([]);
  const [scheduledTimes, setScheduledTimes] = useState({});
  const [selectedCode, setSelectedCode] = useState("44");
  const [phoneError, setPhoneError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    
    // Remove any leading zero
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
    
    // Only allow digits
    value = value.replace(/[^\d]/g, '');
    
    setPhoneNumber(value);
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return organisationDetails?.patientList || [];
    
    return organisationDetails?.patientList?.filter(patient => 
      `${patient.customerName} - ${patient.dateOfBirth}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [organisationDetails?.patientList, searchTerm]);

  const validatePhoneNumber = () => {
    const fullNumber = `+${selectedCode}${phoneNumber}`;
    const phoneNumberObj = parsePhoneNumberFromString(fullNumber);
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      setPhoneError('Invalid phone number for the selected country.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleNext = () => {
    if (validatePhoneNumber()) {
      setCurrentStep(2);
    }
  };

  const handleScheduleCall = async () => {
    try {
      // Get the selected patient details
      const selectedPatientDetails = organisationDetails?.patientList?.find(
        patient => `${patient.customerName} - ${patient.dateOfBirth}` === selectedPatient
      );

      if (!selectedPatientDetails) {
        throw new Error('Selected patient not found');
      }

      const scheduledFor = Array.from(scheduledDates).map(dateStr => ({
        date: dateStr,
        time: scheduledTimes[dateStr] || "10:00"
      }));
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/schedule_call`, {
        // const response = await fetch(`http://localhost:8000/customer_app_api/follow_ups/schedule_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          patientId: selectedPatient,
          patientName: selectedPatientDetails.customerName,
          patientDateOfBirth: selectedPatientDetails.dateOfBirth,
          scheduledFor: scheduledFor,
          objectives: objectives,
          phoneNumber: `+${selectedCode}${phoneNumber}`,
        }),
      });
      
      // Reset form and show success message
      /* setCurrentStep(1);
      setSelectedPatient('');
      setObjectives([]);
      setScheduledDates(new Set());
      setScheduledTimes({}); */

      router.push('/workspace/remote-monitoring');
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  };

  const handlePatientSelect = (e) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);
    
    // Find the selected patient's details
    const selectedPatientDetails = organisationDetails?.patientList?.find(
      patient => `${patient.customerName} - ${patient.dateOfBirth}` === patientId
    );

    // If patient has a stored phone number, pre-populate it
    if (selectedPatientDetails?.phoneNumber) {
      const phoneStr = selectedPatientDetails.phoneNumber.replace(/\D/g, ''); // Remove non-digits
      
      // Check if the number starts with a country code
      const matchedCode = callingCodes.find(code => phoneStr.startsWith(code.code));
      if (matchedCode) {
        setSelectedCode(matchedCode.code);
        setPhoneNumber(phoneStr.substring(matchedCode.code.length));
      } else {
        // If no country code found, default to selected code and full number
        setPhoneNumber(phoneStr);
      }
      
      setPhoneError(''); // Clear any existing errors
    } else {
      // Reset phone fields if no stored number
      setPhoneNumber('');
      setPhoneError('');
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
          'Authorization': `Bearer ${idToken}`,
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
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 1: Select Patient</h3>
          
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients..."
                className="w-full bg-bg-secondary border border-border-main rounded-t p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  ×
                </button>
              )}
            </div>
            
            <select
              value={selectedPatient}
              onChange={handlePatientSelect}
              className="w-full bg-bg-secondary border border-t-0 border-border-main rounded-b p-2 text-text-primary max-h-60 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              size={Math.min(10, filteredPatients.length + 1)}
            >
              <option value="">Select a patient</option>
              {filteredPatients.map((patient, index) => (
                <option 
                  key={index} 
                  value={`${patient.customerName} - ${patient.dateOfBirth}`}
                  className="py-1 px-2 hover:bg-bg-main"
                >
                  {patient.customerName} - {patient.dateOfBirth}
                </option>
              ))}
            </select>
            
            {filteredPatients.length === 0 && searchTerm && (
              <div className="absolute w-full bg-bg-secondary border border-t-0 border-border-main rounded-b p-2 text-text-secondary text-center">
                No patients found
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="bg-bg-secondary border border-r-0 border-border-main rounded-l p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              {callingCodes.map((code) => (
                <option key={code.code} value={code.code}>
                  {code.country}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter phone number"
              className="w-full bg-bg-secondary border border-border-main rounded-r p-2 text-text-primary"
            />
          </div>
          {phoneError && <p className="text-red-500">{phoneError}</p>}
          <div className="flex justify-end mt-6">
            <SecondaryButton
              onClick={handleNext}
              disabled={!selectedPatient || !phoneNumber.trim()}
            >
              Next
            </SecondaryButton>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-text-primary mb-6">Step 2: Generate Objectives or Set them manually</h3>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Instructions */}
            <div>
              <label className="block text-text-primary font-medium mb-2">Instructions:</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="John has bacterial pneumonia. I\'m prescribing amoxicillin 500mg three times a day for 7 days, along with bed rest and increased fluid intake."
                className="w-full h-48 bg-bg-secondary border border-border-main rounded p-2 text-text-primary mb-2"
              />
              <div className="flex justify-end">
                <ActiveButton
                  onClick={handleGenerateObjectives}
                  disabled={!instructions.trim() || isGeneratingObjectives}
                >
                  Generate Objectives
                </ActiveButton>
              </div>
            </div>

            {/* Right Column - Objectives List */}
            <div className="relative min-h-[16rem]">
              <label className="block text-text-primary font-medium mb-2">Objectives:</label>
              {isGeneratingObjectives && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/50 z-10 rounded">
                  <LoadingSpinner />
                </div>
              )}
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index] = e.target.value;
                        setObjectives(newObjectives);
                      }}
                      className="bg-bg-secondary border border-border-main p-2 rounded flex-grow"
                    />
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

          <div className="flex justify-between mt-8">
            <SecondaryButton 
              onClick={() => setCurrentStep(1)}
              className="text-lg px-6 py-3"
            >
              Back
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setCurrentStep(3)}
              disabled={objectives.length === 0}
              className="text-lg px-6 py-3"
            >
              Confirm Objectives
            </SecondaryButton>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 3: Schedule Calls</h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <TwoWeekCalendar 
                onDatesSelect={(selectedDates) => {
                  setScheduledDates(selectedDates);
                  const newTimes = { ...scheduledTimes };
                  selectedDates.forEach(dateStr => {
                    if (!newTimes[dateStr]) {
                      newTimes[dateStr] = "10:00";
                    }
                  });
                  setScheduledTimes(newTimes);
                }}
                selectedDates={scheduledDates}
              />
            </div>
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-4">Selected Follow-up Times:</h4>
              <div className="space-y-2">
                {Array.from(scheduledDates).map((dateStr) => (
                  <div 
                    key={dateStr} 
                    className="flex items-center justify-between bg-bg-secondary p-3 rounded border border-border-main"
                  >
                    <span>
                      {new Date(dateStr).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={scheduledTimes[dateStr] || "10:00"}
                        onChange={(e) => {
                          setScheduledTimes({
                            ...scheduledTimes,
                            [dateStr]: e.target.value
                          });
                        }}
                        className="bg-bg-secondary border border-border-main rounded px-2 py-1 text-text-primary w-24"
                      />
                      <button
                        onClick={() => {
                          const newDates = new Set(scheduledDates);
                          newDates.delete(dateStr);
                          setScheduledDates(newDates);
                          const newTimes = { ...scheduledTimes };
                          delete newTimes[dateStr];
                          setScheduledTimes(newTimes);
                        }}
                        className="text-text-secondary hover:text-text-primary ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {scheduledDates.size === 0 && (
                  <div className="text-text-secondary italic">
                    No dates selected yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <SecondaryButton onClick={() => setCurrentStep(2)}>
              Back
            </SecondaryButton>
            <ActiveButton
              onClick={handleScheduleCall}
              disabled={!scheduledDates.size}
            >
              Schedule Follow-ups
            </ActiveButton>
          </div>
        </div>
      )}
    </div>
  );
};
