import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import TemplateSelector from './TemplateSelector';
import DecisionTree from './DecisionTree';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ActiveButton, SecondaryButton } from '@/_components/global_components';
import { Button } from "@/_components/ui/StyledButton";
import { Toast } from "@/_components/ui/Toast";
import { savePreset } from '../../api';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/_components/ui/Card";

const StepTwo = ({ 
  objectives,
  setObjectives,
  onBack,
  onNext,
  organisationDetails,
  user
}) => {
  const { t, currentLanguage } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [defaultTemplates, setDefaultTemplates] = useState([]);
  const [treePresets, setTreePresets] = useState([]);
  const [customObjectives, setCustomObjectives] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        // 1. Fetch default templates
        const defaultTemplatesSnapshot = await getDocs(collection(db, 'defaultTemplates'));
        const fetchedDefaultTemplates = defaultTemplatesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || {},
          activeNodes: doc.data().activeNodes || [],
          isCustom: false,
          type: 'default'
        }));
        
        let fetchedTreePresets = [];
        let fetchedCustomObjectives = [];
        
        // 2. Fetch organization templates
        if (organisationDetails?.id) {
          // 2a. Fetch tree presets
          const treePresetsSnapshot = await getDocs(
            collection(db, `organisations/${organisationDetails.id}/treePresets`)
          );
          fetchedTreePresets = treePresetsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            activeNodes: doc.data().activeNodes || [],
            isCustom: false,
            type: 'treePreset'
          }));

          // 2b. Fetch custom objectives
          const customObjectivesSnapshot = await getDocs(
            collection(db, `organisations/${organisationDetails.id}/presets`)
          );
          fetchedCustomObjectives = customObjectivesSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            objectives: doc.data().objectives || [],
            isCustom: true,
            type: 'customObjectives'
          }));
        }
        
        setDefaultTemplates(fetchedDefaultTemplates);
        setTreePresets(fetchedTreePresets);
        setCustomObjectives(fetchedCustomObjectives);
        
        // Always select the first default template if available
        if (fetchedDefaultTemplates.length > 0) {
          const firstDefaultTemplate = fetchedDefaultTemplates[0];
          setSelectedTemplate(firstDefaultTemplate);
          setIsCustomMode(false);
          setIsEditMode(false);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchAllTemplates();
  }, [organisationDetails?.id]);

  const handleTemplateSelect = (template) => {
    if (template === "custom") {
      setSelectedTemplate(null);
      setIsCustomMode(true);
      setIsEditMode(true);
      setObjectives([]);
      setTemplateTitle("");
    } else {
      setSelectedTemplate(template);
      setIsCustomMode(template.type === 'customObjectives');
      setIsEditMode(false);
      
      if (template.type === 'customObjectives') {
        setObjectives(template.objectives || []);
        setTemplateTitle(template.title);
        setSelectedTemplate({
          ...template,
          activeNodes: ['GREETING', 'CUSTOM_OBJECTIVES', 'FINISH_CALL']
        });
      } else {
        setObjectives([]);
      }
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim() || objectives.length === 0) return;

    setIsLoading(true);
    try {
      const { success } = await savePreset({
        organisationId: organisationDetails.id,
        title: templateTitle,
        objectives,
        user
      });

      if (success) {
        setToast({
          show: true,
          message: t('workspace.remoteMonitoring.toast.presetSaved'),
          type: 'success'
        });
        
        // Refresh templates
        fetchAllTemplates();
        
        // Reset form
        setTemplateTitle('');
        setObjectives([]);
        setIsCustomMode(false);
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setToast({
        show: true,
        message: t('workspace.remoteMonitoring.toast.error'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-elevated rounded-lg p-4">
      <Card className="flex-1 mb-4">
        <CardContent>
          <div className="flex gap-8 h-[calc(100vh-320px)]">
            {/* Left: Template Selection */}
            <div className="w-1/3 border-r">
              <TemplateSelector
                defaultTemplates={defaultTemplates}
                treePresets={treePresets}
                customObjectives={customObjectives}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
                isEditMode={isEditMode}
              />
            </div>

            {/* Right: Decision Tree */}
            <div className="w-2/3">
              <DecisionTree
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                selectedTemplate={selectedTemplate}
                organisationDetails={organisationDetails}
                objectives={objectives}
                onAddObjective={(obj) => setObjectives([...objectives, obj])}
                onEditObjective={(index, newText) => {
                  const newObjectives = [...objectives];
                  newObjectives[index] = newText;
                  setObjectives(newObjectives);
                }}
                onDeleteObjective={(index) => {
                  setObjectives(objectives.filter((_, i) => i !== index));
                }}
                isCustomMode={isCustomMode}
                onCustomModeChange={setIsCustomMode}
                templateTitle={templateTitle}
                onTemplateChange={setTemplateTitle}
                onSaveTemplate={handleSaveTemplate}
                isLoading={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-border-main">
        <SecondaryButton onClick={onBack}>
          {t('workspace.remoteMonitoring.stepTwo.navigation.back')}
        </SecondaryButton>
        <SecondaryButton 
          onClick={() => onNext({
            templateTitle: isCustomMode ? templateTitle : selectedTemplate?.title,
            activeNodes: selectedTemplate?.activeNodes || []
          })}
          disabled={isCustomMode ? objectives.length === 0 : !selectedTemplate}
        >
          {t('workspace.remoteMonitoring.stepTwo.navigation.confirm')}
        </SecondaryButton>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default StepTwo; 