import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';

export default function DataPreview({ 
  mappedData, 
  onBack, 
  onConfirm, 
  isUploading 
}) {
  const { t } = useLanguage();

  // Get all unique keys from the mapped data
  const columns = [...new Set(mappedData.flatMap(obj => Object.keys(obj)))];

  // Standard fields that should use translations
  const standardFields = ['customerName', 'dateOfBirth', 'phoneNumber'];

  // Function to get column display name
  const getColumnDisplayName = (column) => {
    if (standardFields.includes(column)) {
      return t(`workspace.organisation.patientList.fields.${column}`);
    }
    // For custom fields, use the original name
    return column;
  };

  return (
    <div className="mt-4">
      <h4 className="text-lg font-medium text-text-primary mb-4">
        {t('workspace.organisation.patientList.preview.title')}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="border border-border-main p-2 text-left text-text-secondary">
                  {getColumnDisplayName(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mappedData.slice(0, 5).map((row, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td key={column} className="border border-border-main p-2 text-text-primary">
                    {row[column] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-text-secondary">
        {t('workspace.organisation.patientList.preview.showingRows')}: 
        <span className="font-semibold ml-2">{mappedData.length}</span>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <SecondaryButton onClick={onBack}>
          {t('workspace.organisation.patientList.preview.backToMapping')}
        </SecondaryButton>
        <ActiveButton
          onClick={onConfirm}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('workspace.organisation.patientList.preview.uploading')}
            </div>
          ) : (
            t('workspace.organisation.patientList.preview.uploadButton')
          )}
        </ActiveButton>
      </div>
    </div>
  );
} 