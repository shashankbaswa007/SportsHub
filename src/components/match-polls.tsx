"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, Users, CheckCircle2 } from 'lucide-react';
import type { Match, Team } from '@/lib/types';

interface MatchPollsProps {
  match: Match;
  teamA: Team;
  teamB: Team;
}

interface PollData {
  teamAVotes: number;
  teamBVotes: number;
  drawVotes: number;
  userVote: string | null; // 'teamA' | 'teamB' | 'draw' | null
}

const POLL_STORAGE_PREFIX = 'sports-hub-poll-';

function getPollKey(matchId: string) {
  return `${POLL_STORAGE_PREFIX}${matchId}`;
}

function loadPoll(matchId: string): PollData {
  if (typeof window === 'undefined') return { teamAVotes: 0, teamBVotes: 0, drawVotes: 0, userVote: null };
  try {
    const raw = window.localStorage.getItem(getPollKey(matchId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { teamAVotes: 0, teamBVotes: 0, drawVotes: 0, userVote: null };
}

function savePoll(matchId: string, data: PollData) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getPollKey(matchId), JSON.stringify(data));
  }
}

export function MatchPolls({ match, teamA, teamB }: MatchPollsProps) {
  const [poll, setPoll] = useState<PollData>({ teamAVotes: 0, teamBVotes: 0, drawVotes: 0, userVote: null });

  useEffect(() => {
    setPoll(loadPoll(match.id));
  }, [match.id]);

  const handleVote = useCallback((choice: 'teamA' | 'teamB' | 'draw') => {
    setPoll(prev => {
      // If already voted for this choice, remove the vote
      if (prev.userVote === choice) {
        const next: PollData = {
          ...prev,
          userVote: null,
          teamAVotes: choice === 'teamA' ? Math.max(0, prev.teamAVotes - 1) : prev.teamAVotes,
          teamBVotes: choice === 'teamB' ? Math.max(0, prev.teamBVotes - 1) : prev.teamBVotes,
          drawVotes: choice === 'draw' ? Math.max(0, prev.drawVotes - 1) : prev.drawVotes,
        };
        savePoll(match.id, next);
        return next;
      }

      // If switching vote
      const next: PollData = {
        ...prev,
        userVote: choice,
        teamAVotes: choice === 'teamA' ? prev.teamAVotes + 1 : (prev.userVote === 'teamA' ? Math.max(0, prev.teamAVotes - 1) : prev.teamAVotes),
        teamBVotes: choice === 'teamB' ? prev.teamBVotes + 1 : (prev.userVote === 'teamB' ? Math.max(0, prev.teamBVotes - 1) : prev.teamBVotes),
        drawVotes: choice === 'draw' ? prev.drawVotes + 1 : (prev.userVote === 'draw' ? Math.max(0, prev.drawVotes - 1) : prev.drawVotes),
      };
      savePoll(match.id, next);
      return next;
    });
  }, [match.id]);

  const totalVotes = poll.teamAVotes + poll.teamBVotes + poll.drawVotes;
  const teamAPercent = totalVotes > 0 ? Math.round((poll.teamAVotes / totalVotes) * 100) : 0;
  const teamBPercent = totalVotes > 0 ? Math.round((poll.teamBVotes / totalVotes) * 100) : 0;
  const drawPercent = totalVotes > 0 ? Math.round((poll.drawVotes / totalVotes) * 100) : 0;

  const hasVoted = poll.userVote !== null;

  return (
    <Card className="glass border-white/10 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-purple-400" />
          <CardTitle className="font-headline text-lg sm:text-xl font-bold text-white/90">Match Poll</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-white/40">
          Who do you think will win? Cast your vote!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
        {/* Team A vote */}
        <button
          onClick={() => handleVote('teamA')}
          className={`w-full p-3 rounded-xl border transition-all text-left group ${
            poll.userVote === 'teamA'
              ? 'border-blue-500/50 bg-blue-500/10'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {poll.userVote === 'teamA' && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
              <span className="text-sm font-semibold text-white/90 truncate">{teamA.name}</span>
            </div>
            <span className="text-xs font-bold text-white/50 tabular-nums">
              {hasVoted ? `${teamAPercent}%` : ''}
            </span>
          </div>
          {hasVoted && (
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${teamAPercent}%` }}
              />
            </div>
          )}
        </button>

        {/* Draw vote */}
        <button
          onClick={() => handleVote('draw')}
          className={`w-full p-3 rounded-xl border transition-all text-left group ${
            poll.userVote === 'draw'
              ? 'border-white/30 bg-white/10'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {poll.userVote === 'draw' && <CheckCircle2 className="h-4 w-4 text-white/60" />}
              <span className="text-sm font-semibold text-white/70">Draw</span>
            </div>
            <span className="text-xs font-bold text-white/50 tabular-nums">
              {hasVoted ? `${drawPercent}%` : ''}
            </span>
          </div>
          {hasVoted && (
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white/40 to-white/20 transition-all duration-500"
                style={{ width: `${drawPercent}%` }}
              />
            </div>
          )}
        </button>

        {/* Team B vote */}
        <button
          onClick={() => handleVote('teamB')}
          className={`w-full p-3 rounded-xl border transition-all text-left group ${
            poll.userVote === 'teamB'
              ? 'border-rose-500/50 bg-rose-500/10'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {poll.userVote === 'teamB' && <CheckCircle2 className="h-4 w-4 text-rose-400" />}
              <span className="text-sm font-semibold text-white/90 truncate">{teamB.name}</span>
            </div>
            <span className="text-xs font-bold text-white/50 tabular-nums">
              {hasVoted ? `${teamBPercent}%` : ''}
            </span>
          </div>
          {hasVoted && (
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500"
                style={{ width: `${teamBPercent}%` }}
              />
            </div>
          )}
        </button>

        {/* Vote count */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Users className="h-3.5 w-3.5 text-white/30" />
          <span className="text-xs text-white/30">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
          {hasVoted && (
            <span className="text-xs text-white/20">· Tap again to remove vote</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
