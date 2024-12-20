'use client';

import { FollowUpScheduler } from '../_components/FollowUpScheduler';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function RemoteMonitoringPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">
        {t('workspace.remoteMonitoring.title')}
      </h1>
      <FollowUpScheduler />
    </div>
  );
}