// File: FlowEditor.js
'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MousePointer, PanelRightClose } from 'lucide-react';

import ConversationNode from './Nodes';
import ConversationPath from './Paths';
import { initialNodes, initialEdges } from './config';
import { autoLayoutNodes } from './layoutUtils';
import useNodeVisibilityManager from './useGroupToggle';
import Toggle from '../../../components/ui/Toggle';

// Separate component for scroll hint
function Controls({ showScrollHint }) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col items-center">
      {/* Scroll Indicator */}
      <div className={`
        flex items-center gap-2 text-white/60 text-sm
        transition-opacity duration-500
        ${showScrollHint ? 'opacity-100' : 'opacity-0'}
      `}>
        <MousePointer className="w-4 h-4" />
        <span>Scroll to Zoom</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  conversation: ConversationNode
};

const edgeTypes = {
  custom: ConversationPath
};

function FlowEditorContent({
  activeNodeId = null,
  activePathId = null
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // The hook that manages group hiding
  const {
    hiddenNodeIds,
    appearingNodes,
    toggleGroupVisibility,
    visibleNodes,
    visibleEdges
  } = useNodeVisibilityManager(nodes, edges);

  // Auto-layout once
  useEffect(() => {
    const newNodes = autoLayoutNodes(nodes, edges, 180, 550);
    setNodes(newNodes);
  }, []);

  // Hide scroll hint after first scroll
  useEffect(() => {
    const handleScroll = () => setShowScrollHint(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pulse or highlight if the "demo" says so
  const nodesWithAnimationState = visibleNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      appearing: appearingNodes.has(node.id),
      isPulsing: activeNodeId === node.id
    }
  }));

  const edgesWithHighlightState = visibleEdges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      isHighlighted: activePathId === edge.id
    }
  }));

  // Restore group hiding UI
  const groups = [...new Set(nodes.map((n) => n.data.group).filter(Boolean))];
  const groupHiddenState = groups.reduce((acc, group) => {
    const groupNodeIds = nodes
      .filter((n) => n.data.group === group)
      .map((n) => n.id);
    acc[group] = groupNodeIds.every((id) => hiddenNodeIds.has(id));
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex h-[600px] w-full relative">
          {/* Sidebar with group toggles */}
          <div className={`
            relative transition-all duration-300 ease-in-out
            bg-gray-800 border-r border-gray-700 flex flex-col
            ${isSidebarCollapsed ? 'w-[60px]' : 'w-72'}
          `}>
            {/* Toggle Button - Now inside sidebar */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute top-4 right-3 z-10 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <PanelRightClose 
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isSidebarCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Sidebar Contents - Hidden when collapsed */}
            <div className={`
              p-4 transition-opacity duration-300
              ${isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}
            `}>
              <h3 className="text-white text-sm font-semibold mb-2">
                Activate Pathways
              </h3>
              <div className="flex flex-col space-y-4">
                {groups.map(group => (
                  <div key={group} className="flex items-center gap-4">
                    <Toggle 
                      items={[{ id: group }]}
                      toggles={groupHiddenState}
                      handleToggle={toggleGroupVisibility}
                      switchOnly={true}
                    />
                    <span className={`text-sm font-medium transition-colors duration-300 ${!groupHiddenState[group] ? 'text-white' : 'text-gray-400'}`}>
                      {group}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Flow Editor */}
          <div className="flex-1 h-full bg-gray-900 react-flow">
            <ReactFlow
              nodes={nodesWithAnimationState}
              edges={edgesWithHighlightState}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              defaultEdgeOptions={{
                type: 'custom',
                animated: true,
                style: {
                  stroke: '#666',
                  strokeWidth: 2,
                  strokeDasharray: '6.5,6.5'
                }
              }}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#333" gap={16} />
              <Controls showScrollHint={showScrollHint} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConversationFlowEditor(props) {
  return (
    <ReactFlowProvider>
      <FlowEditorContent {...props} />
    </ReactFlowProvider>
  );
}
