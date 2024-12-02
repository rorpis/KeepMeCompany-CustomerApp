'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import StepFrame from './_shared_components/step_frame';
import { PopupMessage } from '@/app/_components/global_components';

import Register from './_stages/1-register/register';
import PracticeDetails from './_stages/2-practice-details/practice-details';
import { DataSharingAgreement } from './_stages/3-setup/data-sharing-agreement';
import { PatientData } from './_stages/3-setup/patient-data';
import { Telephony } from './_stages/3-setup/telephony';
import { EmergencyProtocol } from './_stages/3-setup/emergency-protocol';



const STAGES = [
  {
    title: 'Create Your Account',
    Component: Register,
    skippable: true,
    requirements: {
      fields: ['name', 'email', 'password'],
      customChecks: []
    }
  },
  {
    title: 'Practice Details',
    Component: PracticeDetails,
    skippable: true,
    requirements: {
      checks: [
        {
          check: (data) => !!data.practiceName?.trim(),
          message: 'Practice name is required'
        },
        {
          check: (data) => !!data.role?.trim(),
          message: 'Role selection is required'
        }
      ]
    }
  },
  {
    title: 'Please provide your Data Protection Officer (DPO) details',
    Component: DataSharingAgreement,
    skippable: true,
    requirements: {
      fields: ['name', 'phone', 'email'],
      customChecks: []
    }
  },
  {
    title: 'If you signed the agreement, please upload your patient list',
    Component: PatientData,
    skippable: true,
    requirements: {
      checks: [
        {
          check: (data) => !!data.file,
          message: 'Please upload a patient data file'
        }
      ]
    }
  },
  {
    title: 'Your Telephony should look like this',
    Component: Telephony,
    skippable: true,
    requirements: {
      fields: [],
      customChecks: []
    }
  },
  {
    title: 'Emergency Protocol',
    Component: EmergencyProtocol,
    skippable: true,
    requirements: {
      checks: [
        {
          check: (data) => !!data.confirmed,
          message: 'Please confirm the emergency protocol'
        }
      ]
    },
    isLastStep: true
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    register: {
      name: '',
      email: '',
      password: ''
    },
    practiceDetails: {
      practiceName: '',
      practiceSize: '',
      practiceAddress: '',
      role: ''
    },
    dataSharingAgreement: {
      name: '',
      phone: '',
      email: ''
    },
    patientData: {
      file: null,
      preview: { headers: [], rows: [] },
      foundColumns: [],
      selectedColumns: {}
    },
    telephony: {
      called: false
    }
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  const updateFormData = (stage, data) => {
    setFormData(prev => ({
      ...prev,
      [stage]: { ...prev[stage], ...data }
    }));
  };
  
  const handleNext = () => {
    if (currentIndex < STAGES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/triage-dashboard');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const { title, Component, skippable } = STAGES[currentIndex];
  const isLastStage = currentIndex === STAGES.length - 1;

  const getStageKey = (Component) => {
    return Component.name.toLowerCase();
  };

  const handleDataShareComplete = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePatientDataSuccess = () => {
    handleShowPopup("Your file looks good!", "success");
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 2000);
  };

  const handleTelephonySuccess = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleShowPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {showPopup && (
        <PopupMessage
          message={popupMessage}
          type={popupType}
          onClose={() => setShowPopup(false)}
        />
      )}
      <StepFrame
        title={title}
        onNext={handleNext}
        onBack={currentIndex > 0 ? handleBack : undefined}
        showSkip={skippable}
        data={formData[getStageKey(Component)]}
        requirements={STAGES[currentIndex].requirements}
        hideNextButton={Component === DataSharingAgreement}
      >
        <div 
          key={currentIndex}
          className="animate-fade-in"
        >
          <Component 
            data={formData[getStageKey(Component)]}
            updateData={(data) => updateFormData(getStageKey(Component), data)}
            onSuccess={
              Component === PatientData 
                ? handlePatientDataSuccess
                : Component === Telephony
                  ? handleTelephonySuccess
                  : undefined
            }
            onComplete={
              Component === DataSharingAgreement 
                ? handleDataShareComplete
                : undefined
            }
            onShowPopup={handleShowPopup}
          />
        </div>
      </StepFrame>
    </div>
  );
}