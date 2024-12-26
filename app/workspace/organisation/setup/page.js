"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../lib/contexts/LanguageContext";
import { useOrganisation } from "../../../../lib/contexts/OrganisationContext";
import { useEffect } from "react";
import Link from "next/link";

const OrganisationSetup = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { organisations } = useOrganisation();

  // Redirect if user already has organisations
  useEffect(() => {
    if (organisations.length > 0) {
      router.push("/workspace");
    }
  }, [organisations, router]);

  return (
    <div className="min-h-screen bg-bg-main px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <h1 className="text-2xl font-bold text-text-primary mb-6">
            {t('workspace.organisation.setup.title')}
          </h1>
          
          <div className="space-y-8">
            {/* Create New Organisation Card */}
            <Link href="/workspace/organisation/create" className="block">
              <div className="bg-bg-secondary p-6 rounded-lg hover:bg-bg-main transition-colors duration-200 border border-border-main">
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  {t('workspace.organisation.setup.createNew.title')}
                </h2>
                <p className="text-text-secondary">
                  {t('workspace.organisation.setup.createNew.description')}
                </p>
              </div>
            </Link>

            {/* Join Existing Organisation Section */}
            <div className="bg-bg-secondary p-6 rounded-lg border border-border-main">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                {t('workspace.organisation.setup.joinExisting.title')}
              </h2>
              <p className="text-text-secondary mb-4">
                {t('workspace.organisation.setup.joinExisting.description')}
              </p>
              <div className="bg-bg-main/50 p-4 rounded-md text-text-secondary text-sm">
                {t('workspace.organisation.setup.joinExisting.note')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationSetup; 