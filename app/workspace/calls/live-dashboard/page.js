'use client';

import { useState, useEffect, useMemo } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { CallsDashboard } from '../../../_components/callsDashboard';
import ResultsTable from '../_components/ResultsTable';
import { listenToConversationsFollowUps, listenToQueueCalls, listenToAllConversations } from '../../../../lib/firebase/realTimeMethods';
import { Dialog } from '@headlessui/react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '../../../../lib/firebase/authContext';
import DateRangePicker from '../../../_components/DateRangePicker';

// Add these helper functions
const getUniqueValues = (calls, key) => {
  return [...new Set(calls.map(call => call[key]))];
};

const getInitialFilters = (calls) => {
  return {
    status: getUniqueValues(calls, 'status'),
    direction: getUniqueValues(calls, 'direction'),
    templateTitle: getUniqueValues(calls, 'templateTitle')
  };
};

const getStatusPriority = (status) => {
  switch (status) {
    case 'processed':
      return 2;
    case 'in_progress':
      return 3;
    case 'failed':
      return 1;
    default:
      return 0;
  }
};

const CallsDashboardPage = () => {
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
  const [filters, setFilters] = useState({
    status: [],
    direction: [],
    templateTitle: []
  });
  const [isProcessingData, setIsProcessingData] = useState(false);

  useEffect(() => {
    if (!selectedOrgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true); // Set loading when starting to fetch

    // Listen to all conversations
    const unsubscribeConversations = listenToAllConversations(
      selectedOrgId,
      new Date(startDate),
      new Date(endDate),
      (snapshot) => {
        const allConversations = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            status: data.callDirection === 'inbound' ? 'processed' : 'processed',
            type: data.callDirection === 'inbound' ? 'processed' : 'completed'
          };
        });
        setConversations(allConversations);
        setIsLoading(false); // Set loading to false after receiving first batch of data
      }
    );

    // Listen to queued calls
    const unsubscribeQueue = listenToQueueCalls(
      selectedOrgId,
      (snapshot) => {
        if (!snapshot.exists()) {
          setQueuedCalls([]);
          setActiveCalls([]);
          setProcessedCalls([]);
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

    return () => {
      unsubscribeConversations();
      unsubscribeQueue();
      unsubscribeProcessed();
    };
  }, [selectedOrgId, startDate, endDate]);

  // Updated mergedCalls logic
  const mergedCalls = useMemo(() => {
    setIsProcessingData(true);
    try {
      // Start with all conversations
      const allCalls = conversations.map(conv => {
        if (conv.callDirection === 'inbound') {
          return {
            ...conv,
            type: 'processed',
            status: 'processed',
            viewed: conv.viewed || false,
            direction: 'inbound',
            templateTitle: 'patientIntake',
            call_sid: conv.callSid
          };
        }
      
        const matchingProcessedCall = processedCalls.find(
          qCall => qCall.call_sid === conv.callSid
        );
        
        return {
          ...conv,
          type: 'processed',
          status: 'processed',
          viewed: matchingProcessedCall?.viewed || false,
          call_sid: conv.callSid,
          direction: 'outbound',
          templateTitle: matchingProcessedCall?.template || conv.template || 'N/A'
        };
      });

      const conversationIds = new Set(conversations.map(conv => conv.callSid));
      
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
          templateTitle: queuedCall.template || 'N/A',
          scheduled_for: {
            date: queuedCall.scheduled_for?.[0]?.date,
            time: queuedCall.scheduled_for?.[0]?.time
          },
          status: 'queued',
          type: 'queued',
          viewed: queuedCall.viewed || false,
          formattedTimestamp: queuedCall.enqueued_at,
          direction: 'outbound'
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
          viewed: false,
          direction: 'outbound',
          templateTitle: activeCall.template || 'N/A'
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
              viewed: processedCall.viewed || false,
              direction: 'outbound',
              templateTitle: processedCall.template || 'N/A'
            });
          }
        }
      });

      // Deduplicate calls based on call_sid and priority
      const callsBySid = new Map();
      
      allCalls.forEach(call => {
        if (!call.call_sid) {
          callsBySid.set(call.id, call);
          return;
        }

        const existingCall = callsBySid.get(call.call_sid);
        if (!existingCall) {
          callsBySid.set(call.call_sid, call);
          return;
        }

        const existingPriority = getStatusPriority(existingCall.status);
        const newPriority = getStatusPriority(call.status);
        
        if (newPriority > existingPriority) {
          callsBySid.set(call.call_sid, call);
        }
      });

      // Convert back to array and sort
      const dedupedCalls = Array.from(callsBySid.values());

      // Sort by timestamp
      return dedupedCalls.sort((a, b) => {
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
    } finally {
      setIsProcessingData(false);
    }
  }, [conversations, queuedCalls, processedCalls, activeCalls, startDate, endDate]);

  // Calculate counts from all calls (before filtering)
  const newCallsCount = mergedCalls.filter(call => !call.viewed).length;
  const viewedCallsCount = mergedCalls.filter(call => call.viewed).length;

  // Filter calls based on status and viewed state
  const filteredCalls = useMemo(() => {
    return mergedCalls.filter(call => {
      // If any filter array is empty, don't show any calls
      if (!filters.status?.length || !filters.direction?.length || !filters.templateTitle?.length) {
        return false;
      }

      // Filter by status
      if (!filters.status.includes(call.status)) {
        return false;
      }

      // Filter by direction
      if (!filters.direction.includes(call.direction)) {
        return false;
      }

      // Filter by template
      if (!filters.templateTitle.includes(call.templateTitle)) {
        return false;
      }
      
      // Then filter by viewed state
      if (activeTab === 'new') {
        return !call.viewed;
      }
      return call.viewed;
    });
  }, [mergedCalls, filters, activeTab]);

  // Use useEffect to set initial filters once mergedCalls is available
  useEffect(() => {
    if (mergedCalls.length > 0) {
      const initialFilters = getInitialFilters(mergedCalls);
      setFilters(initialFilters);
    }
  }, [mergedCalls]);  // Run whenever mergedCalls changes

  // Store available filter options separately from active filters
  const availableFilters = useMemo(() => getInitialFilters(mergedCalls), [mergedCalls]);

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
            scheduledFor,
            templateTitle: call.templateTitle
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reschedule call');
      }
    } catch (error) {
      console.error('Error rescheduling call:', error);
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

    const call_sid = callToMark.call_sid || callToMark.callSid;
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
            callSid: call_sid,
            organisationId: selectedOrgId,
            callType: callToMark.status,
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

  if (isLoading || isProcessingData) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col p-6 max-w-7xl mx-auto">
        {/* Keep the filters section with disabled state */}
        <div className="flex items-center justify-between mb-4 opacity-50 pointer-events-none">  
          <div className="flex items-center space-x-4">
            <div>
              <DateRangePicker
                startDate={new Date(startDate)}
                endDate={endDate ? new Date(endDate) : null}
                onStartDateChange={() => {}}
                onEndDateChange={() => {}}
              />
            </div>
          </div>

          <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
            <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-500">
              {t('workspace.triageDashboard.tabs.newCalls')} (0)
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-500">
              {t('workspace.triageDashboard.tabs.viewedCalls')} (0)
            </button>
          </div>
        </div>

        {/* Loading spinner in the content area */}
        <div className="flex-1 bg-bg-elevated rounded-lg overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6 max-w-7xl mx-auto">
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
        <CallsDashboard 
          calls={filteredCalls}
          organisationDetails={organisationDetails}
          onViewResults={handleViewResults}
          markAsViewed={markAsViewed}
          handleCallAgain={handleCallAgain}
          handleDeleteCall={handleDeleteCall}
          retryingCallId={retryingCallId}
          onFilterChange={(key, value) => {
            setFilters(prev => ({
              ...prev,
              [key]: value
            }));
          }}
          filters={filters}
          availableFilters={availableFilters}
          loading={isLoading || isProcessingData}
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

export default CallsDashboardPage;
