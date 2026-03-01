"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Match, Team, Player, SportName, PointsTableItem } from './types';
import { sports } from './data-client';

interface DataContextValue {
  matches: Match[];
  teams: Team[];
  players: Player[];
  loading: boolean;
  /** O(1) team lookup by ID */
  teamsById: Map<string, Team>;
  /** Players grouped by teamId for O(1) per-team lookup */
  playersByTeam: Map<string, Player[]>;
  /** Pre-computed points tables for every sport, derived from cached matches/teams */
  leaderboards: Record<SportName, PointsTableItem[]>;
}

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Single provider that subscribes to matches, teams, and players once.
 * All pages read from this context instead of creating their own onSnapshot listeners.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const unsubMatches = onSnapshot(query(collection(firestore, 'matches')), (snap) => {
      const docs = snap.docs.map((d) => {
        const m = { id: d.id, ...d.data() } as Match;
        // Pre-compute numeric timestamp so sort doesn't call new Date() repeatedly
        (m as any)._ts = new Date(m.startTime).getTime();
        return m;
      });
      docs.sort((a, b) => (b as any)._ts - (a as any)._ts);
      setMatches(docs);
      setLoadingMatches(false);
    });

    const unsubTeams = onSnapshot(query(collection(firestore, 'teams')), (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Team)));
      setLoadingTeams(false);
    });

    const unsubPlayers = onSnapshot(query(collection(firestore, 'players')), (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Player)));
      setLoadingPlayers(false);
    });

    return () => {
      unsubMatches();
      unsubTeams();
      unsubPlayers();
    };
  }, [firestore]);

  // O(1) team lookup map
  const teamsById = useMemo(() => {
    const map = new Map<string, Team>();
    for (const team of teams) map.set(team.id, team);
    return map;
  }, [teams]);

  // Players grouped by teamId
  const playersByTeam = useMemo(() => {
    const map = new Map<string, Player[]>();
    for (const player of players) {
      const arr = map.get(player.teamId);
      if (arr) arr.push(player);
      else map.set(player.teamId, [player]);
    }
    return map;
  }, [players]);

  // Compute leaderboards client-side from cached data — no extra Firestore reads
  const leaderboards = useMemo(() => {
    const result = {} as Record<SportName, PointsTableItem[]>;
    for (const sport of sports) {
      const completedMatches = matches.filter((m) => m.sport === sport && m.status === 'COMPLETED');
      if (completedMatches.length === 0) {
        result[sport] = [];
        continue;
      }

      const teamIds = [...new Set(completedMatches.flatMap((m) => [m.teamAId, m.teamBId]).filter(Boolean))];
      const sportTeams = teams.filter((t) => teamIds.includes(t.id));

      const table: Record<string, PointsTableItem> = {};
      for (const team of sportTeams) {
        table[team.id] = {
          teamId: team.id,
          teamName: team.name,
          played: 0,
          won: 0,
          lost: 0,
          drawn: 0,
          points: 0,
          rank: 0,
        };
      }

      for (const match of completedMatches) {
        const a = match.teamAId ? table[match.teamAId] : undefined;
        const b = match.teamBId ? table[match.teamBId] : undefined;
        if (!a || !b) continue;
        a.played++;
        b.played++;
        const isDraw = match.teamAScore === match.teamBScore;
        const aWon = match.teamAScore > match.teamBScore;
        if (isDraw) {
          a.drawn++;
          a.points += 1;
          b.drawn++;
          b.points += 1;
        } else if (aWon) {
          a.won++;
          a.points += 2;
          b.lost++;
        } else {
          b.won++;
          b.points += 2;
          a.lost++;
        }
      }

      result[sport] = Object.values(table)
        .sort((a, b) => b.points - a.points || b.won - a.won)
        .map((item, i) => ({ ...item, rank: i + 1 }));
    }
    return result;
  }, [matches, teams]);

  const loading = loadingMatches || loadingTeams || loadingPlayers;

  const value = useMemo<DataContextValue>(
    () => ({ matches, teams, players, loading, teamsById, playersByTeam, leaderboards }),
    [matches, teams, players, loading, teamsById, playersByTeam, leaderboards]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppData must be used inside DataProvider');
  return ctx;
}
