import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const ObjectivesSummary = ({ followUpSummary }) => {
  const { t } = useLanguage();
  
  if (!followUpSummary) {
    return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.summary')}</div>;
  }

  const getConcernLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100';
      case 'MODERATE':
        return 'bg-yellow-100';
      case 'LOW':
        return 'bg-green-100';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left font-medium">
              {t('workspace.calls.modal.summary.question')}
            </th>
            <th className="py-3 px-4 text-left font-medium">
              {t('workspace.calls.modal.summary.response')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {followUpSummary.map((item, index) => (
            <tr key={index}>
              <td className="py-3 px-4">{item.question}</td>
              <td className={`py-3 px-4 ${getConcernLevelColor(item.concern_level)}`}>
                {item.response}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
