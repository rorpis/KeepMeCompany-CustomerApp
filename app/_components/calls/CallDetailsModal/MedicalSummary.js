import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const MedicalSummary = ({ objectives }) => {
  const { t } = useLanguage();
  
  if (!objectives?.length) return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.summary')}</div>;

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'achieved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-50">
        <tr>
          <th className="py-3 px-4 text-left font-medium">Objective</th>
          <th className="py-3 px-4 text-left font-medium">Status</th>
          <th className="py-3 px-4 text-left font-medium">Notes</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {objectives.map((objective, index) => (
          <tr key={index}>
            <td className="py-3 px-4">{objective.item}</td>
            <td className="py-3 px-4">
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(objective.status)}`}>
                {objective.status}
              </span>
            </td>
            <td className="py-3 px-4">{objective.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
