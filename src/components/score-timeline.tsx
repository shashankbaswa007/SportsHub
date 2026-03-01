"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import type { Match, Team, SetScore, CricketScore } from '@/lib/types';

interface ScoreTimelineProps {
  match: Match;
  teamA: Team;
  teamB: Team;
}

interface TimelineEvent {
  label: string;
  teamAScore: number;
  teamBScore: number;
  highlight?: 'teamA' | 'teamB' | 'draw';
}

export function ScoreTimeline({ match, teamA, teamB }: ScoreTimelineProps) {
  const events = useMemo<TimelineEvent[]>(() => {
    // Set-based sports (Volleyball, Badminton, Table Tennis, Throwball)
    if (Array.isArray(match.scoreDetails) && match.scoreDetails.length > 0) {
      return (match.scoreDetails as SetScore[]).map(set => {
        const highlight = set.teamAScore > set.teamBScore ? 'teamA' : set.teamBScore > set.teamAScore ? 'teamB' : 'draw';
        return {
          label: `Set ${set.set}`,
          teamAScore: set.teamAScore,
          teamBScore: set.teamBScore,
          highlight,
        };
      });
    }

    // Cricket
    if (match.sport === 'Cricket' && match.scoreDetails && typeof (match.scoreDetails as CricketScore).runs === 'number') {
      const cs = match.scoreDetails as CricketScore;
      return [
        {
          label: 'Innings',
          teamAScore: match.teamAScore,
          teamBScore: match.teamBScore,
          highlight: match.teamAScore > match.teamBScore ? 'teamA' : match.teamBScore > match.teamAScore ? 'teamB' : 'draw',
        },
      ];
    }

    // Default: single-score sports (Football, Basketball, Kabaddi)
    if (match.teamAScore > 0 || match.teamBScore > 0) {
      return [
        {
          label: 'Final',
          teamAScore: match.teamAScore,
          teamBScore: match.teamBScore,
          highlight: match.teamAScore > match.teamBScore ? 'teamA' : match.teamBScore > match.teamAScore ? 'teamB' : 'draw',
        },
      ];
    }

    return [];
  }, [match]);

  if (events.length === 0) {
    return null;
  }

  const maxScore = Math.max(...events.flatMap(e => [e.teamAScore, e.teamBScore]), 1);

  return (
    <Card className="glass border-white/10 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-white/50" />
          <CardTitle className="font-headline text-lg sm:text-xl font-bold text-white/90">Score Timeline</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-white/40">Score progression throughout the match</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {/* Team labels */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs sm:text-sm font-semibold text-white/70 truncate max-w-[120px] sm:max-w-none">{teamA.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-white/70 truncate max-w-[120px] sm:max-w-none">{teamB.name}</span>
            <div className="w-3 h-3 rounded-full bg-rose-500" />
          </div>
        </div>

        {/* Timeline bars */}
        <div className="space-y-3">
          {events.map((event, index) => {
            const teamAWidth = Math.max((event.teamAScore / maxScore) * 100, 4);
            const teamBWidth = Math.max((event.teamBScore / maxScore) * 100, 4);

            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-medium text-white/50">{event.label}</span>
                  {event.highlight === 'teamA' && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                      <Zap className="h-2.5 w-2.5 mr-0.5" /> {teamA.name.split(' ')[0]}
                    </Badge>
                  )}
                  {event.highlight === 'teamB' && (
                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                      <Zap className="h-2.5 w-2.5 mr-0.5" /> {teamB.name.split(' ')[0]}
                    </Badge>
                  )}
                  {event.highlight === 'draw' && (
                    <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px]">
                      Draw
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-blue-400 w-6 text-right tabular-nums">{event.teamAScore}</span>
                  <div className="flex-1 flex gap-1 h-5 sm:h-6 items-center">
                    {/* Team A bar (grows left to right) */}
                    <div className="flex-1 flex justify-end">
                      <div
                        className="h-full rounded-l-md bg-gradient-to-r from-blue-600/40 to-blue-500/80 transition-all duration-500"
                        style={{ width: `${teamAWidth}%` }}
                      />
                    </div>
                    <div className="w-px h-full bg-white/20" />
                    {/* Team B bar (grows right to left) */}
                    <div className="flex-1">
                      <div
                        className="h-full rounded-r-md bg-gradient-to-r from-rose-500/80 to-rose-600/40 transition-all duration-500"
                        style={{ width: `${teamBWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-rose-400 w-6 tabular-nums">{event.teamBScore}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final score summary */}
        {match.status === 'COMPLETED' && events.length > 1 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xl sm:text-2xl font-black text-blue-400 tabular-nums">{match.teamAScore}</p>
              <p className="text-[10px] text-white/40 mt-1">Final</p>
            </div>
            <div className="text-white/20 text-sm font-medium">vs</div>
            <div className="text-center flex-1">
              <p className="text-xl sm:text-2xl font-black text-rose-400 tabular-nums">{match.teamBScore}</p>
              <p className="text-[10px] text-white/40 mt-1">Final</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
