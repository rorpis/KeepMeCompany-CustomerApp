import { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import DecisionTree from './DecisionTree';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ActiveButton, SecondaryButton } from '@/_components/global_components';

const StepTwo = ({ 
  objectives,
  setObjectives,
  onBack,
  onNext,
  organisationDetails,
  setPresetName,
  selectedPresetIndex,
  setSelectedPresetIndex,
  user,
}) => {
  const { t } = useLanguage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: 'default-intake',
    title: t('workspace.remoteMonitoring.stepTwo.template.patientIntake'),
    activeNodes: ['ANAMNESIS', 'FINISH_CALL']
  });
  
  // Pass template data up when moving to next step
  const handleNext = () => {
    onNext({
      templateTitle: selectedTemplate.title,
      activeNodes: selectedTemplate.activeNodes
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3">
          <TemplateSelector 
            isEditMode={isEditMode}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
            organisationDetails={organisationDetails}
          />
        </div>
        <div className="w-2/3">
          <DecisionTree
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            selectedTemplate={selectedTemplate}
            organisationDetails={organisationDetails}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-border-main mt-auto">
        <SecondaryButton onClick={onBack}>
          {t('workspace.remoteMonitoring.stepTwo.navigation.back')}
        </SecondaryButton>
        <SecondaryButton onClick={handleNext}>
          {t('workspace.remoteMonitoring.stepTwo.navigation.confirm')}
        </SecondaryButton>
      </div>
    </div>
  );
};

export default StepTwo; 