"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../lib/contexts/UserContext";
import { useOrganisation } from "../../lib/contexts/OrganisationContext";
import { useLanguage } from "../../lib/contexts/LanguageContext";
import Link from "next/link";
import { useEffect } from "react";

const WorkspaceDashboard = () => {
  const { userDetails, loading: userLoading } = useUser();
  const { organisations, organisationDetails, loading: orgLoading } = useOrganisation();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !orgLoading && organisations.length === 0) {
      router.push('/workspace/organisation/setup');
    }
  }, [organisations, userLoading, orgLoading, router]);

  if (userLoading || orgLoading) {
    return <div>Loading...</div>;
  }

  // If no organizations, show nothing (will redirect)
  if (organisations.length === 0) {
    return null;
  }

  const welcomeMessage = t('workspace.welcome')
    .replace('{name}', userDetails?.name || '')
    .replace('{organisation}', organisationDetails?.name || '');

  return (
    <div className="min-h-screen bg-bg-main px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-bg-elevated rounded-lg p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {welcomeMessage}
          </h1>
          <p className="text-text-secondary">
            {organisationDetails?.address?.addressLine1}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Intake Card */}
          <Link href="/workspace/intake" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('workspace.cards.patientIntake.title')}
              </h2>
              <p className="text-text-secondary mb-4">
                {t('workspace.cards.patientIntake.description')}
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                {t('workspace.cards.patientIntake.action')}
              </span>
            </div>
          </Link>

          {/* Remote Monitoring Card */}
          <Link href="/workspace/remote-monitoring" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('workspace.cards.remoteMonitoring.title')}
              </h2>
              <p className="text-text-secondary mb-4">
                {t('workspace.cards.remoteMonitoring.description')}
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                {t('workspace.cards.remoteMonitoring.action')}
              </span>
            </div>
          </Link>

          {/* Scribe Card */}
          <Link href="/workspace/scribe" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('workspace.cards.scribe.title')}
              </h2>
              <p className="text-text-secondary mb-4">
                {t('workspace.cards.scribe.description')}
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                {t('workspace.cards.scribe.action')}
              </span>
            </div>
          </Link>

          {/* Organisation Dashboard Card */}
          <Link href="/workspace/organisation/dashboard" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('workspace.cards.organisation.title')}
              </h2>
              <p className="text-text-secondary mb-4">
                {t('workspace.cards.organisation.description')}
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                {t('workspace.cards.organisation.action')}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard; 