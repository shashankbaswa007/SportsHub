'use client';

import { collection, query, where, getDocs, type Firestore } from 'firebase/firestore';

/**
 * Checks if a given email is in the admin_emails Firestore allowlist.
 * Uses a simple in-memory cache to avoid repeated queries within the same session.
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
    const adminQuery = query(
      collection(firestore, 'admin_emails'),
      where('email', '==', normalizedEmail)
    );
    const snap = await getDocs(adminQuery);
    const isAdmin = !snap.empty;
    cachedResult = { email: normalizedEmail, isAdmin };
    return isAdmin;
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
}

export function clearAdminCache() {
  cachedResult = null;
}
