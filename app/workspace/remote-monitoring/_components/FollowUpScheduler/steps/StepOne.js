'use client';

import { useState } from 'react';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import { SecondaryButton } from '@/app/_components/global_components';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { PatientTable } from '@/app/_components/tables/PatientTable';

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
  const { t } = useLanguage();
  const [selectedCode, setSelectedCode] = useState('44');

  const handlePatientSelect = (patientId) => {
    if (!patientId) return;

    const selectedPatientDetails = organisationDetails?.patientList?.find(
      patient => patient.id === patientId
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
    <div className="flex flex-col h-full space-y-4">
      <h3 className="text-lg font-medium text-text-primary mb-4">
        {t('workspace.remoteMonitoring.stepOne.title')}
      </h3>
      
      <div className="flex-1">
        <PatientTable 
          patients={organisationDetails?.patientList || []}
          visibleColumns={['customerName', 'dateOfBirth', 'phoneNumber', 'lastScheduled']}
          showSearch={true}
          selectable={true}
          selectedPatients={selectedPatients}
          onPatientSelect={(patientId) => {
            const patient = organisationDetails?.patientList?.find(p => p.id === patientId);
            if (patient?.phoneNumber) {
              handlePatientSelect(patientId);
            }
          }}
          renderCell={(patient, field) => {
            if (field === 'lastScheduled' && patient.lastScheduled) {
              try {
                const date = typeof patient.lastScheduled === 'string' 
                  ? parseISO(patient.lastScheduled)
                  : patient.lastScheduled?.toDate?.()
                  || new Date(patient.lastScheduled);
                
                return format(date, 'dd/MM/yyyy HH:mm');
              } catch (error) {
                return '';
              }
            }
            return undefined;
          }}
          customRowClassName={(patient) => 
            !patient.phoneNumber ? 'opacity-50 cursor-not-allowed' : ''
          }
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border-main">
        <div className="text-text-secondary">
          {selectedPatients.size} {t('workspace.remoteMonitoring.stepOne.selectedCount')}
        </div>
        <SecondaryButton
          onClick={handleNext}
          disabled={!selectedPatients.size || Array.from(selectedPatients.values()).some(data => !data.phoneNumber.trim())}
        >
          {t('workspace.remoteMonitoring.stepOne.nextButton')}
        </SecondaryButton>
      </div>
    </div>
  );
};

export default StepOne; 