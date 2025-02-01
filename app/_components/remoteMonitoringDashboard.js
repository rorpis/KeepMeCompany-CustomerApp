'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../lib/contexts/LanguageContext';
import { Dialog } from '@headlessui/react';
import ObjectivesTable from '../workspace/remote-monitoring/_components/ObjectivesTable';
import { CallDetailsModal } from './calls/CallDetailsModal';

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
      enqueued_at: call.enqueued_at
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
    };
  }

  // For processed calls, check if there's a recording URL
  const patientDetails = getPatientDetails(call.patientId);
  
  return {
    id: call.id,
    call_sid: call.call_sid,
    patientName: patientDetails?.customerName || call.patientName || call.patient?.name || call.experience_custom_args?.patient_name || 'Unknown',
    userNumber: patientDetails?.phoneNumber || call.userNumber || call.user_number || 'Unknown',
    objectives: call.objectives || [],
    patientId: call.patientId || null,
    formattedTimestamp: formatTime(call.createdAt),
    fullDate: getFullDate(call.createdAt),
    status: call.recordingURL ? 'processed' : 'failed',
    viewed: call.viewed || false,
    recordingURL: call.recordingURL || null,
    conversationHistory: call.conversationHistory || null
  };
};

export function RemoteMonitoringDashboard({ 
  calls, 
  organisationDetails,
  onViewResults,
  markAsViewed,
  handleCallAgain,
  handleDeleteCall,
  retryingCallId
}) {
  const { t } = useLanguage();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('new');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);

  // Format calls data first
  const formattedCalls = calls.map(call => formatCallData(call, organisationDetails));

  // Calculate counts for each tab
  const newCallsCount = formattedCalls.filter(call => !call.viewed).length;
  const viewedCallsCount = formattedCalls.filter(call => call.viewed).length;

  // Group filtered calls by date
  const groupedCalls = formattedCalls.reduce((groups, call) => {
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
    z-20 
    bg-gray-900
    text-white
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
    top-[48px]
    z-10
    bg-gray-200
    border-y
    border-gray-300
    font-medium
    px-6
    py-2
    text-gray-700
    text-left
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
    { key: 'patientName', label: t('workspace.triageDashboard.table.patientName') },
    { key: 'phoneNumber', label: t('workspace.triageDashboard.table.phoneNumber') },
    { key: 'time', label: t('workspace.triageDashboard.table.time') },
    { key: 'status', label: t('workspace.remoteMonitoring.upcomingCalls.table.status') },
    { key: 'actions', label: t('workspace.triageDashboard.table.actions') }
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
      properties: {
        fromNumber: call.userNumber || 'Unknown',
        toNumber: process.env.NEXT_PUBLIC_TWILIO_NUMBER || 'Unknown',
        timestamp: call.createdAt || call.enqueued_at,
        completion: call.completion || 100,
        direction: 'outbound',
        duration: call.duration || 'N/A',
        status: call.status
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
      medicalSummary: {
        objectives: call.objectives?.map(objective => ({
          item: objective,
          status: call.status === 'processed' ? 'Achieved' : 'Pending',
          notes: ''
        })) || []
      }
    };
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
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {Object.entries(groupedCalls).map(([dateStr, dateCalls]) => (
              <React.Fragment key={dateStr}>
                {/* Date Group Header */}
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className={dateGroupHeaderClasses}
                    style={{ position: 'sticky', top: '48px' }}
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
                    <td className={tableCellClasses}>{call.userNumber}</td>
                    <td className={tableCellClasses}>
                      {call.formattedTimestamp || call.createdAt?.toDate?.().toLocaleTimeString()}
                    </td>
                    <td className={tableCellClasses}>
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className={tableCellClasses}>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {call.status !== 'in_progress' && (
                          <>
                            <button
                              onClick={() => handleViewClick(call)}
                              className={actionButtonClasses}
                            >
                              {(call.status === 'queued' || call.status === 'failed')
                                ? t('workspace.triageDashboard.table.viewObjectives')
                                : t('workspace.triageDashboard.table.viewResults.cell')}
                            </button>
                            {!call.viewed && activeTab === 'new' && call.status !== 'queued' && (
                              <button
                                onClick={() => markAsViewed(call.id)}
                                className={actionButtonClasses}
                              >
                                {t('workspace.triageDashboard.table.markAsViewed')}
                              </button>
                            )}
                            {call.status === 'failed' && (
                              <button
                                onClick={() => handleCallAgain(call)}
                                disabled={retryingCallId === call.id}
                                className={`${actionButtonClasses} w-10 h-10 p-0 flex items-center justify-center`}
                              >
                                <svg 
                                  className={`h-5 w-5 ${retryingCallId === call.id ? 'animate-spin' : ''}`}
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
                                onClick={() => handleDeleteCall(call)}
                                className={deleteButtonClasses}
                              >
                                {t('workspace.triageDashboard.table.deleteCall')}
                              </button>
                            )}
                            {call.status === 'processed' && call.recordingURL && (
                              <a
                                href={call.recordingURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${actionButtonClasses} w-10 h-10 p-0 flex items-center justify-center`}
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
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {/* Padding row with background color */}
            <tr>
              <td colSpan={columns.length} className="h-5 bg-bg-elevated"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Call Details Modal */}
      <CallDetailsModal 
        isOpen={isCallDetailsOpen}
        onClose={() => setIsCallDetailsOpen(false)}
        call={selectedCall ? prepareCallDetailsData(selectedCall, organisationDetails) : null}
        markAsViewed={markAsViewed}
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