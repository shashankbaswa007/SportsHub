"use client";

import { memo, useCallback, useMemo, useState } from 'react';
import { useFirestore } from '@/firebase';
import { useAppData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';
import { createMatch, getDefaultScoreDetails } from '@/lib/data-client';
import type { SportName, Team, Player } from '@/lib/types';
import { SPORTS } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  MapPin,
  Users,
  Loader2,
  Check,
  Trophy,
} from 'lucide-react';

const VENUES = [
  'Main Football Ground',
  'Indoor Stadium',
  'Basketball Court',
  'Cricket Ground',
  'Volleyball Court',
  'Badminton Court',
  'Table Tennis Hall',
];

const ROUNDS = ['Group Stage', 'Quarter Final', 'Semi Final', 'Final', 'Friendly'];

type Step = 1 | 2 | 3;

export const QuickMatchCreator = memo(function QuickMatchCreator() {
  const firestore = useFirestore();
  const { teams, players } = useAppData();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [creating, setCreating] = useState(false);

  // Step 1: Sport
  const [sport, setSport] = useState<SportName | ''>('');

  // Step 2: Teams
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');

  // Step 3: Schedule
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [venue, setVenue] = useState('');
  const [customVenue, setCustomVenue] = useState('');
  const [round, setRound] = useState('');

  // Derived helpers
  const sportTeams = useMemo(() => {
    if (!sport) return [];
    return teams.filter((t) => t.sport === sport);
  }, [teams, sport]);

  const playersByTeam = useMemo(() => {
    const map = new Map<string, Player[]>();
    for (const p of players) {
      const arr = map.get(p.teamId);
      if (arr) arr.push(p);
      else map.set(p.teamId, [p]);
    }
    return map;
  }, [players]);

  const teamA = useMemo(() => teams.find((t) => t.id === teamAId), [teams, teamAId]);
  const teamB = useMemo(() => teams.find((t) => t.id === teamBId), [teams, teamBId]);

  const effectiveVenue = venue === '__custom__' ? customVenue : venue;

  const canProceed = (s: Step) => {
    if (s === 1) return !!sport;
    if (s === 2) return !!teamAId && !!teamBId && teamAId !== teamBId;
    if (s === 3) return !!date && !!effectiveVenue.trim();
    return false;
  };

  const reset = () => {
    setStep(1);
    setSport('');
    setTeamAId('');
    setTeamBId('');
    setDate(new Date().toISOString().substring(0, 16));
    setVenue('');
    setCustomVenue('');
    setRound('');
  };

  const handleCreate = useCallback(async () => {
    if (!firestore || !sport || !teamA || !teamB) return;
    setCreating(true);
    try {
      const result = await createMatch(firestore, {
        sport,
        teamAId: teamA.id,
        teamBId: teamB.id,
        status: 'UPCOMING',
        startTime: date,
        venue: effectiveVenue.trim(),
        details: `${teamA.name} vs ${teamB.name}`,
        teamAName: teamA.name,
        teamBName: teamB.name,
      });

      if (result.success) {
        toast({
          title: 'Match Created!',
          description: `${teamA.name} vs ${teamB.name} — ${sport}`,
        });
        reset();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to create match.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Something went wrong.' });
    } finally {
      setCreating(false);
    }
  }, [firestore, sport, teamA, teamB, date, effectiveVenue, toast]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Quick Match Creator
        </h3>
        <p className="text-sm text-white/50 mt-1">Create a match in seconds by selecting existing teams.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : step > s
                  ? 'bg-emerald-500/10 text-emerald-400/60'
                  : 'bg-white/5 text-white/30'
              }`}
            >
              {step > s ? <Check className="h-3.5 w-3.5" /> : s}
            </div>
            {s < 3 && <div className={`w-8 sm:w-12 h-px ${step > s ? 'bg-emerald-500/30' : 'bg-white/10'}`} />}
          </div>
        ))}
        <span className="text-xs text-white/30 ml-2">
          {step === 1 ? 'Pick Sport' : step === 2 ? 'Select Teams' : 'Schedule'}
        </span>
      </div>

      {/* Step 1: Sport Selection */}
      {step === 1 && (
        <Card className="glass p-5 bg-white/[0.02] border-white/10">
          <label className="text-sm font-semibold text-white/70 block mb-3">Choose a Sport</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {SPORTS.map((s) => {
              const count = teams.filter((t) => t.sport === s).length;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setSport(s);
                    setTeamAId('');
                    setTeamBId('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    sport === s
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="text-sm font-semibold truncate">{s}</div>
                  <div className="text-[11px] text-white/30 mt-1">{count} team{count !== 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceed(1)}
              className="bg-white/10 hover:bg-white/15 text-white"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Team Selection */}
      {step === 2 && (
        <Card className="glass p-5 bg-white/[0.02] border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Team A */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white/70">Team A</label>
              <Select value={teamAId} onValueChange={setTeamAId}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Team A" />
                </SelectTrigger>
                <SelectContent>
                  {sportTeams
                    .filter((t) => t.id !== teamBId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  {sportTeams.filter((t) => t.id !== teamBId).length === 0 && (
                    <div className="px-3 py-2 text-xs text-white/40">No teams available for {sport}</div>
                  )}
                </SelectContent>
              </Select>
              {teamA && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-xs font-semibold text-white/50">Roster</span>
                  </div>
                  <div className="space-y-1">
                    {(playersByTeam.get(teamA.id) ?? []).map((p) => (
                      <div key={p.id} className="text-xs text-white/60 pl-1">
                        {p.name}
                      </div>
                    ))}
                    {(playersByTeam.get(teamA.id) ?? []).length === 0 && (
                      <p className="text-xs text-white/30">No players</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white/70">Team B</label>
              <Select value={teamBId} onValueChange={setTeamBId}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Team B" />
                </SelectTrigger>
                <SelectContent>
                  {sportTeams
                    .filter((t) => t.id !== teamAId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  {sportTeams.filter((t) => t.id !== teamAId).length === 0 && (
                    <div className="px-3 py-2 text-xs text-white/40">No teams available for {sport}</div>
                  )}
                </SelectContent>
              </Select>
              {teamB && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-xs font-semibold text-white/50">Roster</span>
                  </div>
                  <div className="space-y-1">
                    {(playersByTeam.get(teamB.id) ?? []).map((p) => (
                      <div key={p.id} className="text-xs text-white/60 pl-1">
                        {p.name}
                      </div>
                    ))}
                    {(playersByTeam.get(teamB.id) ?? []).length === 0 && (
                      <p className="text-xs text-white/30">No players</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {teamAId && teamBId && teamAId === teamBId && (
            <p className="text-xs text-red-400 mt-2">Team A and Team B must be different.</p>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="hover:bg-white/10 text-white/60">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceed(2)}
              className="bg-white/10 hover:bg-white/15 text-white"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <Card className="glass p-5 bg-white/[0.02] border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Date &amp; Time
              </label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Venue
              </label>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {VENUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Custom venue...</SelectItem>
                </SelectContent>
              </Select>
              {venue === '__custom__' && (
                <Input
                  value={customVenue}
                  onChange={(e) => setCustomVenue(e.target.value)}
                  placeholder="Enter venue name"
                  className="h-10 bg-white/5 border-white/10 mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                Round (optional)
              </label>
              <Select value={round} onValueChange={setRound}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10">
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  {ROUNDS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Match Preview */}
          {teamA && teamB && (
            <div className="mt-5 p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xs font-semibold text-white/40 mb-2">Match Preview</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-white/90">{teamA.name}</div>
                  <div className="text-xs text-white/40">
                    {(playersByTeam.get(teamA.id) ?? []).length} players
                  </div>
                </div>
                <div className="text-lg font-bold text-white/30">VS</div>
                <div className="text-left">
                  <div className="font-bold text-white/90">{teamB.name}</div>
                  <div className="text-xs text-white/40">
                    {(playersByTeam.get(teamB.id) ?? []).length} players
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center text-xs text-white/30">
                {sport} {round ? `• ${round}` : ''} • {effectiveVenue || '—'} •{' '}
                {date ? new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep(2)} className="hover:bg-white/10 text-white/60">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canProceed(3) || creating}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold"
            >
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Create Match
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
});
