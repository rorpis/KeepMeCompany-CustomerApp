'use client';

import { ActiveButton, SecondaryButton } from '../../../../../../app/_components/global_components';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import LoadingSpinner from "@/app/_components/ui/LoadingSpinner";
import { Phone } from 'lucide-react';

const CallTypeSelector = ({ onCallNow, onSchedule, isCallingNow, onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-4xl w-full space-y-6">
        
        <div className="grid grid-cols-2 gap-12">
          {/* Call Now */}
          <div 
            onClick={!isCallingNow ? onCallNow : undefined}
            className={`h-[200px] bg-bg-elevated rounded-2xl p-6 pb-0 border border-border-main hover:border-primary-blue hover:bg-blue-500/10 transition-all duration-200 flex flex-col relative cursor-pointer ${
              isCallingNow ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-xl p-4 bg-blue-500/10 text-blue-500">
                <Phone className="h-8 w-8" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-text-primary text-center flex items-center justify-center gap-2">
              {isCallingNow && <LoadingSpinner size="sm" />}
              {t('workspace.remoteMonitoring.callType.callNow.title')}
            </h4>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 bg-blue-500 rounded-t-md" />
          </div>

          {/* Call in 15 minutes */}
          <div className="h-[200px] bg-bg-elevated rounded-2xl p-6 pb-0 border border-border-main transition-all duration-200 flex flex-col relative opacity-50 cursor-not-allowed">
            <div className="flex justify-center mb-6">
              <div className="rounded-xl p-4 bg-slate-500/10 text-slate-500">
                <Phone className="h-8 w-8" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-text-primary text-center">
              {t('workspace.remoteMonitoring.callType.schedule15.title', 'Call in 15 minutes')}
            </h4>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 bg-slate-500 rounded-t-md" />
          </div>

          {/* Call in 30 minutes */}
          <div className="h-[200px] bg-bg-elevated rounded-2xl p-6 pb-0 border border-border-main transition-all duration-200 flex flex-col relative opacity-50 cursor-not-allowed">
            <div className="flex justify-center mb-6">
              <div className="rounded-xl p-4 bg-slate-500/10 text-slate-500">
                <Phone className="h-8 w-8" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-text-primary text-center">
              {t('workspace.remoteMonitoring.callType.schedule30.title', 'Call in 30 minutes')}
            </h4>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 bg-slate-500 rounded-t-md" />
          </div>

          {/* Call in 60 minutes */}
          <div className="h-[200px] bg-bg-elevated rounded-2xl p-6 pb-0 border border-border-main transition-all duration-200 flex flex-col relative opacity-50 cursor-not-allowed">
            <div className="flex justify-center mb-6">
              <div className="rounded-xl p-4 bg-slate-500/10 text-slate-500">
                <Phone className="h-8 w-8" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-text-primary text-center">
              {t('workspace.remoteMonitoring.callType.schedule60.title', 'Call in 60 minutes')}
            </h4>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 bg-slate-500 rounded-t-md" />
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-between items-center pt-4 border-t border-border-main">
          <SecondaryButton onClick={onBack}>
            {t('workspace.remoteMonitoring.stepTwo.navigation.back')}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default CallTypeSelector; 