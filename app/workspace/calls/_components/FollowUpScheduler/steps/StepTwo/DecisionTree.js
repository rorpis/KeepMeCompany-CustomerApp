import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useDecisionTree } from './useDecisionTree';
import { Button } from "@/_components/ui/StyledButton";
import LoadingSpinner from "@/_components/ui/LoadingSpinner";
import TreeVisualization from './TreeVisualization';
import { Loader2 } from 'lucide-react';

const DecisionTree = ({
  isEditMode,
  setIsEditMode,
  selectedTemplate,
  organisationDetails,
  objectives,
  onAddObjective,
  onEditObjective,
  onDeleteObjective,
  isCustomMode,
  templateTitle,
  onTemplateChange,
  onSaveTemplate,
  isLoading,
  onCustomModeChange
}) => {
  const { t } = useLanguage();
  const { nodes, activeNodes, loading, toggleNode, getNodeContent } = useDecisionTree(selectedTemplate, organisationDetails);

  const handleEditClick = () => {
    if (selectedTemplate?.type === 'customObjectives') {
      setIsEditMode(true);
      onCustomModeChange(true);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  return (
    <div className="flex-1 relative h-full">
      {/* Header with title input and edit/save button */}
      <div className="absolute top-4 right-4 left-4 z-10 flex justify-between items-center">
        {/* Show title as input only when editing */}
        {isCustomMode && (
          isEditMode ? (
            <input
              type="text"
              value={templateTitle}
              onChange={(e) => onTemplateChange(e.target.value)}
              placeholder={t('workspace.remoteMonitoring.stepTwo.template.enterTitle')}
              className="w-[300px] mr-4 p-3 rounded-lg border border-gray-200 text-black placeholder-gray-500 bg-white"
            />
          ) : (
            <h3 className="text-xl font-semibold text-gray-900">{templateTitle}</h3>
          )
        )}
        
        {/* Show edit/save button for custom templates */}
        {(selectedTemplate?.isCustom || isCustomMode) && (
          <Button
            onClick={isCustomMode && isEditMode ? onSaveTemplate : handleEditClick}
            variant="outline"
            className={`
              transition-colors shadow-md
              ${isEditMode && (!templateTitle.trim() || objectives.length === 0)
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-100"
                : "bg-white/95 text-gray-900 hover:bg-gray-100"
              }
            `}
            disabled={isEditMode && (!templateTitle.trim() || objectives.length === 0 || isLoading)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              isCustomMode && isEditMode
                ? t('workspace.remoteMonitoring.stepTwo.template.save')
                : isEditMode 
                  ? t('workspace.remoteMonitoring.stepTwo.template.saveChanges') 
                  : t('workspace.remoteMonitoring.stepTwo.template.edit')
            )}
          </Button>
        )}
      </div>

      <TreeVisualization 
        nodes={nodes}
        activeNodes={activeNodes}
        getNodeContent={getNodeContent}
        isEditMode={isEditMode}
        onToggleNode={toggleNode}
        loading={loading}
        objectives={objectives}
        onAddObjective={onAddObjective}
        onEditObjective={onEditObjective}
        onDeleteObjective={onDeleteObjective}
        isCustomMode={isCustomMode}
      />
    </div>
  );
};

export default DecisionTree; 