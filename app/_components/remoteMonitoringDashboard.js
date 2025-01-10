'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../lib/contexts/LanguageContext';
import { Dialog } from '@headlessui/react';
import ObjectivesTable from '../workspace/remote-monitoring/_components/ObjectivesTable';

// Reuse the formatter helper with additional fields
const formatCallData = (call) => {
  const formatDate = (date) => {
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

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  };

  if (call.type === 'queued') {
    // Create a date from the scheduled_for data
    const scheduledDate = call.scheduled_for?.date && call.scheduled_for?.time ? 
      new Date(`${call.scheduled_for.date} ${call.scheduled_for.time}`) : 
      null;

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      patientDateOfBirth: call.patientDateOfBirth || call.experience_custom_args?.patient_dob || 'Unknown',
      userNumber: call.userNumber || call.experience_custom_args?.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      formattedTimestamp: scheduledDate ? formatDate(scheduledDate) : '',
      status: 'queued',
      viewed: false,
      enqueued_at: call.enqueued_at
    };
  }

  else if (call.type === 'failed') {
    // Create a date from the scheduled_for data
    const scheduledDate = call.scheduled_for?.date && call.scheduled_for?.time ? 
      new Date(`${call.scheduled_for.date} ${call.scheduled_for.time}`) : 
      null;

    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: call.patientName || call.experience_custom_args?.patient_name || 'Unknown',
      patientDateOfBirth: call.patientDateOfBirth || call.experience_custom_args?.patient_dob || 'Unknown',
      userNumber: call.userNumber || call.experience_custom_args?.phone_number || 'Unknown',
      objectives: call.objectives || call.experience_custom_args?.objectives || [],
      formattedTimestamp: formatDate(call.createdAt),
      status: 'failed',
      viewed: call.viewed || false,
    };
  }

  // For processed calls, check if there's a recording URL
  if (!call.recordingURL) {
    // If no recording URL, treat as failed
    return {
      id: call.id,
      call_sid: call.call_sid,
      patientName: call.patientName || call.patient?.name || call.experience_custom_args?.patient_name || 'Unknown',
      patientDateOfBirth: call.patientDateOfBirth || call.patient?.dateOfBirth || call.experience_custom_args?.patient_dob || 'Unknown',
      userNumber: call.userNumber || call.user_number || 'Unknown',
      objectives: call.objectives || [],
      formattedTimestamp: formatDate(call.createdAt),
      status: 'failed',
      viewed: call.viewed || false,
      recordingURL: null
    };
  }

  // If there is a recording URL, process as normal
  return {
    id: call.id,
    call_sid: call.call_sid,
    patientName: call.patientName || call.patient?.name || call.experience_custom_args?.patient_name || 'Unknown',
    patientDateOfBirth: call.patientDateOfBirth || call.patient?.dateOfBirth || call.experience_custom_args?.patient_dob || 'Unknown',
    userNumber: call.userNumber || call.user_number || 'Unknown',
    objectives: call.objectives || [],
    formattedTimestamp: formatDate(call.createdAt),
    status: 'processed',
    viewed: call.viewed || false,
    recordingURL: call.recordingURL
  };
};

export function RemoteMonitoringDashboard({ 
  calls, 
  markAsViewed, 
  onViewResults,
  handleCallAgain,
  handleDeleteCall,
  retryingCallId
}) {
  const [activeTab, setActiveTab] = useState('new');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const { t } = useLanguage();
  const formattedCalls = calls.map(formatCallData);
  
  const viewedCalls = formattedCalls.filter(call => call.viewed);
  const nonViewedCalls = formattedCalls.filter(call => !call.viewed);

  const handleViewClick = (call) => {
    if (call.status === 'queued' || call.status === 'failed') {
      setSelectedCall(call);
      setIsObjectivesOpen(true);
    } else {
      onViewResults(call);
    }
  };

  const CallsTable = ({ calls, showMarkAsViewed }) => (
    <table className="table-auto border-collapse border border-gray-300 w-full">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.triageDashboard.table.patientName')}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.triageDashboard.table.dateOfBirth')}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.triageDashboard.table.phoneNumber')}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.triageDashboard.table.callTimestamp')}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.remoteMonitoring.upcomingCalls.table.status')}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.triageDashboard.table.viewResults.title')}
          </th>
          {showMarkAsViewed && 
            <th className="border border-gray-300 px-4 py-2">
              {t('workspace.triageDashboard.table.actions')}
            </th>
          }
        </tr>
      </thead>
      <tbody>
        {calls.map((call, index) => (
          <tr
            key={index}
            className={
              call.viewed 
                ? 'bg-green-100' 
                : call.status === 'queued'
                  ? 'bg-yellow-100'
                  : 'bg-gray-50'
            }
          >
            <td className="border border-gray-300 px-4 py-2 text-black">{call.patientName}</td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.patientDateOfBirth}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.userNumber}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.formattedTimestamp}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  call.status === 'processed'
                    ? 'bg-green-100 text-green-800'
                    : call.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {call.status}
              </span>
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewClick(call)}
                  className="bg-gray-100 hover:bg-gray-200 text-primary-blue hover:text-primary-blue/80 px-3 py-1 rounded transition-colors duration-200"
                >
                  {(call.status === 'queued' || call.status === 'failed')
                    ? t('workspace.triageDashboard.table.viewObjectives')
                    : t('workspace.triageDashboard.table.viewResults.cell')}
                </button>
                {call.status === 'processed' && call.recordingURL && (
                  <button
                    onClick={() => window.open(call.recordingURL, '_blank')}
                    className="bg-gray-100 hover:bg-gray-200 text-primary-blue hover:text-primary-blue/80 px-3 py-1 rounded transition-colors duration-200"
                    title={t('workspace.triageDashboard.table.listenRecording')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </td>
            {showMarkAsViewed && !call.viewed && (
              <td className="border border-gray-300 px-4 py-2 text-black">
                <div className="flex gap-2">
                  {call.status === 'queued' ? (
                    <button
                      onClick={() => handleDeleteCall(call)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      {t('workspace.triageDashboard.table.deleteCall')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => markAsViewed(call.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        {t('workspace.triageDashboard.table.markAsViewed')}
                      </button>
                      {call.status === 'failed' && (
                        <button
                          onClick={() => handleCallAgain(call)}
                          disabled={retryingCallId === call.id}
                          className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                          {retryingCallId === call.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>{t('common.loading')}</span>
                            </>
                          ) : (
                            t('workspace.triageDashboard.table.callAgain')
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex w-full mb-4 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === 'new'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('new')}
        >
          {t('workspace.triageDashboard.tabs.newCalls')} ({nonViewedCalls.length})
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'viewed'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('viewed')}
        >
          {t('workspace.triageDashboard.tabs.viewedCalls')} ({viewedCalls.length})
        </button>
      </div>

      {activeTab === 'new' && (
        <CallsTable calls={nonViewedCalls} showMarkAsViewed={true} />
      )}
      {activeTab === 'viewed' && (
        <CallsTable calls={viewedCalls} showMarkAsViewed={false} />
      )}

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