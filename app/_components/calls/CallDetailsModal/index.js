import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, CheckCircle } from 'lucide-react';
import { CallProperties } from './CallProperties';
import { PatientDetails } from './PatientDetails';
import { TranscriptView } from './TranscriptView';
import { MedicalSummary } from './MedicalSummary';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const CallDetailsModal = ({ isOpen, onClose, call, markAsViewed }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("transcript");
  const [isMarking, setIsMarking] = useState(false);
  const [localViewed, setLocalViewed] = useState(call?.viewed);

  useEffect(() => {
    setLocalViewed(call?.viewed);
  }, [call?.viewed]);

  const handleMarkAsViewed = async () => {
    if (!call?.id) return;
    
    try {
      setIsMarking(true);
      await markAsViewed(call.id);
      setLocalViewed(true);
    } catch (error) {
      console.error('Error marking call as viewed:', error);
      // Optionally show an error toast/notification here
    } finally {
      setIsMarking(false);
    }
  };

  const tabs = [
    { id: "transcript", label: t('workspace.calls.modal.tabs.transcript') },
    { id: "summary", label: t('workspace.calls.modal.tabs.summary') },
    { id: "patient", label: t('workspace.calls.modal.tabs.patient') },
    { id: "properties", label: t('workspace.calls.modal.tabs.properties') },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-4xl text-black">
          <div className="flex flex-col h-[80vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6">
              <div className="flex items-center space-x-4">
                <Dialog.Title className="text-xl font-semibold">
                  {t('workspace.calls.modal.title')}
                </Dialog.Title>
                {call?.viewed ? (
                  <span className="flex items-center space-x-2 px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    <span>{t('workspace.calls.modal.viewed')}</span>
                  </span>
                ) : (
                  <button
                    onClick={handleMarkAsViewed}
                    disabled={isMarking}
                    className={`
                      flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm
                      transition-all duration-200 
                      ${isMarking 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }
                    `}
                  >
                    <CheckCircle className={`h-4 w-4 ${isMarking ? 'animate-spin' : ''}`} />
                    <span>
                      {isMarking 
                        ? t('workspace.calls.modal.marking') 
                        : t('workspace.calls.modal.markAsViewed')
                      }
                    </span>
                  </button>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium rounded-t-lg ${
                    activeTab === tab.id
                      ? "bg-blue-50 border-b-2 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto min-h-0">
              {activeTab === "properties" && <CallProperties properties={call?.properties} />}
              {activeTab === "patient" && <PatientDetails patient={call?.patient} />}
              {activeTab === "transcript" && (
                <TranscriptView transcript={call?.conversationHistory} recordingURL={call?.recordingURL} />
              )}
              {activeTab === "summary" && <MedicalSummary callId={call?.id} />}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
