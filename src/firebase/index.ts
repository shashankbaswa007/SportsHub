
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Only initialize Firebase in the browser, not during SSR/build
  if (typeof window === 'undefined') {
    // Return mock SDKs during server-side rendering/build
    return null;
  }
  
  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Return null if initialization fails
      return null;
    }
  }
  // If already initialized, or after initializing, return the SDKs with the App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
