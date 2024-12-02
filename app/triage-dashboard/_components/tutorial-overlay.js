import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COLUMN_TOOLTIPS = [
  {
    title: "Welcome",
    description: "Here we'll teach you how to use the dashboard for proper patient triaging, ensuring you manage this safely and efficiently",
    centered: true,
    highlightedColumns: []
  },
  {
    title: "Symptoms",
    description: "View and copy patient symptoms and conversation details",
    centered: false,
    highlightedColumns: ['symptoms']
  },
  {
    title: "Managing Patients",
    description: "After copying the information, paste it into your EHR and manage next steps for that patient based on your internal pathways.",
    centered: true,
    highlightedColumns: []
  },
  {
    title: "Actions",
    description: "Once you've finished, mark 'Review' to make sure you don't miss any patients. Are you ready to do a simulation?",
    centered: false,
    highlightedColumns: ['actions']
  }
];

const TRANSITION_DURATION = 500;
const TOOLTIP_OFFSET = 20;
const HEADER_INDICES = {
  symptoms: 3,
  actions: 5
};

function Tooltip({ content, position, centered, isTransitioning, onPrev, onNext, isLastStep }) {
  return (
    <div 
      className="absolute transition-opacity duration-1000 ease-in-out"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        opacity: isTransitioning ? 0 : 1
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className={`
        bg-white/90 backdrop-blur-sm text-black p-8 rounded-2xl shadow-2xl 
        border border-white/20
        ${centered ? 'max-w-lg -translate-x-1/2 -translate-y-1/2' : 'max-w-md -translate-x-1/2'}
      `}>
        <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 
          text-transparent bg-clip-text ${centered ? 'text-center' : ''}`}>
          {content.title}
        </h3>
        
        <p className={`text-gray-600 mb-8 leading-relaxed ${centered ? 'text-center' : ''}`}>
          {content.description}
        </p>
        
        <div className="flex justify-between items-center">
          {onPrev ? (
            <button onClick={onPrev} className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Previous
            </button>
          ) : <div />}
          
          <button
            onClick={onNext}
            className={`px-5 py-2.5 text-sm text-white rounded-xl transition-colors
              ${isLastStep ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLastStep ? 'Start Simulation!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TutorialOverlay({ onComplete, columnPositions }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const updateTooltipPosition = () => {
    const currentTooltip = COLUMN_TOOLTIPS[currentStep];
    
    if (currentTooltip.centered) {
      return {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2
      };
    }

    const columnId = currentTooltip.highlightedColumns[0];
    const headerIndex = HEADER_INDICES[columnId];
    const header = document.querySelectorAll('th')[headerIndex];
    
    if (header) {
      const rect = header.getBoundingClientRect();
      return {
        left: rect.left + (rect.width / 2),
        top: rect.bottom + TOOLTIP_OFFSET
      };
    }

    return tooltipPosition;
  };

  useEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => setTooltipPosition(updateTooltipPosition());
    handleUpdate();
    
    const timer = setTimeout(handleUpdate, 100);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('resize', handleUpdate);
      clearTimeout(timer);
    };
  }, [currentStep, isVisible]);

  const handleStepChange = (direction) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => direction === 'next' ? prev + 1 : Math.max(0, prev - 1));
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  if (!isVisible) return null;

  const currentTooltip = COLUMN_TOOLTIPS[currentStep];
  const isLastStep = currentStep === COLUMN_TOOLTIPS.length - 1;

  return (
    <div className="fixed inset-0 z-50" onClick={onComplete}>
      {!currentTooltip.centered && columnPositions.length > 0 && (
        <div 
          className="absolute inset-0 grid" 
          style={{ 
            gridTemplateColumns: columnPositions.map(col => `${col.width}px`).join(' ') 
          }}
        >
          {columnPositions.map((col, index) => (
            <div
              key={index}
              className={`
                transition-all duration-300
                ${currentTooltip.highlightedColumns.includes(col.id) 
                  ? 'bg-transparent' 
                  : 'bg-black/50 backdrop-blur-sm'}
              `}
              data-column-id={col.id}
              data-highlighted={currentTooltip.highlightedColumns.includes(col.id)}
            />
          ))}
        </div>
      )}

      {currentTooltip.centered && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}

      <button 
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <Tooltip
        content={currentTooltip}
        position={tooltipPosition}
        centered={currentTooltip.centered}
        isTransitioning={isTransitioning}
        onPrev={currentStep > 0 ? () => handleStepChange('prev') : null}
        onNext={isLastStep ? onComplete : () => handleStepChange('next')}
        isLastStep={isLastStep}
      />
    </div>
  );
} 