/**
 * One-time setup script to bootstrap the first admin in Firestore.
 * Run: node scripts/seed-admin.mjs
 * 
 * This creates documents in both admin_emails and admin_emails_lookup collections.
 * After running this, the specified Google account can link to their College ID login
 * and gain admin access.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'REDACTED_FIREBASE_API_KEY',
  projectId: 'shruti-sports-hub',
  appId: '1:1234567890:web:abcdef123456',
  authDomain: 'shruti-sports-hub.firebaseapp.com',
};

const ADMIN_EMAIL = 'baswashashank123@gmail.com';
const ADMIN_NAME = 'Shashank';

async function seedAdmin() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Seeding admin: ${ADMIN_EMAIL}`);

  // 1. Add to admin_emails collection (used by the app for listing/UI)
  const docRef = await addDoc(collection(db, 'admin_emails'), {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    addedBy: 'system',
    addedAt: serverTimestamp(),
  });
  console.log(`✓ Created admin_emails/${docRef.id}`);

  // 2. Add to admin_emails_lookup collection (used by Firestore rules for exists() check)
  await setDoc(doc(db, 'admin_emails_lookup', ADMIN_EMAIL), {
    addedBy: 'system',
    addedAt: serverTimestamp(),
  });
  console.log(`✓ Created admin_emails_lookup/${ADMIN_EMAIL}`);

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
