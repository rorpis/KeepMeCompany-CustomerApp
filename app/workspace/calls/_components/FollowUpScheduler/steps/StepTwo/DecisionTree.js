import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useDecisionTree } from './useDecisionTree';
import { Button } from "@/_components/ui/StyledButton";
import LoadingSpinner from "@/_components/ui/LoadingSpinner";
import TreeVisualization from './TreeVisualization';

const DecisionTree = ({
  isEditMode,
  setIsEditMode,
  selectedTemplate,
  organisationDetails
}) => {
  const { t } = useLanguage();
  const { nodes, activeNodes, loading, toggleNode, getNodeContent } = useDecisionTree(selectedTemplate, organisationDetails);

  return (
    <div className="flex-1 relative h-full">
      {/* Only show Edit Button for custom templates */}
      {selectedTemplate?.isCustom && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant="outline"
            className={`
              transition-colors bg-white/95 shadow-md
              ${isEditMode 
                ? 'text-gray-900 hover:bg-gray-100' 
                : 'text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {isEditMode ? t('workspace.remoteMonitoring.stepTwo.template.saveChanges') : t('workspace.remoteMonitoring.stepTwo.template.edit')}
          </Button>
        </div>
      )}

      <TreeVisualization 
        nodes={nodes}
        activeNodes={activeNodes}
        getNodeContent={getNodeContent}
        isEditMode={isEditMode}
        onToggleNode={toggleNode}
        loading={loading}
      />
    </div>
  );
};

export default DecisionTree; 