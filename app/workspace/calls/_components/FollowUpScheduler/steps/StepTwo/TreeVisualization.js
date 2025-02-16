import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { autoLayoutNodes } from './layoutUtils';
import { PhoneCall, MessageSquare, Lock, ClipboardPlus } from 'lucide-react';

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
  const nodeColor = nodeTypeColors[data.nodeType || 'regular'];
  const icon = nodeTypeIcons[data.nodeType || 'regular'];

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
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        id={`${data.id}-source`}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        id={`${data.id}-target`}
      />
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-white font-medium">{data.title}</h3>
      </div>
      <p className="text-sm text-gray-400">{data.description}</p>
    </div>
  );
};

// Move nodeTypes outside component
const nodeTypes = {
  conversationNode: ConversationNode
};

const TreeVisualization = ({ nodes, activeNodes, getNodeContent, isEditMode, onToggleNode }) => {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

    // Only create edges between active nodes
    const reactFlowEdges = nodes
      .filter(node => activeNodes.has(node.id))
      .flatMap(node => 
        (node.paths || [])
          .filter(path => activeNodes.has(path.targetNode))
          .map((path, index) => ({
            id: `${node.id}-${path.targetNode}-${index}`,
            source: node.id,
            target: path.targetNode,
            sourceHandle: path.sourceHandle,
            targetHandle: path.targetHandle,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#666', strokeWidth: 2, strokeDasharray: '5,5' }
          }))
      );

    // Apply automatic layout
    const { nodes: layoutedNodes } = autoLayoutNodes(reactFlowNodes, reactFlowEdges);
    
    setFlowNodes(layoutedNodes);
    setEdges(reactFlowEdges);
  }, [nodes, activeNodes, getNodeContent, isEditMode]);

  return (
    <div className="h-full w-full bg-gray-900">
      <ReactFlowProvider>
        <ReactFlow
          nodes={flowNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true
          }}
        >
          <Background color="#333" gap={16} />
          <Controls className="text-white" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default TreeVisualization; 