import { useLanguage } from '../../../../../lib/contexts/LanguageContext';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-text-secondary mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-text-secondary hover:text-black disabled:opacity-50"
          >
            {t('workspace.organisation.patientList.patientModal.buttons.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('workspace.organisation.patientList.patientModal.buttons.deleting')}
              </>
            ) : (
              t('workspace.organisation.patientList.patientModal.buttons.delete')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 