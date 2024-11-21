import { db } from 'config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


export const listenToOrders = (customerId, callback) => {
  const ordersRef = collection(db, 'orders');
  const customerOrdersQuery = query(ordersRef, where('customer_id', '==', customerId));

  // Attach the listener to the filtered query
  return onSnapshot(customerOrdersQuery, callback);
};
