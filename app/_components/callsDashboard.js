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
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return '';

    return d;
  };

  // Helper to get patient details from patientList
  const getPatientDetails = (patientId) => {
    if (!patientId || !organisationDetails?.patientList) return null;
    return organisationDetails.patientList.find(patient => patient.id === patientId);
  };

  if (call.type === 'queued') {
    const scheduledDate = call.scheduled_for?.date && call.scheduled_for?.time ? 
      new Date(`${call.scheduled_for.date} ${call.scheduled_for.time}`) : 
      null;

    const patientDetails = getPatientDetails(call.patientId);

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: patientDetails?.customerName || call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      userNumber: patientDetails?.phoneNumber || call.userNumber || call.experience_custom_args?.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      patientId: call.patientId || null,
      formattedTimestamp: scheduledDate ? formatTime(scheduledDate) : '',
      fullDate: scheduledDate ? getFullDate(scheduledDate) : null,
      status: 'queued',
      viewed: false,
      enqueued_at: call.enqueued_at,
      direction: 'outbound'
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
      patientId: call.patientId || null,
      formattedTimestamp: formatTime(call.createdAt),
      fullDate: getFullDate(call.createdAt),
      status: 'in_progress',
      viewed: false,
      direction: 'outbound'
    };
  }

  else if (call.type === 'failed') {
    const patientDetails = getPatientDetails(call.patientId);

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: patientDetails?.customerName || call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      userNumber: patientDetails?.phoneNumber || call.userNumber || call.experience_custom_args?.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      patientId: call.patientId || null,
      formattedTimestamp: formatTime(call.createdAt),
      fullDate: getFullDate(call.createdAt),
      status: 'failed',
      viewed: call.viewed || false,
      summaryURL: call.summaryURL || null,
      followUpSummary: call.followUpSummary || null,
      direction: call.callDirection || 'outbound'
    };
  }

  // For processed calls, check if there's a recording URL
  const patientDetails = getPatientDetails(call.patientId);
  
  return {
    id: call.id,
    call_sid: call.call_sid,
    patientName: patientDetails?.customerName || call.patientName || call.patient?.name || call.experience_custom_args?.patient_name || 'Unknown',
    userNumber: call.userNumber || 'Unknown',
    twilioNumber: call.twilioNumber || 'Unknown',
    objectives: call.objectives || [],
    patientId: call.patientId || null,
    formattedTimestamp: formatTime(call.createdAt),
    fullDate: getFullDate(call.createdAt),
    status: call.recordingURL ? 'processed' : 'failed',
    viewed: call.viewed || false,
    recordingURL: call.recordingURL || null,
    conversationHistory: call.conversationHistory || null,
    summaryURL: call.summaryURL || null,
    followUpSummary: call.followUpSummary || null,
    direction: call.direction || call.callDirection || 'outbound'
  };
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
  filters
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
      // Filter by status
      if (filters.status?.length > 0 && !filters.status.includes(call.status)) {
        return false;
      }

      // Filter by direction
      if (filters.direction?.length > 0 && !filters.direction.includes(call.direction)) {
        return false;
      }
      
      return true; // Remove the viewed state filter as it's handled by the parent
    });
  }, [formattedCalls, filters]);

  // Then group the filtered calls
  const groupedCalls = filteredCalls.reduce((groups, call) => {
    if (!call.fullDate) return groups;
    
    const dateStr = call.fullDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(call);
    return groups;
  }, {});

  // Calculate counts for each tab
  const newCallsCount = formattedCalls.filter(call => !call.viewed).length;
  const viewedCallsCount = formattedCalls.filter(call => call.viewed).length;

  // Update the table container classes
  const tableContainerClasses = `
    overflow-x-auto
    relative 
    h-[calc(100vh-12rem)]
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
      filterOptions: [
        { value: 'inbound', label: t('workspace.remoteMonitoring.dashboard.direction.inbound') },
        { value: 'outbound', label: t('workspace.remoteMonitoring.dashboard.direction.outbound') }
      ],
      currentFilter: filters.direction,
      onFilterChange: (value) => onFilterChange('direction', value)
    },
    { 
      key: 'time', 
      label: t('workspace.triageDashboard.table.time'),
      filterable: false 
    },
    { 
      key: 'status', 
      label: t('workspace.remoteMonitoring.upcomingCalls.table.status'),
      filterable: true,
      filterOptions: [
        { value: 'queued', label: t('workspace.remoteMonitoring.dashboard.statusFilter.queued') },
        { value: 'in_progress', label: t('workspace.remoteMonitoring.dashboard.statusFilter.inProgress') },
        { value: 'processed', label: t('workspace.remoteMonitoring.dashboard.statusFilter.processed') },
        { value: 'failed', label: t('workspace.remoteMonitoring.dashboard.statusFilter.failed') }
      ],
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
        completion: call.completion || 100,
        direction: call.direction || 'N/A',
        duration: call.duration || 'N/A',
        status: call.status,
        summaryURL: call.summaryURL || 'N/A',
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
      objectivesSummary: {
        objectives: call.objectives?.map(objective => ({
          item: objective,
          status: call.status === 'processed' ? 'Achieved' : 'Pending',
          notes: ''
        })) || []
      }
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
            {Object.keys(groupedCalls).length === 0 ? (
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
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(call.status)}`}>
                            {call.status}
                          </span>
                          {call.status === 'failed' && (
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

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'processed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// Helper function for row background colors
const getStatusBackgroundColor = (status) => {
  switch (status) {
    case 'processed':
      return 'bg-green-50';
    case 'failed':
      return 'bg-red-50';
    case 'in_progress':
      return 'bg-blue-50';
    default:
      return 'bg-yellow-50';
  }
}; 