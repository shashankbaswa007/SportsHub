'use client';

import { doc, getDoc, collection, query, where, getDocs, type Firestore } from 'firebase/firestore';

/**
 * Checks if a given email is in the admin_emails Firestore allowlist.
 * First tries direct document lookup (doc ID = email), then falls back
 * to querying by email field in case the document ID doesn't match.
 */
let cachedResult: { email: string; isAdmin: boolean } | null = null;

export async function checkIsAdmin(firestore: Firestore, email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase();

  // Return cached result if same email
  if (cachedResult && cachedResult.email === normalizedEmail) {
    return cachedResult.isAdmin;
  }

  try {
    // Method 1: Direct document lookup — document ID is the email address
    const adminDoc = await getDoc(doc(firestore, 'admin_emails', normalizedEmail));
    console.log('[AdminCheck] Direct lookup admin_emails/' + normalizedEmail + ':', adminDoc.exists());
    
    if (adminDoc.exists()) {
      cachedResult = { email: normalizedEmail, isAdmin: true };
      return true;
    }

    // Method 2: Query by email field (fallback if doc ID doesn't match)
    const q = query(collection(firestore, 'admin_emails'), where('email', '==', normalizedEmail));
    const snap = await getDocs(q);
    console.log('[AdminCheck] Query by email field:', { found: !snap.empty, count: snap.size });
    
    if (!snap.empty) {
      cachedResult = { email: normalizedEmail, isAdmin: true };
      return true;
    }

    cachedResult = { email: normalizedEmail, isAdmin: false };
    return false;
  } catch (error) {
    console.error('[AdminCheck] Admin check failed:', error);
    return false;
  }
}

export function clearAdminCache() {
  cachedResult = null;
}
