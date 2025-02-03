'use client';

import { FollowUpScheduler } from '../_components/FollowUpScheduler';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function RemoteMonitoringPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">
        {t('workspace.remoteMonitoring.scheduler.title')}
      </h1>
      <FollowUpScheduler />
    </div>
  );
}