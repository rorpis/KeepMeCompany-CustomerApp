import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import TemplateSelector from './TemplateSelector';
import DecisionTree from './DecisionTree';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ActiveButton, SecondaryButton } from '@/_components/global_components';

const StepTwo = ({ 
  onBack,
  onNext,
  organisationDetails,
  user,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [defaultTemplates, setDefaultTemplates] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        // Fetch default templates
        const defaultTemplatesSnapshot = await getDocs(collection(db, 'defaultTemplates'));
        const fetchedDefaultTemplates = defaultTemplatesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || {},
          activeNodes: doc.data().activeNodes || [],
          isCustom: false
        }));
        setDefaultTemplates(fetchedDefaultTemplates);
        
        let fetchedCustomTemplates = []; // Initialize empty array
        
        // Fetch custom templates for the organization
        if (organisationDetails?.id) {
          const customTemplatesSnapshot = await getDocs(
            collection(db, `organisations/${organisationDetails.id}/treePresets`)
          );
          fetchedCustomTemplates = customTemplatesSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            activeNodes: doc.data().activeNodes || [],
            isCustom: true
          }));
          setCustomTemplates(fetchedCustomTemplates);
        }
        
        // Select first template by default (prioritize custom templates)
        const allTemplates = [...fetchedCustomTemplates, ...fetchedDefaultTemplates];
        if (allTemplates.length > 0) {
          setSelectedTemplate(allTemplates[0]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchAllTemplates();
  }, [organisationDetails?.id]);

  const handleNext = () => {
    if (selectedTemplate) {
      const templateTitle = selectedTemplate.isCustom 
        ? selectedTemplate.title 
        : (selectedTemplate.title[currentLanguage] || selectedTemplate.title.EN);
      onNext({
        templateTitle,
        activeNodes: selectedTemplate.activeNodes
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-bg-elevated rounded-lg">
      <div className="flex flex-col h-full p-4">
        <div className="bg-white shadow-sm rounded-lg p-4 border flex-1 mb-4">
          <div className="flex gap-8 h-[calc(100vh-300px)]">
            <div className="w-1/3 border-r">
              <TemplateSelector 
                defaultTemplates={defaultTemplates}
                customTemplates={customTemplates}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                isEditMode={isEditMode}
              />
            </div>
            <div className="w-3/4">
              <DecisionTree
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                selectedTemplate={selectedTemplate}
                organisationDetails={organisationDetails}
              />
            </div>
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
    </div>
  );
};

export default StepTwo; 