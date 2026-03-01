"use client";

import { memo, useCallback, useMemo, useState } from 'react';
import {
  collection,
  doc,
  writeBatch,
  deleteDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAppData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';
import { getStatFieldsForSport } from '@/lib/data-client';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  UserPlus,
  X,
  Save,
  UserX,
} from 'lucide-react';

// ─── Player Row ────────────────────────────────────────────
interface PlayerRowProps {
  index: number;
  name: string;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function PlayerRow({ index, name, onChange, onRemove }: PlayerRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/30 w-6 text-center tabular-nums">{index + 1}</span>
      <Input
        value={name}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Player ${index + 1}`}
        className="h-9 bg-white/5 border-white/10 text-sm flex-1"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 hover:bg-red-500/20 text-white/40 hover:text-red-400"
        onClick={() => onRemove(index)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Team Form Dialog ──────────────────────────────────────
interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeam?: Team | null;
  editingPlayers?: Player[];
}

function TeamFormDialog({ open, onOpenChange, editingTeam, editingPlayers }: TeamFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [teamName, setTeamName] = useState(editingTeam?.name ?? '');
  const [sport, setSport] = useState<SportName | ''>(editingTeam?.sport ?? '');
  const [playerNames, setPlayerNames] = useState<string[]>(
    editingPlayers?.map((p) => p.name) ?? ['']
  );

  // Reset form state when dialog opens/edits change
  const resetForm = useCallback(() => {
    setTeamName(editingTeam?.name ?? '');
    setSport(editingTeam?.sport ?? '');
    setPlayerNames(editingPlayers?.map((p) => p.name) ?? ['']);
  }, [editingTeam, editingPlayers]);

  // Reset when dialog opens
  const handleOpenChange = (value: boolean) => {
    if (value) resetForm();
    onOpenChange(value);
  };

  const addPlayerRow = () => setPlayerNames((prev) => [...prev, '']);

  const updatePlayer = (index: number, value: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removePlayer = (index: number) => {
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!firestore || !teamName.trim() || !sport) {
      toast({ variant: 'destructive', title: 'Error', description: 'Team name and sport are required.' });
      return;
    }

    const validPlayers = playerNames.filter((n) => n.trim());

    setSaving(true);
    try {
      const batch = writeBatch(firestore);

      if (editingTeam) {
        // Update existing team
        const teamRef = doc(firestore, 'teams', editingTeam.id);
        batch.update(teamRef, { name: teamName.trim(), sport });

        // Delete old players
        if (editingPlayers) {
          for (const p of editingPlayers) {
            batch.delete(doc(firestore, 'players', p.id));
          }
        }

        // Re-create players with updated names
        for (const name of validPlayers) {
          const playerRef = doc(collection(firestore, 'players'));
          batch.set(playerRef, {
            name: name.trim(),
            teamId: editingTeam.id,
            sport,
            stats: getStatFieldsForSport(sport),
          });
        }
      } else {
        // Create new team
        const teamRef = doc(collection(firestore, 'teams'));
        batch.set(teamRef, { name: teamName.trim(), sport, logoUrl: '' });

        for (const name of validPlayers) {
          const playerRef = doc(collection(firestore, 'players'));
          batch.set(playerRef, {
            name: name.trim(),
            teamId: teamRef.id,
            sport,
            stats: getStatFieldsForSport(sport),
          });
        }
      }

      await batch.commit();

      toast({
        title: editingTeam ? 'Team Updated' : 'Team Created',
        description: `${teamName.trim()} — ${validPlayers.length} player${validPlayers.length !== 1 ? 's' : ''}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Team save error:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save team.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-strong border-white/10 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white/90 text-xl">
            {editingTeam ? 'Edit Team' : 'Create New Team'}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {editingTeam ? 'Update the team details and roster.' : 'Set up a team with its full roster.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Team Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">Team Name</label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. CSE Dragons"
              className="h-11 bg-white/5 border-white/10"
            />
          </div>

          {/* Sport */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">Sport</label>
            <Select
              value={sport}
              onValueChange={(v) => setSport(v as SportName)}
              disabled={!!editingTeam}
            >
              <SelectTrigger className="h-11 bg-white/5 border-white/10">
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white/70">
                Players ({playerNames.filter((n) => n.trim()).length})
              </label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-white/50 hover:text-white/80"
                onClick={addPlayerRow}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {playerNames.map((name, i) => (
                <PlayerRow key={i} index={i} name={name} onChange={updatePlayer} onRemove={removePlayer} />
              ))}
              {playerNames.length === 0 && (
                <p className="text-xs text-white/30 text-center py-4">
                  No players added yet. Click &quot;Add&quot; to start.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/10">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !teamName.trim() || !sport}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {editingTeam ? 'Update Team' : 'Create Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Team Card ─────────────────────────────────────────────
interface TeamCardProps {
  team: Team;
  players: Player[];
  onEdit: (team: Team, players: Player[]) => void;
  onDelete: (teamId: string) => void;
  deleting: boolean;
}

const TeamCard = memo(function TeamCard({ team, players, onEdit, onDelete, deleting }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`glass p-4 bg-white/[0.02] border-white/10 hover:border-white/20 transition-all ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-lg text-white/90">{team.name}</h4>
            <Badge variant="outline" className="text-xs font-semibold border-white/20 text-white/60">
              {team.sport}
            </Badge>
            <span className="text-xs text-white/30">{players.length} player{players.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 border-white/10 hover:bg-white/10"
            onClick={() => onEdit(team, players)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive" className="h-9 w-9 hover:bg-red-600" disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-strong border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white/90">Delete {team.name}?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  This will remove the team, all its players, and any associated matches. Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-500" onClick={() => onDelete(team.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-white/10"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          {players.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-3">No players. Edit team to add roster.</p>
          ) : (
            players.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                <span className="text-xs text-white/30 w-6 text-center tabular-nums">{i + 1}</span>
                <span className="text-sm text-white/80 font-medium">{p.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
});

// ─── Team Manager (main export) ────────────────────────────
export const TeamManager = memo(function TeamManager() {
  const { teams, players } = useAppData();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [sportFilter, setSportFilter] = useState<SportName | 'All'>('All');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayers, setEditingPlayers] = useState<Player[]>([]);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  // Group players by teamId
  const playersByTeam = useMemo(() => {
    const map = new Map<string, Player[]>();
    for (const p of players) {
      const arr = map.get(p.teamId);
      if (arr) arr.push(p);
      else map.set(p.teamId, [p]);
    }
    return map;
  }, [players]);

  const filteredTeams = useMemo(() => {
    let result = teams;
    if (sportFilter !== 'All') result = result.filter((t) => t.sport === sportFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }
    return result;
  }, [teams, sportFilter, search]);

  const handleEdit = useCallback((team: Team, teamPlayers: Player[]) => {
    setEditingTeam(team);
    setEditingPlayers(teamPlayers);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingTeam(null);
    setEditingPlayers([]);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (teamId: string) => {
      if (!firestore) return;
      setDeletingTeamId(teamId);
      try {
        const { deleteTeam } = await import('@/lib/data-client');
        await deleteTeam(firestore, teamId);
        toast({ title: 'Team Deleted', description: 'Team and associated data removed.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete team.' });
      } finally {
        setDeletingTeamId(null);
      }
    },
    [firestore, toast]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white/90">Teams</h3>
          <p className="text-sm text-white/50">{teams.length} team{teams.length !== 1 ? 's' : ''} across all sports</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="pl-9 h-10 bg-white/5 border-white/10"
          />
        </div>
        <Select value={sportFilter} onValueChange={(v) => setSportFilter(v as SportName | 'All')}>
          <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white/5 border-white/10">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sports</SelectItem>
            {SPORTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team List */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Users className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/40 font-medium">
            {teams.length === 0
              ? 'No teams yet. Create one to get started.'
              : 'No teams match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              players={playersByTeam.get(team.id) ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleting={deletingTeamId === team.id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <TeamFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTeam={editingTeam}
        editingPlayers={editingPlayers}
      />
    </div>
  );
});
