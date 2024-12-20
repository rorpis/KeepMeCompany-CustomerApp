"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../lib/contexts/LanguageContext";

const OrganisationSuccess = () => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
      <div className="bg-bg-elevated rounded-lg p-8 text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          {t('workspace.organisation.success.title')}
        </h1>
        <p className="text-text-secondary mb-8">
          {t('workspace.organisation.success.subtitle')}
        </p>
        
        <button 
          onClick={() => router.push("/workspace")}
          className="bg-primary-blue hover:bg-primary-blue/80 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
        >
          {t('workspace.organisation.success.returnButton')}
        </button>
      </div>
    </div>
  );
};

export default OrganisationSuccess; 