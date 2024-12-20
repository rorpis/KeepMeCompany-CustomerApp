"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import Link from 'next/link';

const VerifyEmail = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.push("/workspace");
        }
      }
    };

    checkVerification();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('auth.verifyEmail.title')}
          </h1>
          <p className="text-text-secondary mb-8">
            {t('auth.verifyEmail.subtitle')}
          </p>
        </div>

        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    {t('auth.verifyEmail.instructions')}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-text-secondary">
                {t('auth.verifyEmail.proceedLogin')}
              </p>
              
              <Link 
                href="/login"
                className="inline-block w-full bg-primary-blue hover:bg-primary-blue/80 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center"
              >
                {t('auth.verifyEmail.loginButton')}
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-text-secondary text-sm">
            {t('auth.verifyEmail.noEmail')}{' '}
            <button 
              onClick={() => user?.sendEmailVerification()} 
              className="text-primary-blue hover:text-primary-blue/80 font-medium"
            >
              {t('auth.verifyEmail.resendButton')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
