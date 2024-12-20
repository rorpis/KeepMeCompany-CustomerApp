'use client';

import { ActiveButton } from '@/app/_components/global_components';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const CallTypeSelector = ({ onCallNow, onSchedule }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-text-primary mb-8">
        {t('workspace.remoteMonitoring.callType.title')}
      </h3>
      
      <div className="grid grid-cols-2 gap-8">
        <div 
          onClick={onCallNow}
          className="cursor-pointer bg-bg-secondary hover:bg-bg-main p-8 rounded-lg border-2 border-border-main transition-colors duration-200 flex flex-col items-center justify-center gap-4"
        >
          <h4 className="text-xl font-semibold text-text-primary">
            {t('workspace.remoteMonitoring.callType.callNow.title')}
          </h4>
          <p className="text-text-secondary text-center">
            {t('workspace.remoteMonitoring.callType.callNow.description')}
          </p>
        </div>

        <div 
          onClick={onSchedule}
          className="cursor-pointer bg-bg-secondary hover:bg-bg-main p-8 rounded-lg border-2 border-border-main transition-colors duration-200 flex flex-col items-center justify-center gap-4"
        >
          <h4 className="text-xl font-semibold text-text-primary">
            {t('workspace.remoteMonitoring.callType.schedule.title')}
          </h4>
          <p className="text-text-secondary text-center">
            {t('workspace.remoteMonitoring.callType.schedule.description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallTypeSelector; 