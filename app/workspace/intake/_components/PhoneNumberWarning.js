"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../lib/contexts/LanguageContext";

const PhoneNumberWarning = () => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4">
      <span className="text-red-500 text-sm">
        {t('workspace.intake.phoneNumberRequired')}
      </span>
      <button
        onClick={() => router.push('/workspace/phone-numbers/purchase')}
        className="px-4 py-1 text-sm bg-primary-blue hover:bg-primary-blue/80 text-white rounded-md transition-colors duration-200"
      >
        {t('workspace.intake.purchaseNumber')}
      </button>
    </div>
  );
};

export default PhoneNumberWarning; 