'use client';

import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import LoadingSpinner from "@/app/_components/ui/LoadingSpinner";
import TwoWeekCalendar from "@/app/_components/TwoWeekCalendar";
import { useLanguage } from '@/lib/contexts/LanguageContext';

const StepThree = ({
  scheduledDates,
  setScheduledDates,
  scheduledTimes,
  setScheduledTimes,
  onBack,
  onSchedule,
  isScheduling
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 relative">
      {isScheduling && (
        <div className="absolute inset-0 bg-bg-elevated/50 flex items-center justify-center z-10 rounded">
          <LoadingSpinner />
        </div>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-4">
        {t('workspace.remoteMonitoring.stepThree.title')}
      </h3>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <TwoWeekCalendar 
            onDatesSelect={(selectedDates) => {
              setScheduledDates(selectedDates);
              const newTimes = { ...scheduledTimes };
              selectedDates.forEach(dateStr => {
                if (!newTimes[dateStr]) {
                  newTimes[dateStr] = "10:00";
                }
              });
              setScheduledTimes(newTimes);
            }}
            selectedDates={scheduledDates}
          />
        </div>
        <div>
          <h4 className="text-lg font-medium text-text-primary mb-4">
            {t('workspace.remoteMonitoring.stepThree.selectedTimes')}
          </h4>
          <div className="space-y-2">
            {Array.from(scheduledDates).map((dateStr) => (
              <div 
                key={dateStr} 
                className="flex items-center justify-between bg-bg-secondary p-3 rounded border border-border-main"
              >
                <span>
                  {new Date(dateStr).toLocaleDateString(t('language') === 'es' ? 'es-ES' : 'en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={scheduledTimes[dateStr] || "10:00"}
                    onChange={(e) => {
                      setScheduledTimes({
                        ...scheduledTimes,
                        [dateStr]: e.target.value
                      });
                    }}
                    className="bg-bg-secondary border border-border-main rounded px-2 py-1 text-text-primary w-24"
                  />
                  <button
                    onClick={() => {
                      const newDates = new Set(scheduledDates);
                      newDates.delete(dateStr);
                      setScheduledDates(newDates);
                      const newTimes = { ...scheduledTimes };
                      delete newTimes[dateStr];
                      setScheduledTimes(newTimes);
                    }}
                    className="text-text-secondary hover:text-text-primary ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {scheduledDates.size === 0 && (
              <div className="text-text-secondary italic">
                {t('workspace.remoteMonitoring.stepThree.noDatesSelected')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <SecondaryButton 
          onClick={onBack}
          disabled={isScheduling}
        >
          {t('workspace.remoteMonitoring.stepThree.navigation.back')}
        </SecondaryButton>
        <ActiveButton
          onClick={onSchedule}
          disabled={!scheduledDates.size || isScheduling}
        >
          {isScheduling ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              {t('workspace.remoteMonitoring.stepThree.navigation.scheduling')}
            </div>
          ) : (
            t('workspace.remoteMonitoring.stepThree.navigation.schedule')
          )}
        </ActiveButton>
      </div>
    </div>
  );
};

export default StepThree;