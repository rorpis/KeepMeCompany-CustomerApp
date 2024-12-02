'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TriageHandler from './_components/triage-handler';

// Training configuration
const TRAINING_REVIEW_LIMIT = 20;

export default function TriageDashboardPage() {
  const router = useRouter();
  
  // Tutorial and training states
  const [showTutorial, setShowTutorial] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pausedAt, setPausedAt] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  // Start continuous timer
  useEffect(() => {
    if (!isRunning || isPaused || reviewedCount >= TRAINING_REVIEW_LIMIT) return;
    
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const newTotalTime = startTime ? currentTime - startTime - totalPausedTime : 0;
      setTotalTime(newTotalTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, startTime, totalPausedTime, reviewedCount]);

  // Add new useEffect to handle navigation
  useEffect(() => {
    if (reviewedCount >= TRAINING_REVIEW_LIMIT) {
      finishReview();
    }
  }, [reviewedCount]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowTimer(true);
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const handleTrainingComplete = () => {
    setShowTimer(false);
    setIsRunning(false);
  };

  const finishReview = () => {
    setIsRunning(false);
    router.push('/workspace');
  };

  const handleReview = () => {
    setReviewedCount(prev => prev + 1);
    setAverageTime(totalTime / (reviewedCount + 1));
  };

  const handlePause = () => {
    if (isPaused) {
      // Resuming
      const currentTime = Date.now();
      setTotalPausedTime(prev => prev + (currentTime - pausedAt));
      setPausedAt(null);
    } else {
      // Pausing
      setPausedAt(Date.now());
    }
    setIsPaused(prev => !prev);
  };

  return (
    <TriageHandler 
      showTutorial={showTutorial}
      showTimer={showTimer}
      reviewedCount={reviewedCount}
      totalTime={totalTime}
      averageTime={averageTime}
      isPaused={isPaused}
      trainingLimit={TRAINING_REVIEW_LIMIT}
      onTutorialComplete={handleTutorialComplete}
      onTrainingComplete={handleTrainingComplete}
      onReview={handleReview}
      onPause={handlePause}
    />
  );
}