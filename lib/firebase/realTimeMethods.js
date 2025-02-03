import { db } from './config';
import { collection, query, where, orderBy, onSnapshot, Timestamp, doc, collectionGroup } from 'firebase/firestore';

export const listenToAllConversations = (organisationId, startDate, endDate, callback) => {
  if (!organisationId) {
    console.warn('No organisation ID provided for listening to conversations');
    return () => {};
  }

  const startTimestamp = Timestamp.fromDate(startDate);
  const nextDay = new Date(endDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const endTimestamp = Timestamp.fromDate(nextDay);

  const conversationsRef = collection(db, 'logs/calls/conversations');
  const conversationsQuery = query(
    conversationsRef, 
    where('organisationId', '==', organisationId),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<', endTimestamp),
    orderBy("createdAt", "desc") 
  );

  return onSnapshot(conversationsQuery, callback);
};

export const listenToQueueCalls = (organisationId, callback) => {
  if (!organisationId) {
    console.warn('No organisation ID provided for listening to queue calls');
    return () => {};
  }

  // Create references to all three subcollections
  const queueRef = collection(db, 'logs/remoteMonitoring/callQueues', organisationId, 'queue');
  const activeCallsRef = collection(db, 'logs/remoteMonitoring/callQueues', organisationId, 'active_calls');
  const processedCallsRef = collection(db, 'logs/remoteMonitoring/callQueues', organisationId, 'processed_calls');

  // Create queries for each subcollection
  const queueQuery = query(queueRef);
  const activeCallsQuery = query(activeCallsRef);
  const processedCallsQuery = query(processedCallsRef);

  // Create a single callback that combines all data
  const unsubscribeQueue = onSnapshot(queueQuery, queueSnapshot => {
    const unsubscribeActive = onSnapshot(activeCallsQuery, activeSnapshot => {
      const unsubscribeProcessed = onSnapshot(processedCallsQuery, processedSnapshot => {
        // Combine all data into a single structure
        const data = {
          queue: Object.fromEntries(
            queueSnapshot.docs.map(doc => [doc.id, doc.data()])
          ),
          active_calls: Object.fromEntries(
            activeSnapshot.docs.map(doc => [doc.id, doc.data()])
          ),
          processed_calls: Object.fromEntries(
            processedSnapshot.docs.map(doc => [doc.id, doc.data()])
          )
        };
        
        callback({ exists: () => true, data: () => data });
      });
    });
  });

  // Return cleanup function that unsubscribes from all listeners
  return () => {
    unsubscribeQueue();
  };
};
