'use client';

import { doc, getDoc, type Firestore } from 'firebase/firestore';

/**
 * Checks if a given email is in the admin_emails Firestore allowlist.
 * Uses document ID = email for direct lookup (matches Firestore rules).
 * Simple in-memory cache to avoid repeated reads within the same session.
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
    // Direct document lookup — document ID is the email address
    // This matches the Firestore rules: exists(/databases/.../admin_emails/$(request.auth.token.email))
    const adminDoc = await getDoc(doc(firestore, 'admin_emails', normalizedEmail));
    const isAdmin = adminDoc.exists();
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
