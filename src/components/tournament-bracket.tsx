"use client";

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronRight } from 'lucide-react';
import type { Match, Team } from '@/lib/types';
import Link from 'next/link';

interface TournamentBracketProps {
  matches: Match[];
  teamsById: Map<string, Team>;
  sport: string;
}

interface BracketMatch {
  match: Match;
  teamA: Team | undefined;
  teamB: Team | undefined;
  winner: 'A' | 'B' | null;
}

export function TournamentBracket({ matches, teamsById, sport }: TournamentBracketProps) {
  const bracketData = useMemo(() => {
    const sportMatches = matches
      .filter(m => m.sport === sport)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return sportMatches.map((match): BracketMatch => {
      const teamA = teamsById.get(match.teamAId);
      const teamB = teamsById.get(match.teamBId);
      const winner = match.status === 'COMPLETED'
        ? match.teamAScore > match.teamBScore ? 'A' : match.teamBScore > match.teamAScore ? 'B' : null
        : null;

      return { match, teamA, teamB, winner };
    });
  }, [matches, teamsById, sport]);

  if (bracketData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/30 text-sm">No matches scheduled for {sport}</p>
      </div>
    );
  }

  // Group into rounds heuristically (pairs of matches in time order)
  const rounds: BracketMatch[][] = [];
  let remaining = [...bracketData];
  let roundSize = Math.max(1, Math.ceil(remaining.length / 2));

  // Simple: first half = round 1, next quarter = round 2, etc.
  // For a real bracket, you'd need seeding data. This is a visual approximation.
  while (remaining.length > 0) {
    rounds.push(remaining.splice(0, roundSize));
    roundSize = Math.max(1, Math.ceil(roundSize / 2));
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-fit items-start">
        {rounds.map((round, roundIdx) => (
          <div key={roundIdx} className="flex flex-col gap-4 min-w-[260px]">
            {/* Round label */}
            <div className="text-center">
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40 px-3">
                {roundIdx === rounds.length - 1 && rounds.length > 1
                  ? 'Final'
                  : roundIdx === rounds.length - 2 && rounds.length > 2
                  ? 'Semi-Final'
                  : `Round ${roundIdx + 1}`}
              </Badge>
            </div>

            {/* Matches in this round */}
            <div className="flex flex-col gap-4" style={{ justifyContent: 'space-around', flex: 1 }}>
              {round.map((bm) => (
                <Link key={bm.match.id} href={`/match/${bm.match.id}`}>
                  <Card className="glass border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                    {/* Status indicator */}
                    <div className={`h-[2px] ${
                      bm.match.status === 'LIVE' ? 'bg-red-500' :
                      bm.match.status === 'COMPLETED' ? 'bg-green-500' :
                      'bg-blue-500/40'
                    }`} />

                    <div className="p-3 space-y-2">
                      {/* Team A */}
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        bm.winner === 'A' ? 'bg-green-500/10' : 'bg-white/[0.02]'
                      }`}>
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white/70">
                            {bm.teamA?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold flex-1 truncate ${
                          bm.winner === 'A' ? 'text-green-400' : 'text-white/80'
                        }`}>
                          {bm.teamA?.name || 'TBD'}
                        </span>
                        <span className={`text-sm font-bold tabular-nums ${
                          bm.winner === 'A' ? 'text-green-400' : 'text-white/50'
                        }`}>
                          {bm.match.status !== 'UPCOMING' ? bm.match.teamAScore : '-'}
                        </span>
                        {bm.winner === 'A' && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
                      </div>

                      {/* Team B */}
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        bm.winner === 'B' ? 'bg-green-500/10' : 'bg-white/[0.02]'
                      }`}>
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white/70">
                            {bm.teamB?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold flex-1 truncate ${
                          bm.winner === 'B' ? 'text-green-400' : 'text-white/80'
                        }`}>
                          {bm.teamB?.name || 'TBD'}
                        </span>
                        <span className={`text-sm font-bold tabular-nums ${
                          bm.winner === 'B' ? 'text-green-400' : 'text-white/50'
                        }`}>
                          {bm.match.status !== 'UPCOMING' ? bm.match.teamBScore : '-'}
                        </span>
                        {bm.winner === 'B' && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
                      </div>

                      {/* Match meta */}
                      <div className="flex items-center justify-between text-[10px] text-white/30 pt-1">
                        <span>{bm.match.venue}</span>
                        <Badge className={`text-[9px] px-1.5 py-0 ${
                          bm.match.status === 'LIVE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          bm.match.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {bm.match.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Connector arrows (except last round) */}
            {roundIdx < rounds.length - 1 && (
              <div className="flex items-center justify-center py-2">
                <ChevronRight className="h-4 w-4 text-white/10" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
