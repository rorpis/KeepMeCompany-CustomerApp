import { db } from './config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';


export const listenToConversations = (customerPhone, callback) => {
  const conversationsRef = collection(db, 'logs/patientIntake/conversations');
  const customerConversationsQuery = query(
    conversationsRef, 
    where('twilioNumber', '==', customerPhone),
    orderBy("createdAt", "desc") 
  );

  // Attach the listener to the filtered query
  return onSnapshot(customerConversationsQuery, callback);
};
