'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../lib/contexts/LanguageContext';

// Reuse the formatter helper with additional fields
const formatCallData = (call) => {
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    
    let d;
    if (date && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return 'Unknown';

    const options = { 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      hour: "2-digit",  
      minute: "2-digit"
    };
    return d.toLocaleDateString("en-GB", options);
  };

  return {
    id: call.id,
    patientName: call.patientName || call.patient?.name || call.experience_custom_args?.patient_name || 'Unknown',
    patientDateOfBirth: call.patientDateOfBirth || call.patient?.dateOfBirth || call.experience_custom_args?.patient_dob || 'Unknown',
    userNumber: call.userNumber || call.user_number || 'Unknown',
    summaryURL: call.summaryURL || call.transcriptionUrl || '#',
    timestamp: call.timestamp || call.createdAt || new Date(),
    formattedTimestamp: formatDate(call.timestamp || call.createdAt),
    enqueuedAt: formatDate(call.enqueued_at || call.timestamp || call.createdAt),
    status: call.status || 'processed',
    viewed: call.viewed || false,
  };
};

export function RemoteMonitoringDashboard({ 
  calls, 
  markAsViewed, 
  onViewResults 
}) {
  const [activeTab, setActiveTab] = useState('new');
  const { t } = useLanguage();
  const formattedCalls = calls.map(formatCallData);
  
  const viewedCalls = formattedCalls.filter(call => call.viewed);
  const nonViewedCalls = formattedCalls.filter(call => !call.viewed);

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
            {t('workspace.remoteMonitoring.upcomingCalls.table.phoneNumber')}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t('workspace.remoteMonitoring.upcomingCalls.table.enqueuedAt')}
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
            className={call.viewed ? 'bg-green-100' : 'bg-yellow-100'}
          >
            <td className="border border-gray-300 px-4 py-2 text-black">{call.patientName}</td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.patientDateOfBirth}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.userNumber}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.enqueuedAt}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.formattedTimestamp}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  call.status === 'processed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {call.status}
              </span>
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              <button
                onClick={() => onViewResults(call)}
                className="bg-gray-100 hover:bg-gray-200 text-primary-blue hover:text-primary-blue/80 px-3 py-1 rounded transition-colors duration-200"
              >
                {t('workspace.triageDashboard.table.viewResults.cell')}
              </button>
            </td>
            {showMarkAsViewed && !call.viewed && (
              <td className="border border-gray-300 px-4 py-2 text-black">
                <button
                  onClick={() => markAsViewed(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {t('workspace.triageDashboard.table.markAsViewed')}
                </button>
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
    </div>
  );
} 