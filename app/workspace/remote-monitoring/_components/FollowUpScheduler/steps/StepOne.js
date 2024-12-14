'use client';

import { useState } from 'react';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import { SecondaryButton } from '@/app/_components/global_components';

const callingCodes = [
  { country: 'UK', code: '44', iso2: 'GB' },
  { country: 'FR', code: '33', iso2: 'FR' },
  { country: 'DE', code: '49', iso2: 'DE' },
  { country: 'ES', code: '34', iso2: 'ES' },
  { country: 'CL', code: '56', iso2: 'CL' },
].map(item => ({
  ...item,
  label: `${item.country} (+${item.code})`
}));

const StepOne = ({ 
  organisationDetails, 
  selectedPatients, 
  setSelectedPatients, 
  onNext 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState('44');

  const filteredPatients = organisationDetails?.patientList?.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.customerName.toLowerCase().includes(searchLower) ||
      patient.dateOfBirth.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handlePatientSelect = (patientId) => {
    if (!patientId) return;

    const selectedPatientDetails = organisationDetails?.patientList?.find(
      patient => `${patient.customerName} - ${patient.dateOfBirth}` === patientId
    );

    const newSelectedPatients = new Map(selectedPatients);
    
    if (selectedPatients.has(patientId)) {
      newSelectedPatients.delete(patientId);
    } else {
      let phoneNumber = '';
      let countryCode = selectedCode;

      if (selectedPatientDetails?.phoneNumber) {
        const phoneStr = selectedPatientDetails.phoneNumber.replace(/\D/g, '');
        const matchedCode = callingCodes.find(code => phoneStr.startsWith(code.code));
        if (matchedCode) {
          countryCode = matchedCode.code;
          phoneNumber = phoneStr.substring(matchedCode.code.length);
        } else {
          phoneNumber = phoneStr;
        }
      }

      const countryIso2 = callingCodes.find(c => c.code === countryCode)?.iso2;
      const fullNumber = `+${countryCode}${phoneNumber}`;
      let isValid = false;
      try {
        const parsedPhoneNumber = parsePhoneNumberFromString(fullNumber, countryIso2);
        isValid = parsedPhoneNumber?.isValid() ?? false;
      } catch (error) {
        isValid = false;
      }

      newSelectedPatients.set(patientId, { phoneNumber, countryCode, isValid });
    }
    
    setSelectedPatients(newSelectedPatients);
  };

  const handleNext = () => {
    const isValid = Array.from(selectedPatients.values())
      .every(data => data.phoneNumber.trim() !== '' && data.isValid);

    if (isValid && selectedPatients.size > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text-primary mb-4">Select Patient(s)</h3>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Patient Selection */}
        <div className="space-y-4">
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
          
          <div 
            className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary h-[calc(100vh-400px)] min-h-[300px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            {filteredPatients.length === 0 ? (
              <div className="text-text-secondary italic p-2">
                No patients found
              </div>
            ) : (
              filteredPatients.map((patient, index) => {
                const patientId = `${patient.customerName} - ${patient.dateOfBirth}`;
                const isSelected = selectedPatients.has(patientId);
                return (
                  <div
                    key={index}
                    onClick={() => handlePatientSelect(patientId)}
                    className={`py-2 px-2 cursor-pointer transition-colors duration-150 rounded ${
                      isSelected 
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-bg-main'
                    }`}
                  >
                    {patient.customerName} - {patient.dateOfBirth}
                    {patient.lastScheduled && (
                      <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                        Last Scheduled: {new Date(patient.lastScheduled.date).toLocaleDateString()} {patient.lastScheduled.time}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Selected Patients */}
        <div className="space-y-4">
          <h4 className="text-text-primary font-medium">Selected Patients:</h4>
          {selectedPatients.size === 0 ? (
            <div className="text-text-secondary italic">
              No patients selected yet
            </div>
          ) : (
            <div className="space-y-2 h-[calc(100vh-400px)] min-h-[300px] overflow-y-auto">
              {Array.from(selectedPatients.entries()).map(([patientId, data]) => {
                const patient = filteredPatients.find(
                  p => `${p.customerName} - ${p.dateOfBirth}` === patientId
                );
                return (
                  <div key={patientId} className="flex flex-col gap-2 bg-bg-secondary p-3 rounded border border-border-main">
                    <div className="flex items-center justify-between">
                      <div className="text-text-primary">
                        {patient?.customerName} - {patient?.dateOfBirth}
                      </div>
                      <button
                        onClick={() => {
                          const newSelectedPatients = new Map(selectedPatients);
                          newSelectedPatients.delete(patientId);
                          setSelectedPatients(newSelectedPatients);
                        }}
                        className="text-text-secondary hover:text-text-primary"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <select
                          value={data.countryCode}
                          onChange={(e) => {
                            const newSelectedPatients = new Map(selectedPatients);
                            newSelectedPatients.set(patientId, {
                              ...data,
                              countryCode: e.target.value,
                              isValid: false // Reset validation when country changes
                            });
                            setSelectedPatients(newSelectedPatients);
                          }}
                          className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary w-32"
                        >
                          {callingCodes.map((code) => (
                            <option key={code.code} value={code.code}>
                              {code.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex-1 relative">
                          <input
                            type="tel"
                            value={data.phoneNumber}
                            onChange={(e) => {
                              let newNumber = e.target.value.replace(/[^\d]/g, '');
                              
                              // Remove leading zero if present
                              if (newNumber.startsWith('0')) {
                                newNumber = newNumber.substring(1);
                              }

                              const countryIso2 = callingCodes.find(
                                c => c.code === data.countryCode
                              )?.iso2;

                              // Validate the phone number
                              const fullNumber = `+${data.countryCode}${newNumber}`;
                              let isValid = false;
                              try {
                                const phoneNumber = parsePhoneNumberFromString(fullNumber, countryIso2);
                                isValid = phoneNumber?.isValid() ?? false;
                              } catch (error) {
                                isValid = false;
                              }

                              const newSelectedPatients = new Map(selectedPatients);
                              newSelectedPatients.set(patientId, {
                                ...data,
                                phoneNumber: newNumber,
                                isValid
                              });
                              setSelectedPatients(newSelectedPatients);
                            }}
                            placeholder="Enter phone number"
                            className={`w-full bg-bg-secondary border ${
                              data.phoneNumber && !data.isValid 
                                ? 'border-red-500' 
                                : 'border-border-main'
                            } rounded p-2 text-text-primary`}
                          />
                          {data.phoneNumber && !data.isValid && (
                            <div className="text-red-500 text-sm mt-1">
                              Invalid phone number for selected country
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex justify-end">
            <SecondaryButton
              onClick={handleNext}
              disabled={!selectedPatients.size || Array.from(selectedPatients.values()).some(data => !data.phoneNumber.trim())}
            >
              Next
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOne; 