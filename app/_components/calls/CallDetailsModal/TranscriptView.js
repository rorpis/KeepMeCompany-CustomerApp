import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const TranscriptView = ({ transcript, recordingURL }) => {
  const { t } = useLanguage();
  
  if (!transcript?.length) return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.transcript')}</div>;

  return (
    <div className="h-full overflow-y-auto pr-2">
      {recordingURL && (
        <div className="sticky top-0 bg-white pb-4 pt-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {t('workspace.calls.modal.listen')}:
            </span>
            <audio
              controls
              className="h-10"
              src={recordingURL}
            >
              <source src={recordingURL} type="audio/wav" />
              {t('workspace.calls.modal.browserNotSupported')}
            </audio>
          </div>
        </div>
      )}
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
