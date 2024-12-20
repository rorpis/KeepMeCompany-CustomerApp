"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/contexts/LanguageContext";

export default function Welcome() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('welcome.title')}
          </h1>
          <p className="text-text-secondary mb-8">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-bg-elevated hover:bg-bg-secondary text-text-primary px-6 py-4 rounded-lg transition-colors duration-200 border border-border-main"
          >
            {t('welcome.loginButton')}
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="w-full bg-bg-elevated hover:bg-bg-secondary text-text-primary px-6 py-4 rounded-lg transition-colors duration-200 border border-border-main"
          >
            {t('welcome.signupButton')}
          </button>
        </div>
      </div>
    </div>
  );
} 