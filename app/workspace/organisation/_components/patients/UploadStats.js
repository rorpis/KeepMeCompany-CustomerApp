import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ActiveButton } from '@/app/_components/global_components';

export default function UploadStats({ stats, onClose }) {
  const { t } = useLanguage();

  const handleClose = async () => {
    onClose();
    // Start refreshing the list after closing the stats
    if (typeof refreshOrganisationDetails === 'function') {
      await refreshOrganisationDetails();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-elevated rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-medium text-text-primary mb-6">
          {t('workspace.organisation.patientList.uploadStats.title')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-text-primary">
                {t('workspace.organisation.patientList.uploadStats.created')}: 
                <span className="font-semibold ml-2">{stats.created}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-500" size={24} />
            <div>
              <p className="text-text-primary">
                {t('workspace.organisation.patientList.uploadStats.updated')}: 
                <span className="font-semibold ml-2">{stats.updated}</span>
              </p>
            </div>
          </div>

          {stats.skipped > 0 && (
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-500" size={24} />
              <div>
                <p className="text-text-primary">
                  {t('workspace.organisation.patientList.uploadStats.skipped')}: 
                  <span className="font-semibold ml-2">{stats.skipped}</span>
                </p>
                <p className="text-sm text-text-secondary">
                  {t('workspace.organisation.patientList.uploadStats.skippedReason')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <ActiveButton onClick={handleClose} className="w-full">
            {t('workspace.organisation.patientList.uploadStats.close')}
          </ActiveButton>
        </div>
      </div>
    </div>
  );
} 