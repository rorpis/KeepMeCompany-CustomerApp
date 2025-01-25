'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../lib/contexts/LanguageContext';
import { Dialog } from '@headlessui/react';
import ObjectivesTable from '../workspace/remote-monitoring/_components/ObjectivesTable';

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
    recordingURL: call.recordingURL || null
  };
};

export function RemoteMonitoringDashboard({ 
  calls, 
  organisationDetails,
  markAsViewed, 
  onViewResults,
  handleCallAgain,
  handleDeleteCall,
  retryingCallId
}) {
  const [activeTab, setActiveTab] = useState('new');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const { t, language } = useLanguage();
  const formattedCalls = calls.map(call => formatCallData(call, organisationDetails));
  
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

  const CallsTable = ({ calls, showMarkAsViewed }) => {
    // Group calls by date
    const groupedCalls = calls.reduce((groups, call) => {
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

        {/* Single table with sticky headers */}
        <div 
          className="w-full max-h-[70vh] overflow-y-auto"
          style={{ 
            marginTop: '-2px',
            borderBottom: '2px solid rgb(156 163 175)'
          }}
        >
          <table className="w-full border-collapse border-2 border-gray-300 [border-spacing:0]" 
                 style={{ marginTop: '-2px' }}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-white"></tr>
            </thead>
            <thead className="sticky top-0 z-20">
              <tr className="bg-white">
                <th className="h-12 bg-black text-white border-r-2 border-gray-300">
                  {t('workspace.triageDashboard.table.patientName')}
                </th>
                <th className="h-12 bg-black text-white border-r-2 border-gray-300">
                  {t('workspace.triageDashboard.table.phoneNumber')}
                </th>
                <th className="h-12 bg-black text-white border-r-2 border-gray-300">
                  {t('workspace.triageDashboard.table.time')}
                </th>
                <th className="h-12 bg-black text-white border-r-2 border-gray-300">
                  {t('workspace.remoteMonitoring.upcomingCalls.table.status')}
                </th>
                <th className="h-12 bg-black text-white border-r-2 border-gray-300">
                  {t('workspace.triageDashboard.table.viewResults.title')}
                </th>
                {showMarkAsViewed && 
                  <th className="h-12 bg-black text-white">
                    {t('workspace.triageDashboard.table.actions')}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedCalls).map(([dateStr, dateCalls]) => (
                <React.Fragment key={dateStr}>
                  {/* Date header row */}
                  <tr>
                    <td 
                      colSpan={showMarkAsViewed ? 6 : 5} 
                      className="bg-gray-100 font-semibold text-gray-700 text-center sticky top-12 z-10 h-10"
                      style={{ 
                        backgroundColor: 'rgb(243 244 246)',
                        boxShadow: 'inset 0 2px 0 rgb(156 163 175), inset 0 -2px 0 rgb(156 163 175), 0 2px 4px rgba(0, 0, 0, 0.1)',
                        position: 'sticky',
                        zIndex: 10
                      }}
                    >
                      {dateStr}
                    </td>
                  </tr>
                  {/* Call rows for this date */}
                  {dateCalls.map((call, index) => (
                    <tr
                      key={`${dateStr}-${index}`}
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
                        {call.status !== 'in_progress' && (
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
                        )}
                      </td>
                      {showMarkAsViewed && !call.viewed && call.status !== 'in_progress' && (
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
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                    title={t('workspace.triageDashboard.table.callAgain')}
                                  >
                                    {retryingCallId === call.id ? (
                                      <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <img 
                                        src="/retry call.png" 
                                        alt="Retry Call"
                                        className="h-5 w-5"
                                      />
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      {showMarkAsViewed && !call.viewed && call.status === 'in_progress' && (
                        <td className="border border-gray-300 px-4 py-2"></td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

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
  };

  return (
    <CallsTable calls={activeTab === 'new' ? nonViewedCalls : viewedCalls} showMarkAsViewed={true} />
  );
} 