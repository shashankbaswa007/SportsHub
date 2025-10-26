
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sports, deleteTeam as deleteTeamData, deletePlayer as deletePlayerData, updatePlayerName as updatePlayerNameData, updateMatch as updateMatchData, deleteMatch as deleteMatchData, addPlayerToTeam as addPlayerToTeamData, getOrCreateTeam, createMatch } from '@/lib/data-client';
import { PlusCircle, Trash2, Loader2, Edit, Save, X, UserX, UserPlus, MapPin } from 'lucide-react';
import type { Match, Team, Player, SportName } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';


const matchSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  teamAName: z.string().min(1, "Team A name is required."),
  teamBName: z.string().min(1, "Team B name is required."),
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED']),
  startTime: z.string().min(1, "A valid date and time is required."),
  venue: z.string().min(1, "Venue is required."),
}).refine(data => data.teamAName.toLowerCase() !== data.teamBName.toLowerCase(), {
    message: "Team A and Team B must be different.",
    path: ["teamBName"],
});

type EditableMatch = Match & { isEditing?: boolean };
type EditablePlayer = Player & { isEditing?: boolean };

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (!firestore) return;
        const user = localStorage.getItem('sports-hub-user');
        if (user !== '160123771030') {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'You are not authorized to view this page.',
            });
            router.replace('/overview');
            return;
        }

        setDataLoading(true);
        const unsubMatches = onSnapshot(query(collection(firestore, "matches")), (snap) => {
            setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
            setDataLoading(false);
        });
        const unsubTeams = onSnapshot(query(collection(firestore, "teams")), (snap) => {
            setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
        });
        const unsubPlayers = onSnapshot(query(collection(firestore, "players")), (snap) => {
            setPlayers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
        });

        return () => {
            unsubMatches();
            unsubTeams();
            unsubPlayers();
        }
    }, [router, toast, firestore]);

    const [editingMatch, setEditingMatch] = useState<Partial<EditableMatch> | null>(null);
    const [editingPlayer, setEditingPlayer] = useState<Partial<EditablePlayer> | null>(null);
    const [addingPlayerToTeam, setAddingPlayerToTeam] = useState<string | null>(null);
    const [newPlayerName, setNewPlayerName] = useState("");

    const form = useForm<z.infer<typeof matchSchema>>({
        resolver: zodResolver(matchSchema),
        defaultValues: {
            sport: '',
            teamAName: '',
            teamBName: '',
            status: 'UPCOMING',
            startTime: new Date().toISOString().substring(0, 16),
            venue: '',
        },
    });

    const watchSport = form.watch('sport');
    const watchTeamA = form.watch('teamAName');
    const watchTeamB = form.watch('teamBName');

    const onSubmit = (values: z.infer<typeof matchSchema>) => {
        if (!firestore) return;
        
        toast({
            title: 'Creating Match...',
            description: 'Your request is being processed in the background.',
        });

        (async () => {
            try {
                const [teamAResult, teamBResult] = await Promise.all([
                    getOrCreateTeam(firestore, values.teamAName, values.sport as SportName),
                    getOrCreateTeam(firestore, values.teamBName, values.sport as SportName)
                ]);

                if (!teamAResult.success || !teamAResult.teamId) {
                     toast({ variant: "destructive", title: "Error processing Team A", description: teamAResult.error });
                     return;
                }
                if (!teamBResult.success || !teamBResult.teamId) {
                    toast({ variant: "destructive", title: "Error processing Team B", description: teamBResult.error });
                    return;
                }
                
                const matchResult = await createMatch(firestore, {
                    sport: values.sport as SportName,
                    teamAId: teamAResult.teamId,
                    teamBId: teamBResult.teamId,
                    status: values.status,
                    startTime: values.startTime,
                    venue: values.venue,
                });

                if (matchResult.success) {
                    toast({
                        title: 'Match Created Successfully',
                        description: `Match between ${values.teamAName} and ${values.teamBName} has been added.`,
                    });
                     form.setValue('teamAName', '');
                     form.setValue('teamBName', '');
                     form.setValue('venue', '');
                     form.setValue('startTime', new Date().toISOString().substring(0, 16));
                } else {
                     toast({ variant: "destructive", title: "Error Creating Match", description: matchResult.error });
                }
            } catch (error: any) {
                console.error("Error during background match creation: ", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Error Creating Match",
                    description: errorMessage,
                });
            }
        })();
    };

    const handleUpdateMatch = async () => {
        if (!editingMatch || !editingMatch.id || !firestore) return;
        await updateMatchData(firestore, editingMatch.id, editingMatch as Partial<Match>);
        toast({ title: "Match Updated", description: "The match details have been saved." });
        setEditingMatch(null);
    };

    const handleDeleteMatch = async (id: string) => {
        if (!firestore) return;
        await deleteMatchData(firestore, id);
        toast({ title: "Match Deleted", description: "The match has been removed." });
    };
    
    const startEditing = (match: EditableMatch) => {
        setEditingMatch({ ...match });
    };

    const handlePlayerUpdate = async (playerId: string, newName: string) => {
        if (!firestore) return;
        if (!newName.trim()) {
            toast({ variant: 'destructive', title: "Invalid Name", description: "Player name cannot be empty." });
            setEditingPlayer(null);
            return;
        }
        await updatePlayerNameData(firestore, playerId, newName);
        toast({ title: "Player Updated", description: "Player's name has been changed." });
        setEditingPlayer(null);
    };

    const handleDeletePlayer = async (playerId: string) => {
        if (!firestore) return;
        await deletePlayerData(firestore, playerId);
        toast({ title: "Player Removed", description: "The player has been removed from the team." });
    };

    const handleDeleteTeam = async (teamId: string) => {
        if (!firestore) return;
        try {
            await deleteTeamData(firestore, teamId);
            toast({ title: "Team Deleted", description: "The team and its players have been removed." });
        } catch (error) {
             toast({ variant: 'destructive', title: "Error", description: "Could not delete the team." });
        }
    };
    
    const startEditingPlayer = (player: EditablePlayer) => {
        setEditingPlayer({ ...player });
    };
    
    const cancelEditingPlayer = () => {
        setEditingPlayer(null);
    };

    const handleAddPlayer = async (teamId: string, sport: SportName) => {
        if (!firestore) return;
        if (!newPlayerName.trim()) {
             toast({ variant: 'destructive', title: "Invalid Name", description: "Player name cannot be empty." });
             return;
        }
        await addPlayerToTeamData(firestore, teamId, newPlayerName, sport);
        toast({ title: "Player Added", description: `${newPlayerName} has been added to the team.` });
        setAddingPlayerToTeam(null);
        setNewPlayerName("");
    };

    const availableTeams = teams
        .filter(t => t.sport === watchSport)
        .map(t => ({ label: t.name, value: t.name }));

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="font-headline text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage tournaments, matches, teams, and players.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Create New Match</CardTitle>
                    <CardDescription>
                    Use the form below to add a new match. Enter a team name to select an existing team or create a new one.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="sport" render={({ field }) => (<FormItem><FormLabel>Sport</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`teamAName`, ''); form.setValue(`teamBName`, ''); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a sport" /></SelectTrigger></FormControl><SelectContent>{sports.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="teamAName" render={({ field }) => (<FormItem><FormLabel>Team A</FormLabel><FormControl><Combobox options={availableTeams.filter(t => t.value.toLowerCase() !== watchTeamB.toLowerCase())} placeholder="Select or create Team A" disabled={!watchSport} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="teamBName" render={({ field }) => (<FormItem><FormLabel>Team B</FormLabel><FormControl><Combobox options={availableTeams.filter(t => t.value.toLowerCase() !== watchTeamA.toLowerCase())} placeholder="Select or create Team B" disabled={!watchSport} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="LIVE">Live</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem><FormLabel>Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="venue" render={({ field }) => ( <FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="E.g., Main Football Ground" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Create Match
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Manage Existing Matches</CardTitle>
                    <CardDescription>Update scores, status, or delete matches. Navigate to a match page to update player stats or set scores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dataLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> :
                         matches.length === 0 ? <p className="text-muted-foreground text-center py-8">No matches created yet.</p> :
                        matches.map((match) => {
                            const teamA = teams.find(t => t.id === match.teamAId);
                            const teamB = teams.find(t => t.id === match.teamBId);
                            if (!teamA || !teamB) return null;

                            const isEditingThis = editingMatch?.id === match.id;
                            
                            return (
                            <Card key={match.id} className="p-4 bg-background transition-all">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex-1 min-w-[200px] cursor-pointer" onClick={() => router.push(`/match/${match.id}`)}>
                                        <p className="font-bold text-lg">{teamA?.name} vs {teamB?.name}</p>
                                        <p className="text-sm text-muted-foreground">{match.sport} - {new Date(match.startTime).toLocaleString()}</p>
                                        <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{match.venue}</span>
                                        </div>
                                    </div>
                                    {isEditingThis ? (
                                         <>
                                            {/* Score editing is now primarily on the match page for complexity */}
                                            <p className="text-sm text-muted-foreground">Edit score on match page</p>
                                            <Select value={editingMatch?.status} onValueChange={(value) => setEditingMatch({...editingMatch, status: value as any})}>
                                                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                                    <SelectItem value="LIVE">Live</SelectItem>
                                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button size="icon" onClick={handleUpdateMatch}><Save className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => setEditingMatch(null)}><X className="h-4 w-4" /></Button>
                                         </>
                                    ) : (
                                        <>
                                            <p className="font-mono font-bold text-xl">{match.teamAScore} - {match.teamBScore}</p>
                                            <Badge variant={match.status === 'LIVE' ? 'destructive' : match.status === 'UPCOMING' ? 'secondary' : 'default'} className="w-[100px] justify-center">{match.status}</Badge>
                                            <Button size="icon" variant="outline" onClick={() => startEditing(match)} disabled={!!editingMatch || !!editingPlayer || !!addingPlayerToTeam}><Edit className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="destructive" disabled={!!editingMatch || !!editingPlayer || !!addingPlayerToTeam}><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the match.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteMatch(match.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )})}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Manage Teams & Players</CardTitle>
                    <CardDescription>Edit player names or remove players and teams.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     {teams.length === 0 && !dataLoading && <p className="text-muted-foreground text-center py-8">No teams exist. Create a match to add teams.</p>}
                    {teams.map(team => (
                        <Card key={team.id} className="p-4 bg-background">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xl">{team.name} <span className="text-sm text-muted-foreground">({team.sport})</span></h4>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}><Trash2 className="mr-2 h-4 w-4"/>Delete Team</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete {team.name}?</AlertDialogTitle><AlertDialogDescription>This will remove the team and all its players, and any matches they are in. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>Confirm Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <div className="mt-4 space-y-2">
                                {players.filter(p => p.teamId === team.id).map(player => (
                                    <div key={player.id} className="flex items-center gap-2">
                                        {editingPlayer?.id === player.id ? (
                                            <>
                                                <Input data-player-id={player.id} defaultValue={player.name} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePlayerUpdate(player.id, e.currentTarget.value); } if (e.key === 'Escape') cancelEditingPlayer(); }} className="h-8" />
                                                <Button size="icon" className="h-8 w-8" onClick={() => handlePlayerUpdate(player.id, (document.querySelector(`input[data-player-id='${player.id}']`) as HTMLInputElement).value)}><Save className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEditingPlayer}><X className="h-4 w-4" /></Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-1">{player.name}</span>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => startEditingPlayer(player)} disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="icon" variant="destructive" className="h-8 w-8" disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}><UserX className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Remove {player.name}?</AlertDialogTitle><AlertDialogDescription>This will remove the player from the team. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeletePlayer(player.id)}>Confirm Removal</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {players.filter(p => p.teamId === team.id).length === 0 && (
                                    <p className="text-sm text-muted-foreground">No players found for this team. Add one below.</p>
                                )}
                            </div>
                            <div className="mt-4">
                            {addingPlayerToTeam === team.id ? (
                                <div className="flex items-center gap-2">
                                    <Input 
                                        placeholder="New player name" 
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlayer(team.id, team.sport); if (e.key === 'Escape') { setAddingPlayerToTeam(null); setNewPlayerName(""); } }}
                                        className="h-9"
                                    />
                                    <Button size="sm" onClick={() => handleAddPlayer(team.id, team.sport)}>Save Player</Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setAddingPlayerToTeam(null); setNewPlayerName(""); }}>Cancel</Button>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => setAddingPlayerToTeam(team.id)} disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}>
                                    <UserPlus className="mr-2 h-4 w-4" /> Add Player
                                </Button>
                            )}
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );

    
}

    