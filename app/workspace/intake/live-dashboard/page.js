'use client';

import { useState, useEffect } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { TriageDashboard } from '../../../_components/triageDashboard';
import { listenToConversations } from '../../../../lib/firebase/realTimeMethods';

const TriageDashboardPage = () => {
  const { selectedOrgId, organisationDetails } = useOrganisation();
  const [conversations, setConversations] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setHours(0,0,0,0)).toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(23,59,59,999)).toISOString().slice(0, 16));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const initializeListener = async () => {
      if (!organisationDetails?.registeredNumbers?.length) {
        setIsLoading(false);
        return;
      }

      try {
        unsubscribe = listenToConversations(
          organisationDetails.registeredNumbers,
          new Date(startDate),
          new Date(endDate),
          (snapshot) => {
            const customerConversations = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setConversations(customerConversations);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error initializing conversation listener:', error);
        setIsLoading(false);
      }
    };

    initializeListener();

    return () => unsubscribe();
  }, [organisationDetails?.registeredNumbers, organisationDetails, startDate, endDate]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!organisationDetails?.registeredNumbers?.length) {
    return <div className="p-6">No registered numbers found for this organisation.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Call Backlog</h2>
      
      {/* Date Filter Section */}
      <div className="mb-6 flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">From</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary focus:border-primary-blue focus:ring-primary-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">To</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="bg-bg-secondary border border-border-main rounded p-2 text-text-primary focus:border-primary-blue focus:ring-primary-blue"
          />
        </div>
      </div>

      <TriageDashboard 
        calls={conversations} 
        markAsViewed={(index) => {
          console.log('Marking call as viewed:', conversations[index].id);
        }} 
      />
    </div>
  );
};

export default TriageDashboardPage;
