"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let app;
let db;
let auth;

const getFirebaseConfig = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const serviceAccount = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}');
    
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    return serviceAccount;
  } catch (error) {
    console.error('Error parsing Firebase service account JSON:', error);
    throw new Error('Invalid Firebase configuration in environment');
  }
};

export const getClientFirebaseConfig = () => {
  if (typeof window === 'undefined') return {};
  
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

if (typeof window !== 'undefined' && !getApps().length) {
  const config = getClientFirebaseConfig();
  app = initializeApp(config);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
