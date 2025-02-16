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
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-black">
          {selectedTemplate?.title || t('workspace.remoteMonitoring.stepTwo.noTemplate')}
        </h3>
        <Button
          onClick={() => setIsEditMode(!isEditMode)}
          variant="secondary"
          className="bg-[#F8FAFC] text-black hover:bg-gray-100"
        >
          {isEditMode ? t('common.save') : t('common.edit')}
        </Button>
      </div>
      
      <div className="flex-1 min-h-[500px]">
        <TreeVisualization 
          nodes={nodes}
          activeNodes={activeNodes}
          getNodeContent={getNodeContent}
          isEditMode={isEditMode}
          onToggleNode={toggleNode}
        />
      </div>
    </div>
  );
};

export default DecisionTree; 