import { useState, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';
import { formatTime } from '@/app/_utils/number-formatting';
import { SecondaryButton } from '@/app/_components/global_components';

export function TutorialTimer({ 
  isActive, 
  totalCalls,
  reviewedCount = 0,
  totalTime = 0,
  averageTime = 0,
  isPaused = false,
  onComplete,
  onPause
}) {
  if (!isActive) return null;

  const handleNavigate = () => {
    window.location.href = '/workspace';
  };

  return (
    <div className="fixed top-[28%] right-[10%] flex flex-col gap-4">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg text-black min-w-[200px]">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Total Time</h3>
            <p className="text-xl font-bold">{formatTime(totalTime)}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Average Time per Review</h3>
            <p className="text-xl font-bold">{formatTime(averageTime)}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Reviews</h3>
            <p className="text-xl font-bold">{reviewedCount} / {totalCalls}</p>
          </div>
          <button 
            onClick={onPause}
            className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </button>
        </div>
      </div>
      <SecondaryButton 
        onClick={handleNavigate}
        className="mt-6 rounded-xl"
      >
        Finish Tutorial
      </SecondaryButton>
    </div>
  );
} 