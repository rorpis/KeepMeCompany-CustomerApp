'use client';

import { ActiveButton } from '@/app/_components/global_components';

const CallTypeSelector = ({ onCallNow, onSchedule }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-text-primary mb-8">Select Call Type</h3>
      
      <div className="grid grid-cols-2 gap-8">
        <div 
          onClick={onCallNow}
          className="cursor-pointer bg-bg-secondary hover:bg-bg-main p-8 rounded-lg border-2 border-border-main transition-colors duration-200 flex flex-col items-center justify-center gap-4"
        >
          <h4 className="text-xl font-semibold text-text-primary">Call Now</h4>
          <p className="text-text-secondary text-center">
            Initiate follow-up call immediately
          </p>
        </div>

        <div 
          onClick={onSchedule}
          className="cursor-pointer bg-bg-secondary hover:bg-bg-main p-8 rounded-lg border-2 border-border-main transition-colors duration-200 flex flex-col items-center justify-center gap-4"
        >
          <h4 className="text-xl font-semibold text-text-primary">Schedule Follow-ups</h4>
          <p className="text-text-secondary text-center">
            Schedule follow-up calls for specific dates and times
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallTypeSelector; 