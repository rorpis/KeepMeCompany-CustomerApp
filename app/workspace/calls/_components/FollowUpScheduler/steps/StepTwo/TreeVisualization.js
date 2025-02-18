import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import { autoLayoutNodes } from './layoutUtils';
import { PhoneCall, MessageSquare, Lock, ClipboardPlus, Save, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';

const nodeTypeColors = {
  greeting: 'bg-gray-800',
  regular: 'bg-black',
  verification: 'bg-green-900',
  anamnesis: 'bg-blue-900',
  first: 'bg-black',
  last: 'bg-black',
  objectives: 'bg-blue-50'
};

const nodeTypeIcons = {
  greeting: <MessageSquare className="w-4 h-4 text-white" />,
  regular: <MessageSquare className="w-4 h-4 text-white" />,
  verification: <Lock className="w-4 h-4 text-white" />,
  anamnesis: <ClipboardPlus className="w-4 h-4 text-white" />,
  first: <PhoneCall className="w-4 h-4 text-white" />,
  last: <PhoneCall className="w-4 h-4 text-white" />,
  objectives: <ClipboardPlus className="w-4 h-4 text-blue-500" />
};

const ConversationNode = ({ data }) => {
  const { currentLanguage } = useLanguage();
  const nodeColor = nodeTypeColors[data.nodeType || 'regular'];
  const icon = nodeTypeIcons[data.nodeType || 'regular'];

  // Force re-render when language changes by accessing the correct language key
  const title = typeof data.title === 'object' ? 
    (data.title[currentLanguage] || data.title.EN || data.title.en) : 
    data.title;
    
  const description = typeof data.description === 'object' ? 
    (data.description[currentLanguage] || data.description.EN || data.description.en) : 
    data.description;

  return (
    <div 
      className={`
        relative flex flex-col border-2 border-white/10 rounded-lg p-4 
        min-w-[300px] max-w-[400px]
        ${nodeColor}
        ${data.isActive ? 'border-white/30' : 'border-white/10'}
        ${data.onToggle ? 'cursor-pointer hover:border-white/50' : ''}
      `}
      onClick={data.onToggle}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', left: '50%', transform: 'translateX(-50%)' }}
        id={`${data.id}-target`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', left: '50%', transform: 'translateX(-50%)' }}
        id={`${data.id}-source`}
      />

      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

const ObjectivesNode = ({ data }) => {
  const [newObjective, setNewObjective] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const { t } = useLanguage();
  const inputRef = useRef(null);

  const handleEditStart = (index, text) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleEditSave = () => {
    if (editingText.trim() && editingIndex !== null) {
      data.onEditObjective(editingIndex, editingText.trim());
      setEditingIndex(null);
      setEditingText("");
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 min-w-[400px] max-w-[500px] border border-gray-200 shadow-sm">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />

      <div className="space-y-4">
        {data.objectives.map((objective, index) => (
          <div key={index} className={`
            group flex items-center justify-between p-3 rounded-lg border border-gray-200
            ${data.isEditMode ? 'bg-gray-50' : 'bg-white'}
          `}>
            {editingIndex === index ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                  className="flex-1 p-2 rounded border border-gray-200 text-gray-900"
                  autoFocus
                />
                <button
                  onClick={handleEditSave}
                  className="p-1 rounded hover:bg-green-50 transition-colors"
                >
                  <Save className="h-4 w-4 text-gray-600 hover:text-green-600" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-gray-900">{objective}</span>
                {data.isEditMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStart(index, objective)}
                      className="p-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                    </button>
                    <button
                      onClick={() => data.onDeleteObjective(index)}
                      className="p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {data.isEditMode && (
          <div className="flex gap-2 mt-4">
            <input
              ref={inputRef}
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newObjective.trim()) {
                  data.onAddObjective(newObjective.trim());
                  setNewObjective("");
                }
              }}
              placeholder={t('workspace.remoteMonitoring.stepTwo.template.addNewObjective')}
              className="flex-1 p-3 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-500"
            />
            <button 
              onClick={() => {
                if (newObjective.trim()) {
                  data.onAddObjective(newObjective.trim());
                  setNewObjective("");
                }
              }}
              className="p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <PlusCircle className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Add custom edge component
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const { currentLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  
  const edgeIndex = parseInt(id.split('-').pop());
  const totalEdges = data.totalEdges || 1;
  const offset = totalEdges > 1 
    ? (edgeIndex - (totalEdges - 1) / 2) * 100
    : 0;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: targetX + offset,
    targetY,
    targetPosition,
    curvature: Math.abs(offset) > 0 ? 0.3 : 0.2
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd}
        style={{
          stroke: '#666',
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }}
      />
      {data.instructions && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX + offset}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: isHovered ? 1000 : 0
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              className={`
                px-3 py-1 rounded-full bg-gray-200/90 border border-gray-300/90 
                text-gray-800/90 transition-all duration-200 
                ${isHovered ? 'scale-105 bg-white shadow-lg border-gray-400' : ''}
              `}
            >
              <span>{data.instructions}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Move these completely outside the file scope
const NODE_TYPES = {
  conversationNode: ConversationNode,
  objectivesNode: ObjectivesNode
};

const EDGE_TYPES = {
  custom: CustomEdge
};

const TreeVisualization = ({ 
  nodes = [],
  activeNodes = new Set(),
  getNodeContent = () => ({}),
  isEditMode, 
  onToggleNode = () => {},
  loading,
  objectives,
  onAddObjective,
  onEditObjective,
  onDeleteObjective,
  isCustomMode,
  templateTitle,
  onTemplateChange,
  organisationDetails
}) => {
  const { currentLanguage, t } = useLanguage();
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  useEffect(() => {
    if (isCustomMode) {
      // Calculate greeting node height (approximate based on content length)
      const greetingMessage = organisationDetails?.settings?.remoteMonitoring?.firstMessage || '';
      const messageLines = Math.ceil(greetingMessage.length / 40); // Assume ~40 chars per line
      const lineHeight = 24; // pixels per line
      const nodePadding = 32; // padding inside node
      const estimatedGreetingHeight = (messageLines * lineHeight) + nodePadding + 40; // 40px for title and margins
      
      // Calculate objectives node height dynamically based on text length
      const baseObjectiveHeight = 65; // minimum height for each objective
      const charsPerLine = 50; // approximate characters that fit per line
      const objectivesPadding = 48; // padding inside objectives node
      const addNewObjectiveHeight = 70; // height of the "add new objective" input

      // Calculate height for each objective based on its content length
      const totalObjectivesHeight = objectives.reduce((total, objective) => {
        const lines = Math.ceil(objective.length / charsPerLine);
        const objectiveHeight = Math.max(baseObjectiveHeight, (lines * lineHeight) + 32); // 32px for padding
        return total + objectiveHeight;
      }, 0);

      const finalObjectivesHeight = totalObjectivesHeight + objectivesPadding + 
        (isEditMode ? addNewObjectiveHeight : 0);
      
      const horizontalCenter = 350;
      
      // Calculate different spacings for top and bottom
      const topNodeSpacing = Math.max(100, estimatedGreetingHeight + 30);
      const bottomNodeSpacing = 60; // Smaller spacing for bottom gap

      // Base heights with dynamic spacing
      const greetingY = 80;
      const objectivesY = greetingY + topNodeSpacing;
      const finishY = objectivesY + bottomNodeSpacing + finalObjectivesHeight;

      // Get node content from Firebase data
      const finishContent = getNodeContent(nodes.find(n => n.id === 'FINISH_CALL') || {});

      const customNodes = [
        {
          id: 'greeting',
          type: 'conversationNode',
          position: { x: horizontalCenter, y: greetingY },
          data: {
            title: { en: 'Greeting', es: 'Saludo' },
            description: { 
              en: organisationDetails?.settings?.remoteMonitoring?.firstMessage || '"Hello!"',
              es: organisationDetails?.settings?.remoteMonitoring?.firstMessage || '"¡Hola!"'
            },
            nodeType: 'greeting',
            isActive: true
          }
        },
        {
          id: 'objectives',
          type: 'objectivesNode',
          position: { x: horizontalCenter, y: objectivesY },
          data: {
            objectives,
            onAddObjective,
            onEditObjective,
            onDeleteObjective,
            isEditMode,
            isCustomMode
          }
        },
        {
          id: 'finish',
          type: 'conversationNode',
          position: { x: horizontalCenter, y: finishY },
          data: {
            title: finishContent.title ? {
              en: finishContent.title,
              es: finishContent.title
            } : { en: 'Finish Call', es: 'Finalizar Llamada' },
            description: finishContent.description ? {
              en: finishContent.description,
              es: finishContent.description
            } : { en: 'End the conversation', es: 'Finalizar la conversación' },
            nodeType: 'last',
            isActive: true
          }
        }
      ];

      // Update edge settings for smoother curves
      const customEdges = [
        {
          id: 'greeting-objectives',
          source: 'greeting',
          target: 'objectives',
          type: 'custom',
          animated: true,
          data: {
            instructions: 'Proceed with objectives'
          },
          style: { strokeWidth: 2 } // Make edges slightly thicker
        },
        {
          id: 'objectives-finish',
          source: 'objectives',
          target: 'finish',
          type: 'custom',
          animated: true,
          data: {
            instructions: finishContent.instructions ?
              finishContent.instructions
            : '-',
          },
          style: { strokeWidth: 2 }
        }
      ];

      setFlowNodes(customNodes);
      setEdges(customEdges);

      // Adjust viewport with more padding
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ duration: 200, padding: 0.4 }); // Increased padding
        }
      }, 50);
    } else if (nodes && nodes.length > 0) {
      // For default templates, update the autoLayoutNodes function call
      const reactFlowNodes = nodes.map(node => {
        const content = getNodeContent(node);
        return {
          id: node.id,
          type: 'conversationNode',
          position: { x: 0, y: 0 },
          data: {
            ...content,
            id: node.id,
            nodeType: node.id === 'GREETING' ? 'greeting' : 
                     node.id === 'ANAMNESIS' ? 'anamnesis' : 'regular',
            isActive: activeNodes.has(node.id),
            onToggle: isEditMode ? () => onToggleNode(node.id) : undefined
          },
          // Add minimum dimensions for layout calculation
          dimensions: { width: 300, height: 120 } // Minimum node dimensions
        };
      });

      // Only create edges between active nodes with instructions
      const reactFlowEdges = nodes
        .filter(node => activeNodes.has(node.id))
        .flatMap(node => 
          (node.paths || [])
            .filter(path => activeNodes.has(path.targetNode))
            .map((path, index) => {
              const targetNode = nodes.find(n => n.id === path.targetNode);
              const targetContent = targetNode ? getNodeContent(targetNode) : {};
              
              return {
                id: `${node.id}-${path.targetNode}-${index}`,
                source: node.id,
                target: path.targetNode,
                sourceHandle: path.sourceHandle,
                targetHandle: path.targetHandle,
                type: 'custom',
                animated: true,
                data: {
                  instructions: targetContent.instructions
                }
              };
            })
        );

      // Apply automatic layout
      const { nodes: layoutedNodes } = autoLayoutNodes(reactFlowNodes, reactFlowEdges);
      
      setFlowNodes(layoutedNodes);
      setEdges(reactFlowEdges);

      // Reset zoom after a short delay to ensure nodes are properly laid out
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ duration: 200, padding: 0.2 });
        }
      }, 50);
    }
  }, [nodes, activeNodes, getNodeContent, isEditMode, currentLanguage, 
      reactFlowInstance, isCustomMode, objectives, organisationDetails]);

  // Add new function to determine if a node should be interactive
  const isNodeInteractive = useCallback((node) => {
    return isCustomMode && node.type === 'objectivesNode';
  }, [isCustomMode]);

  return (
    <div className="h-full w-full bg-gray-900 rounded-lg overflow-hidden">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <ReactFlowProvider>
          <ReactFlow
            nodes={flowNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnScroll={false}
            zoomOnScroll={true}
            panOnDrag={true}
            preventScrolling={true}
            proOptions={{ hideAttribution: true }}
            fitViewOptions={{ 
              padding: 0.2,
              maxZoom: 1
            }}
            style={{ height: '100%' }}
            zoomOnDoubleClick={false}
            selectNodesOnDrag={false}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.5}
            maxZoom={1.5}
            nodesFocusable={false}
            edgesFocusable={false}
            disableKeyboardA11y={true}
            onNodeClick={(_, node) => {
              if (isNodeInteractive(node)) {
                // Handle node click
              }
            }}
          >
            <Background color="#333" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </div>
  );
};

export default TreeVisualization; 