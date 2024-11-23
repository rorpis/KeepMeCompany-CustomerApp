import React from 'react';

export function TriageDashboard({ calls, markAsViewed }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Calls Dashboard</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Patient Name</th>
            <th className="border border-gray-300 px-4 py-2">Date of Birth</th>
            <th className="border border-gray-300 px-4 py-2">Summary Link</th>
            <th className="border border-gray-300 px-4 py-2">Call Timestamp</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call, index) => (
            <tr
              key={index}
              className={
                call.viewed
                  ? 'bg-green-100' // Viewed call color
                  : 'bg-yellow-100' // Unviewed call color
              }
            >
              <td className="border border-gray-300 px-4 py-2 text-black">{call.patientName}</td>
              <td className="border border-gray-300 px-4 py-2 text-black">
                {call.patientDateOfBirth}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-black">
                <a
                  href={call.summaryURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Summary
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-black">
                {call.timestamp.toLocaleString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-black">
                {!call.viewed && (
                  <button
                    onClick={() => markAsViewed(index)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Mark as Viewed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
