import { useCallback, useEffect, useState, useRef } from 'react';
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
import { PhoneCall, MessageSquare, Lock, ClipboardPlus } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';

const nodeTypeColors = {
  greeting: 'bg-gray-800',
  regular: 'bg-black',
  verification: 'bg-green-900',
  anamnesis: 'bg-blue-900',
  first: 'bg-black',
  last: 'bg-black'
};

const nodeTypeIcons = {
  greeting: <MessageSquare className="w-4 h-4 text-white" />,
  regular: <MessageSquare className="w-4 h-4 text-white" />,
  verification: <Lock className="w-4 h-4 text-white" />,
  anamnesis: <ClipboardPlus className="w-4 h-4 text-white" />,
  first: <PhoneCall className="w-4 h-4 text-white" />,
  last: <PhoneCall className="w-4 h-4 text-white" />
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
        relative flex flex-col border-2 border-white/10 rounded-lg p-4 min-w-[200px] max-w-[250px]
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

// Update nodeTypes
const nodeTypes = {
  conversationNode: ConversationNode
};

// Add edgeTypes
const edgeTypes = {
  custom: CustomEdge
};

const TreeVisualization = ({ 
  nodes, 
  activeNodes, 
  getNodeContent, 
  isEditMode, 
  onToggleNode,
  loading 
}) => {
  const { currentLanguage } = useLanguage();
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  useEffect(() => {
    // Convert nodes to ReactFlow format
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
        }
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
  }, [nodes, activeNodes, getNodeContent, isEditMode, currentLanguage, reactFlowInstance]);

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
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnScroll={false}
            zoomOnScroll={true}
            proOptions={{ hideAttribution: true }}
            fitViewOptions={{ 
              padding: 0.2,
              maxZoom: 1
            }}
            style={{ height: '100%' }}
          >
            <Background color="#333" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </div>
  );
};

export default TreeVisualization; 