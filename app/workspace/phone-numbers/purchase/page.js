"use client";

import { useLanguage } from "../../../../lib/contexts/LanguageContext";

const PurchasePhoneNumber = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg-main px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <h1 className="text-2xl font-bold text-text-primary mb-6">
            {t('workspace.phoneNumbers.purchase.title')}
          </h1>
          
          <div className="space-y-4">
            <p className="text-text-secondary">
              {t('workspace.phoneNumbers.purchase.description')}
            </p>
            <div className="bg-bg-secondary p-6 rounded-lg border border-border-main">
              <p className="text-text-primary font-medium">
                eduardo@keepmecompanyai.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePhoneNumber; 