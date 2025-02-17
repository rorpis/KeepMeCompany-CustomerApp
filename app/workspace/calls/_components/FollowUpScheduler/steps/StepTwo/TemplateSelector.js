import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Button } from "@/_components/ui/StyledButton";
import { Switch } from "@/_components/ui/Switch";
import { PlusCircle } from "lucide-react";

const TemplateSelector = ({
  defaultTemplates,
  customTemplates,
  selectedTemplate,
  onTemplateSelect,
  isEditMode,
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

  const renderTemplate = (template) => (
    <button
      key={template.id}
      onClick={() => onTemplateSelect(template)}
      className={`
        w-full p-3 rounded-lg border text-black
        ${selectedTemplate?.id === template.id 
          ? !template.isCustom
            ? "border-2 border-blue-500 bg-blue-50"  // Selected default template
            : "border-blue-500 bg-blue-50"           // Selected custom template
          : !template.isCustom
            ? "border-2 border-gray-300 hover:border-blue-500"  // Unselected default template
            : "border-gray-200 hover:border-blue-500"           // Unselected custom template
        }
      `}
    >
      <span className="font-medium">
        {template.isCustom 
          ? template.title
          : (template.title[currentLanguage] || template.title.EN)
        }
      </span>
    </button>
  );
  
  // In view mode, show template selection
  if (!isEditMode) {
    return (
      <div className="h-full pr-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900">
          {t('workspace.remoteMonitoring.stepTwo.preset.selectPresetLabel')}
        </h3>
        
        <div className="space-y-2">
          {/* Default Templates */}
          {defaultTemplates.map(renderTemplate)}
          
          {/* Separator if both types exist */}
          {defaultTemplates.length > 0 && customTemplates.length > 0 && (
            <div className="my-4 border-t border-gray-200" />
          )}
          
          {/* Custom Templates */}
          {customTemplates.map(renderTemplate)}
          
          {/* Custom Template Button */}
          <button
            onClick={() => onTemplateSelect({ id: "custom", isCustom: true, title: "", activeNodes: [] })}
            className={`
              w-full p-3 rounded-lg border text-black
              ${selectedTemplate?.id === "custom"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-500"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <span className="font-medium">
                {t('workspace.remoteMonitoring.stepTwo.template.custom')}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // In edit mode, show active pathways selection
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
};

export default TemplateSelector; 