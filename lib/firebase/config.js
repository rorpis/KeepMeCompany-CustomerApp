import { initializeApp, getApps, cert } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const getFirebaseConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      // Parse the JSON string from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG || '');
      
      // Ensure the private key is properly formatted
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      return serviceAccount;
    } catch (error) {
      console.error('Error parsing Firebase service account JSON:', error);
      throw new Error('Invalid Firebase configuration in environment');
    }
  } else {
    // Development: Read from local file
    try {
      return require('../../credentials_local/firestore_credentials.json');
    } catch (error) {
      console.error('Error loading Firebase credentials:', error);
      throw new Error('Firebase credentials not found in development environment');
    }
  }
};

// Initialize Firebase if it hasn't been initialized yet
const initializeFirebase = () => {
  try {
    if (getApps().length === 0) {
      const config = getFirebaseConfig();
      initializeApp(config);
    }
    return getFirestore();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export const db = initializeFirebase();

// Export a method to get Firebase config for client-side
export const getClientFirebaseConfig = () => {
  const config = getFirebaseConfig();
  return {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  };
};
