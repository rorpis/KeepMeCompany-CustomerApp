'use client';

import { FollowUpScheduler } from '../_components/FollowUpScheduler';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function RemoteMonitoringPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-10 h-full">
      <FollowUpScheduler />
    </div>
  );
}