/**
 * One-time setup script to bootstrap the first admin in Firestore.
 * 
 * Prerequisites: Create a .env.local file at the project root with:
 *   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 *   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * 
 * Run: node --env-file=.env.local scripts/seed-admin.mjs
 * 
 * This creates a document in the admin_emails collection with the email as document ID.
 * After running this, the specified Google account can link to their College ID login
 * and gain admin access.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
};

const ADMIN_EMAIL = 'baswashashank123@gmail.com';
const ADMIN_NAME = 'Shashank';

async function seedAdmin() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Seeding admin: ${ADMIN_EMAIL}`);

  // Add to admin_emails collection with email as document ID
  // This is used by both the app and Firestore rules for exists() checks
  await setDoc(doc(db, 'admin_emails', ADMIN_EMAIL), {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    addedBy: 'system',
    addedAt: serverTimestamp(),
  });
  console.log(`✓ Created admin_emails/${ADMIN_EMAIL}`);

  console.log('\nDone! You can now:');
  console.log('1. Log in with your College ID');
  console.log('2. Navigate to /admin');
  console.log(`3. Link your Google account (${ADMIN_EMAIL})`);
  console.log('4. You\'ll have admin access!');
  
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
