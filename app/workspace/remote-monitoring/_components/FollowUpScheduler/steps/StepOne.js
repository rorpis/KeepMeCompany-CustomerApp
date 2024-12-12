'use client';

import { useState } from 'react';
import { SecondaryButton } from '@/app/_components/global_components';

const callingCodes = [
  { country: 'UK', code: '44' },
  { country: 'US', code: '1' },
  // Add more country codes as needed
];

const StepOne = ({ 
  organisationDetails, 
  selectedPatients, 
  setSelectedPatients, 
  onNext 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState('44');
  const [selectionMode, setSelectionMode] = useState('single');

  // Filter patients based on search term
  const filteredPatients = organisationDetails?.patientList?.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.customerName.toLowerCase().includes(searchLower) ||
      patient.dateOfBirth.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handlePatientSelect = (e) => {
    const patientId = e.target.value;
    if (!patientId) return;

    // Find the selected patient's details
    const selectedPatientDetails = organisationDetails?.patientList?.find(
      patient => `${patient.customerName} - ${patient.dateOfBirth}` === patientId
    );

    let phoneNumber = '';
    let countryCode = selectedCode;

    // If patient has a stored phone number, pre-populate it
    if (selectedPatientDetails?.phoneNumber) {
      const phoneStr = selectedPatientDetails.phoneNumber.replace(/\D/g, ''); // Remove non-digits
      
      // Check if the number starts with a country code
      const matchedCode = callingCodes.find(code => phoneStr.startsWith(code.code));
      if (matchedCode) {
        countryCode = matchedCode.code;
        phoneNumber = phoneStr.substring(matchedCode.code.length);
      } else {
        // If no country code found, default to selected code and full number
        phoneNumber = phoneStr;
      }
    }

    const newSelectedPatients = new Map();
    newSelectedPatients.set(patientId, { phoneNumber, countryCode });
    setSelectedPatients(newSelectedPatients);
  };

  const handleNext = () => {
    // Validate that all selected patients have phone numbers
    const isValid = Array.from(selectedPatients.values())
      .every(data => data.phoneNumber.trim() !== '');

    if (isValid && selectedPatients.size > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text-primary mb-4">Step 1: Select Patient(s)</h3>
      
      <div className="flex space-x-4 border-b border-border-main mb-6">
        <button
          onClick={() => {
            setSelectionMode('single');
            setSelectedPatients(new Map());
          }}
          className={`pb-2 px-4 ${
            selectionMode === 'single'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Single Patient
        </button>
        <button
          onClick={() => {
            setSelectionMode('multiple');
            setSelectedPatients(new Map());
          }}
          className={`pb-2 px-4 ${
            selectionMode === 'multiple'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Multiple Patients
        </button>
      </div>

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
          value={selectionMode === 'single' ? Array.from(selectedPatients.keys())[0] || '' : ''}
          onChange={selectionMode === 'single' ? handlePatientSelect : undefined}
          multiple={selectionMode === 'multiple'}
          className="w-full bg-bg-secondary border border-t-0 border-border-main rounded-b p-2 text-text-primary max-h-60 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          size={Math.min(10, filteredPatients.length + 1)}
          onClick={(e) => {
            if (selectionMode === 'multiple') {
              const option = e.target;
              const patientId = option.value;
              if (!patientId) return;

              const newSelectedPatients = new Map(selectedPatients);
              if (selectedPatients.has(patientId)) {
                newSelectedPatients.delete(patientId);
              } else {
                // Find the selected patient's details
                const selectedPatientDetails = organisationDetails?.patientList?.find(
                  patient => `${patient.customerName} - ${patient.dateOfBirth}` === patientId
                );

                let phoneNumber = '';
                let countryCode = selectedCode;

                // If patient has a stored phone number, pre-populate it
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

                newSelectedPatients.set(patientId, { phoneNumber, countryCode });
              }
              setSelectedPatients(newSelectedPatients);
            }
          }}
        >
          <option value="">Select a patient</option>
          {filteredPatients.map((patient, index) => (
            <option 
              key={index} 
              value={`${patient.customerName} - ${patient.dateOfBirth}`}
              className="py-1 px-2 hover:bg-bg-main"
            >
              {patient.customerName} - {patient.dateOfBirth}
              {patient.lastScheduled && (
                ` | (Last Scheduled: ${new Date(patient.lastScheduled.date).toLocaleDateString()} ${patient.lastScheduled.time})`
              )}
            </option>
          ))}
        </select>
      </div>

      {selectionMode === 'single' ? (
        selectedPatients.size > 0 && (
          <div className="space-y-4">
            {Array.from(selectedPatients.entries()).map(([patientId, data]) => (
              <div key={patientId} className="flex items-center gap-4">
                <select
                  value={data.countryCode}
                  onChange={(e) => {
                    const newSelectedPatients = new Map(selectedPatients);
                    newSelectedPatients.set(patientId, {
                      ...data,
                      countryCode: e.target.value
                    });
                    setSelectedPatients(newSelectedPatients);
                  }}
                  className="bg-bg-secondary border border-r-0 border-border-main rounded-l p-2 text-text-primary"
                >
                  {callingCodes.map((code) => (
                    <option key={code.code} value={code.code}>
                      {code.country}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={data.phoneNumber}
                  onChange={(e) => {
                    const newSelectedPatients = new Map(selectedPatients);
                    newSelectedPatients.set(patientId, {
                      ...data,
                      phoneNumber: e.target.value.replace(/[^\d]/g, '')
                    });
                    setSelectedPatients(newSelectedPatients);
                  }}
                  placeholder="Enter phone number"
                  className="flex-1 bg-bg-secondary border border-border-main rounded-r p-2 text-text-primary"
                />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <SecondaryButton
                onClick={handleNext}
                disabled={!selectedPatients.size || Array.from(selectedPatients.values()).some(data => !data.phoneNumber.trim())}
              >
                Next
              </SecondaryButton>
            </div>
          </div>
        )
      ) : (
        <div className="mt-4 space-y-6">
          {selectedPatients.size > 0 && (
            <div className="space-y-4">
              <h4 className="text-text-primary font-medium">Selected Patients:</h4>
              <div className="space-y-2">
                {Array.from(selectedPatients.entries()).map(([patientId, data]) => {
                  const patient = filteredPatients.find(
                    p => `${p.customerName} - ${p.dateOfBirth}` === patientId
                  );
                  return (
                    <div key={patientId} className="flex items-center gap-4 bg-bg-secondary p-3 rounded border border-border-main">
                      <div className="flex-grow">
                        {patient?.customerName} - {patient?.dateOfBirth}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={data.countryCode}
                          onChange={(e) => {
                            const newSelectedPatients = new Map(selectedPatients);
                            newSelectedPatients.set(patientId, {
                              ...data,
                              countryCode: e.target.value
                            });
                            setSelectedPatients(newSelectedPatients);
                          }}
                          className="bg-bg-secondary border border-r-0 border-border-main rounded-l p-2 text-text-primary"
                        >
                          {callingCodes.map((code) => (
                            <option key={code.code} value={code.code}>
                              {code.country}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={data.phoneNumber}
                          onChange={(e) => {
                            const newSelectedPatients = new Map(selectedPatients);
                            newSelectedPatients.set(patientId, {
                              ...data,
                              phoneNumber: e.target.value.replace(/[^\d]/g, '')
                            });
                            setSelectedPatients(newSelectedPatients);
                          }}
                          placeholder="Enter phone number"
                          className="w-40 bg-bg-secondary border border-border-main rounded-r p-2 text-text-primary"
                        />
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
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end mt-4">
                <SecondaryButton
                  onClick={handleNext}
                  disabled={!selectedPatients.size || Array.from(selectedPatients.values()).some(data => !data.phoneNumber.trim())}
                >
                  Next
                </SecondaryButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepOne; 