import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Button } from "@/_components/ui/StyledButton";
import { Switch } from "@/_components/ui/Switch";
import { PlusCircle } from "lucide-react";

const TemplateSelector = ({
  defaultTemplates,
  treePresets,
  customObjectives,
  selectedTemplate,
  onTemplateSelect,
  isEditMode,
  organisationDetails,
  nodes,
  activeNodes,
  onToggleNode
}) => {
  const { t, currentLanguage } = useLanguage();

  const renderTemplate = (template, isDefault = false) => (
    <button
      key={template.id}
      onClick={() => onTemplateSelect(template)}
      className={`
        w-full p-3 rounded-lg border text-gray-900
        ${selectedTemplate?.id === template.id 
          ? "border-blue-500 bg-blue-50"
          : isDefault 
            ? "border-2 border-gray-300 hover:border-blue-500"
            : "border border-gray-200 hover:border-blue-500"
        }
      `}
    >
      <span className="font-medium">
        {template.type === 'default'
          ? (template.title[currentLanguage] || template.title.EN)
          : template.title}
      </span>
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        {t('workspace.remoteMonitoring.stepTwo.preset.selectPresetLabel')}
      </h3>
      
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2">
        {/* Default Templates */}
        <div className="space-y-2">
          {defaultTemplates?.map(template => renderTemplate(template, true))}
        </div>
        
        {/* Separator */}
        {treePresets?.length > 0 && <hr className="border-gray-200 my-4" />}
        
        {/* Tree Presets */}
        {treePresets?.length > 0 && (
          <div className="space-y-2">
            {treePresets.map(template => renderTemplate(template))}
          </div>
        )}
        
        {/* Separator */}
        {customObjectives?.length > 0 && <hr className="border-gray-200 my-4" />}
        
        {/* Custom Objectives */}
        {customObjectives?.length > 0 && (
          <div className="space-y-2">
            {customObjectives.map(template => renderTemplate(template))}
          </div>
        )}
        
        {/* Custom Objectives button */}
        <button
          onClick={() => onTemplateSelect("custom")}
          className={`
            w-full p-3 rounded-lg border text-gray-900
            ${!selectedTemplate ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-500"}
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
};

export default TemplateSelector; 