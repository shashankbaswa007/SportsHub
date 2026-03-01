
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import type { Match, Team } from '@/lib/types';
import { useAppData } from '@/lib/data-context';
import { generateMatchInsights } from '@/lib/match-insights-engine';

interface MatchPredictionProps {
  match: Match;
  teamA: Team;
  teamB: Team;
}

export function MatchPrediction({ match, teamA, teamB }: MatchPredictionProps) {
  const { matches, teamsById } = useAppData();

  const insights = useMemo(
    () => generateMatchInsights({ match, teamA, teamB, allMatches: matches, teamsById }),
    [match, teamA, teamB, matches, teamsById]
  );

  if (insights.length === 0) return null;

  return (
    <Card className="glass p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-500/15">
          <Lightbulb className="h-4 w-4 text-amber-400" />
        </div>
        <h3 className="text-sm font-bold text-white/80">Match Insights</h3>
      </div>

      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400 shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-xs text-white/60 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
