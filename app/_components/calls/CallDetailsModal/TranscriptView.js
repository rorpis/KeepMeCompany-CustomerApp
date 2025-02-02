import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const TranscriptView = ({ transcript, recordingURL }) => {
  const { t } = useLanguage();
  
  if (!transcript?.length) return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.transcript')}</div>;

  return (
    <div className="h-full overflow-y-auto pr-2">
      {recordingURL && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">
            {t('workspace.calls.modal.listen')}:
          </span>
          <a
            href={recordingURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-primary-blue bg-blue-50 hover:bg-blue-100"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          </a>
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
