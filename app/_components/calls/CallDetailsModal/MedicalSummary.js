import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import ResultsTable from '../../../workspace/remote-monitoring/_components/ResultsTable';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export const MedicalSummary = ({ callId }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  
  if (!callId) {
    return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.summary')}</div>;
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : null}
      <ResultsTable 
        callId={callId} 
        onLoadingChange={(loading) => setIsLoading(loading)}
      />
    </div>
  );
};
