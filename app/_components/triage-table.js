import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// Add this new component
const ConversationPopup = ({ conversation, onClose, template }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCopy = () => {
    // Use the plain text version for clipboard
    const content = template.formatDisplay(template, false);
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Create formatted content for display
  const formattedContent = template.formatDisplay(template, true);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div className="bg-white p-8 rounded-xl max-w-2xl w-full mx-4 space-y-6 text-black animate-scaleIn relative" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Conversation Summary</h1>
          <CopyButton copySuccess={copySuccess} handleCopy={handleCopy} />
        </div>

        {copySuccess && (
          <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-lg animate-fadeIn">
            Copied to clipboard!
          </div>
        )}

        <div className="space-y-6" 
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    </div>
  );
};

const CopyButton = ({ copySuccess, handleCopy }) => (
  <button 
    onClick={handleCopy}
    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-2 relative"
  >
    {copySuccess ? (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      </>
    ) : (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy
      </>
    )}
  </button>
);

const ConversationSummarySection = ({ title, content, className = "" }) => (
  <div className={className}>
    <p className="text-xl">
      <span className="italic">{title}:</span>
      <span className="font-normal">{content}</span>
    </p>
  </div>
);

const ConversationSummaryList = ({ title, items }) => (
  <div>
    <p className="text-xl italic">{title}:</p>
    {items.map((item, index) => (
      <p key={index} className="ml-4 font-normal">{item}</p>
    ))}
  </div>
);

const TableHeader = ({ onColumnPositions }) => {
  const headerRef = useRef(null);
  const columnRefs = useRef([]);

  useEffect(() => {
    if (headerRef.current && columnRefs.current.length > 0) {
      const positions = columnRefs.current.map(ref => {
        const rect = ref.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          center: rect.left + (rect.width / 2)
        };
      });
      onColumnPositions(positions);
    }
  }, [onColumnPositions]);

  const COLUMNS = [
    { id: 'id', label: 'Id', align: 'center' },
    { id: 'name', label: 'Patient Name', align: 'left' },
    { id: 'dob', label: 'Date of Birth', align: 'center' },
    { id: 'symptoms', label: 'Symptoms', align: 'center' },
    { id: 'time', label: 'Call Time', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'center' }
  ];

  const baseClass = "border-2 border-gray-200 px-3 py-1.5 text-white";
  
  return (
    <thead ref={headerRef} className="bg-black sticky top-0 z-10">
      <tr>
        {COLUMNS.map((col, index) => (
          <th
            key={col.id}
            ref={el => columnRefs.current[index] = el}
            className={`
              ${baseClass}
              ${index === 0 ? 'first:rounded-tl-xl' : ''}
              ${index === COLUMNS.length - 1 ? 'last:rounded-tr-xl' : ''}
              text-${col.align}
            `}
            data-column={col.id}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const TableRow = ({ call, index, setSelectedCall, markAsViewed }) => (
  <tr
    className={`${call.viewed ? 'bg-green-100' : 'bg-yellow-100'} h-8 hover:brightness-95`}
    style={{
      transition: 'all 0.3s ease-in-out',
      opacity: call.animating ? '0' : '1',
      transform: call.animating ? 'translateY(5px)' : 'translateY(0)',
    }}
  >
    <td className="border-2 border-gray-200 px-3 py-1.5 text-black text-center">{call.originalId}</td>
    <td className="border-2 border-gray-200 px-3 py-1.5 text-black">{call.patientName}</td>
    <td className="border-2 border-gray-200 px-3 py-1.5 text-black text-center">{call.patientDateOfBirth}</td>
    <td className="border-2 border-gray-200 px-3 py-1.5 text-black text-center">
      <button
        onClick={() => setSelectedCall(call)}
        className="text-blue-500 hover:text-blue-700 underline decoration-dotted transition-colors duration-200 block w-full h-full"
      >
        Link
      </button>
    </td>
    <td className="border-2 border-gray-200 px-3 py-1.5 text-black text-center">{call.timestamp.toLocaleString()}</td>
    <td className="border-2 border-gray-200 px-3 py-1.5 text-center">
      <button
        onClick={() => markAsViewed(index)}
        className={`${call.viewed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-0 h-7 rounded-xl transition duration-200`}
        disabled={call.viewed}
      >
        {call.viewed ? 'Reviewed' : 'Review'}
      </button>
    </td>
  </tr>
);

// Add this before TriageTable component
const sortCalls = (calls) => {
  return [...calls].sort((a, b) => {
    if (a.viewed !== b.viewed) return a.viewed ? 1 : -1;
    if (a.viewed && b.viewed) return new Date(a.viewedAt) - new Date(b.viewedAt);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
};

export function TriageTable({ calls, markAsViewed, conversationTemplate, onColumnPositionsChange }) {
  const [selectedCall, setSelectedCall] = useState(null);
  const [columnPositions, setColumnPositions] = useState([]);
  const tableRef = useRef(null);
  const sortedCalls = sortCalls(calls);

  const handleColumnPositions = useCallback((positions) => {
    setColumnPositions(positions);
    onColumnPositionsChange?.(positions);
  }, [onColumnPositionsChange]);

  // Recalculate positions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (tableRef.current) {
        const headers = tableRef.current.querySelectorAll('th');
        const newPositions = Array.from(headers).map(header => {
          const rect = header.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            center: rect.left + (rect.width / 2),
            id: header.dataset.column
          };
        });
        setColumnPositions(newPositions);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <h2 className="text-xl font-bold mb-4">Calls Dashboard</h2>
      <div className="max-h-[60vh] overflow-y-auto w-full scrollbar-thin rounded-xl bg-white relative">
        <table ref={tableRef} className="table-auto border-collapse w-full shadow-sm">
          <TableHeader onColumnPositions={handleColumnPositions} />
          <tbody>
            {sortedCalls?.map((call, index) => (
              <TableRow
                key={index}
                call={call}
                index={index}
                setSelectedCall={setSelectedCall}
                markAsViewed={markAsViewed}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedCall && (
        <ConversationPopup
          conversation={selectedCall}
          template={conversationTemplate}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
}
