'use client';
import { useState } from 'react';

import StepFrame from './_shared_components/step_frame';

import Register from './_stages/1-register/register';
import PracticeDetails from './_stages/2-practice-details/practice-details';
import { DataSharingAgreement } from './_stages/3-setup/1-data-sharing-agreement/data-sharing-agreement';
import { PatientData } from './_stages/3-setup/2-patient-data/patient-data';
import { Telephony } from './_stages/3-setup/3-telephony/telephony';
import { EmergencyProtocol } from './_stages/3-setup/4-emergency-protocol/emergency-protocol';
import { DashboardTesting } from './_stages/4-dashboard_testing/dashboard_testing';
import { ReadyToOperate } from './_stages/5-ready-to-operate/ready-to-operate';



const STAGES = [
  {
    title: 'Create Your Account',
    Component: Register
  },
  {
    title: 'Practice Details',
    Component: PracticeDetails
  },
  {
    title: 'Please provide your Data Protection Officer (DPO) details',
    Component: DataSharingAgreement,
    skippable: true
  },
  {
    title: 'If you signed the agreement, please upload your patient data here',
    Component: PatientData,
    skippable: true
  },
  {
    title: 'Your Telephony should look like this',
    Component: Telephony,
    skippable: true
  },
  {
    title: 'Emergency Protocol',
    Component: EmergencyProtocol
  },
  {
    title: 'Dashboard Testing',
    Component: DashboardTesting
  },
  {
    title: 'Ready to Operate',
    Component: ReadyToOperate
  }
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    register: {
      email: '',
      password: ''
    },
    practiceDetails: {
      practiceName: '',
      practiceSize: '',
      practiceAddress: ''
    },
    dataSharingAgreement: {
      name: '',
      phone: '',
      email: ''
    },
    patientData: {
      file: null,
      preview: { headers: [], rows: [] }
    }
  });

  const updateFormData = (stage, data) => {
    setFormData(prev => ({
      ...prev,
      [stage]: { ...prev[stage], ...data }
    }));
  };
  
  const handleNext = () => {
    if (currentIndex < STAGES.length - 1) {
      setCurrentIndex(currentIndex + 1);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <StepFrame
        title={title}
        onNext={!isLastStage ? handleNext : undefined}
        onBack={currentIndex > 0 ? handleBack : undefined}
        showSkip={skippable}
      >
        <Component 
          data={formData[getStageKey(Component)]}
          updateData={(data) => updateFormData(getStageKey(Component), data)}
        />
      </StepFrame>
    </div>
  );
}