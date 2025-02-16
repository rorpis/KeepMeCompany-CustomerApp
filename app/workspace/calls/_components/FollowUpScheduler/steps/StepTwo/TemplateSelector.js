import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Button } from "@/_components/ui/StyledButton";
import { Switch } from "@/_components/ui/Switch";
import { PlusCircle } from "lucide-react";

const TemplateSelector = ({
  isEditMode,
  selectedTemplate,
  onTemplateSelect,
  organisationDetails,
  nodes,
  activeNodes,
  onToggleNode
}) => {
  const { t, currentLanguage } = useLanguage();
  
  console.log('🎯 TemplateSelector render:', {
    isEditMode,
    selectedTemplate,
    nodesAvailable: nodes?.length,
    activeNodesCount: activeNodes?.size
  });

  // Default template is always available
  const defaultTemplate = {
    id: 'default-intake',
    title: t('workspace.remoteMonitoring.stepTwo.template.patientIntake'),
    activeNodes: ['ANAMNESIS', 'FINISH_CALL']
  };

  // In edit mode, show active pathways selection
  if (isEditMode) {
    return (
      <div className="h-full border-r pr-6">
        <h3 className="text-lg font-medium mb-4">
          {t('workspace.remoteMonitoring.stepTwo.activePathways')}
        </h3>
        <div className="space-y-4">
          {nodes.map(node => (
            <div 
              key={node.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <h4 className="font-medium">{node.title[currentLanguage] || node.title.en}</h4>
                <p className="text-sm text-gray-500">{node.description[currentLanguage] || node.description.en}</p>
              </div>
              <Switch
                checked={activeNodes.has(node.id)}
                onCheckedChange={() => onToggleNode(node.id)}
                aria-label={`Toggle ${node.title[currentLanguage] || node.title.en}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // In view mode, show template selection
  return (
    <div className="h-full border-r pr-6">
      <h3 className="text-lg font-medium mb-4">
        {t('workspace.remoteMonitoring.stepTwo.selectTemplate')}
      </h3>
      <div className="space-y-3">
        <button
          onClick={() => onTemplateSelect(defaultTemplate)}
          className={`
            w-full p-3 rounded-lg border transition-all
            ${selectedTemplate?.id === defaultTemplate.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
            }
          `}
        >
          <span className="font-medium">{defaultTemplate.title}</span>
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector; 