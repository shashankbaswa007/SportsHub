
// This configuration is derived from your service account and is safe to use on the client-side.
// Provide fallback values for build time to prevent errors when env vars are not set

// Use the app's own domain as authDomain so that signInWithPopup opens a same-origin
// popup (proxied via Next.js rewrites to Firebase's /__/auth/handler).
// This avoids Cross-Origin-Opener-Policy issues that block popup communication.
const getAuthDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.host;
  }
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-project.firebaseapp.com';
};

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key-for-build',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'mock-app-id',
  authDomain: getAuthDomain(),
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project'}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
};
