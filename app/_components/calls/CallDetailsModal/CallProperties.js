import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const CallProperties = ({ properties }) => {
  const { t } = useLanguage();
  
  if (!properties) return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.properties')}</div>;

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'string' && isValidUrl(value)) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          Link
        </a>
      );
    }
    return value;
  };

  return (
    <table className="w-full border-collapse">
      <tbody className="divide-y divide-gray-200">
        {Object.entries(properties).map(([key, value]) => (
          <tr key={key}>
            <td className="py-3 px-4 font-medium capitalize bg-gray-50">
              {key.replace(/([A-Z])/g, " $1")}
            </td>
            <td className="py-3 px-4">{formatValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
