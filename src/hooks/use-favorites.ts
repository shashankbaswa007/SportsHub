"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SportName } from '@/lib/types';

const STORAGE_KEY_TEAMS = 'sports-hub-favorite-teams';
const STORAGE_KEY_SPORTS = 'sports-hub-favorite-sports';

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, s: Set<string>) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify([...s]));
  }
}

export function useFavorites() {
  const [favoriteTeams, setFavoriteTeams] = useState<Set<string>>(new Set());
  const [favoriteSports, setFavoriteSports] = useState<Set<string>>(new Set());

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setFavoriteTeams(readSet(STORAGE_KEY_TEAMS));
    setFavoriteSports(readSet(STORAGE_KEY_SPORTS));
  }, []);

  const toggleFavoriteTeam = useCallback((teamId: string) => {
    setFavoriteTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      writeSet(STORAGE_KEY_TEAMS, next);
      return next;
    });
  }, []);

  const toggleFavoriteSport = useCallback((sport: SportName) => {
    setFavoriteSports(prev => {
      const next = new Set(prev);
      if (next.has(sport)) next.delete(sport);
      else next.add(sport);
      writeSet(STORAGE_KEY_SPORTS, next);
      return next;
    });
  }, []);

  const isTeamFavorite = useCallback((teamId: string) => favoriteTeams.has(teamId), [favoriteTeams]);
  const isSportFavorite = useCallback((sport: SportName) => favoriteSports.has(sport), [favoriteSports]);

  return useMemo(() => ({
    favoriteTeams,
    favoriteSports,
    toggleFavoriteTeam,
    toggleFavoriteSport,
    isTeamFavorite,
    isSportFavorite,
  }), [favoriteTeams, favoriteSports, toggleFavoriteTeam, toggleFavoriteSport, isTeamFavorite, isSportFavorite]);
}
