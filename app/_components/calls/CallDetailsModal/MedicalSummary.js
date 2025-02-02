import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import ResultsTable from '../../../workspace/remote-monitoring/_components/ResultsTable';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export const MedicalSummary = ({ callId }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('objectives');
  const [isLoading, setIsLoading] = useState(false);
  
  if (!callId) {
    return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.summary')}</div>;
  }

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

  const renderObjectivesTable = () => (
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

  return (
    <div className="w-full">
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${
            activeTab === 'objectives'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setIsLoading(true);
            setActiveTab('objectives');
            setIsLoading(false);
          }}
        >
          {t('workspace.calls.modal.tabs.objectives')}
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'results'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('results')}
        >
          {t('workspace.calls.modal.tabs.results')}
        </button>
      </div>

      {activeTab === 'objectives' ? (
        isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          renderObjectivesTable()
        )
      ) : (
        <ResultsTable callId={callId} />
      )}
    </div>
  );
};
