
"use client";

import { useState, useEffect, useMemo, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { Button } from '@/components/ui/button';


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sports, deleteTeam as deleteTeamData, deletePlayer as deletePlayerData, updatePlayerName as updatePlayerNameData, updateMatch as updateMatchData, deleteMatch as deleteMatchData, addPlayerToTeam as addPlayerToTeamData, getOrCreateTeam, createMatch } from '@/lib/data-client';
import { PlusCircle, Trash2, Loader2, Edit, Save, X, UserX, UserPlus, MapPin, Trophy, Users, Chrome, Shield, Link2 } from 'lucide-react';
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
import { AdminTour } from '@/components/admin-tour';
import { ActivityLog } from '@/components/admin/activity-log';
import { QuickActions } from '@/components/admin/quick-actions';
import { useFirestore, useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/lib/data-context';
import { checkIsAdmin, clearAdminCache } from '@/lib/admin-check';



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
    
    const { matches, teams, players, teamsById, loading: dataLoading } = useAppData();
    const [matchFilter, setMatchFilter] = useState<SportName | 'All'>('All');
    const [teamFilter, setTeamFilter] = useState<SportName | 'All'>('All');
    const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
    const [savingPlayer, setSavingPlayer] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminCheckLoading, setAdminCheckLoading] = useState(true);
    const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
    const [isPending, startTransition] = useTransition();
    const createMatchRef = useRef<HTMLDivElement>(null);
    const firestore = useFirestore();
    const { auth } = useFirebase();

    // Get linked Google email from providerData
    const linkedGoogleEmail = auth.currentUser?.providerData.find(
        (p) => p.providerId === 'google.com'
    )?.email ?? null;

    useEffect(() => {
        if (!auth.currentUser) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'You must be logged in to view this page.',
            });
            router.replace('/');
            return;
        }

        // Check admin status via Firestore admin_emails collection
        const verifyAdmin = async () => {
            setAdminCheckLoading(true);
            // Check if user has a linked Google account
            const googleEmail = auth.currentUser?.providerData.find(
                (p) => p.providerId === 'google.com'
            )?.email ?? null;

            // Also check sessionStorage for verified admin (fallback when linking fails)
            const verifiedAdmin = typeof window !== 'undefined'
                ? window.sessionStorage.getItem('sports-hub-verified-admin')
                : null;

            const emailToCheck = googleEmail || verifiedAdmin;

            if (!emailToCheck) {
                // No Google account linked and no verified session — show the linking prompt
                setAdminCheckLoading(false);
                return;
            }

            const isAdmin = await checkIsAdmin(firestore, emailToCheck);
            if (isAdmin) {
                setIsAuthorized(true);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Access Denied',
                    description: 'Your Google account is not in the admin allowlist.',
                });
                router.replace('/overview');
            }
            setAdminCheckLoading(false);
        };

        verifyAdmin();
    }, [router, toast, auth.currentUser, firestore, linkedGoogleEmail]);

    const handleLinkGoogle = async () => {
        if (!auth.currentUser) return;
        setIsLinkingGoogle(true);

        try {
            // Use a secondary Firebase Auth instance to verify Google identity
            // without disrupting the current College ID session.
            // This avoids popup-blocked errors from chained popups.
            const secondaryApp = getApps().find(a => a.name === 'google-verify')
                || initializeApp(firebaseConfig, 'google-verify');
            const secondaryAuth = getAuth(secondaryApp);

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const googleResult = await signInWithPopup(secondaryAuth, provider);
            const googleEmail = googleResult.user.email;

            // Sign out of the secondary instance immediately
            await firebaseSignOut(secondaryAuth);

            if (!googleEmail) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not get email from Google account.' });
                return;
            }

            clearAdminCache();
            const adminVerified = await checkIsAdmin(firestore, googleEmail);

            if (adminVerified) {
                // Store verified admin email in sessionStorage for this session
                if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem('sports-hub-verified-admin', googleEmail);
                }
                setIsAuthorized(true);
                toast({ title: 'Admin Verified', description: `Welcome, Admin! Verified as ${googleEmail}` });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Not Authorized',
                    description: `${googleEmail} is not in the admin allowlist. Contact an existing admin to get invited.`,
                });
            }
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                console.error('Google verify error:', error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to verify Google account. Please try again.' });
            }
        } finally {
            setIsLinkingGoogle(false);
        }
    };

    const [editingMatch, setEditingMatch] = useState<EditableMatch | null>(null);
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

    const onSubmit = async (values: z.infer<typeof matchSchema>) => {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Firebase not initialized.",
            });
            return;
        }
        
        try {
            toast({
                title: 'Creating Match...',
                description: 'Your request is being processed...',
            });

            // Use in-memory cache to skip Firestore reads for existing teams
            const cachedTeamA = teams.find(t => t.name === values.teamAName && t.sport === values.sport);
            const cachedTeamB = teams.find(t => t.name === values.teamBName && t.sport === values.sport);
            const [teamAResult, teamBResult] = await Promise.all([
                cachedTeamA
                    ? { success: true as const, teamId: cachedTeamA.id, error: undefined }
                    : getOrCreateTeam(firestore, values.teamAName, values.sport as SportName),
                cachedTeamB
                    ? { success: true as const, teamId: cachedTeamB.id, error: undefined }
                    : getOrCreateTeam(firestore, values.teamBName, values.sport as SportName),
            ]);

            if (!teamAResult.success || !teamAResult.teamId) {
                toast({ 
                    variant: "destructive", 
                    title: "Error processing Team A", 
                    description: teamAResult.error 
                });
                return;
            }
            if (!teamBResult.success || !teamBResult.teamId) {
                toast({ 
                    variant: "destructive", 
                    title: "Error processing Team B", 
                    description: teamBResult.error 
                });
                return;
            }

            // Create the match with the team IDs
            const matchResult = await createMatch(firestore, {
                sport: values.sport as SportName,
                teamAId: teamAResult.teamId,
                teamBId: teamBResult.teamId,
                status: values.status,
                startTime: values.startTime,
                venue: values.venue,
                details: `${values.teamAName} vs ${values.teamBName}`,
                teamAName: values.teamAName,
                teamBName: values.teamBName,
            });

            if (matchResult.success) {
                toast({
                    title: 'Match Created Successfully',
                    description: `Match between ${values.teamAName} and ${values.teamBName} has been added.`,
                });
                
                // Reset form
                form.reset({
                    sport: '',
                    teamAName: '',
                    teamBName: '',
                    status: 'UPCOMING',
                    startTime: new Date().toISOString().substring(0, 16),
                    venue: '',
                });
            } else {
                toast({ 
                    variant: "destructive", 
                    title: "Error Creating Match", 
                    description: matchResult.error 
                });
            }
        } catch (error: any) {
            console.error("Error during match creation: ", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Error Creating Match",
                description: errorMessage,
            });
        }
    };

    const handleUpdateMatch = useCallback(async () => {
        if (!editingMatch || !editingMatch.id || !firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Cannot update match at this time."
            });
            return;
        }
        try {
            await updateMatchData(firestore, editingMatch.id, editingMatch as Partial<Match>);
            toast({ 
                title: "Match Updated", 
                description: "The match details have been saved." 
            });
            setEditingMatch(null);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update match. Please try again."
            });
        }
    }, [editingMatch, firestore, toast]);

    const handleDeleteMatch = useCallback(async (id: string) => {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Cannot delete match at this time."
            });
            return;
        }
        try {
            toast({ title: "Deleting...", description: "Removing the match." });
            await deleteMatchData(firestore, id);
            toast({ 
                title: "Match Deleted", 
                description: "The match has been removed." 
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete match. Please try again."
            });
        }
    }, [firestore, toast]);
    
    const startEditing = (match: EditableMatch) => {
        setEditingMatch({ ...match });
    };

    const handlePlayerUpdate = useCallback(async (playerId: string, newName: string) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Cannot update player at this time."
            });
            return;
        }
        if (!newName.trim()) {
            toast({ 
                variant: 'destructive', 
                title: "Invalid Name", 
                description: "Player name cannot be empty." 
            });
            setEditingPlayer(null);
            return;
        }
        try {
            await updatePlayerNameData(firestore, playerId, newName);
            toast({ 
                title: "Player Updated", 
                description: "Player's name has been changed." 
            });
            setEditingPlayer(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to update player. Please try again."
            });
        }
    }, [firestore, toast]);

    const handleDeletePlayer = useCallback(async (playerId: string) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Cannot delete player at this time."
            });
            return;
        }
        try {
            await deletePlayerData(firestore, playerId);
            toast({ 
                title: "Player Removed", 
                description: "The player has been removed from the team." 
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to remove player. Please try again."
            });
        }
    }, [firestore, toast]);

    const handleDeleteTeam = useCallback(async (teamId: string) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Cannot delete team at this time."
            });
            return;
        }
        try {
            setDeletingTeamId(teamId);
            toast({ title: "Deleting...", description: "Removing the team and its players." });
            await deleteTeamData(firestore, teamId);
            toast({ 
                title: "Team Deleted", 
                description: "The team and its players have been removed." 
            });
        } catch (error) {
            console.error("Error deleting team:", error);
            toast({ 
                variant: 'destructive', 
                title: "Error", 
                description: "Could not delete the team. Please try again." 
            });
        } finally {
            setDeletingTeamId(null);
        }
    }, [firestore, toast]);
    
    const startEditingPlayer = (player: EditablePlayer) => {
        setEditingPlayer({ ...player });
    };
    
    const cancelEditingPlayer = () => {
        setEditingPlayer(null);
    };

    const handleAddPlayer = useCallback(async (teamId: string, sport: SportName) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Cannot add player at this time."
            });
            return;
        }
        if (!newPlayerName.trim()) {
            toast({ 
                variant: 'destructive', 
                title: "Invalid Name", 
                description: "Player name cannot be empty." 
            });
            return;
        }
        try {
            setSavingPlayer(true);
            await addPlayerToTeamData(firestore, teamId, newPlayerName, sport);
            toast({ 
                title: "Player Added", 
                description: `${newPlayerName} has been added to the team.` 
            });
            setAddingPlayerToTeam(null);
            setNewPlayerName("");
        } catch (error) {
            console.error("Error adding player:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to add player. Please try again."
            });
        } finally {
            setSavingPlayer(false);
        }
    }, [firestore, newPlayerName, toast]);

    const availableTeams = useMemo(() => 
        teams
            .filter(t => t.sport === watchSport)
            .map(t => ({ label: t.name, value: t.name })),
        [teams, watchSport]
    );

    // Filtered data based on sport filters
    const filteredMatches = useMemo(() => 
        matchFilter === 'All' 
            ? matches 
            : matches.filter(m => m.sport === matchFilter),
        [matches, matchFilter]
    );
    
    const filteredTeams = useMemo(() => 
        teamFilter === 'All'
            ? teams
            : teams.filter(t => t.sport === teamFilter),
        [teams, teamFilter]
    );

    // Pre-compute players grouped by team to avoid repeated .filter() in render
    const playersByTeam = useMemo(() => {
        const map = new Map<string, Player[]>();
        for (const player of players) {
            const existing = map.get(player.teamId) || [];
            existing.push(player);
            map.set(player.teamId, existing);
        }
        return map;
    }, [players]);

    if (!isAuthorized) {
        // Still checking admin status
        if (adminCheckLoading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-white/20" />
                </div>
            );
        }

        // User needs to link Google account for admin elevation
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-4">
                <Card className="w-full max-w-md glass-strong border-white/10 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-orange-500/50 to-red-500/50" />
                    <CardContent className="p-6 sm:p-8 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20">
                                <Shield className="h-10 w-10 text-amber-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white/90 mb-2">Admin Verification Required</h2>
                            <p className="text-sm text-white/50 leading-relaxed">
                                To access the admin dashboard, link your Google account.
                                Your Google email must be in the approved admin list.
                            </p>
                        </div>

                        {linkedGoogleEmail ? (
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-xs text-white/40">Linked Google Account</p>
                                    <p className="text-sm font-medium text-white/70">{linkedGoogleEmail}</p>
                                </div>
                                <p className="text-xs text-red-400/80">
                                    This Google account is not in the admin allowlist. Contact an existing admin.
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="w-full border-white/10 hover:bg-white/10 text-white/70"
                                    onClick={() => router.push('/overview')}
                                >
                                    Back to Overview
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleLinkGoogle}
                                    disabled={isLinkingGoogle}
                                    className="w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white gap-2 h-12"
                                >
                                    {isLinkingGoogle ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Chrome className="h-5 w-5" />
                                    )}
                                    Link Google Account
                                </Button>
                                <div className="flex items-center gap-2 text-[11px] text-white/25 justify-center">
                                    <Link2 className="h-3 w-3" />
                                    Your College ID login stays active. This just adds Google verification.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (dataLoading) {
        return (
            <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
                <header className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-10 sm:w-16 bg-gradient-to-r from-white/60 to-transparent rounded-full" />
                        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">Control Center</span>
                    </div>
                    <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white/90">Admin Dashboard</h1>
                </header>
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            <header className="space-y-2" data-tour="welcome">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-10 sm:w-16 bg-gradient-to-r from-white/60 to-transparent rounded-full" />
                    <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">Control Center</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white/90">Admin Dashboard</h1>
                        <p className="text-white/50 text-base sm:text-lg mt-1">Manage tournaments, matches, teams, and players with precision.</p>
                    </div>
                    <AdminTour />
                </div>
            </header>

            <QuickActions
                onScrollToCreate={() => createMatchRef.current?.scrollIntoView({ behavior: 'smooth' })}
                onExport={() => {
                    const data = JSON.stringify({ matches, teams, players }, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sportshub-export-${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                }}
                matchCount={matches.length}
                liveCount={matches.filter(m => m.status === 'LIVE').length}
            />

            <Card className="glass-strong border-white/10" data-tour="create-match" ref={createMatchRef}>
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                        <PlusCircle className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-400" />
                        <CardTitle className="font-headline text-xl sm:text-2xl font-bold text-white/90">Create New Match</CardTitle>
                    </div>
                    <CardDescription className="text-white/50 text-sm sm:text-base mt-2">
                        Use the form below to add a new match. Enter a team name to select an existing team or create a new one.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <FormField control={form.control} name="sport" render={({ field }) => (<FormItem><FormLabel className="text-white/70 font-semibold text-sm">Sport</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`teamAName`, ''); form.setValue(`teamBName`, ''); }} value={field.value}><FormControl><SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-11"><SelectValue placeholder="Select a sport" /></SelectTrigger></FormControl><SelectContent>{sports.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <div data-tour="create-match-teams"><FormField control={form.control} name="teamAName" render={({ field }) => (<FormItem><FormLabel className="text-white/70 font-semibold text-sm">Team A</FormLabel><FormControl><Combobox options={availableTeams.filter(t => t.value.toLowerCase() !== watchTeamB.toLowerCase())} placeholder="Select or create Team A" disabled={!watchSport} {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                                <FormField control={form.control} name="teamBName" render={({ field }) => (<FormItem><FormLabel className="text-white/70 font-semibold text-sm">Team B</FormLabel><FormControl><Combobox options={availableTeams.filter(t => t.value.toLowerCase() !== watchTeamA.toLowerCase())} placeholder="Select or create Team B" disabled={!watchSport} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel className="text-white/70 font-semibold text-sm">Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-11"><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="LIVE">Live</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem><FormLabel className="text-white/70 font-semibold text-sm">Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-11" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="venue" render={({ field }) => ( <FormItem><FormLabel className="text-white/70 font-semibold text-sm">Venue</FormLabel><FormControl><Input placeholder="E.g., Main Football Ground" {...field} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors placeholder:text-white/30 h-11" /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={form.formState.isSubmitting} 
                                    size="lg"
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg hover:shadow-emerald-500/20 transition-all w-full sm:w-auto h-11"
                                >
                                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Create Match
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="glass-strong border-white/10" data-tour="manage-matches">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline text-xl sm:text-2xl font-bold text-white/90 mb-2">Manage Existing Matches</CardTitle>
                            <CardDescription className="text-white/50 text-sm sm:text-base">Update scores, status, or delete matches. Navigate to a match page to update player stats or set scores.</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                                <span className="text-xs sm:text-sm text-white/50 font-medium shrink-0">Filter:</span>
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <button onClick={() => startTransition(() => setMatchFilter('All'))} className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm active:scale-[0.98] transition-all ${matchFilter === 'All' ? 'bg-white/8 text-white' : 'bg-white/3 text-white/70'} border ${matchFilter === 'All' ? 'border-white/10' : 'border-white/6'}`}>All</button>
                                    {sports.map(sport => (
                                        <button key={sport} onClick={() => startTransition(() => setMatchFilter(sport as SportName))} className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm active:scale-[0.98] transition-all ${matchFilter === sport ? 'bg-white/8 text-white' : 'bg-white/3 text-white/70'} border ${matchFilter === sport ? 'border-white/10' : 'border-white/6'} whitespace-nowrap`}>{sport}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                    <div className="space-y-3 sm:space-y-4">
                        {filteredMatches.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white/5 mb-4">
                                    <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-white/20" />
                                </div>
                                <p className="text-white/40 font-medium text-sm sm:text-base">
                                    {matchFilter === 'All' ? 'No matches created yet.' : `No ${matchFilter} matches found.`}
                                </p>
                            </div>
                        ) : (
                        filteredMatches.map((match) => {
                            const teamA = teamsById.get(match.teamAId);
                            const teamB = teamsById.get(match.teamBId);
                            if (!teamA || !teamB) return null;

                            const isEditingThis = editingMatch?.id === match.id;
                            
                            return (
                            <Card key={match.id} className="glass p-3 sm:p-5 bg-white/[0.02] border-white/10 hover:border-white/20 transition-all group cursor-pointer hover-lift" data-tour-match>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-[180px] sm:min-w-[200px] w-full sm:w-auto" onClick={() => router.push(`/match/${match.id}`)}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs font-semibold border-white/20 text-white/60">
                                                {match.sport}
                                            </Badge>
                                            {match.status === 'LIVE' && (
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-bold text-base sm:text-lg text-white/90 group-hover:text-white transition-colors">{teamA?.name} vs {teamB?.name}</p>
                                        <p className="text-xs sm:text-sm text-white/40 mt-1">{new Date(match.startTime).toLocaleString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}</p>
                                        <div className="flex items-center text-xs sm:text-sm text-white/40 gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{match.venue}</span>
                                        </div>
                                    </div>
                                    {isEditingThis ? (
                                         <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                                            <p className="text-xs sm:text-sm text-white/40 font-medium w-full sm:w-auto">Edit score on match page</p>
                                            <Select value={editingMatch?.status} onValueChange={(value) => setEditingMatch({...editingMatch, status: value as any})}>
                                                <SelectTrigger className="w-full sm:w-[140px] bg-white/5 border-white/10 h-9 sm:h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                                    <SelectItem value="LIVE">Live</SelectItem>
                                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex gap-2">
                                                <Button size="icon" className="bg-emerald-600 hover:bg-emerald-500 h-9 w-9" onClick={handleUpdateMatch}><Save className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="hover:bg-white/10 h-9 w-9" onClick={() => setEditingMatch(null)}><X className="h-4 w-4" /></Button>
                                            </div>
                                         </div>
                                    ) : (
                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                                            <div className="flex items-center gap-2" data-tour="match-actions">
                                                <div className="font-mono font-bold text-xl sm:text-2xl tabular-nums text-white/90">{match.teamAScore}</div>
                                                <span className="text-white/30">-</span>
                                                <div className="font-mono font-bold text-xl sm:text-2xl tabular-nums text-white/90">{match.teamBScore}</div>
                                            </div>
                                            <Badge 
                                                variant={match.status === 'LIVE' ? 'destructive' : match.status === 'UPCOMING' ? 'secondary' : 'default'} 
                                                className="w-[90px] sm:w-[100px] justify-center font-semibold text-xs"
                                            >
                                                {match.status}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" className="border-white/10 hover:bg-white/10 hover:border-white/20 h-9 w-9" onClick={() => startEditing(match)} disabled={!!editingMatch || !!editingPlayer || !!addingPlayerToTeam}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="destructive" className="hover:bg-red-600 h-9 w-9" disabled={!!editingMatch || !!editingPlayer || !!addingPlayerToTeam}><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="glass-strong border-white/10">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white/90">Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-white/60">This action cannot be undone. This will permanently delete the match.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction className="bg-red-600 hover:bg-red-500" onClick={() => handleDeleteMatch(match.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                        }))}
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-strong border-white/10" data-tour="manage-teams">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline text-xl sm:text-2xl font-bold text-white/90 mb-2">Manage Teams & Players</CardTitle>
                            <CardDescription className="text-white/50 text-sm sm:text-base">Edit player names or remove players and teams.</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                                <span className="text-xs sm:text-sm text-white/50 font-medium shrink-0">Filter:</span>
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <button onClick={() => startTransition(() => setTeamFilter('All'))} className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm active:scale-[0.98] transition-all ${teamFilter === 'All' ? 'bg-white/8 text-white' : 'bg-white/3 text-white/70'} border ${teamFilter === 'All' ? 'border-white/10' : 'border-white/6'}`}>All</button>
                                    {sports.map(sport => (
                                        <button key={sport} onClick={() => startTransition(() => setTeamFilter(sport as SportName))} className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm active:scale-[0.98] transition-all ${teamFilter === sport ? 'bg-white/8 text-white' : 'bg-white/3 text-white/70'} border ${teamFilter === sport ? 'border-white/10' : 'border-white/6'} whitespace-nowrap`}>{sport}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-4 sm:pt-6">
                     {filteredTeams.length === 0 && !deletingTeamId && (
                         <div className="text-center py-12">
                             <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white/5 mb-4">
                                 <Users className="h-6 sm:h-8 w-6 sm:w-8 text-white/20" />
                             </div>
                             <p className="text-white/40 font-medium text-sm sm:text-base">
                                 {teamFilter === 'All' ? 'No teams exist. Create a match to add teams.' : `No ${teamFilter} teams found.`}
                             </p>
                         </div>
                     )}
                    {filteredTeams.map((team, teamIndex) => (
                        <Card key={team.id} className={`glass p-4 sm:p-6 bg-white/[0.02] border-white/10 hover:border-white/20 transition-all group ${deletingTeamId === team.id ? 'opacity-50 pointer-events-none' : ''}`} {...(teamIndex === 0 ? { 'data-tour': 'team-players' } : {})}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    <h4 className="font-bold text-xl sm:text-2xl text-white/90 group-hover:text-white transition-colors">{team.name}</h4>
                                    <Badge variant="outline" className="text-xs font-semibold border-white/20 text-white/60">{team.sport}</Badge>
                                </div>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="hover:bg-red-600 w-full sm:w-auto h-9 text-sm" disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam || !!deletingTeamId}>
                                            {deletingTeamId === team.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4"/>}Delete Team
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-strong border-white/10">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white/90">Delete {team.name}?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-white/60">This will remove the team and all its players, and any matches they are in. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-red-600 hover:bg-red-500" onClick={() => handleDeleteTeam(team.id)}>Confirm Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                                {(playersByTeam.get(team.id) || []).map(player => (
                                    <div key={player.id} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        {editingPlayer?.id === player.id ? (
                                            <>
                                                <Input data-player-id={player.id} defaultValue={player.name} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePlayerUpdate(player.id, e.currentTarget.value); } if (e.key === 'Escape') cancelEditingPlayer(); }} className="h-9 bg-white/5 border-white/10 text-sm" />
                                                <Button size="icon" className="h-9 w-9 bg-emerald-600 hover:bg-emerald-500 shrink-0" onClick={() => { const el = document.querySelector(`input[data-player-id='${player.id}']`) as HTMLInputElement | null; if (el) handlePlayerUpdate(player.id, el.value); }}><Save className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-white/10 shrink-0" onClick={cancelEditingPlayer}><X className="h-4 w-4" /></Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-white/80 font-medium text-sm sm:text-base truncate">{player.name}</span>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button size="icon" variant="outline" className="h-9 w-9 border-white/10 hover:bg-white/10 hover:border-white/20" onClick={() => startEditingPlayer(player)} disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="destructive" className="h-9 w-9 hover:bg-red-600" disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}><UserX className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="glass-strong border-white/10">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white/90">Remove {player.name}?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-white/60">This will remove the player from the team. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction className="bg-red-600 hover:bg-red-500" onClick={() => handleDeletePlayer(player.id)}>Confirm Removal</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {(playersByTeam.get(team.id) || []).length === 0 && (
                                    <p className="text-xs sm:text-sm text-white/40 text-center py-3 sm:py-4">No players found for this team. Add one below.</p>
                                )}
                            </div>
                            <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/5">
                            {addingPlayerToTeam === team.id ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <Input 
                                        placeholder="New player name" 
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlayer(team.id, team.sport); if (e.key === 'Escape') { setAddingPlayerToTeam(null); setNewPlayerName(""); } }}
                                        className="h-9 sm:h-10 bg-white/5 border-white/10 placeholder:text-white/30 text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 font-semibold h-9 sm:h-10 flex-1 sm:flex-none" onClick={() => handleAddPlayer(team.id, team.sport)} disabled={savingPlayer}>
                                            {savingPlayer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Player
                                        </Button>
                                        <Button size="sm" variant="ghost" className="hover:bg-white/10 h-9 sm:h-10 flex-1 sm:flex-none" onClick={() => { setAddingPlayerToTeam(null); setNewPlayerName(""); }}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:border-white/20 font-medium h-9 sm:h-10 w-full sm:w-auto text-sm" onClick={() => setAddingPlayerToTeam(team.id)} disabled={!!editingPlayer || !!editingMatch || !!addingPlayerToTeam}>
                                    <UserPlus className="mr-2 h-4 w-4" /> Add Player
                                </Button>
                            )}
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <ActivityLog matches={matches} teamsById={teamsById} />
        </div>
    );

    
}

    