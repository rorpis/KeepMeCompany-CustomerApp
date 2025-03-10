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

  const getTemplateTranslation = (templateTitle) => {
    switch (templateTitle) {
      case 'patientIntake':
        return t('workspace.remoteMonitoring.stepTwo.template.patientIntake');
      default:
        return templateTitle;
    }
  };

  const getDirectionTranslation = (direction) => {
    switch (direction) {
      case 'inbound':
        return t('workspace.remoteMonitoring.dashboard.direction.inbound');
      case 'outbound':
        return t('workspace.remoteMonitoring.dashboard.direction.outbound');
      default:
        return direction;
    }
  };

  const propertiesList = [
    { key: 'Patient Number', value: properties.toNumber || 'Unknown' },
    { key: 'System Number', value: properties.fromNumber || 'Unknown' },
    { key: 'Direction', value: getDirectionTranslation(properties.direction) || 'N/A' },
    { key: 'Completion', value: properties.completion || 'N/A' },
    { key: 'Duration', value: properties.duration || 'N/A' },
    { key: 'Status', value: properties.status || 'N/A' },
    { key: 'Template', value: getTemplateTranslation(properties.templateTitle) || 'N/A' },
    { key: 'Deducted Credits', value: properties.deductedCredits === true ? 'Yes' : 'No' }
  ]

  // return a table with the properties list
  return (
    <table className="w-full border-collapse">
      <tbody className="divide-y divide-gray-200">
        {propertiesList.map(({ key, value }) => (
          <tr key={key}>
            <td className="py-3 px-4 font-medium capitalize bg-gray-50">{key}</td>
            <td className="py-3 px-4">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
