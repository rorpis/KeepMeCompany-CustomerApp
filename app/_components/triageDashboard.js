'use client';

import React, { useState } from 'react';

// Standardize the data structure with a formatter helper
const formatCallData = (call) => {
  // Create a stable date string format that will be consistent between server and client
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    
    // Handle Firestore Timestamp
    let d;
    if (date && typeof date.toDate === 'function') {
      // If it's a Firestore Timestamp
      d = date.toDate();
    } else if (date instanceof Date) {
      // If it's already a Date object
      d = date;
    } else {
      // If it's something else, try to create a date
      d = new Date(date);
    }

    // Check if we have a valid date
    if (isNaN(d.getTime())) return 'Unknown';

    // Format the date
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
    patientName: call.patientName || call.patient?.name || 'Unknown',
    patientDateOfBirth: call.patientDateOfBirth || call.patient?.dateOfBirth || 'Unknown',
    summaryURL: call.summaryURL || call.transcriptionUrl || '#',
    timestamp: call.timestamp || call.createdAt || new Date(),
    formattedTimestamp: formatDate(call.timestamp || call.createdAt),
    viewed: call.viewed || false,
  };
};

export function TriageDashboard({ 
  calls, 
  markAsViewed, 
  isRemoteMonitoring = false,
  onViewResults 
}) {
  const [activeTab, setActiveTab] = useState('new');
  const formattedCalls = calls.map(formatCallData);
  
  const viewedCalls = formattedCalls.filter(call => call.viewed);
  const nonViewedCalls = formattedCalls.filter(call => !call.viewed);

  const CallsTable = ({ calls, showMarkAsViewed }) => (
    <table className="table-auto border-collapse border border-gray-300 w-full">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Patient Name</th>
          <th className="border border-gray-300 px-4 py-2">Date of Birth</th>
          <th className="border border-gray-300 px-4 py-2">Summary</th>
          <th className="border border-gray-300 px-4 py-2">Call Timestamp</th>
          {showMarkAsViewed && <th className="border border-gray-300 px-4 py-2">Actions</th>}
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
              {isRemoteMonitoring ? (
                <button
                  onClick={() => onViewResults(call)}
                  className="text-primary-blue hover:text-primary-blue/80"
                >
                  View Results
                </button>
              ) : (
                <a
                  href={call.summaryURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Summary
                </a>
              )}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-black">
              {call.formattedTimestamp}
            </td>
            {showMarkAsViewed && !call.viewed && (
              <td className="border border-gray-300 px-4 py-2 text-black">
                <button
                  onClick={() => markAsViewed(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Mark as Viewed
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
          New Calls ({nonViewedCalls.length})
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'viewed'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('viewed')}
        >
          Viewed Calls ({viewedCalls.length})
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
