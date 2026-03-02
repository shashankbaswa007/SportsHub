
"use client";

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { Button } from '@/components/ui/button';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sports, updateMatch as updateMatchData, deleteMatch as deleteMatchData, createMatch } from '@/lib/data-client';
import { Trash2, Loader2, Edit, Save, X, MapPin, Trophy, Chrome, Shield, Link2, CheckSquare, Copy, CheckCheck } from 'lucide-react';
import type { Match, SportName } from '@/lib/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminTour } from '@/components/admin-tour';
import { ActivityLog } from '@/components/admin/activity-log';
import { TeamManager } from '@/components/admin/team-manager';
import { QuickMatchCreator } from '@/components/admin/quick-match-creator';
import { AdminManagement } from '@/components/admin/admin-management';
import { CSVImport } from '@/components/admin/csv-import';
import { useFirestore, useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/lib/data-context';
import { checkIsAdmin, clearAdminCache } from '@/lib/admin-check';



type EditableMatch = Match & { isEditing?: boolean };

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const { matches, teams, players, teamsById, loading: dataLoading } = useAppData();
    const [matchFilter, setMatchFilter] = useState<SportName | 'All'>('All');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminCheckLoading, setAdminCheckLoading] = useState(true);
    const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
    const [isPending, startTransition] = useTransition();
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
            const googleEmail = auth.currentUser?.providerData.find(
                (p) => p.providerId === 'google.com'
            )?.email ?? null;

            const verifiedAdmin = typeof window !== 'undefined'
                ? window.sessionStorage.getItem('sports-hub-verified-admin')
                : null;

            const emailToCheck = googleEmail || verifiedAdmin;

            if (!emailToCheck) {
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
            const secondaryApp = getApps().find(a => a.name === 'google-verify')
                || initializeApp(firebaseConfig, 'google-verify');
            const secondaryAuth = getAuth(secondaryApp);

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const googleResult = await signInWithPopup(secondaryAuth, provider);
            const googleEmail = googleResult.user.email;

            await firebaseSignOut(secondaryAuth);

            if (!googleEmail) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not get email from Google account.' });
                return;
            }

            clearAdminCache();
            const adminVerified = await checkIsAdmin(firestore, googleEmail);

            if (adminVerified) {
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
                const errorMsg = error.message || error.code || 'Unknown error';
                toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: `${errorMsg}` });
            }
        } finally {
            setIsLinkingGoogle(false);
        }
    };

    // ─── Match management state ────────────────────────────
    const [editingMatch, setEditingMatch] = useState<EditableMatch | null>(null);
    const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());

    const handleUpdateMatch = useCallback(async () => {
        if (!editingMatch || !editingMatch.id || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "Cannot update match at this time." });
            return;
        }
        try {
            await updateMatchData(firestore, editingMatch.id, editingMatch as Partial<Match>);
            toast({ title: "Match Updated", description: "The match details have been saved." });
            setEditingMatch(null);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update match. Please try again." });
        }
    }, [editingMatch, firestore, toast]);

    const handleDeleteMatch = useCallback(async (id: string) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "Cannot delete match at this time." });
            return;
        }
        try {
            toast({ title: "Deleting...", description: "Removing the match." });
            await deleteMatchData(firestore, id);
            toast({ title: "Match Deleted", description: "The match has been removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete match. Please try again." });
        }
    }, [firestore, toast]);

    const handleBulkStatusChange = useCallback(async (status: Match['status']) => {
        if (!firestore || selectedMatchIds.size === 0) return;
        try {
            const promises = [...selectedMatchIds].map(id => 
                updateMatchData(firestore, id, { status })
            );
            await Promise.all(promises);
            toast({ title: 'Bulk Update', description: `${selectedMatchIds.size} matches set to ${status}.` });
            setSelectedMatchIds(new Set());
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update some matches.' });
        }
    }, [firestore, selectedMatchIds, toast]);

    const toggleMatchSelection = useCallback((matchId: string) => {
        setSelectedMatchIds(prev => {
            const next = new Set(prev);
            if (next.has(matchId)) next.delete(matchId);
            else next.add(matchId);
            return next;
        });
    }, []);

    const handleDuplicateMatch = useCallback(async (match: Match) => {
        if (!firestore) return;
        const tA = teamsById.get(match.teamAId);
        const tB = teamsById.get(match.teamBId);
        try {
            const result = await createMatch(firestore, {
                sport: match.sport,
                teamAId: match.teamAId,
                teamBId: match.teamBId,
                status: 'UPCOMING',
                startTime: new Date().toISOString(),
                venue: match.venue,
                details: match.details,
                teamAName: tA?.name || 'Team A',
                teamBName: tB?.name || 'Team B',
            });
            if (result.success) {
                toast({ title: 'Match Duplicated', description: `Copy of ${match.details || 'match'} created as UPCOMING.` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to duplicate match.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Something went wrong.' });
        }
    }, [firestore, teamsById, toast]);

    const filteredMatches = useMemo(() => 
        matchFilter === 'All' ? matches : matches.filter(m => m.sport === matchFilter),
        [matches, matchFilter]
    );

    const selectAllMatches = useCallback(() => {
        setSelectedMatchIds(new Set(filteredMatches.map(m => m.id)));
    }, [filteredMatches]);

    // ─── Admin Keyboard Shortcuts ──────────────────────────
    const [activeTab, setActiveTab] = useState('matches');

    useEffect(() => {
        if (!isAuthorized) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            // Escape → clear selection
            if (e.key === 'Escape') {
                setSelectedMatchIds(new Set());
                setEditingMatch(null);
                return;
            }

            // Ctrl/Cmd + Shift + N → switch to Create Match tab
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                setActiveTab('create');
                return;
            }

            // Ctrl/Cmd + A → select all filtered matches (when on matches tab)
            if ((e.metaKey || e.ctrlKey) && e.key === 'a' && activeTab === 'matches') {
                e.preventDefault();
                if (selectedMatchIds.size === filteredMatches.length) {
                    setSelectedMatchIds(new Set());
                } else {
                    setSelectedMatchIds(new Set(filteredMatches.map(m => m.id)));
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAuthorized, activeTab, filteredMatches, selectedMatchIds.size]);

    // ─── Pre-auth screens ──────────────────────────────────
    if (!isAuthorized) {
        if (adminCheckLoading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-white/20" />
                </div>
            );
        }

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

    // ─── Main Dashboard ────────────────────────────────────
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
                        <p className="text-white/50 text-base sm:text-lg mt-1">Manage tournaments, matches, teams, and players.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/25">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">⌘⇧N</kbd>
                            <span>New match</span>
                            <span className="text-white/10">|</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">⌘A</kbd>
                            <span>Select all</span>
                            <span className="text-white/10">|</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Esc</kbd>
                            <span>Clear</span>
                        </div>
                        <AdminTour />
                    </div>
                </div>
            </header>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="glass p-3 bg-white/[0.02] border-white/10">
                    <div className="text-xs text-white/40 font-medium">Total Matches</div>
                    <div className="text-2xl font-bold text-white/90 tabular-nums">{matches.length}</div>
                </Card>
                <Card className="glass p-3 bg-white/[0.02] border-white/10">
                    <div className="text-xs text-white/40 font-medium">Live Now</div>
                    <div className="text-2xl font-bold text-red-400 tabular-nums flex items-center gap-2">
                        {matches.filter(m => m.status === 'LIVE').length}
                        {matches.some(m => m.status === 'LIVE') && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                        )}
                    </div>
                </Card>
                <Card className="glass p-3 bg-white/[0.02] border-white/10">
                    <div className="text-xs text-white/40 font-medium">Total Teams</div>
                    <div className="text-2xl font-bold text-white/90 tabular-nums">{teams.length}</div>
                </Card>
                <Card className="glass p-3 bg-white/[0.02] border-white/10">
                    <div className="text-xs text-white/40 font-medium">Total Players</div>
                    <div className="text-2xl font-bold text-white/90 tabular-nums">{players.length}</div>
                </Card>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-white/5 border border-white/10 p-1 rounded-lg h-auto flex-wrap">
                    <TabsTrigger value="matches" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-md text-sm px-4 py-2">
                        Matches
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-md text-sm px-4 py-2" data-tour="manage-teams">
                        Teams
                    </TabsTrigger>
                    <TabsTrigger value="create" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-md text-sm px-4 py-2" data-tour="create-match">
                        Create Match
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-md text-sm px-4 py-2">
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* ── Matches Tab ── */}
                <TabsContent value="matches" className="mt-5 space-y-4" data-tour="manage-matches">
                    {/* Sport filter + selection controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-white/50 font-medium shrink-0">Filter:</span>
                        <button
                            onClick={() => startTransition(() => setMatchFilter('All'))}
                            className={`px-3 py-1 rounded-md text-xs transition-all border ${
                                matchFilter === 'All'
                                    ? 'bg-white/10 text-white border-white/10'
                                    : 'bg-white/[0.03] text-white/70 border-white/[0.06]'
                            }`}
                        >
                            All
                        </button>
                        {sports.map(s => (
                            <button
                                key={s}
                                onClick={() => startTransition(() => setMatchFilter(s))}
                                className={`px-3 py-1 rounded-md text-xs transition-all border whitespace-nowrap ${
                                    matchFilter === s
                                        ? 'bg-white/10 text-white border-white/10'
                                        : 'bg-white/[0.03] text-white/70 border-white/[0.06]'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                        <div className="ml-auto flex items-center gap-1.5">
                            {selectedMatchIds.size === filteredMatches.length && filteredMatches.length > 0 ? (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[11px] text-white/40 hover:text-white/70 gap-1"
                                    onClick={() => setSelectedMatchIds(new Set())}
                                >
                                    <CheckCheck className="h-3 w-3" />
                                    Deselect All
                                </Button>
                            ) : filteredMatches.length > 0 ? (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[11px] text-white/40 hover:text-white/70 gap-1"
                                    onClick={selectAllMatches}
                                >
                                    <CheckSquare className="h-3 w-3" />
                                    Select All
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    {/* Bulk Actions toolbar */}
                    {selectedMatchIds.size > 0 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-wrap">
                            <CheckSquare className="h-4 w-4 text-blue-400 shrink-0" />
                            <span className="text-xs font-semibold text-blue-400 shrink-0">{selectedMatchIds.size} selected</span>
                            <div className="flex gap-1.5 ml-auto flex-wrap">
                                <Button size="sm" className="h-7 text-[11px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30" onClick={() => handleBulkStatusChange('UPCOMING')}>
                                    Set Upcoming
                                </Button>
                                <Button size="sm" className="h-7 text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30" onClick={() => handleBulkStatusChange('LIVE')}>
                                    Set Live
                                </Button>
                                <Button size="sm" className="h-7 text-[11px] bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30" onClick={() => handleBulkStatusChange('COMPLETED')}>
                                    Set Completed
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-white/40" onClick={() => setSelectedMatchIds(new Set())}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Match list */}
                    {filteredMatches.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                <Trophy className="h-8 w-8 text-white/20" />
                            </div>
                            <p className="text-white/40 font-medium">
                                {matchFilter === 'All' ? 'No matches created yet.' : `No ${matchFilter} matches found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredMatches.map((match) => {
                                const teamA = teamsById.get(match.teamAId);
                                const teamB = teamsById.get(match.teamBId);
                                if (!teamA || !teamB) return null;

                                const isEditingThis = editingMatch?.id === match.id;

                                return (
                                    <Card key={match.id} className="glass p-4 bg-white/[0.02] border-white/10 hover:border-white/20 transition-all group hover-lift">
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                                            {/* Selection checkbox */}
                                            <button
                                                onClick={() => toggleMatchSelection(match.id)}
                                                className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                                                    selectedMatchIds.has(match.id)
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'border-white/20 hover:border-white/40'
                                                }`}
                                            >
                                                {selectedMatchIds.has(match.id) && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-[180px] w-full sm:w-auto cursor-pointer" onClick={() => router.push(`/match/${match.id}`)}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="text-xs font-semibold border-white/20 text-white/60">
                                                        {match.sport}
                                                    </Badge>
                                                    {match.status === 'LIVE' && (
                                                        <span className="flex h-2 w-2 relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-bold text-lg text-white/90 group-hover:text-white transition-colors">{teamA.name} vs {teamB.name}</p>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {new Date(match.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="flex items-center text-xs text-white/40 gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{match.venue}</span>
                                                </div>
                                            </div>

                                            {isEditingThis ? (
                                                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                                                    <Select value={editingMatch?.status} onValueChange={(v) => setEditingMatch({ ...editingMatch!, status: v as any })}>
                                                        <SelectTrigger className="w-full sm:w-[140px] bg-white/5 border-white/10 h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                                            <SelectItem value="LIVE">Live</SelectItem>
                                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex gap-2">
                                                        <Button size="icon" className="bg-emerald-600 hover:bg-emerald-500 h-9 w-9" onClick={handleUpdateMatch}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="hover:bg-white/10 h-9 w-9" onClick={() => setEditingMatch(null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap" data-tour="match-actions">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-mono font-bold text-2xl tabular-nums text-white/90">{match.teamAScore}</div>
                                                        <span className="text-white/30">-</span>
                                                        <div className="font-mono font-bold text-2xl tabular-nums text-white/90">{match.teamBScore}</div>
                                                    </div>
                                                    <Badge
                                                        variant={match.status === 'LIVE' ? 'destructive' : match.status === 'UPCOMING' ? 'secondary' : 'default'}
                                                        className="w-[100px] justify-center font-semibold text-xs"
                                                    >
                                                        {match.status}
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="border-white/10 hover:bg-white/10 h-9 w-9"
                                                            onClick={() => setEditingMatch({ ...match })}
                                                            disabled={!!editingMatch}
                                                            title="Edit match"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="border-white/10 hover:bg-white/10 h-9 w-9"
                                                            onClick={() => handleDuplicateMatch(match)}
                                                            disabled={!!editingMatch}
                                                            title="Duplicate match"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="icon" variant="destructive" className="hover:bg-red-600 h-9 w-9" disabled={!!editingMatch}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="glass-strong border-white/10">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-white/90">Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-white/60">This will permanently delete the match.</AlertDialogDescription>
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
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* ── Teams Tab ── */}
                <TabsContent value="teams" className="mt-5 space-y-6">
                    <TeamManager />
                    <CSVImport />
                </TabsContent>

                {/* ── Create Match Tab ── */}
                <TabsContent value="create" className="mt-5">
                    <QuickMatchCreator />
                </TabsContent>

                {/* ── Settings Tab ── */}
                <TabsContent value="settings" className="mt-5 space-y-6">
                    <AdminManagement />
                    <ActivityLog matches={matches} teamsById={teamsById} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

    