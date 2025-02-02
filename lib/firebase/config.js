"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

let app;
let db;
let auth;

/* const getFirebaseConfig = () => {
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
}; */

export const getClientFirebaseConfig = () => {
  if (typeof window === 'undefined') return {};
  
  /* const config = getFirebaseConfig(); */
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_appId,
    /* measurementId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_measurementId */
  };
};

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp({
    apiKey: `AIzaSyBap0GJ9EogEOqRpaerGtXvysfam2n93cw`,
    authDomain: `keepmecompanyai.firebaseapp.com`,
    projectId: `keepmecompanyai`,
    storageBucket: `keepmecompanyai.firebasestorage.app`,
    messagingSenderId: `1099500018898`,
    appId: `1:1099500018898:web:02b80dc6f1be388979a10b`,
  });
  db = getFirestore(app);
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();

// Add required scopes for Google Calendar
/* googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly'); */

const microsoftProvider = new OAuthProvider('microsoft.com');

// Add required Microsoft scopes
microsoftProvider.addScope('user.read');
microsoftProvider.addScope('openid');
microsoftProvider.addScope('profile');
microsoftProvider.addScope('email');

// Set custom parameters for both personal and work accounts
microsoftProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: '',  // Remove any default login hint
  tenant: 'common'  // Allows both personal and work/school accounts
});

export { db, auth, googleProvider, microsoftProvider };
