"use client";

import React, { useMemo } from 'react';
import { useAppData } from '@/lib/data-context';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Users,
  Calendar,
  Flame,
  TrendingUp,
  Zap,
  Crown,
  Swords,
  Sparkles,
} from 'lucide-react';
import type { SportName } from '@/lib/types';
import { sports } from '@/lib/data-client';

/* ------------------------------------------------------------------ */
/*  SVG micro-charts                                                   */
/* ------------------------------------------------------------------ */

/** Donut ring chart rendered as SVG */
function DonutRing({
  percent,
  size = 64,
  strokeWidth = 6,
  className = '',
  trackColor = 'rgba(255,255,255,0.06)',
  color = 'url(#donutGrad)',
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackColor?: string;
  color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (Math.min(percent, 100) / 100);
  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

/** Mini horizontal bar chart for sport distribution */
function MiniBarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-1.5 w-full">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 w-20 truncate text-right shrink-0">{d.label}</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-white/50 w-4 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Color palette for sport bars                                       */
/* ------------------------------------------------------------------ */
const SPORT_COLORS: Record<string, string> = {
  Football: '#f472b6',
  Basketball: '#fb923c',
  Volleyball: '#a78bfa',
  Cricket: '#34d399',
  Throwball: '#38bdf8',
  'Badminton (Singles)': '#facc15',
  'Badminton (Doubles)': '#fbbf24',
  'Table Tennis (Singles)': '#f87171',
  'Table Tennis (Doubles)': '#fb7185',
  Kabaddi: '#818cf8',
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface TournamentStatsProps {
  className?: string;
}

export function TournamentStats({ className }: TournamentStatsProps) {
  const { matches, teams, players, leaderboards } = useAppData();

  const stats = useMemo(() => {
    const completedCount = matches.filter(m => m.status === 'COMPLETED').length;
    const totalMatches = matches.length;
    const totalTeams = teams.length;
    const totalPlayers = players.length;

    // Sport match counts
    const sportCounts: Record<string, number> = {};
    for (const m of matches) {
      sportCounts[m.sport] = (sportCounts[m.sport] || 0) + 1;
    }
    const sortedSports = Object.entries(sportCounts).sort((a, b) => b[1] - a[1]);
    const mostActiveSport = sortedSports[0];

    // Top team (most wins across all sports)
    const teamWins: Record<string, { name: string; wins: number; played: number }> = {};
    for (const sport of sports) {
      const lb = leaderboards[sport as SportName];
      if (!lb) continue;
      for (const item of lb) {
        const entry = teamWins[item.teamId];
        if (entry) {
          entry.wins += item.won;
          entry.played += item.played;
        } else {
          teamWins[item.teamId] = { name: item.teamName, wins: item.won, played: item.played };
        }
      }
    }
    const topTeam = Object.values(teamWins).sort((a, b) => b.wins - a.wins)[0];

    const totalGoals = matches
      .filter(m => m.status === 'COMPLETED')
      .reduce((sum, m) => sum + m.teamAScore + m.teamBScore, 0);

    // Highest scoring match
    const highestMatch = matches
      .filter(m => m.status === 'COMPLETED')
      .sort((a, b) => (b.teamAScore + b.teamBScore) - (a.teamAScore + a.teamBScore))[0];

    const completionRate = totalMatches > 0 ? Math.round((completedCount / totalMatches) * 100) : 0;

    // Average per match
    const avgPerMatch = completedCount > 0 ? (totalGoals / completedCount).toFixed(1) : '0';

    // Sport distribution (top 5 for bar chart)
    const sportDistribution = sortedSports.slice(0, 5).map(([label, value]) => ({
      label,
      value,
      color: SPORT_COLORS[label] || '#a78bfa',
    }));

    // Smart insights
    const insights: { text: string; icon: React.ReactNode; color: string }[] = [];
    if (mostActiveSport) {
      insights.push({
        text: `${mostActiveSport[0]} leads with ${mostActiveSport[1]} matches`,
        icon: <Flame className="h-3 w-3" />,
        color: 'text-rose-400',
      });
    }
    if (topTeam && topTeam.wins > 0) {
      const winRate = topTeam.played > 0 ? Math.round((topTeam.wins / topTeam.played) * 100) : 0;
      insights.push({
        text: `${topTeam.name} has a ${winRate}% win rate`,
        icon: <Crown className="h-3 w-3" />,
        color: 'text-amber-400',
      });
    }
    if (highestMatch) {
      const total = highestMatch.teamAScore + highestMatch.teamBScore;
      insights.push({
        text: `Highest scoring match: ${total} total points`,
        icon: <Zap className="h-3 w-3" />,
        color: 'text-yellow-400',
      });
    }
    if (completionRate > 0 && completionRate < 100) {
      insights.push({
        text: `Tournament is ${completionRate}% complete`,
        icon: <TrendingUp className="h-3 w-3" />,
        color: 'text-cyan-400',
      });
    }
    if (totalPlayers > 0 && totalTeams > 0) {
      insights.push({
        text: `${Math.round(totalPlayers / totalTeams)} players per team on average`,
        icon: <Users className="h-3 w-3" />,
        color: 'text-emerald-400',
      });
    }

    return {
      completedCount,
      totalMatches,
      totalTeams,
      totalPlayers,
      mostActiveSport,
      topTeam,
      totalGoals,
      highestMatch,
      completionRate,
      avgPerMatch,
      sportDistribution,
      insights,
    };
  }, [matches, teams, players, leaderboards]);

  /* ---- Empty state ---- */
  if (stats.totalMatches === 0) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 mb-4 animate-pulse">
            <Trophy className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-white/35 font-medium">No tournament data yet</p>
          <p className="text-white/20 text-sm mt-1">Insights will appear once matches are created</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* ──────── 1 · HERO: Top Performer (spans 2 cols on sm+) ──────── */}
        {stats.topTeam && stats.topTeam.wins > 0 ? (
          <div className="sm:col-span-2 relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.01]">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)]" />
            <div className="relative border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex items-center gap-5 backdrop-blur-sm">
              {/* Donut ring */}
              <div className="relative shrink-0">
                <DonutRing
                  percent={stats.topTeam.played > 0 ? (stats.topTeam.wins / stats.topTeam.played) * 100 : 0}
                  size={80}
                  strokeWidth={7}
                  color="#f59e0b"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] mb-2">
                  Top Performer
                </Badge>
                <p className="text-xl sm:text-2xl font-black text-white/90 truncate leading-tight">
                  {stats.topTeam.name}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-2xl font-black tabular-nums text-amber-400">{stats.topTeam.wins}</p>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Wins</p>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <p className="text-2xl font-black tabular-nums text-white/70">{stats.topTeam.played}</p>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Played</p>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <p className="text-2xl font-black tabular-nums text-white/70">
                      {stats.topTeam.played > 0 ? Math.round((stats.topTeam.wins / stats.topTeam.played) * 100) : 0}%
                    </p>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Win Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback if no wins yet — total matches card spans 2 */
          <div className="sm:col-span-2 relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-transparent" />
            <div className="relative border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex items-center gap-5 backdrop-blur-sm">
              <div className="relative shrink-0">
                <DonutRing percent={stats.completionRate} size={80} strokeWidth={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-violet-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] mb-2">
                  Tournament
                </Badge>
                <p className="text-xl sm:text-2xl font-black text-white/90 leading-tight">
                  {stats.totalMatches} Matches Scheduled
                </p>
                <p className="text-sm text-white/40 mt-1">{stats.completionRate}% completed so far</p>
              </div>
            </div>
          </div>
        )}

        {/* ──────── 2 · Completion Progress ──────── */}
        <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent" />
          <div className="relative border border-white/[0.08] rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Progress</Badge>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-3xl sm:text-4xl font-black tabular-nums text-white/90">{stats.completionRate}%</p>
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium mt-1">Complete</p>
              </div>
              <div className="shrink-0">
                <DonutRing percent={stats.completionRate} size={48} strokeWidth={5} color="#34d399" />
              </div>
            </div>
            {/* Segmented bar */}
            <div className="mt-3 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-white/5">
              <div
                className="bg-emerald-500 transition-all duration-700 rounded-l-full"
                style={{ width: `${stats.totalMatches > 0 ? (stats.completedCount / stats.totalMatches) * 100 : 0}%` }}
              />
              <div
                className="bg-red-500/60"
                style={{
                  width: `${stats.totalMatches > 0 ? (matches.filter(m => m.status === 'LIVE').length / stats.totalMatches) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Done
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" /> Live
              </span>
            </div>
          </div>
        </div>

        {/* ──────── 3 · Total Points Scored ──────── */}
        <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-transparent" />
          <div className="relative border border-white/[0.08] rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-4 w-4 text-rose-400" />
              <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">Scoring</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-black tabular-nums text-white/90">{stats.totalGoals}</p>
            <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium mt-0.5">Total Points</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
              <Zap className="h-3 w-3 text-rose-400/60" />
              <span className="tabular-nums">{stats.avgPerMatch} avg per match</span>
            </div>
            {stats.highestMatch && (
              <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Highest Scoring</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50 font-medium truncate">{stats.highestMatch.sport}</span>
                  <span className="text-xs tabular-nums font-bold text-white/70">
                    {stats.highestMatch.teamAScore} - {stats.highestMatch.teamBScore}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ──────── 4 · Sport Distribution ──────── */}
        {stats.sportDistribution.length > 0 && (
          <div className="sm:col-span-2 relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent" />
            <div className="relative border border-white/[0.08] rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-semibold text-white/60">Sport Distribution</span>
                </div>
                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
                  {Object.keys(stats.sportDistribution).length} Sports
                </Badge>
              </div>
              <MiniBarChart data={stats.sportDistribution} />
            </div>
          </div>
        )}

        {/* ──────── 5 · Players & Teams ──────── */}
        <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent" />
          <div className="relative border border-white/[0.08] rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-4 w-4 text-cyan-400" />
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">Athletes</Badge>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl sm:text-4xl font-black tabular-nums text-white/90">{stats.totalPlayers}</p>
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium mt-0.5">Players</p>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <p className="text-3xl sm:text-4xl font-black tabular-nums text-white/60">{stats.totalTeams}</p>
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium mt-0.5">Teams</p>
              </div>
            </div>
          </div>
        </div>

        {/* ──────── 6 · Most Active Sport ──────── */}
        {stats.mostActiveSport && (
          <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent" />
            <div className="relative border border-white/[0.08] rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <Flame className="h-4 w-4 text-pink-400" />
                <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 text-[10px]">Popular</Badge>
              </div>
              <p className="text-lg sm:text-xl font-black text-white/90 truncate leading-tight">{stats.mostActiveSport[0]}</p>
              <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium mt-0.5">
                {stats.mostActiveSport[1]} matches
              </p>
              {/* Inline sparkle bar relative to total */}
              <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-700"
                  style={{
                    width: `${stats.totalMatches > 0 ? (stats.mostActiveSport[1] as number / stats.totalMatches) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ──────── Smart Insight Pills ──────── */}
      {stats.insights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Sparkles className="h-3.5 w-3.5 text-white/20 mt-1 shrink-0" />
          {stats.insights.map((insight, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70"
            >
              <span className={insight.color}>{insight.icon}</span>
              {insight.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
