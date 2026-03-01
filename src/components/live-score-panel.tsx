"use client";

import { useState, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, RefreshCw, ChevronDown, ChevronUp, Zap, Save } from 'lucide-react';
import { updateMatch, recalculateMatchScores } from '@/lib/data-client';
import { useToast } from '@/hooks/use-toast';
import type { Match, Team, MatchStatus } from '@/lib/types';
import type { Firestore } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveScorePanelProps {
  match: Match;
  teamA: Team;
  teamB: Team;
  firestore: Firestore;
}

export const LiveScorePanel = memo(function LiveScorePanel({ match, teamA, teamB, firestore }: LiveScorePanelProps) {
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleQuickScore = useCallback(async (team: 'A' | 'B', delta: number) => {
    setSaving(true);
    try {
      const updates: Partial<Match> = team === 'A'
        ? { teamAScore: Math.max(0, match.teamAScore + delta) }
        : { teamBScore: Math.max(0, match.teamBScore + delta) };
      await updateMatch(firestore, match.id, updates);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update score.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [match.id, match.teamAScore, match.teamBScore, firestore, toast]);

  const handleStatusChange = useCallback(async (status: MatchStatus) => {
    setSaving(true);
    try {
      await updateMatch(firestore, match.id, { status });
      toast({ title: 'Status Updated', description: `Match is now ${status}.` });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [match.id, firestore, toast]);

  const handleRecalculate = useCallback(async () => {
    setSaving(true);
    try {
      await recalculateMatchScores(firestore, match.id);
      toast({ title: 'Recalculated', description: 'Scores synced from player stats.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to recalculate.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [match.id, firestore, toast]);

  const isDirectScoring = ['Football', 'Basketball', 'Kabaddi'].includes(match.sport);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-lg"
    >
      <Card className="glass-strong border-2 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-white/90">Live Score Panel</span>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
              ADMIN
            </Badge>
          </div>
          {collapsed ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {/* Status Quick Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 shrink-0">Status:</span>
                  <div className="flex gap-1.5 flex-1">
                    {(['UPCOMING', 'LIVE', 'COMPLETED'] as MatchStatus[]).map((s) => (
                      <button
                        key={s}
                        disabled={saving}
                        onClick={() => handleStatusChange(s)}
                        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-bold transition-all border ${
                          match.status === s
                            ? s === 'LIVE'
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : s === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-400 border-green-500/40'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Score Controls */}
                {isDirectScoring && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Team A */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-blue-400 truncate">{teamA.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 border-white/10 hover:bg-red-500/20 hover:border-red-500/40"
                          onClick={() => handleQuickScore('A', -1)}
                          disabled={saving || match.teamAScore <= 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-black text-white tabular-nums">{match.teamAScore}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 border-white/10 hover:bg-green-500/20 hover:border-green-500/40"
                          onClick={() => handleQuickScore('A', 1)}
                          disabled={saving}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-rose-400 truncate">{teamB.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 border-white/10 hover:bg-red-500/20 hover:border-red-500/40"
                          onClick={() => handleQuickScore('B', -1)}
                          disabled={saving || match.teamBScore <= 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-black text-white tabular-nums">{match.teamBScore}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 border-white/10 hover:bg-green-500/20 hover:border-green-500/40"
                          onClick={() => handleQuickScore('B', 1)}
                          disabled={saving}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recalculate */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/10 hover:bg-white/10 text-white/70 text-xs"
                  onClick={handleRecalculate}
                  disabled={saving}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  Recalculate from Player Stats
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});
