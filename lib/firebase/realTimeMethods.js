import { db } from './config';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

export const listenToConversations = (registeredNumbers, startDate, endDate, callback) => {
  // Validate input
  if (!registeredNumbers || !Array.isArray(registeredNumbers) || registeredNumbers.length === 0) {
    console.warn('No registered numbers provided for listening to conversations');
    return () => {}; // Return empty cleanup function
  }

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const conversationsRef = collection(db, 'logs/patientIntake/conversations');
  const customerConversationsQuery = query(
    conversationsRef, 
    where('twilioNumber', 'in', registeredNumbers),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp),
    orderBy("createdAt", "desc") 
  );

  // Attach the listener to the filtered query
  return onSnapshot(customerConversationsQuery, callback);
};

export const listenToConversationsFollowUps = (registeredNumbers, startDate, endDate, callback) => {
  // Validate input
  if (!registeredNumbers || !Array.isArray(registeredNumbers) || registeredNumbers.length === 0) {
    console.warn('No registered numbers provided for listening to conversations');
    return () => {}; // Return empty cleanup function
  }

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const conversationsRef = collection(db, 'logs/followUps/conversations');
  const customerConversationsQuery = query(
    conversationsRef, 
    where('twilioNumber', 'in', registeredNumbers),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp),
    orderBy("createdAt", "desc") 
  );

  // Attach the listener to the filtered query
  return onSnapshot(customerConversationsQuery, callback);
};
