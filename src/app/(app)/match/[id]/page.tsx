"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updatePlayerStats, recalculateMatchScores, updateSetScore } from '@/lib/data-client';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SportIcon } from '@/components/sport-icon';
import type { SportName, Player, Match, SetScore, CricketScore } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Save, Plus, Minus, Edit, X, RefreshCw, ArrowLeft, MapPin,
  Calendar, Clock, Info, Trophy, BarChart3, Zap, Activity
} from 'lucide-react';
import { MatchPrediction } from '@/components/match-prediction';
import { MatchPerformanceCharts } from '@/components/match-performance-charts';
import { MatchCountdown } from '@/components/match-countdown';
import { ErrorBoundary } from '@/components/error-boundary';
import { ScoreTimeline } from '@/components/score-timeline';
import { MatchPolls } from '@/components/match-polls';
import { LiveScorePanel } from '@/components/live-score-panel';
import { ShareMatchButton } from '@/components/share-match-button';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore, useFirebase } from '@/firebase';
import { useAppData } from '@/lib/data-context';
import { checkIsAdmin } from '@/lib/admin-check';

/* ─── Tabs ─── */
const TABS = ['Overview', 'Players', 'Timeline', 'Poll'] as const;
type TabName = (typeof TABS)[number];

/* ─── Helpers ─── */
const statusConfig = {
  LIVE: { label: 'LIVE', className: 'match-badge-live', icon: Activity },
  UPCOMING: { label: 'UPCOMING', className: 'match-badge-upcoming', icon: Clock },
  COMPLETED: { label: 'COMPLETED', className: 'match-badge-completed', icon: Trophy },
} as const;

type EditablePlayerStats = { [key: string]: string | number };
type EditableSet = SetScore & { isEditing?: boolean };

/* ─── Stat Bar ─── */
function StatBar({ label, valueA, valueB }: { label: string; valueA: number; valueB: number }) {
  const total = valueA + valueB || 1;
  const pctA = (valueA / total) * 100;
  const pctB = (valueB / total) * 100;
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span className={`font-mono font-bold text-sm ${aWins ? 'text-blue-400' : 'text-white/70'}`}>{valueA}</span>
        <span className="uppercase tracking-wider text-[10px] font-semibold text-white/40">{label}</span>
        <span className={`font-mono font-bold text-sm ${bWins ? 'text-rose-400' : 'text-white/70'}`}>{valueB}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
        <motion.div
          className="h-full rounded-l-full bg-gradient-to-r from-blue-500 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${pctA}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <div className="w-px bg-white/10" />
        <motion.div
          className="h-full rounded-r-full bg-gradient-to-l from-rose-500 to-rose-400"
          initial={{ width: 0 }}
          animate={{ width: `${pctB}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ─── Team Stat Bars for sport ─── */
function getTeamStatBars(sport: SportName, teamAPlayers: Player[], teamBPlayers: Player[]) {
  const sum = (players: Player[], key: string) =>
    players.reduce((s, p) => s + (Number(p.stats?.[key]) || 0), 0);

  const bars: { label: string; valueA: number; valueB: number }[] = [];

  switch (sport) {
    case 'Football':
      bars.push({ label: 'Goals', valueA: sum(teamAPlayers, 'Goals'), valueB: sum(teamBPlayers, 'Goals') });
      bars.push({ label: 'Assists', valueA: sum(teamAPlayers, 'Assists'), valueB: sum(teamBPlayers, 'Assists') });
      bars.push({ label: 'Yellow Cards', valueA: sum(teamAPlayers, 'Yellow Cards'), valueB: sum(teamBPlayers, 'Yellow Cards') });
      bars.push({ label: 'Red Cards', valueA: sum(teamAPlayers, 'Red Cards'), valueB: sum(teamBPlayers, 'Red Cards') });
      break;
    case 'Basketball':
      bars.push({ label: 'Points', valueA: sum(teamAPlayers, 'Points'), valueB: sum(teamBPlayers, 'Points') });
      bars.push({ label: 'Rebounds', valueA: sum(teamAPlayers, 'Rebounds'), valueB: sum(teamBPlayers, 'Rebounds') });
      bars.push({ label: 'Assists', valueA: sum(teamAPlayers, 'Assists'), valueB: sum(teamBPlayers, 'Assists') });
      break;
    case 'Cricket':
      bars.push({ label: 'Runs', valueA: sum(teamAPlayers, 'Runs'), valueB: sum(teamBPlayers, 'Runs') });
      bars.push({ label: 'Wickets', valueA: sum(teamAPlayers, 'Wickets'), valueB: sum(teamBPlayers, 'Wickets') });
      bars.push({ label: 'Fours', valueA: sum(teamAPlayers, 'Fours'), valueB: sum(teamBPlayers, 'Fours') });
      bars.push({ label: 'Sixes', valueA: sum(teamAPlayers, 'Sixes'), valueB: sum(teamBPlayers, 'Sixes') });
      break;
    case 'Volleyball':
      bars.push({ label: 'Points', valueA: sum(teamAPlayers, 'Points'), valueB: sum(teamBPlayers, 'Points') });
      bars.push({ label: 'Aces', valueA: sum(teamAPlayers, 'Aces'), valueB: sum(teamBPlayers, 'Aces') });
      bars.push({ label: 'Blocks', valueA: sum(teamAPlayers, 'Blocks'), valueB: sum(teamBPlayers, 'Blocks') });
      break;
    case 'Throwball':
      bars.push({ label: 'Points', valueA: sum(teamAPlayers, 'Points'), valueB: sum(teamBPlayers, 'Points') });
      bars.push({ label: 'Catches', valueA: sum(teamAPlayers, 'Catches'), valueB: sum(teamBPlayers, 'Catches') });
      break;
    case 'Badminton (Singles)':
    case 'Badminton (Doubles)':
    case 'Table Tennis (Singles)':
    case 'Table Tennis (Doubles)':
      bars.push({ label: 'Points', valueA: sum(teamAPlayers, 'Points'), valueB: sum(teamBPlayers, 'Points') });
      bars.push({ label: 'Smashes', valueA: sum(teamAPlayers, 'Smashes'), valueB: sum(teamBPlayers, 'Smashes') });
      break;
    case 'Kabaddi':
      bars.push({ label: 'Raid Points', valueA: sum(teamAPlayers, 'Raid Points'), valueB: sum(teamBPlayers, 'Raid Points') });
      bars.push({ label: 'Tackle Points', valueA: sum(teamAPlayers, 'Tackle Points'), valueB: sum(teamBPlayers, 'Tackle Points') });
      break;
  }

  return bars.filter((b) => b.valueA > 0 || b.valueB > 0);
}

/* ────────────────────────────── Main Component ────────────────────────────── */

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { teamsById, playersByTeam } = useAppData();

  const [isAdmin, setIsAdmin] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('Overview');

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingPlayerStats, setEditingPlayerStats] = useState<EditablePlayerStats>({});
  const [editingSet, setEditingSet] = useState<Partial<EditableSet> | null>(null);

  /* ── Admin check ── */
  useEffect(() => {
    const googleEmail =
      auth.currentUser?.providerData.find((p) => p.providerId === 'google.com')?.email ?? null;
    const verifiedAdmin =
      typeof window !== 'undefined' ? window.sessionStorage.getItem('sports-hub-verified-admin') : null;
    const emailToCheck = googleEmail || verifiedAdmin;

    if (emailToCheck && firestore) {
      checkIsAdmin(firestore, emailToCheck).then(setIsAdmin).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [auth.currentUser, firestore]);

  /* ── Real-time match listener ── */
  useEffect(() => {
    if (!id || !firestore) {
      setLoading(false);
      return;
    }

    const unsubMatch = onSnapshot(doc(firestore, 'matches', id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setMatch({ id: docSnapshot.id, ...docSnapshot.data() } as Match);
      } else {
        setMatch(null);
      }
      setLoading(false);
    });

    return () => unsubMatch();
  }, [id, firestore]);

  /* ── Derived data ── */
  const teamA = useMemo(() => (match?.teamAId ? (teamsById.get(match.teamAId) ?? null) : null), [match?.teamAId, teamsById]);
  const teamB = useMemo(() => (match?.teamBId ? (teamsById.get(match.teamBId) ?? null) : null), [match?.teamBId, teamsById]);
  const teamAPlayers = useMemo(() => (match?.teamAId ? (playersByTeam.get(match.teamAId) ?? []) : []), [match?.teamAId, playersByTeam]);
  const teamBPlayers = useMemo(() => (match?.teamBId ? (playersByTeam.get(match.teamBId) ?? []) : []), [match?.teamBId, playersByTeam]);
  const statBars = useMemo(() => (match ? getTeamStatBars(match.sport, teamAPlayers, teamBPlayers) : []), [match, teamAPlayers, teamBPlayers]);

  const teamAWinning = match ? match.teamAScore > match.teamBScore : false;
  const teamBWinning = match ? match.teamBScore > match.teamAScore : false;

  /* ── Handlers (admin editing) ── */
  const handleBackNavigation = useCallback(() => router.push('/overview'), [router]);

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player.id);
    setEditingPlayerStats({ ...player.stats });
  };

  const handleCancelEditPlayer = () => {
    setEditingPlayer(null);
    setEditingPlayerStats({});
  };

  const handlePlayerStatChange = (stat: string, value: string) => {
    setEditingPlayerStats((prev) => ({ ...prev, [stat]: value }));
  };

  const handlePlayerStatIncrement = (stat: string) => {
    setEditingPlayerStats((prev) => ({ ...prev, [stat]: (Number(prev[stat]) || 0) + 1 }));
  };

  const handlePlayerStatDecrement = (stat: string) => {
    setEditingPlayerStats((prev) => ({ ...prev, [stat]: Math.max(0, (Number(prev[stat]) || 0) - 1) }));
  };

  const handleSavePlayerStats = async (playerId: string) => {
    const numericStats: Record<string, number> = {};
    for (const key in editingPlayerStats) {
      const val = Number(editingPlayerStats[key]);
      numericStats[key] = isNaN(val) ? 0 : val;
    }

    try {
      await updatePlayerStats(firestore, playerId, numericStats);
      await recalculateMatchScores(firestore, match!.id);
      setEditingPlayer(null);
      setEditingPlayerStats({});
      toast({ title: 'Stats Updated', description: 'Player performance and match score have been updated.' });
    } catch (error) {
      console.error('Failed to save player stats:', error);
      toast({ title: 'Error', description: 'Failed to save player stats.', variant: 'destructive' });
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculateMatchScores(firestore, match!.id);
      toast({ title: 'Scores Refreshed', description: 'Match scores recalculated from player stats.' });
    } catch (error) {
      console.error('Failed to recalculate scores:', error);
      toast({ title: 'Error', description: 'Failed to recalculate scores.', variant: 'destructive' });
    }
  };

  const handleEditSet = (set: SetScore) => {
    setEditingSet({ ...set, isEditing: true });
  };

  const handleCancelEditSet = () => setEditingSet(null);

  const handleSaveSet = async () => {
    if (!editingSet || !editingSet.set) return;
    try {
      await updateSetScore(firestore, match!.id, editingSet.set, Number(editingSet.teamAScore), Number(editingSet.teamBScore));
      await recalculateMatchScores(firestore, match!.id);
      setEditingSet(null);
      toast({ title: 'Set Score Updated' });
    } catch (error) {
      console.error('Failed to save set score:', error);
      toast({ title: 'Error', description: 'Failed to update set score.', variant: 'destructive' });
    }
  };

  /* ── Loading / Not Found ── */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
        <p className="text-xs text-white/30 uppercase tracking-widest">Loading match</p>
      </div>
    );
  }

  if (!match || !teamA || !teamB) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="p-4 rounded-full bg-white/[0.03] border border-white/10">
          <Trophy className="h-8 w-8 text-white/20" />
        </div>
        <h1 className="text-xl font-bold text-white/60">Match Not Found</h1>
        <Button variant="outline" onClick={() => router.push('/overview')} className="border-white/10 text-white/60">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Overview
        </Button>
      </div>
    );
  }

  const cricketScore = match.sport === 'Cricket' ? (match.scoreDetails as CricketScore) : null;
  const statusCfg = statusConfig[match.status] ?? statusConfig['UPCOMING'];
  const StatusIcon = statusCfg.icon;

  /* ── Player stat card renderer ── */
  const renderPlayerCard = (player: Player, teamSide: 'A' | 'B') => {
    const isEditing = editingPlayer === player.id;
    const isBlue = teamSide === 'A';

    return (
      <motion.div
        key={player.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border bg-white/[0.02] p-3 sm:p-4 transition-all ${
          isEditing
            ? isBlue
              ? 'border-blue-500/30 ring-1 ring-blue-500/20'
              : 'border-rose-500/30 ring-1 ring-rose-500/20'
            : 'border-white/[0.06]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
              isBlue ? 'bg-blue-500/10 border-blue-500/20' : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <span className={`text-[10px] font-bold ${isBlue ? 'text-blue-400' : 'text-rose-400'}`}>
                {(player.name || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-white/80">{player.name}</span>
          </div>
          {isAdmin && !isEditing && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-white/60" onClick={() => handleEditPlayer(player)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-3">
            {Object.keys(player.stats ?? {}).map((key) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-white/40 capitalize min-w-[60px]">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-white/40" onClick={() => handlePlayerStatDecrement(key)}>
                    <Minus className="h-2.5 w-2.5" />
                  </Button>
                  <Input
                    type="number"
                    className="w-12 h-7 text-center text-xs bg-white/[0.04] border-white/10"
                    value={editingPlayerStats[key]}
                    onChange={(e) => handlePlayerStatChange(key, e.target.value)}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-white/40" onClick={() => handlePlayerStatIncrement(key)}>
                    <Plus className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-white/[0.06]">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleCancelEditPlayer}>
                <X className="mr-1 h-3 w-3" /> Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => handleSavePlayerStats(player.id)}>
                <Save className="mr-1 h-3 w-3" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
            {Object.entries(player.stats ?? {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 capitalize truncate">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={`text-xs font-mono font-semibold ${Number(value) > 0 ? 'text-white/80' : 'text-white/20'}`}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  /* ────────────── RENDER ────────────── */
  return (
    <div className="relative min-h-full pb-8">
      {/* ─── Back Button + Share ─── */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4 flex items-center justify-between">
        <Button variant="ghost" className="h-9 text-sm text-white/50 hover:text-white/80 -ml-2" onClick={handleBackNavigation}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Overview</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <ShareMatchButton match={match} teamA={teamA} teamB={teamB} />
      </motion.div>

      {/* ═══════════════════════ HERO SCOREBOARD ═══════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="match-hero-card relative rounded-2xl overflow-hidden mb-6"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-rose-500/[0.06]" />
        {match.status === 'LIVE' && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.03] via-transparent to-red-500/[0.03] animate-pulse" />
        )}

        <div className="relative z-10 p-5 sm:p-8">
          {/* Sport label + Status */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-white/40">
              <SportIcon sport={match.sport} className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{match.sport}</span>
            </div>
            <div className={`${statusCfg.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
              {match.status === 'LIVE' && <span className="match-live-dot" />}
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </div>
          </div>

          {/* ── Scoreboard Grid ── */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            {/* Team A */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black transition-all duration-500 ${
                teamAWinning ? 'bg-blue-500/15 text-blue-400 ring-2 ring-blue-500/20' : 'bg-white/[0.04] text-white/50'
              }`}>
                {teamA.name.charAt(0)}
              </div>
              <h2 className={`font-headline text-sm sm:text-lg md:text-xl font-bold text-center leading-tight transition-colors ${
                teamAWinning && match.status !== 'UPCOMING' ? 'text-blue-400' : 'text-white/80'
              }`}>
                {teamA.name}
              </h2>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-2 sm:gap-4">
                <motion.span
                  key={`a-${match.teamAScore}`}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`match-score font-headline text-4xl sm:text-5xl lg:text-6xl font-black tabular-nums ${
                    teamAWinning && match.status !== 'UPCOMING' ? 'text-blue-400' : 'text-white'
                  }`}
                >
                  {match.teamAScore}
                </motion.span>
                <span className="text-xl sm:text-2xl text-white/15 font-light select-none">:</span>
                <motion.span
                  key={`b-${match.teamBScore}`}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`match-score font-headline text-4xl sm:text-5xl lg:text-6xl font-black tabular-nums ${
                    teamBWinning && match.status !== 'UPCOMING' ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {match.teamBScore}
                </motion.span>
              </div>

              {cricketScore && cricketScore.runs != null && (
                <p className="font-mono text-xs sm:text-sm text-white/40 mt-1">
                  {cricketScore.runs}/{cricketScore.wickets ?? 0} ({cricketScore.overs ?? 0} ov)
                </p>
              )}

              {match.status === 'UPCOMING' && (
                <div className="mt-3">
                  <MatchCountdown startTime={match.startTime} />
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black transition-all duration-500 ${
                teamBWinning ? 'bg-rose-500/15 text-rose-400 ring-2 ring-rose-500/20' : 'bg-white/[0.04] text-white/50'
              }`}>
                {teamB.name.charAt(0)}
              </div>
              <h2 className={`font-headline text-sm sm:text-lg md:text-xl font-bold text-center leading-tight transition-colors ${
                teamBWinning && match.status !== 'UPCOMING' ? 'text-rose-400' : 'text-white/80'
              }`}>
                {teamB.name}
              </h2>
            </div>
          </div>

          {/* ── Match meta row ── */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mt-5 sm:mt-6 text-xs text-white/30 flex-wrap">
            {match.venue && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.venue}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {new Date(match.startTime).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Admin recalc */}
          {isAdmin && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleRecalculate} size="sm" variant="outline" className="text-xs border-white/10 text-white/50 hover:text-white h-8">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Recalculate
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════ TAB NAVIGATION ═══════════════════════ */}
      <div className="match-tab-bar flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`match-tab relative flex-1 min-w-[80px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === tab
                ? 'match-tab-active text-white bg-white/[0.08]'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-lg bg-white/[0.06] -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ TAB CONTENT ═══════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Team Stat Comparison */}
              {statBars.length > 0 && (
                <Card className="glass border-white/[0.06] overflow-hidden">
                  <CardHeader className="p-4 sm:p-5 pb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <CardTitle className="text-sm font-bold text-white/70">Head to Head</CardTitle>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs font-semibold">
                      <span className="text-blue-400">{teamA.name}</span>
                      <span className="text-rose-400">{teamB.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                    {statBars.map((bar) => (
                      <StatBar key={bar.label} label={bar.label} valueA={bar.valueA} valueB={bar.valueB} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Set Scores */}
              {Array.isArray(match.scoreDetails) && match.scoreDetails.length > 0 && (
                <Card className="glass border-white/[0.06] overflow-hidden">
                  <CardHeader className="p-4 sm:p-5 pb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <CardTitle className="text-sm font-bold text-white/70">Set Scores</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(match.scoreDetails as SetScore[]).map((set) => {
                        const aWins = set.teamAScore > set.teamBScore;
                        const bWins = set.teamBScore > set.teamAScore;
                        const isEditingThis = editingSet?.set === set.set;

                        return (
                          <motion.div
                            key={set.set}
                            layout
                            className={`relative rounded-xl p-3 sm:p-4 border transition-all ${
                              aWins ? 'border-blue-500/20 bg-blue-500/[0.04]'
                              : bWins ? 'border-rose-500/20 bg-rose-500/[0.04]'
                              : 'border-white/[0.06] bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Set {set.set}</span>
                              {isAdmin && (
                                isEditingThis ? (
                                  <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-5 w-5 text-white/30" onClick={handleCancelEditSet}><X className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-5 w-5 text-emerald-400" onClick={handleSaveSet}><Save className="h-3 w-3" /></Button>
                                  </div>
                                ) : (
                                  <Button size="icon" variant="ghost" className="h-5 w-5 text-white/20" onClick={() => handleEditSet(set)}><Edit className="h-3 w-3" /></Button>
                                )
                              )}
                            </div>

                            {isEditingThis && editingSet ? (
                              <div className="flex items-center gap-1.5">
                                <Input type="number" value={editingSet.teamAScore} onChange={(e) => setEditingSet({ ...editingSet, teamAScore: Number(e.target.value) })} className="w-full h-8 text-sm text-center bg-white/[0.04] border-white/10" />
                                <span className="text-white/20 text-xs">-</span>
                                <Input type="number" value={editingSet.teamBScore} onChange={(e) => setEditingSet({ ...editingSet, teamBScore: Number(e.target.value) })} className="w-full h-8 text-sm text-center bg-white/[0.04] border-white/10" />
                              </div>
                            ) : (
                              <div className="flex items-baseline justify-center gap-2">
                                <span className={`font-mono text-2xl sm:text-3xl font-black ${aWins ? 'text-blue-400' : 'text-white/50'}`}>{set.teamAScore}</span>
                                <span className="text-white/10 text-lg">-</span>
                                <span className={`font-mono text-2xl sm:text-3xl font-black ${bWins ? 'text-rose-400' : 'text-white/50'}`}>{set.teamBScore}</span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Match Details + Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass border-white/[0.06]">
                  <CardHeader className="p-4 sm:p-5 pb-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-white/40" />
                      <CardTitle className="text-sm font-bold text-white/70">Match Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Date</p>
                        <p className="text-sm font-semibold text-white/70">{new Date(match.startTime).toLocaleDateString()}</p>
                      </div>
                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Time</p>
                        <p className="text-sm font-semibold text-white/70">{new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    {match.venue && (
                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Venue</p>
                        <p className="text-sm font-semibold text-white/70">{match.venue}</p>
                      </div>
                    )}
                    {match.details && (
                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Details</p>
                        <p className="text-sm text-white/60">{match.details}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <ErrorBoundary fallbackTitle="Insights unavailable">
                  <MatchPrediction match={match} teamA={teamA} teamB={teamB} />
                </ErrorBoundary>
              </div>
            </div>
          )}

          {/* ─── PLAYERS TAB ─── */}
          {activeTab === 'Players' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-bold text-white/70">{teamA.name}</h3>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/30">{teamAPlayers.length} players</Badge>
                </div>
                {teamAPlayers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamAPlayers.map((p) => renderPlayerCard(p, 'A'))}
                  </div>
                ) : (
                  <p className="text-xs text-white/20 py-6 text-center">No player data available</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-bold text-white/70">{teamB.name}</h3>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/30">{teamBPlayers.length} players</Badge>
                </div>
                {teamBPlayers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamBPlayers.map((p) => renderPlayerCard(p, 'B'))}
                  </div>
                ) : (
                  <p className="text-xs text-white/20 py-6 text-center">No player data available</p>
                )}
              </div>

              {match.status === 'COMPLETED' && teamAPlayers.length > 0 && teamBPlayers.length > 0 && (
                <div className="mt-4">
                  <MatchPerformanceCharts match={match} teamA={teamA} teamB={teamB} teamAPlayers={teamAPlayers} teamBPlayers={teamBPlayers} />
                </div>
              )}
            </div>
          )}

          {/* ─── TIMELINE TAB ─── */}
          {activeTab === 'Timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ScoreTimeline match={match} teamA={teamA} teamB={teamB} />
              {match.status === 'COMPLETED' && teamAPlayers.length > 0 && teamBPlayers.length > 0 && (
                <MatchPerformanceCharts match={match} teamA={teamA} teamB={teamB} teamAPlayers={teamAPlayers} teamBPlayers={teamBPlayers} />
              )}
            </div>
          )}

          {/* ─── POLL TAB ─── */}
          {activeTab === 'Poll' && (
            <div className="max-w-lg mx-auto">
              <MatchPolls match={match} teamA={teamA} teamB={teamB} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Admin Live Score Panel ─── */}
      {isAdmin && match.status !== 'UPCOMING' && (
        <LiveScorePanel match={match} teamA={teamA} teamB={teamB} firestore={firestore} />
      )}
    </div>
  );
}
