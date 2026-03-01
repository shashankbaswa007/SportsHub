'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Start with null so the first client render matches the server render (both show the loading shell).
  // Then initialize Firebase after hydration via useEffect to avoid a hydration mismatch.
  const [services, setServices] = useState<ReturnType<typeof initializeFirebase>>(null);

  useEffect(() => {
    setServices(initializeFirebase());
  }, []);

  // Before Firebase is ready (SSR + first client render), show a loading shell
  if (!services) {
    return (
      <div className="min-h-screen bg-[var(--background-hex,#0C0C0C)]" />
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}