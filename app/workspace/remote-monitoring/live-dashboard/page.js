'use client';

import { useState, useEffect } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { TriageDashboard } from '../../../_components/triageDashboard';
import ResultsTable from '../_components/ResultsTable';
import { listenToConversationsFollowUps } from '../../../../lib/firebase/realTimeMethods';
import { Dialog } from '@headlessui/react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const RemoteMonitoringDashboardPage = () => {
  const { selectedOrgId, organisationDetails } = useOrganisation();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString().slice(0, 16);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (!organisationDetails?.registeredNumbers?.length) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = listenToConversationsFollowUps(
      organisationDetails.registeredNumbers,
      new Date(startDate),
      new Date(endDate),
      (snapshot) => {
        const customerConversations = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          /* .filter(conversation => {
            // Find matching patient in patientList
            return organisationDetails.patientList.some(patient => 
              patient.customerName === conversation.patientName &&
              patient.dateOfBirth === conversation.patientDateOfBirth
            );
          }); */
        setConversations(customerConversations);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organisationDetails?.registeredNumbers, startDate, endDate]);

  const handleViewResults = (conversation) => {
    setSelectedConversation(conversation);
    setIsResultsOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">{t('workspace.remoteMonitoring.dashboard.loading')}</div>;
  }

  if (!organisationDetails?.registeredNumbers?.length) {
    return <div className="p-6">{t('workspace.remoteMonitoring.dashboard.noNumbers')}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">
        {t('workspace.remoteMonitoring.dashboard.title')}
      </h2>
      
      {/* Date Filter Section */}
      <div className="mb-6 flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('workspace.remoteMonitoring.dashboard.dateFilter.from')}
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary focus:border-primary-blue focus:ring-primary-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('workspace.remoteMonitoring.dashboard.dateFilter.to')}
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary focus:border-primary-blue focus:ring-primary-blue"
          />
        </div>
      </div>

      <TriageDashboard 
        calls={conversations} 
        isRemoteMonitoring={true}
        onViewResults={handleViewResults}
        markAsViewed={(index) => {
          console.log('Marking call as viewed:', conversations[index].id);
          setConversations(prevConversations => {
            const updatedConversations = [...prevConversations];
            updatedConversations[index].viewed = true;
            return updatedConversations;
          });
        }} 
      />

      {/* Results Table Dialog */}
      <Dialog open={isResultsOpen} onClose={() => setIsResultsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded bg-bg-elevated p-6">
            <Dialog.Title className="text-xl font-semibold mb-4 text-text-primary">
              {t('workspace.remoteMonitoring.dashboard.results.title')}
            </Dialog.Title>
            {selectedConversation && (
              <ResultsTable 
                callId={selectedConversation.id} 
                key={selectedConversation.id}
              />
            )}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setIsResultsOpen(false)} 
                className="px-4 py-2 bg-bg-secondary text-text-primary rounded hover:bg-bg-secondary/80"
              >
                {t('workspace.remoteMonitoring.dashboard.results.close')}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default RemoteMonitoringDashboardPage;
