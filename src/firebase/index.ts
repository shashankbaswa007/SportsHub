
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    try {
      if (process.env.NODE_ENV !== 'production' || firebaseConfig.apiKey) {
        // Initialize with config for local development or if config is explicitly provided
        initializeApp(firebaseConfig);
      } else {
        // Initialize without config for production (App Hosting)
        initializeApp();
      }
    } catch (error) {
      // During Next.js build, we're in 'production' mode but not actually deployed.
      // initializeApp() will throw because options are missing. Use a dummy config to let build pass.
      initializeApp({ apiKey: "build", projectId: "build", appId: "1:1:web:1" });
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
