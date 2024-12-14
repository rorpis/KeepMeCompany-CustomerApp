'use client';

import { useState, useEffect } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { listenToQueueCalls } from '../../../../lib/firebase/realTimeMethods';

const UpcomingCallsPage = () => {
  const { selectedOrgId } = useOrganisation();
  const [calls, setCalls] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'queue', 'processed'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = listenToQueueCalls(selectedOrgId, (snapshot) => {
      if (!snapshot.exists()) {
        setCalls([]);
        setIsLoading(false);
        return;
      }

      const data = snapshot.data();
      const queueCalls = Object.entries(data.queue || {}).map(([id, call]) => ({
        id,
        ...call,
        status: 'queue',
      }));

      const processedCalls = Object.entries(data.processed_calls || {}).map(([id, call]) => ({
        id,
        ...call,
        status: 'processed',
      }));

      // Helper function to get timestamp in milliseconds
      const getTimestamp = (date) => {
        if (!date) return 0;
        
        // Handle Firestore Timestamp
        if (typeof date.toMillis === 'function') {
          return date.toMillis();
        }
        
        // Handle Date object
        if (date instanceof Date) {
          return date.getTime();
        }
        
        // Handle string or number
        return new Date(date).getTime();
      };

      // Combine and sort by enqueued_at in descending order
      const allCalls = [...queueCalls, ...processedCalls].sort(
        (a, b) => getTimestamp(b.enqueued_at) - getTimestamp(a.enqueued_at)
      );

      setCalls(allCalls);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedOrgId]);

  const filteredCalls = calls.filter(call => {
    if (activeTab === 'all') return true;
    return call.status === activeTab;
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Upcoming Follow-up Calls</h2>
      
      <div className="max-w-[65%] mx-auto">
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-border-main mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 ${
              activeTab === 'all'
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 ${
              activeTab === 'queue'
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            In Queue
          </button>
          <button
            onClick={() => setActiveTab('processed')}
            className={`px-4 py-2 ${
              activeTab === 'processed'
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Processed
          </button>
        </div>

        {/* Calls Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg-secondary">
                <th className="border border-border-main px-4 py-2 text-left text-text-primary">Patient Name</th>
                <th className="border border-border-main px-4 py-2 text-left text-text-primary">Date of Birth</th>
                <th className="border border-border-main px-4 py-2 text-left text-text-primary">Phone Number</th>
                <th className="border border-border-main px-4 py-2 text-left text-text-primary">Enqueued At</th>
                <th className="border border-border-main px-4 py-2 text-left text-text-primary">Status</th>
                <th className="border border-border-main px-4 py-2 text-left text-text-primary">Call SID</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => (
                <tr
                  key={call.id}
                  className={`${
                    call.status === 'processed' 
                      ? 'bg-green-50 hover:bg-green-100' 
                      : 'bg-yellow-50 hover:bg-yellow-100'
                  }`}
                >
                  <td className="border border-border-main px-4 py-2 text-gray-900">
                    {call.experience_custom_args?.patient_name || '-'}
                  </td>
                  <td className="border border-border-main px-4 py-2 text-gray-900">
                    {call.experience_custom_args?.patient_dob || '-'}
                  </td>
                  <td className="border border-border-main px-4 py-2 text-gray-900">
                    {call.phone_number || '-'}
                  </td>
                  <td className="border border-border-main px-4 py-2 text-gray-900">
                    {call.enqueued_at ? (
                      typeof call.enqueued_at.toDate === 'function' 
                        ? call.enqueued_at.toDate().toLocaleString()
                        : new Date(call.enqueued_at).toLocaleString()
                    ) : '-'}
                  </td>
                  <td className="border border-border-main px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        call.status === 'processed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {call.status === 'processed' ? 'Processed' : 'In Queue'}
                    </span>
                  </td>
                  <td className="border border-border-main px-4 py-2 text-gray-900">
                    {call.call_sid || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpcomingCallsPage;
