"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from '@/lib/contexts/LanguageContext';

const RemoteMonitoringMainScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const navigationCards = [
    {
      title: t('workspace.remoteMonitoring.mainScreen.cards.dashboard.title'),
      description: t('workspace.remoteMonitoring.mainScreen.cards.dashboard.description'),
      path: "/workspace/remote-monitoring/live-dashboard",
    },
    {
      title: t('workspace.remoteMonitoring.mainScreen.cards.createFollowUp.title'),
      description: t('workspace.remoteMonitoring.mainScreen.cards.createFollowUp.description'),
      path: "/workspace/remote-monitoring/create-follow-up",
    },
    {
      title: t('workspace.remoteMonitoring.mainScreen.cards.upcomingFollowUps.title'),
      description: t('workspace.remoteMonitoring.mainScreen.cards.upcomingFollowUps.description'),
      path: "/workspace/remote-monitoring/upcoming-calls",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">
        {t('workspace.remoteMonitoring.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationCards.map((card, index) => (
          <div
            key={index}
            className="block cursor-pointer"
            onClick={() => router.push(card.path)}
          >
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">{card.title}</h2>
              <p className="text-text-secondary mb-4">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoteMonitoringMainScreen; 