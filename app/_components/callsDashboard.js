'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../lib/contexts/LanguageContext';
import { Dialog } from '@headlessui/react';
import ObjectivesTable from '../workspace/calls/_components/ObjectivesTable';
import { CallDetailsModal } from './calls/CallDetailsModal';
import { CheckboxDropdown } from './CheckboxDropdown';
import { Filter } from 'lucide-react';

// Reuse the formatter helper with additional fields
const formatCallData = (call, organisationDetails) => {
  const formatTime = (date) => {
    if (!date) return '';
    
    let d;
    if (date && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return '';

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  const getFullDate = (date) => {
    if (!date) return '';
    
    let d;
    if (date && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      try {
        d = new Date(date);
      } catch (e) {
        console.error('Invalid date:', date);
        return '';
      }
    }

    if (isNaN(d.getTime())) {
      console.error('Invalid date object:', date);
      return '';
    }

    return d;
  };

  // Helper to get patient details from patientList
  const getPatientDetails = (patientId) => {
    if (!patientId || !organisationDetails?.patientList) return null;
    return organisationDetails.patientList.find(patient => patient.id === patientId);
  };

  // Add this helper function at the beginning with the other helpers
  const calculateDuration = (createdAt, finishedAt) => {
    if (!createdAt || !finishedAt) return '';
    
    let startDate, endDate;
    
    // Handle Firestore timestamps
    if (typeof createdAt?.toDate === 'function') {
      startDate = createdAt.toDate();
    } else {
      startDate = new Date(createdAt);
    }
    
    if (typeof finishedAt?.toDate === 'function') {
      endDate = finishedAt.toDate();
    } else {
      endDate = new Date(finishedAt);
    }
    
    // Calculate difference in seconds
    const diffInSeconds = Math.floor((endDate - startDate) / 1000);
    
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    
    // If less than a minute, just show seconds
    if (minutes === 0) {
      return `${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  };

  // Update status determination for processed calls
  const determineCallStatus = (call) => {
    // First check for voicemail
    if (call.answeredBy === 'Voicemail') {
      return 'voicemail';
    }

    // If it's a processed call, check completedExperience
    if (call.type === 'processed') {
      return call.completedExperience ? 'complete' : 'incomplete';
    }

    // For other types, maintain existing logic
    if (!call.recordingURL) {
      if (call.direction === 'inbound') {
        if (isCallTooOld(call.createdAt)) {
          return 'failed';
        } else {
          return 'in_progress';
        }
      } else {
        return 'failed';
      }
    }

    return call.completedExperience ? 'complete' : 'incomplete';
  };

  if (call.type === 'queued') {
    const scheduledDate = call.scheduled_for?.date && call.scheduled_for?.time ? 
      new Date(`${call.scheduled_for.date} ${call.scheduled_for.time}`) : null;
    
    // Use enqueued_at as fallback for the date
    const callDate = scheduledDate || getFullDate(call.enqueued_at);

    const patientDetails = getPatientDetails(call.patientId);

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: patientDetails?.customerName || call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      userNumber: patientDetails?.phoneNumber || call.userNumber || call.experience_custom_args?.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      templateTitle: call.templateTitle || 'N/A',
      patientId: call.patientId || null,
      formattedTimestamp: formatTime(callDate),
      fullDate: callDate,
      status: 'queued',
      viewed: false,
      enqueued_at: call.enqueued_at,
      direction: 'outbound',
      duration: calculateDuration(call.enqueued_at, scheduledDate),
      deductedCredits: call.deductedCredits || null
    };
  }

  if (call.type === 'in_progress') {
    const patientDetails = getPatientDetails(call.patientId);

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: patientDetails?.customerName || call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      userNumber: patientDetails?.phoneNumber || call.userNumber || call.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      templateTitle: call.templateTitle || 'N/A',
      patientId: call.patientId || null,
      formattedTimestamp: formatTime(call.createdAt),
      fullDate: getFullDate(call.createdAt),
      status: 'in_progress',
      viewed: false,
      direction: 'outbound',
      duration: calculateDuration(call.createdAt, call.finishedAt),
      deductedCredits: call.deductedCredits || null
    };
  }

  else if (call.type === 'failed' || call.answeredBy === 'Voicemail') {
    const patientDetails = getPatientDetails(call.patientId);
    const callDate = getFullDate(call.createdAt);

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: patientDetails?.customerName || call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      userNumber: patientDetails?.phoneNumber || call.userNumber || call.experience_custom_args?.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      activeNodes: call.activeNodes || call.experience_custom_args?.active_nodes || [],
      templateTitle: call.templateTitle || 'N/A',
      patientId: call.patientId || null,
      formattedTimestamp: formatTime(callDate),
      fullDate: callDate,
      status: call.answeredBy === 'Voicemail' ? 'voicemail' : 'failed',
      viewed: call.viewed || false,
      summaryURL: call.summaryURL || null,
      followUpSummary: call.followUpSummary || null,
      direction: call.direction === 'outbound-api' ? 'outbound' : (call.direction || 'outbound'),
      duration: calculateDuration(callDate, call.finishedAt),
      systemNumber: call.systemNumber || call.twilioNumber || 'Unknown',
      twilioNumber: call.twilioNumber || call.systemNumber || 'Unknown',
      recordingURL: call.recordingURL || call.recording_url,
      transcriptURL: call.transcriptURL || call.transcript_url,
      transcript: call.transcript,
      conversationHistory: call.conversationHistory,
      deductedCredits: call.deductedCredits || null
    };
  }

  // For processed calls
  const patientDetails = getPatientDetails(call.patientId);
  const status = determineCallStatus(call);

  // Helper function to check if call is too old (> 8 minutes)
  const isCallTooOld = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000);
    return createdDate < eightMinutesAgo;
  };

  const completedObjectives = (call.CompletedGoals?.length) || 0;
  const totalGoals = (call.settings?.initial_goals?.length || 0) + (call.settings?.final_goals?.length - 1 || 0) + (call.settings?.max_goals_to_generate || 0);
  // if totalGoals is 0 set completion to 100
  const completitionPct = totalGoals === 0 ? 0 : Math.min(Math.round((completedObjectives / totalGoals) * 100), 100);

  return {
    id: call.id,
    call_sid: call.call_sid,
    patientName: patientDetails?.customerName || call.patientName || call.patient?.name || call.experience_custom_args?.patient_name || 'Unknown',
    userNumber: call.userNumber || 'Unknown',
    twilioNumber: call.twilioNumber || 'Unknown',
    objectives: call.objectives || call.experience_custom_args?.objectives || [],
    activeNodes: call.activeNodes || call.experience_custom_args?.active_nodes || [],
    templateTitle: call.templateTitle || 'N/A',
    patientId: call.patientId || null,
    formattedTimestamp: formatTime(call.createdAt),
    fullDate: getFullDate(call.createdAt),
    status,
    viewed: call.viewed || false,
    recordingURL: call.recordingURL || null,
    conversationHistory: call.conversationHistory || null,
    summaryURL: call.summaryURL || null,
    summary: call.summary || null,
    completion: completitionPct,
    followUpSummary: call.followUpSummary || null,
    direction: call.direction || call.callDirection || 'outbound',
    duration: calculateDuration(call.createdAt, call.finishedAt),
    systemNumber: call.twilioNumber || call.systemNumber || 'Unknown',
    deductedCredits: call.deductedCredits || null
  };
};

const getTemplateFilterOptions = (calls, t) => {
  // Get unique template titles
  const uniqueTemplates = [...new Set(calls.map(call => call.templateTitle))];
  
  // Map them to filter options format
  return uniqueTemplates.map(template => ({
    value: template,
    label: template === 'patientIntake' 
      ? t('workspace.remoteMonitoring.stepTwo.template.patientIntake')
      : template
  }));
};

export function CallsDashboard({ 
  calls, 
  organisationDetails,
  onViewResults,
  markAsViewed,
  handleCallAgain,
  handleDeleteCall,
  retryingCallId,
  onFilterChange,
  filters,
  availableFilters,
  loading
}) {
  const { t } = useLanguage();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('new');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // First format the calls
  const formattedCalls = calls.map(call => formatCallData(call, organisationDetails));

  // Then filter the calls
  const filteredCalls = useMemo(() => {
    return formattedCalls.filter(call => {
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
      
      return true;
    });
  }, [formattedCalls, filters]);

  // Then group the filtered calls
  const groupedCalls = useMemo(() => {
    const groups = filteredCalls.reduce((acc, call) => {
      if (!call.fullDate) {
        return acc;
      }
      
      const dateStr = call.fullDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(call);
      return acc;
    }, {});

    // Sort each date group by time
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) => {
        // Get time values from formattedTimestamp (HH:MM)
        const timeA = a.formattedTimestamp ? 
          a.formattedTimestamp.split(':').map(Number) : [0, 0];
        const timeB = b.formattedTimestamp ? 
          b.formattedTimestamp.split(':').map(Number) : [0, 0];
        
        // Compare hours first
        if (timeA[0] !== timeB[0]) {
          return timeB[0] - timeA[0]; // Descending order (newer first)
        }
        
        // If hours are the same, compare minutes
        return timeB[1] - timeA[1];
      });
    });
    
    return groups;
  }, [filteredCalls, language]);

  // Calculate counts for each tab
  const newCallsCount = formattedCalls.filter(call => !call.viewed).length;
  const viewedCallsCount = formattedCalls.filter(call => call.viewed).length;

  // Update the table container classes
  const tableContainerClasses = `
    overflow-x-auto
    overflow-y-auto
    relative 
    h-[calc(100vh-11rem)]
    rounded-lg
    border
  `;

  const tableHeaderClasses = `
    sticky 
    top-0 
    z-40
    bg-gray-900
    text-white
    text-center
    h-14
  `;

  const headerCellClasses = `
    px-6 
    py-4
    text-center
    text-xs 
    font-medium 
    uppercase 
    tracking-wider
  `;

  const dateGroupHeaderClasses = `
    sticky
    top-14
    z-30
    bg-gray-200
    border-y
    border-gray-300
    font-medium
    px-6
    py-2
    text-gray-700
    text-left
    h-10
  `;

  const tableRowClasses = (status) => `
    hover:bg-gray-50
    transition-colors
    duration-150
    ${getStatusBackgroundColor(status)}
  `;

  const tableCellClasses = `
    px-6
    py-4
    whitespace-nowrap
    text-sm
    text-gray-900
    text-center
  `;

  // Update the action button classes
  const actionButtonClasses = `
    inline-flex
    items-center
    px-3
    py-1.5
    border
    border-transparent
    text-xs
    font-medium
    rounded-md
    shadow-sm
    text-primary-blue
    bg-blue-50
    hover:bg-blue-100
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-primary-blue
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const deleteButtonClasses = `
    inline-flex
    items-center
    px-3
    py-1.5
    border
    border-transparent
    text-xs
    font-medium
    rounded-md
    shadow-sm
    text-red-600
    bg-red-50
    hover:bg-red-100
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-red-500
  `;

  const columns = [
    { 
      key: 'patientName', 
      label: t('workspace.triageDashboard.table.patientName'),
      filterable: false 
    },
    { 
      key: 'direction', 
      label: t('workspace.remoteMonitoring.dashboard.direction.title'),
      filterable: true,
      filterOptions: availableFilters.direction.map(dir => ({
        value: dir,
        label: dir === 'inbound' 
          ? t('workspace.remoteMonitoring.dashboard.direction.inbound')
          : t('workspace.remoteMonitoring.dashboard.direction.outbound')
      })),
      currentFilter: filters.direction,
      onFilterChange: (value) => onFilterChange('direction', value)
    },
    { 
      key: 'time', 
      label: t('workspace.triageDashboard.table.time'),
      filterable: false 
    },
    { 
      key: 'templateTitle', 
      label: 'Template',
      filterable: true,
      filterOptions: availableFilters.templateTitle.map(template => ({
        value: template,
        label: template === 'patientIntake' 
          ? t('workspace.remoteMonitoring.stepTwo.template.patientIntake')
          : template === 'aiAnamnesis'
            ? t('workspace.remoteMonitoring.stepTwo.template.aiAnamnesis')
            : template
      })),
      currentFilter: filters.templateTitle,
      onFilterChange: (value) => onFilterChange('templateTitle', value)
    },
    {
      key: 'duration',
      label: t('workspace.remoteMonitoring.dashboard.duration'),
      filterable: false
    },
    { 
      key: 'status', 
      label: t('workspace.remoteMonitoring.upcomingCalls.table.status'),
      filterable: true,
      filterOptions: availableFilters.status.map(status => ({
        value: status,
        label: t(`workspace.remoteMonitoring.dashboard.statusFilter.${status}`)
      })),
      currentFilter: filters.status,
      onFilterChange: (value) => onFilterChange('status', value)
    }
  ];

  const handleViewClick = (call) => {
    if (call.status === 'in_progress') {
      // Do nothing for in-progress calls
      return;
    }
    setSelectedCall(call);
    setIsCallDetailsOpen(true);
  };

  const prepareCallDetailsData = (call, organisationDetails) => {
    // Get patient details from organisation
    const patientDetails = organisationDetails?.patientList?.find(
      patient => patient.id === call.patientId
    );

    return {
      id: call.id,
      viewed: call.viewed,
      properties: {
        toNumber: call.userNumber || 'Unknown',
        fromNumber: call.twilioNumber || 'Unknown',
        timestamp: call.createdAt || call.enqueued_at,
        completion: (call.completion || 100) + '%',
        direction: call.direction || 'N/A',
        duration: call.duration || 'N/A',
        status: call.status,
        summaryURL: call.summaryURL || 'N/A',
        templateTitle: call.templateTitle || 'N/A',
        deductedCredits: call.deductedCredits || 'N/A'
      },
      patient: patientDetails ? {
        name: patientDetails.customerName,
        dateOfBirth: patientDetails.dateOfBirth,
        phoneNumber: patientDetails.phoneNumber,
        ...Object.fromEntries(
          Object.entries(patientDetails).filter(([key]) => 
            !['id', 'customerName', 'dateOfBirth', 'phoneNumber'].includes(key)
          )
        )
      } : null,
      conversationHistory: call.conversationHistory || [],
      followUpSummary: call.followUpSummary || null,
      recordingURL: call.recordingURL || null,
      summary: call.summary || null,
      objectivesSummary: {
        objectives: call.objectives?.map(objective => ({
          item: objective,
          status: call.status === 'processed' ? 'Achieved' : 'Pending',
          notes: ''
        })) || []
      },
      templateTitle: call.templateTitle || 'N/A'
    };
  };

  const handleMarkAsViewed = async (callId) => {
    if (!callId) return;
    
    try {
      await markAsViewed(callId);
      // Update the selectedCall state to reflect the viewed status
      setSelectedCall(prev => prev?.id === callId ? { ...prev, viewed: true } : prev);
    } catch (error) {
      console.error('Error marking call as viewed:', error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className={tableContainerClasses}>
        <table className="w-full min-w-[800px] border-collapse bg-white relative">
          {/* Main Header */}
          <thead className={tableHeaderClasses}>
            <tr>
              {columns.map(column => (
                <th 
                  key={column.key} 
                  className={headerCellClasses}
                  style={{ position: 'sticky', top: 0 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {column.label}
                    {column.filterable && (
                      <CheckboxDropdown
                        title={<Filter size={14} className="text-gray-400" />}
                        items={column.filterOptions}
                        selectedItems={filters[column.key] || []}
                        onItemToggle={(value) => {
                          const currentValues = filters[column.key] || [];
                          const newValues = currentValues.includes(value)
                            ? currentValues.filter(v => v !== value)
                            : [...currentValues, value];
                          onFilterChange(column.key, newValues);
                        }}
                        onSelectAll={() => onFilterChange(column.key, column.filterOptions.map(opt => opt.value))}
                        onDeselectAll={() => onFilterChange(column.key, [])}
                        buttonClassName="p-1 text-gray-400 hover:text-gray-600"
                        dropdownClassName="right-0"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-blue"></div>
                  </div>
                </td>
              </tr>
            ) : Object.keys(groupedCalls).length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center py-12 text-gray-500 text-lg"
                >
                  {t('workspace.remoteMonitoring.dashboard.noCalls')}
                </td>
              </tr>
            ) : (
              Object.entries(groupedCalls).map(([dateStr, dateCalls]) => (
                <React.Fragment key={dateStr}>
                  {/* Date Group Header */}
                  <tr>
                    <td 
                      colSpan={columns.length} 
                      className={dateGroupHeaderClasses}
                      style={{ position: 'sticky', top: '65px' }}
                    >
                      {dateStr}
                    </td>
                  </tr>

                  {/* Calls for this date */}
                  {dateCalls.map(call => (
                    <tr 
                      key={call.id} 
                      className={`${tableRowClasses(call.status)} cursor-pointer`}
                      onClick={() => handleViewClick(call)}
                    >
                      <td className={tableCellClasses}>{call.patientName}</td>
                      <td className={tableCellClasses}>
                        {call.direction === 'inbound' ? t('workspace.remoteMonitoring.dashboard.direction.inbound') : t('workspace.remoteMonitoring.dashboard.direction.outbound')}
                      </td>
                      <td className={tableCellClasses}>
                        {call.formattedTimestamp || call.createdAt?.toDate?.().toLocaleTimeString()}
                      </td>
                      <td className={tableCellClasses}>
                        {call.templateTitle === 'patientIntake' 
                          ? t('workspace.remoteMonitoring.stepTwo.template.patientIntake')
                          : call.templateTitle}
                      </td>
                      <td className={tableCellClasses}>
                        {call.duration || ''}
                      </td>
                      <td className={tableCellClasses}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(call.status)}`}>
                            {call.status}
                          </span>
                          {(call.status === 'failed' || call.status === 'voicemail' || call.status === 'incomplete') && call.direction !== 'inbound' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCallAgain(call);
                              }}
                              disabled={retryingCallId === call.id}
                              className={`w-8 h-8 p-0 flex items-center justify-center rounded-full text-primary-blue bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <svg 
                                className={`h-4 w-4 ${retryingCallId === call.id ? 'animate-spin' : ''}`}
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                />
                              </svg>
                            </button>
                          )}
                          {call.status === 'queued' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCall(call);
                              }}
                              className="w-8 h-8 p-0 flex items-center justify-center rounded-full text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              <svg 
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Call Details Modal */}
      <CallDetailsModal 
        isOpen={isCallDetailsOpen}
        onClose={() => setIsCallDetailsOpen(false)}
        call={selectedCall ? prepareCallDetailsData(selectedCall, organisationDetails) : null}
        markAsViewed={handleMarkAsViewed}
      />

      {/* Objectives Dialog */}
      <Dialog open={isObjectivesOpen} onClose={() => setIsObjectivesOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded bg-bg-elevated p-6">
            <Dialog.Title className="text-xl font-semibold mb-4 text-text-primary">
              {t('workspace.remoteMonitoring.objectives.title')}
            </Dialog.Title>
            {selectedCall && (
              <ObjectivesTable objectives={selectedCall.objectives} />
            )}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setIsObjectivesOpen(false)} 
                className="px-4 py-2 bg-bg-secondary text-text-primary rounded hover:bg-bg-secondary/80"
              >
                {t('common.close')}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

// Update the status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'incomplete':
      return 'bg-yellow-100 text-yellow-800';
    case 'voicemail':
      return 'bg-red-100 text-red-800'
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Update background colors
const getStatusBackgroundColor = (status) => {
  switch (status) {
    case 'complete':
      return 'bg-green-50';
    case 'incomplete':
      return 'bg-yellow-50';
    case 'voicemail':
      return 'bg-red-50'
    case 'failed':
      return 'bg-red-50';
    case 'in_progress':
      return 'bg-blue-50';
    default:
      return 'bg-gray-50';
  }
}; 