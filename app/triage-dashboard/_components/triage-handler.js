import { useState, useEffect } from 'react';
import { fetchExampleCalls } from '../../../lib/firebase/queries';
import { TriageTable } from '../../_components/triage-table';
import { TutorialOverlay } from './tutorial-overlay';
import { TutorialTimer } from './tutorial-timer';

const CONVERSATION_TEMPLATE = {
  patient: {
    name: "Alice Johnson",
    age: "38",
    gender: "Female"
  },
  reasonForVisit: "Severe Headache",
  primarySymptoms: ["Headache"],
  triggers: ["Not specified"],
  pattern: [
    "Chronicity: Headache ongoing for 2 weeks",
    "Duration: Started 2 weeks ago",
    "Severity: Not specified"
  ],
  formatDisplay: (data, includeMarkup = false) => {
    const bold = (text) => includeMarkup ? `<strong>${text}</strong>` : text;
    
    return `
${bold('Patient')}: ${data.patient.name}, ${data.patient.age}, ${data.patient.gender}

${bold('Reason for Visit')}: ${data.reasonForVisit}

${bold('Primary Symptoms')}:
- ${data.primarySymptoms.join('\n- ')}

${bold('Triggers')}:
- ${data.triggers.join('\n- ')}

${bold('Pattern')}:
- ${data.pattern.join('\n- ')}
`.split('\n').join('<br />');
  }
};

function useCallManagement() {
  const [exampleCalls, setExampleCalls] = useState([]);
  const [displayedCalls, setDisplayedCalls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const processCallData = (calls) => {
    const today = new Date();
    const startTime = new Date(today.setHours(8, 0, 0));
    const endTime = new Date(today.setHours(9, 0, 0));
    const interval = (endTime.getTime() - startTime.getTime()) / calls.length;

    return calls.map((call, index) => ({
      ...call,
      viewed: false,
      originalId: index + 1,
      patientDateOfBirth: new Date(call.patientDateOfBirth).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      timestamp: new Date(startTime.getTime() + index * interval).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
    }));
  };

  useEffect(() => {
    const fetchAndProcessCalls = async () => {
      const calls = await fetchExampleCalls();
      
      if (calls && Array.isArray(calls)) {
        const processedCalls = processCallData(calls);
        const sortedCalls = processedCalls.sort((a, b) => 
          new Date('1/1/1970 ' + a.timestamp) - new Date('1/1/1970 ' + b.timestamp)
        );

        setExampleCalls(sortedCalls);
        setDisplayedCalls(sortedCalls.slice(0, 8));
        setCurrentIndex(8);
      }
    };

    fetchAndProcessCalls();
  }, []);

  return { exampleCalls, displayedCalls, setDisplayedCalls, currentIndex, setCurrentIndex };
}

function useAutoAddCalls(exampleCalls, currentIndex, setDisplayedCalls, setCurrentIndex, isPaused) {
  useEffect(() => {
    if (isPaused) return; // Don't set up interval if paused

    const interval = setInterval(() => {
      if (currentIndex < exampleCalls.length) {
        setDisplayedCalls((prev) => [...prev, exampleCalls[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [exampleCalls, currentIndex, setDisplayedCalls, setCurrentIndex, isPaused]);
}

export default function TriageHandler({
  showTutorial,
  showTimer,
  reviewedCount,
  totalTime,
  averageTime,
  isPaused,
  trainingLimit,
  onTutorialComplete,
  onTrainingComplete,
  onReview,
  onPause
}) {
  const { 
    exampleCalls, 
    displayedCalls, 
    setDisplayedCalls, 
    currentIndex, 
    setCurrentIndex 
  } = useCallManagement();

  const [columnPositions, setColumnPositions] = useState([]);

  useAutoAddCalls(exampleCalls, currentIndex, setDisplayedCalls, setCurrentIndex, showTutorial);

  const markAsViewed = (index) => {
    setDisplayedCalls((prev) =>
      prev.map((call, idx) => 
        idx === index 
          ? { ...call, viewed: true, animating: true, viewedAt: new Date().toISOString() } 
          : call
      )
    );

    onReview?.(); 

    setTimeout(() => {
      setDisplayedCalls((prev) => {
        const updatedCalls = prev.filter((_, idx) => idx !== index);
        const markedCall = { 
          ...prev[index], 
          viewed: true, 
          animating: false,
          viewedAt: prev[index].viewedAt
        };
        return [...updatedCalls, markedCall];
      });
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <TriageTable 
        calls={displayedCalls} 
        markAsViewed={markAsViewed}
        conversationTemplate={CONVERSATION_TEMPLATE}
        onColumnPositions={setColumnPositions}
      />
      
      {showTutorial && (
        <TutorialOverlay 
          onComplete={onTutorialComplete}
          columnPositions={columnPositions}
        />
      )}

      {showTimer && (
        <TutorialTimer
          isActive={showTimer}
          totalCalls={trainingLimit}
          reviewedCount={reviewedCount}
          totalTime={totalTime}
          averageTime={averageTime}
          isPaused={isPaused}
          onComplete={onTrainingComplete}
          onPause={onPause}
        />
      )}
    </div>
  );
}
