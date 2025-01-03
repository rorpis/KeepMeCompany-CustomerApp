'use client';

import { useState, useEffect, useMemo } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { RemoteMonitoringDashboard } from '../../../_components/remoteMonitoringDashboard';
import ResultsTable from '../_components/ResultsTable';
import { listenToConversationsFollowUps, listenToQueueCalls } from '../../../../lib/firebase/realTimeMethods';
import { Dialog } from '@headlessui/react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const RemoteMonitoringDashboardPage = () => {
  const { selectedOrgId, organisationDetails } = useOrganisation();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [queuedCalls, setQueuedCalls] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (!selectedOrgId) {
      setIsLoading(false);
      return;
    }

    // Listen to completed conversations
    const unsubscribeConversations = listenToConversationsFollowUps(
      selectedOrgId,
      new Date(startDate),
      new Date(endDate),
      (snapshot) => {
        const customerConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: 'processed',
          type: 'completed'
        }));
        setConversations(customerConversations);
      }
    );

    // Listen to queued calls
    const unsubscribeQueue = listenToQueueCalls(
      selectedOrgId,
      (snapshot) => {
        if (!snapshot.exists()) {
          setQueuedCalls([]);
          setIsLoading(false);
          return;
        }
        const data = snapshot.data();
        const queuedCalls = Object.entries(data.queue || {}).map(([id, call]) => ({
          id,
          ...call,
          type: 'queued'
        }));
        setQueuedCalls(queuedCalls);
      }
    );

    setIsLoading(false);

    return () => {
      unsubscribeConversations();
      unsubscribeQueue();
    };
  }, [selectedOrgId, startDate, endDate]);

  // Merge and match conversations with queued calls
  const mergedCalls = useMemo(() => {
    const allCalls = [...conversations];
    
    // Add queued calls that don't have a matching conversation yet
    queuedCalls.forEach(queuedCall => {
      allCalls.push({
        id: queuedCall.id,
        call_sid: queuedCall.call_sid,
        patientName: queuedCall.experience_custom_args?.patient_name,
        patientDateOfBirth: queuedCall.experience_custom_args?.patient_dob,
        userNumber: queuedCall.phone_number,
        objectives: queuedCall.experience_custom_args?.objectives,
        scheduled_for: {
          date: queuedCall.scheduled_for?.[0]?.date,
          time: queuedCall.scheduled_for?.[0]?.time
        },
        status: 'queued',
        type: 'queued'
      });
    });

    // Sort by timestamp (createdAt for completed calls, scheduled_for for queued calls)
    return allCalls.sort((a, b) => {
      const dateA = a.type === 'queued' 
        ? new Date(`${a.scheduled_for?.date} ${a.scheduled_for?.time}`)
        : a.createdAt?.toDate();
      const dateB = b.type === 'queued' 
        ? new Date(`${b.scheduled_for?.date} ${b.scheduled_for?.time}`)
        : b.createdAt?.toDate();
      
      return dateB - dateA; // Descending order
    });
  }, [conversations, queuedCalls]);

  // Filter calls based on status
  const filteredCalls = useMemo(() => {
    return mergedCalls.filter(call => {
      if (statusFilter === 'all') return true;
      return call.status === statusFilter;
    });
  }, [mergedCalls, statusFilter]);

  const handleViewResults = (conversation) => {
    setSelectedConversation(conversation);
    setIsResultsOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">{t('workspace.remoteMonitoring.dashboard.loading')}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">
        {t('workspace.remoteMonitoring.dashboard.title')}
      </h2>
      
      {/* Filters Section */}
      <div className="mb-6 flex gap-4 items-end">
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
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('workspace.remoteMonitoring.dashboard.statusFilter.label')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary focus:border-primary-blue focus:ring-primary-blue"
          >
            <option value="all">{t('workspace.remoteMonitoring.dashboard.statusFilter.all')}</option>
            <option value="queued">{t('workspace.remoteMonitoring.dashboard.statusFilter.queued')}</option>
            <option value="processed">{t('workspace.remoteMonitoring.dashboard.statusFilter.processed')}</option>
          </select>
        </div>
      </div>

      <RemoteMonitoringDashboard 
        calls={filteredCalls}
        onViewResults={handleViewResults}
        markAsViewed={(index) => {
          const callToMark = filteredCalls[index];
          console.log('Marking call as viewed:', callToMark.id);
          setConversations(prevConversations => {
            return prevConversations.map(conv => 
              conv.id === callToMark.id 
                ? { ...conv, viewed: true }
                : conv
            );
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
