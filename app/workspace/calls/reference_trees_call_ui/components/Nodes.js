// File: app/[locale]/ui/components/ConversationNodes.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { PhoneCall, MessageSquare, Lock, ClipboardPlus } from 'lucide-react';

const nodeTypeColors = {
  regular: 'bg-black',
  verification: 'bg-green-900',
  anamnesis: 'bg-blue-900',
  first: 'bg-black',
  last: 'bg-black'
};

const nodeTypeIcons = {
  regular: <MessageSquare className="w-4 h-4 text-white" />,
  verification: <Lock className="w-4 h-4 text-white" />,
  anamnesis: <ClipboardPlus className="w-4 h-4 text-white" />,
  first: <PhoneCall className="w-4 h-4 text-white" />,
  last: <PhoneCall className="w-4 h-4 text-white" />
};

export default function ConversationNode({ data, id }) {
  // Use pulseAppear animation if the node is in the "appearing" state
  const pulseStyle = data.appearing ? { animation: 'pulseAppear 300ms ease-out forwards' } : {};
  
  // Retain the heartbeat style for demo pulsing (if applicable)
  const heartbeatStyle = data.isPulsing ? { animation: 'heartbeat 2.5s infinite' } : {};

  const combinedStyle = {
    ...pulseStyle,
    ...heartbeatStyle
  };

  return (
    <div className="relative">
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.05); }
          50% { transform: scale(1); }
          75% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes pulseAppear {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes travelingStroke {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -1000;
          }
        }
        .traveling-stroke {
          stroke-dasharray: 40, 960;
          animation: travelingStroke 3s linear infinite;
        }
      `}</style>
      <div
        className={`relative flex flex-col border-2 border-white/10 border-gray-800 rounded-lg p-4 min-w-[200px] max-w-[250px] ${nodeTypeColors[data.nodeType || 'regular']}`}
        style={combinedStyle}
      >
        <div className="flex items-center gap-2 mb-2">
          {nodeTypeIcons[data.nodeType || 'regular']}
          <h3 className="text-white font-medium">{data.label}</h3>
        </div>

        {data.description && (
          <p
            className={`text-sm text-gray-400 ${data.isFixedResponse ? 'italic' : ''}`}
            style={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical'
            }}
          >
            {data.isFixedResponse ? `"${data.description}"` : data.description}
          </p>
        )}

        {data.nodeType !== 'first' && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-gray-500 border-2 border-dark"
          />
        )}
        
        {data.nodeType !== 'last' && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-gray-500 border-2 border-dark"
          />
        )}
        
        {data.isPulsing && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx="8"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="8"
              className="traveling-stroke"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
