import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const PatientDetails = ({ patient }) => {
  const { t } = useLanguage();
  
  if (!patient) return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.patient')}</div>;

  const formatValue = (key, value) => {
    // Handle timestamp formatting for lastScheduled
    if (key === 'lastScheduled' && value) {
      try {
        const date = new Date(value);
        return date.toLocaleString('en-UK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return value;
      }
    }
    return value;
  };

  return (
    <table className="w-full border-collapse">
      <tbody className="divide-y divide-gray-200">
        {Object.entries(patient).map(([key, value]) => (
          <tr key={key}>
            <td className="py-3 px-4 font-medium capitalize bg-gray-50">
              {key.replace(/([A-Z])/g, " $1")}
            </td>
            <td className="py-3 px-4">{formatValue(key, value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
