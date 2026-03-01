"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Match } from '@/lib/types';

const NOTIFICATION_STORAGE_KEY = 'sports-hub-notified-matches';

function getNotifiedMatches(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function markNotified(matchId: string) {
  if (typeof window === 'undefined') return;
  const s = getNotifiedMatches();
  s.add(matchId);
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([...s]));
}

export function useMatchNotifications(matches: Match[], teamsById: Map<string, { name: string }>) {
  const [enabled, setEnabled] = useState(false);
  const previousMatchesRef = useRef<Map<string, Match['status']>>(new Map());

  // Check permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      setEnabled(true);
      return true;
    }

    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    const granted = result === 'granted';
    setEnabled(granted);
    return granted;
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      return false;
    }
    return requestPermission();
  }, [enabled, requestPermission]);

  // Watch for LIVE matches
  useEffect(() => {
    if (!enabled) return;

    const notifiedSet = getNotifiedMatches();

    for (const match of matches) {
      const previousStatus = previousMatchesRef.current.get(match.id);

      // Only notify when a match transitions to LIVE (not on first load)
      if (
        match.status === 'LIVE' &&
        previousStatus &&
        previousStatus !== 'LIVE' &&
        !notifiedSet.has(match.id)
      ) {
        const teamA = teamsById.get(match.teamAId);
        const teamB = teamsById.get(match.teamBId);
        const title = `🔴 Match is LIVE!`;
        const body = `${teamA?.name ?? 'Team A'} vs ${teamB?.name ?? 'Team B'} — ${match.sport}`;

        try {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            tag: `match-live-${match.id}`,
            requireInteraction: false,
          });
          markNotified(match.id);
        } catch (e) {
          // Some browsers throw on Notification constructor
          console.warn('Notification failed:', e);
        }
      }
    }

    // Update previous state
    const nextMap = new Map<string, Match['status']>();
    for (const m of matches) {
      nextMap.set(m.id, m.status);
    }
    previousMatchesRef.current = nextMap;
  }, [matches, enabled, teamsById]);

  return { enabled, toggleNotifications, requestPermission };
}
