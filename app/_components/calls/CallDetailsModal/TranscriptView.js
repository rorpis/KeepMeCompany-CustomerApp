import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const TranscriptView = ({ transcript }) => {
  const { t } = useLanguage();
  
  if (!transcript?.length) return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.transcript')}</div>;

  return (
    <div className="h-full overflow-y-auto pr-2">
      {transcript.map((message, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg mb-4 ${
            message.role === "assistant" 
              ? "bg-blue-50 ml-0 mr-12" 
              : "bg-gray-50 ml-12 mr-0"
          }`}
        >
          <div className="font-medium mb-1 capitalize">{message.role}</div>
          <div>{message.content}</div>
        </div>
      ))}
    </div>
  );
};
