import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export const Credits = ({ credits = 0 }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const callsPerCredit = 10;
  const totalCallsAvailable = credits * callsPerCredit;

  return (
    <div className="bg-bg-elevated rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">
        {t('workspace.organisation.dashboard.credits.title')}
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-text-secondary">
              {t('workspace.organisation.dashboard.credits.available')}: 
              <span className="font-semibold ml-2">{credits}</span>
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {t('workspace.organisation.dashboard.credits.callsAvailable').replace('{{calls}}', totalCallsAvailable)}
            </p>
          </div>
          <button
            onClick={() => router.push('/workspace/credits/purchase')}
            className="px-4 py-2 text-sm bg-primary-blue hover:bg-primary-blue/80 text-white rounded-md transition-colors duration-200"
          >
            {t('workspace.organisation.dashboard.credits.purchase')}
          </button>
        </div>
        <div className="bg-bg-secondary p-4 rounded-md">
          <p className="text-sm text-text-secondary">
            {t('workspace.organisation.dashboard.credits.equivalency').replace('{{callsPerCredit}}', callsPerCredit)}
          </p>
        </div>
      </div>
    </div>
  );
}; 