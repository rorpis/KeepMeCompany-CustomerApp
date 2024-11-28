'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";
import { useOrganisation } from '../../../lib/contexts/OrganisationContext';
import { listenToConversations } from '../../../lib/firebase/realTimeMethods';

const TriageDashboard = () => {
  const { user, loading, emailVerified } = useAuth();
  const { selectedOrgId, organisationDetails, loading_organisation } = useOrganisation();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
    } else if (user && !emailVerified) {
      router.push("/verify-email"); // Redirect to a verify-email page if email not verified
    }
  }, [user, loading, emailVerified, router]);

  useEffect(() => {
    const unsubscribe = listenToConversations("+442078701183", (snapshot) => {
      const customerConversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(customerConversations);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [user]);

  if (loading) return <p>Loading...</p>;

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown Date"; // Handle missing/invalid dates
    const date = timestamp.toDate(); // Convert Firestore Timestamp to JS Date
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit",  minute: "2-digit"};
    return date.toLocaleDateString("en-GB", options);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-sm text-gray-500">Organisation</h2>
        <h1 className="text-2xl font-bold">{organisationDetails?.name || 'Loading...'}</h1>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Call Backlog</h2>
      <ul className="space-y-2">
        {conversations.map(conversation => (
          <li key={conversation.id} className="p-3 bg-white rounded shadow">
            Call {conversation.callSid}: {conversation.patientName} - {conversation.patientDateOfBirth} - {conversation.summaryURL} - {formatDate(conversation.createdAt)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TriageDashboard;
