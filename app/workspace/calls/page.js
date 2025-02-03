"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { useOrganisation } from "../../../lib/contexts/OrganisationContext";
import LoadingSpinner from "../../_components/ui/LoadingSpinner";

const CallsMainScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { organisationDetails, loading } = useOrganisation();
  const hasPhoneNumbers = organisationDetails?.registeredNumbers?.length > 0;

  const navigationCards = [
    {
      title: t('workspace.remoteMonitoring.mainScreen.cards.dashboard.title'),
      description: t('workspace.remoteMonitoring.mainScreen.cards.dashboard.description'),
      path: "/workspace/calls/live-dashboard",
    },
    {
      title: t('workspace.remoteMonitoring.mainScreen.cards.createFollowUp.title'),
      description: t('workspace.remoteMonitoring.mainScreen.cards.createFollowUp.description'),
      path: "/workspace/calls/create-follow-up",
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-bg-main px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              {t('workspace.remoteMonitoring.title')}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {navigationCards.map((card, index) => (
              <div
                key={index}
                className="block cursor-pointer"
                onClick={() => router.push(card.path)}
              >
                <div className="bg-bg-secondary p-8 rounded-lg hover:bg-bg-main transition-colors duration-200 border border-border-main">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    {card.title}
                  </h2>
                  <p className="text-text-secondary mb-4">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsMainScreen; 