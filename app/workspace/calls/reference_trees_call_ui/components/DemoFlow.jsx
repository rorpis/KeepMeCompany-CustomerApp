// File: DemoFlow.jsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import dynamic from 'next/dynamic';

// 1) Dynamically import your production FlowEditor
const ConversationFlowEditor = dynamic(
  () => import('./FlowEditor'),
  { ssr: false }
);

/** 
 * 2) The full multi-step sequence 
 */
const demoSequence = [
  {
    nodeId: '1',
    duration: 3000,
    pathToNext: { edgeId: 'e1-2', duration: 1500 }
  },
  {
    nodeId: '2',
    duration: 2500,
    pathToNext: { edgeId: 'e2-3', duration: 1500 }
  },
  {
    nodeId: '3',
    duration: 2500,
    pathToNext: { edgeId: 'e3-4', duration: 1500 }
  },
  {
    nodeId: '4',
    duration: 2500,
    pathToNext: { edgeId: 'e4-8', duration: 1500 }
  },
  {
    nodeId: '8',
    duration: 2500,
    pathToNext: { edgeId: 'e8-11', duration: 1500 }
  },
  {
    nodeId: '11',
    duration: 3000
  }
];

/**
 * 3) The "useFlowDemo" hook: manages timed steps, 
 * highlights, and offsets.
 */
function useFlowDemo(sequence) {
  const { getNode, getViewport, setViewport } = useReactFlow();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activePathId, setActivePathId] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const timeoutRef = useRef(null);

  // Clear timeouts on unmount
  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  // 4) Center on node with offsets for the sidebar
  const centerOnNode = useCallback((nodeId) => {
    const node = getNode(nodeId);
    if (!node) return;

    // Example logic adjusting for a ~272px sidebar
    const sidebarOffset = 272 / 2;
    const adjustedX = node.position.x + sidebarOffset;

    // Choose a zoom level
    const zoomLevel = 0.75;

    // Shift slightly up/left so the node is more central
    const xOffset = -window.innerWidth * 0.2;
    const yOffset = -window.innerHeight * 0.15;

    setViewport(
      {
        x: -adjustedX * zoomLevel + window.innerWidth / 2 + xOffset,
        y: -node.position.y * zoomLevel + window.innerHeight / 2 + yOffset,
        zoom: zoomLevel
      },
      { duration: 1200 }
    );
  }, [getNode, getViewport, setViewport]);

  // 5) Step through the sequence
  const processStep = useCallback(
    (index) => {
      if (index >= sequence.length) {
        setIsPlaying(false);
        setActiveNodeId(null);
        setActivePathId(null);
        return;
      }

      setCurrentStepIndex(index);
      const step = sequence[index];

      centerOnNode(step.nodeId);

      // Delay before highlighting the node
      timeoutRef.current = setTimeout(() => {
        setActiveNodeId(step.nodeId);

        if (step.pathToNext) {
          // After node highlight, highlight the edge
          timeoutRef.current = setTimeout(() => {
            setActivePathId(step.pathToNext.edgeId);

            // Then move on
            timeoutRef.current = setTimeout(() => {
              setActivePathId(null);
              processStep(index + 1);
            }, step.pathToNext.duration);
          }, step.duration);
        } else {
          // No path? Move directly on
          timeoutRef.current = setTimeout(() => {
            processStep(index + 1);
          }, step.duration);
        }
      }, 300);
    },
    [centerOnNode, sequence]
  );

  const startDemo = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
      setCurrentStepIndex(0);
      processStep(0);
    }
  }, [isPlaying, processStep]);

  const stopDemo = useCallback(() => {
    clearAllTimeouts();
    setIsPlaying(false);
    setActiveNodeId(null);
    setActivePathId(null);
    setCurrentStepIndex(0);
  }, [clearAllTimeouts]);

  return {
    isPlaying,
    activeNodeId,
    activePathId,
    currentStepIndex,
    startDemo,
    stopDemo
  };
}

/**
 * 6) The DemoFlow component with Start/Stop buttons
 */
export default function DemoFlow() {
  return (
    <div className="min-h-screen bg-black p-8">
      <ReactFlowProvider>
        <DemoContainer />
      </ReactFlowProvider>
    </div>
  );
}

function DemoContainer() {
  const {
    isPlaying,
    activeNodeId,
    activePathId,
    startDemo,
    stopDemo
  } = useFlowDemo(demoSequence);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Conversation Flow Editor Demo
      </h2>

      <div className="mb-4">
        <button
          onClick={startDemo}
          disabled={isPlaying}
          className="px-3 py-1 bg-green-600 text-white rounded mr-2"
        >
          Start Demo
        </button>
        <button
          onClick={stopDemo}
          disabled={!isPlaying}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Stop Demo
        </button>
      </div>

      <ConversationFlowEditor
        activeNodeId={activeNodeId}
        activePathId={activePathId}
      />
    </>
  );
}
