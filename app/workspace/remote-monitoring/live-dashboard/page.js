'use client';

import { useState, useEffect, useMemo } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { RemoteMonitoringDashboard } from '../../../_components/remoteMonitoringDashboard';
import ResultsTable from '../_components/ResultsTable';
import { listenToConversationsFollowUps, listenToQueueCalls } from '../../../../lib/firebase/realTimeMethods';
import { Dialog } from '@headlessui/react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '../../../../lib/firebase/authContext';
import DateRangePicker from '../../../_components/DateRangePicker';

const RemoteMonitoringDashboardPage = () => {
  const { selectedOrgId, organisationDetails } = useOrganisation();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [queuedCalls, setQueuedCalls] = useState([]);
  const [processedCalls, setProcessedCalls] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useAuth();
  const [retryingCallId, setRetryingCallId] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);
  const [activeTab, setActiveTab] = useState('new');

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
          setActiveCalls([]);
          setIsLoading(false);
          return;
        }
        const data = snapshot.data();
        
        // Handle queued calls
        const queuedCalls = Object.entries(data.queue || {}).map(([id, call]) => ({
          id,
          ...call,
          type: 'queued'
        }));
        setQueuedCalls(queuedCalls);

        // Handle active calls
        const activeCallsList = Object.entries(data.active_calls || {}).map(([id, call]) => ({
          id,
          ...call,
          type: 'in_progress',
          status: 'in_progress'
        }));
        setActiveCalls(activeCallsList);
      }
    );

    // Listen to processed calls
    const unsubscribeProcessed = listenToQueueCalls(
      selectedOrgId,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProcessedCalls([]);
          return;
        }
        const data = snapshot.data();
        const processedCallsList = Object.entries(data.processed_calls || {}).map(([id, call]) => ({
          id,
          ...call,
          viewed: call.viewed || false,
          type: 'failed',
          status: 'failed'
        }));
        setProcessedCalls(processedCallsList);
      }
    );

    setIsLoading(false);

    return () => {
      unsubscribeConversations();
      unsubscribeQueue();
      unsubscribeProcessed();
    };
  }, [selectedOrgId, startDate, endDate]);

  // Merge and match conversations with queued calls
  const mergedCalls = useMemo(() => {
    // Filter out conversations without recordingURL
    const validConversations = conversations.filter(conv => conv.recordingURL);
    const allCalls = [...validConversations];
    const conversationIds = new Set(validConversations.map(conv => conv.callSid));
    
    // Add queued calls that don't have a matching conversation yet
    queuedCalls.forEach(queuedCall => {
      allCalls.push({
        id: queuedCall.id,
        call_sid: queuedCall.call_sid,
        patientName: queuedCall.experience_custom_args?.patient_name,
        patientDateOfBirth: queuedCall.experience_custom_args?.patient_dob,
        patientId: queuedCall.patient_id,
        userNumber: queuedCall.phone_number,
        objectives: queuedCall.experience_custom_args?.objectives,
        scheduled_for: {
          date: queuedCall.scheduled_for?.[0]?.date,
          time: queuedCall.scheduled_for?.[0]?.time
        },
        status: 'queued',
        type: 'queued',
        viewed: queuedCall.viewed || false,
        formattedTimestamp: queuedCall.enqueued_at,
      });
    });

    // Add active calls
    activeCalls.forEach(activeCall => {
      allCalls.push({
        id: activeCall.id,
        call_sid: activeCall.call_sid,
        patientName: activeCall.experience_custom_args?.patient_name,
        patientDateOfBirth: activeCall.experience_custom_args?.patient_dob,
        patientId: activeCall.patient_id,
        userNumber: activeCall.phone_number,
        objectives: activeCall.experience_custom_args?.objectives,
        createdAt: activeCall.started_at,
        status: 'in_progress',
        type: 'in_progress',
        viewed: false
      });
    });

    // Add processed (failed) calls that don't have a matching conversation
    processedCalls.forEach(processedCall => {
      if (!conversationIds.has(processedCall.call_sid)) {
        const processedDate = processedCall.processed_at?.toDate?.() || new Date(processedCall.processed_at);
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // Set end date to end of day

        // Only add if the processed date falls within the selected date range
        if (processedDate >= startDateTime && processedDate <= endDateTime) {
          allCalls.push({
            id: processedCall.id,
            call_sid: processedCall.call_sid,
            patientName: processedCall.experience_custom_args?.patient_name,
            patientDateOfBirth: processedCall.experience_custom_args?.patient_dob,
            patientId: processedCall.patient_id,
            userNumber: processedCall.phone_number,
            objectives: processedCall.experience_custom_args?.objectives,
            createdAt: processedCall.processed_at,
            status: 'failed',
            type: 'failed',
            viewed: processedCall.viewed || false
          });
        }
      }
    });

    // Sort by timestamp
    return allCalls.sort((a, b) => {
      let dateA, dateB;

      if (a.type === 'queued') {
        dateA = new Date(`${a.scheduled_for?.date} ${a.scheduled_for?.time}`);
      } else if (typeof a.createdAt?.toDate === 'function') {
        dateA = a.createdAt.toDate();
      } else {
        dateA = new Date(a.createdAt);
      }

      if (b.type === 'queued') {
        dateB = new Date(`${b.scheduled_for?.date} ${b.scheduled_for?.time}`);
      } else if (typeof b.createdAt?.toDate === 'function') {
        dateB = b.createdAt.toDate();
      } else {
        dateB = new Date(b.createdAt);
      }
      
      return dateB - dateA;
    });
  }, [conversations, queuedCalls, processedCalls, activeCalls, startDate, endDate]);

  // Calculate counts from all calls (before filtering)
  const newCallsCount = mergedCalls.filter(call => !call.viewed).length;
  const viewedCallsCount = mergedCalls.filter(call => call.viewed).length;

  // Filter calls based on status and viewed state
  const filteredCalls = useMemo(() => {
    return mergedCalls.filter(call => {
      // First filter by status
      if (statusFilter !== 'all' && call.status !== statusFilter) {
        return false;
      }
      
      // Then filter by viewed state
      if (activeTab === 'new') {
        return !call.viewed;
      }
      return call.viewed;
    });
  }, [mergedCalls, statusFilter, activeTab]);

  const handleViewResults = (conversation) => {
    // For failed or queued calls, we'll show objectives instead of results
    if (conversation.status === 'failed' || conversation.status === 'queued') {
      setSelectedConversation({
        ...conversation,
        showObjectives: true
      });
    } else {
      setSelectedConversation(conversation);
    }
    setIsResultsOpen(true);
  };

  const handleCallAgain = async (call) => {
    console.log("Retrying call:", call);
    setRetryingCallId(call.id);
    try {
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const timeStr = currentDate.toTimeString().slice(0, 5);

      // Create the scheduled data
      const scheduledFor = [{
        date: dateStr,
        time: timeStr
      }];

      // Format patient data
      const patients = [{
        patientId: call.patientId
      }];

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/schedule_call`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            organisationId: selectedOrgId,
            patients,
            objectives: call.objectives,
            scheduledFor
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reschedule call');
      }

      // Optionally show a success toast/notification here
    } catch (error) {
      console.error('Error rescheduling call:', error);
      // Optionally show an error toast/notification here
    } finally {
      setRetryingCallId(null);
    }
  };

  const handleDeleteCall = async (call) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/delete_call`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            callId: call.id,
            organisationId: selectedOrgId
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete call');
      }
    } catch (error) {
      console.error('Error deleting call:', error);
    }
  };

  const markAsViewed = async (callId) => {
    const callToMark = filteredCalls.find(call => call.id === callId);

    // Optimistically update the UI state first
    if (callToMark.status === 'processed') {
      setConversations(prevConversations => {
        return prevConversations.map(conv => 
          conv.id === callToMark.id 
            ? { ...conv, viewed: true }
            : conv
        );
      });
    } else if (callToMark.status === 'failed') {
      setProcessedCalls(prevCalls => {
        return prevCalls.map(call => 
          call.id === callToMark.id 
            ? { ...call, viewed: true }
            : call
        );
      });
    } else if (callToMark.status === 'queued') {
      setQueuedCalls(prevCalls => {
        return prevCalls.map(call => 
          call.id === callToMark.id 
            ? { ...call, viewed: true }
            : call
        );
      });
    }

    // Then sync with the backend
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/mark_as_viewed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            callId: callToMark.id,
            organisationId: selectedOrgId,
            callType: callToMark.status,
            callSid: callToMark.call_sid
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark call as viewed');
      }
    } catch (error) {
      // Optionally revert the optimistic update if the backend call fails
      if (callToMark.status === 'processed') {
        setConversations(prevConversations => {
          return prevConversations.map(conv => 
            conv.id === callToMark.id 
              ? { ...conv, viewed: false }
              : conv
          );
        });
      } else if (callToMark.status === 'failed') {
        setProcessedCalls(prevCalls => {
          return prevCalls.map(call => 
            call.id === callToMark.id 
              ? { ...call, viewed: false }
              : call
          );
        });
      } else if (callToMark.status === 'queued') {
        setQueuedCalls(prevCalls => {
          return prevCalls.map(call => 
            call.id === callToMark.id 
              ? { ...call, viewed: false }
              : call
          );
        });
      }
      // Optionally show an error toast/notification here
    }
  };

  if (isLoading) {
    return <div className="p-6">{t('workspace.remoteMonitoring.dashboard.loading')}</div>;
  }

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">
        {t('workspace.remoteMonitoring.dashboard.title')}
      </h2>

      {/* Filters Section */}
      <div className="flex items-center justify-between mb-4">  
        <div className="flex items-center space-x-4">
          <div>
            <DateRangePicker
              startDate={new Date(startDate)}
              endDate={endDate ? new Date(endDate) : null}
              onStartDateChange={(date) => {
                if (date) {
                  setStartDate(date.toISOString().split('T')[0]);
                }
              }}
              onEndDateChange={(date) => {
                if (date) {
                  setEndDate(date.toISOString().split('T')[0]);
                } else {
                  setEndDate(null);
                }
              }}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary focus:border-primary-blue focus:ring-primary-blue"
            >
              <option value="all">{t('workspace.remoteMonitoring.dashboard.statusFilter.all')}</option>
              <option value="queued">{t('workspace.remoteMonitoring.dashboard.statusFilter.queued')}</option>
              <option value="in_progress">{t('workspace.remoteMonitoring.dashboard.statusFilter.inProgress')}</option>
              <option value="processed">{t('workspace.remoteMonitoring.dashboard.statusFilter.processed')}</option>
              <option value="failed">{t('workspace.remoteMonitoring.dashboard.statusFilter.failed')}</option>
            </select>
          </div>
        </div>

        {/* Switch-style Tabs */}
        <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setActiveTab('new')}
            className={`
              px-4 
              py-2 
              text-sm 
              font-medium 
              rounded-md
              transition-colors
              duration-200
              ${activeTab === 'new'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {t('workspace.triageDashboard.tabs.newCalls')} ({newCallsCount})
          </button>
          <button
            onClick={() => setActiveTab('viewed')}
            className={`
              px-4 
              py-2 
              text-sm 
              font-medium 
              rounded-md
              transition-colors
              duration-200
              ${activeTab === 'viewed'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {t('workspace.triageDashboard.tabs.viewedCalls')} ({viewedCallsCount})
          </button>
        </div>
      </div>

      <div className="flex-1 bg-bg-elevated rounded-lg overflow-hidden">
        <RemoteMonitoringDashboard 
          calls={filteredCalls}
          organisationDetails={organisationDetails}
          onViewResults={handleViewResults}
          markAsViewed={markAsViewed}
          handleCallAgain={handleCallAgain}
          handleDeleteCall={handleDeleteCall}
          retryingCallId={retryingCallId}
          activeTab={activeTab}
        />
      </div>

      {/* Results/Objectives Dialog */}
      <Dialog open={isResultsOpen} onClose={() => setIsResultsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded bg-bg-elevated p-6">
            <Dialog.Title className="text-xl font-semibold mb-4 text-text-primary">
              {t('workspace.remoteMonitoring.dashboard.results.title')}
            </Dialog.Title>
            {selectedConversation && (
              selectedConversation.showObjectives ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-text-primary">
                    {t('workspace.remoteMonitoring.dashboard.objectives.list')}:
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {selectedConversation.objectives?.map((objective, index) => (
                      <li key={index} className="text-text-primary">
                        {objective}
                      </li>
                    )) || (
                      <li className="text-text-secondary italic">
                        {t('workspace.remoteMonitoring.dashboard.objectives.none')}
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <ResultsTable 
                  callId={selectedConversation.id} 
                  key={selectedConversation.id}
                />
              )
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
