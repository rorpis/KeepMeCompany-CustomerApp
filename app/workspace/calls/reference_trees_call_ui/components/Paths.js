// File: app/[locale]/ui/components/ConversationPaths.js
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

// Add these base styles at the top of the component
const baseEdgeStyles = {
  stroke: '#666',
  strokeWidth: 2,
  strokeDasharray: '5,5',
  transition: 'opacity 300ms ease-in-out'
};

export default function ConversationPath(props) {
  const {
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
  } = props;

  const labelToShow = data?.label || '';
  const isHighlighted = data?.isHighlighted;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Merge base styles with highlights and custom styles
  const pathStyle = {
    ...baseEdgeStyles,
    ...style,
    ...(isHighlighted
      ? {
          stroke: '#fff',
          strokeWidth: 3,
          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))'
        }
      : {})
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 300ms ease-in-out forwards;
        }
      `}</style>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={pathStyle}
        className="fade-in"
      />

      {labelToShow && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              transition: 'opacity 300ms ease-in-out'
            }}
            className="nodrag nopan fade-in"
          >
            <div className={`
              px-3 py-1 rounded-full transition-all duration-300
              ${isHighlighted 
                ? 'bg-white text-black shadow-glow'
                : 'bg-gray-200/90 border border-gray-300/90 text-gray-800/90'}
            `}>
              <span>{labelToShow}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
