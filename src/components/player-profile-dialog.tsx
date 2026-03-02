"use client";

import { useMemo, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Trophy, Target, TrendingUp, Zap, Activity } from 'lucide-react';
import { SportIcon } from '@/components/sport-icon';
import type { Player, Match, Team } from '@/lib/types';

interface PlayerProfileDialogProps {
  player: Player | null;
  team: Team | null;
  matches: Match[];
  teamsById: Map<string, Team>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlayerProfileDialog = memo(function PlayerProfileDialog({
  player,
  team,
  matches,
  teamsById,
  open,
  onOpenChange,
}: PlayerProfileDialogProps) {
  // Calculate match history for this player's team
  const teamMatches = useMemo(() => {
    if (!player || !team) return [];
    return matches
      .filter(
        m =>
          m.sport === team.sport &&
          (m.teamAId === team.id || m.teamBId === team.id) &&
          m.status === 'COMPLETED'
      )
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [player, team, matches]);

  const teamRecord = useMemo(() => {
    if (!team) return { wins: 0, losses: 0, draws: 0 };
    let wins = 0, losses = 0, draws = 0;
    for (const m of teamMatches) {
      const isTeamA = m.teamAId === team.id;
      const myScore = isTeamA ? m.teamAScore : m.teamBScore;
      const oppScore = isTeamA ? m.teamBScore : m.teamAScore;
      if (myScore > oppScore) wins++;
      else if (myScore < oppScore) losses++;
      else draws++;
    }
    return { wins, losses, draws };
  }, [team, teamMatches]);

  if (!player || !team) return null;

  const stats = Object.entries(player.stats).filter(([, v]) => typeof v === 'number');
  const totalStatValue = stats.reduce((sum, [, v]) => sum + (Number(v) || 0), 0);
  const maxStat = Math.max(...stats.map(([, v]) => Number(v) || 0), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-white/10 max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-lg font-black text-white/80">{player.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <DialogTitle className="font-headline text-xl font-bold text-white/90">
                {player.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-white/50">
                <SportIcon sport={team.sport} className="h-3.5 w-3.5" />
                {team.name} &middot; {team.sport}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <Card className="bg-green-500/5 border-green-500/20 p-2 sm:p-3 text-center">
              <div className="text-lg font-black text-green-400 tabular-nums">{teamRecord.wins}</div>
              <div className="text-[10px] text-white/40 font-medium">Team Wins</div>
            </Card>
            <Card className="bg-red-500/5 border-red-500/20 p-2 sm:p-3 text-center">
              <div className="text-lg font-black text-red-400 tabular-nums">{teamRecord.losses}</div>
              <div className="text-[10px] text-white/40 font-medium">Team Losses</div>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20 p-2 sm:p-3 text-center">
              <div className="text-lg font-black text-blue-400 tabular-nums">{teamMatches.length}</div>
              <div className="text-[10px] text-white/40 font-medium">Matches</div>
            </Card>
          </div>

          {/* Player Stats */}
          {stats.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Performance Stats</h4>
              <div className="space-y-2">
                {stats.map(([key, value]) => {
                  const numVal = Number(value) || 0;
                  const pct = (numVal / maxStat) * 100;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">{key}</span>
                        <span className="text-sm font-bold text-white/90 tabular-nums">{numVal}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalStatValue > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs text-white/40">Total contribution: <strong className="text-amber-400">{totalStatValue}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Recent Team Matches */}
          {teamMatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Recent Team Matches</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {teamMatches.slice(0, 5).map(m => {
                  const isTeamA = m.teamAId === team.id;
                  const oppId = isTeamA ? m.teamBId : m.teamAId;
                  const opponent = teamsById.get(oppId);
                  const myScore = isTeamA ? m.teamAScore : m.teamBScore;
                  const oppScore = isTeamA ? m.teamBScore : m.teamAScore;
                  const won = myScore > oppScore;
                  const draw = myScore === oppScore;

                  return (
                    <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <Badge className={`text-[9px] px-1.5 ${
                        won ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        draw ? 'bg-white/5 text-white/40 border-white/10' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {won ? 'W' : draw ? 'D' : 'L'}
                      </Badge>
                      <span className="text-xs text-white/60 flex-1 truncate">
                        vs {opponent?.name || 'Unknown'}
                      </span>
                      <span className="text-xs font-bold text-white/70 tabular-nums">
                        {myScore}-{oppScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
