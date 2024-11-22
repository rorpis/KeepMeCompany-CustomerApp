'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";
import { listenToConversations } from '../../../lib/firebase/realTimeMethods';

const TriageDashboard = () => {
  const { user, loading, emailVerified } = useAuth();
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
    <div>
      <h1> Call Backlog </h1>
      <ul>
        {conversations.map(conversation => (
          <li key={conversation.id}>
            Call {conversation.callSid}: {conversation.patientName} - {conversation.patientDateOfBirth} - {conversation.summaryURL} - {formatDate(conversation.createdAt)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TriageDashboard;
