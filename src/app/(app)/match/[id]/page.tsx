
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updatePlayerStats, recalculateMatchScores, updateSetScore } from '@/lib/data-client';

// Force dynamic rendering to prevent build-time errors with Firebase
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SportIcon } from '@/components/sport-icon';
import type { SportName, Player, Match, SetScore, CricketScore, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Minus, Edit, X, RefreshCw, Loader2, ArrowLeft, MapPin } from 'lucide-react';
import { MatchPrediction } from '@/components/match-prediction';
import { MatchPerformanceCharts } from '@/components/match-performance-charts';
import { doc, onSnapshot, collection, query, where, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


const getStatusVariant = (status: 'LIVE' | 'UPCOMING' | 'COMPLETED') => {
  switch (status) {
    case 'LIVE': return 'destructive';
    case 'UPCOMING': return 'secondary';
    case 'COMPLETED': return 'default';
  }
};

type EditablePlayerStats = { [key: string]: string | number };
type EditableSet = SetScore & { isEditing?: boolean };

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);

  const [loading, setLoading] = useState(true);

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingPlayerStats, setEditingPlayerStats] = useState<EditablePlayerStats>({});
  const [editingSet, setEditingSet] = useState<Partial<EditableSet> | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('sports-hub-user');
    setIsAdmin(user === '160123771030');
  }, []);

  useEffect(() => {
    if (!id || !firestore) {
        setLoading(false);
        return;
    }

    const unsubMatch = onSnapshot(doc(firestore, "matches", id), async (docSnapshot) => {
        if (docSnapshot.exists()) {
            const matchData = { id: docSnapshot.id, ...docSnapshot.data() } as Match;
            setMatch(matchData);

            if (matchData.teamAId) {
                onSnapshot(doc(firestore, "teams", matchData.teamAId), (teamDoc) => {
                    if(teamDoc.exists()) setTeamA({ id: teamDoc.id, ...teamDoc.data() } as Team);
                });
            }
            if (matchData.teamBId) {
                onSnapshot(doc(firestore, "teams", matchData.teamBId), (teamDoc) => {
                    if(teamDoc.exists()) setTeamB({ id: teamDoc.id, ...teamDoc.data() } as Team);
                });
            }
        } else {
            setMatch(null);
            setTeamA(null);
            setTeamB(null);
        }
        setLoading(false);
    });
    
    return () => unsubMatch();
  }, [id, firestore]);

  useEffect(() => {
    if (!match?.teamAId) {
        setTeamAPlayers([]);
        return;
    }

    const qA = query(collection(firestore, "players"), where("teamId", "==", match.teamAId));
    const unsubA = onSnapshot(qA, (snap) => {
      setTeamAPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
    });
    
    return () => unsubA();
  }, [match?.teamAId, firestore]);

  useEffect(() => {
      if (!match?.teamBId) {
          setTeamBPlayers([]);
          return;
      }

      const qB = query(collection(firestore, "players"), where("teamId", "==", match.teamBId));
      const unsubB = onSnapshot(qB, (snap) => {
          setTeamBPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
      });
      
      return () => unsubB();
  }, [match?.teamBId, firestore]);


  const handleBackNavigation = () => {
    router.push('/overview');
  };


  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
    );
  }

  if (!match || !teamA || !teamB) {
     return (
        <div className="flex flex-col justify-center items-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">Match Not Found</h1>
            <Button onClick={() => router.push('/overview')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Overview
            </Button>
        </div>
    );
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player.id);
    setEditingPlayerStats({ ...player.stats });
  };
  
  const handleCancelEditPlayer = () => {
    setEditingPlayer(null);
    setEditingPlayerStats({});
  };
  
  const handlePlayerStatChange = (stat: string, value: string) => {
    setEditingPlayerStats(prev => ({...prev, [stat]: value}));
  };

  const handlePlayerStatIncrement = (stat: string) => {
      setEditingPlayerStats(prev => ({...prev, [stat]: (Number(prev[stat]) || 0) + 1}));
  };

  const handlePlayerStatDecrement = (stat: string) => {
      setEditingPlayerStats(prev => ({...prev, [stat]: Math.max(0, (Number(prev[stat]) || 0) - 1)}));
  };

  const handleSavePlayerStats = async (playerId: string) => {
    const numericStats: Record<string, number> = {};
    for (const key in editingPlayerStats) {
        const val = Number(editingPlayerStats[key]);
        numericStats[key] = isNaN(val) ? 0 : val;
    }
    
    await updatePlayerStats(firestore, playerId, numericStats);
    await recalculateMatchScores(firestore, match.id);
    
    setEditingPlayer(null);
    setEditingPlayerStats({});
    
    toast({
        title: 'Stats Updated',
        description: 'Player performance and match score have been updated.',
    });
  };

  const handleRecalculate = async () => {
      await recalculateMatchScores(firestore, match.id);
      toast({
          title: 'Scores Refreshed',
          description: 'Match scores have been recalculated from player stats.',
      });
  }

  const handleEditSet = (set: SetScore) => {
    setEditingSet({ ...set, isEditing: true });
  }

  const handleCancelEditSet = () => {
      setEditingSet(null);
  }

  const handleSaveSet = async () => {
      if (!editingSet || !editingSet.set) return;
      await updateSetScore(firestore, match.id, editingSet.set, Number(editingSet.teamAScore), Number(editingSet.teamBScore));
      await recalculateMatchScores(firestore, match.id);
      setEditingSet(null);
      toast({ title: "Set Score Updated" });
  }

  const renderPlayerStats = (player: Player) => {
    if (editingPlayer === player.id) {
        return (
             <TableRow key={player.id}>
                <TableCell className="text-xs sm:text-sm">{player.name}</TableCell>
                <TableCell colSpan={isAdmin ? 2 : 1} className="text-right">
                    <div className="space-y-2">
                        {Object.keys(player.stats).map((key) => (
                            <div key={key} className="flex items-center justify-end gap-1 sm:gap-2">
                                <span className="text-[10px] sm:text-xs font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    <Button size="icon" variant="outline" className="h-5 w-5 sm:h-6 sm:w-6" onClick={() => handlePlayerStatDecrement(key)}><Minus className="h-2 w-2 sm:h-3 sm:w-3" /></Button>
                                    <Input 
                                      type="number" 
                                      className="w-10 sm:w-14 h-6 sm:h-8 text-center text-xs sm:text-sm" 
                                      value={editingPlayerStats[key]} 
                                      onChange={(e) => handlePlayerStatChange(key, e.target.value)}
                                    />
                                    <Button size="icon" variant="outline" className="h-5 w-5 sm:h-6 sm:w-6" onClick={() => handlePlayerStatIncrement(key)}><Plus className="h-2 w-2 sm:h-3 sm:w-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-3 sm:mt-4">
                        <Button size="sm" variant="ghost" className="h-8 text-xs sm:text-sm" onClick={handleCancelEditPlayer}><X className="mr-1 h-3 sm:h-4 w-3 sm:w-4" /> Cancel</Button>
                        <Button size="sm" className="h-8 text-xs sm:text-sm" onClick={() => handleSavePlayerStats(player.id)}><Save className="mr-1 h-3 sm:h-4 w-3 sm:w-4" /> Save</Button>
                    </div>
                </TableCell>
            </TableRow>
        )
    }

    return (
        <TableRow key={player.id}>
            <TableCell className="text-xs sm:text-sm">{player.name}</TableCell>
            <TableCell className="text-right text-[10px] sm:text-xs">
                {Object.entries(player.stats).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${value}`).join(', ')}
            </TableCell>
            {isAdmin && <TableCell className="text-right"><Button variant="outline" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => handleEditPlayer(player)}><Edit className="h-3 w-3 sm:h-4 sm:w-4" /></Button></TableCell>}
        </TableRow>
    );
  };
  
  const cricketScore = match.sport === 'Cricket' ? match.scoreDetails as CricketScore : null;

  return (
    <div className="relative min-h-full">
        <div className="relative z-10 space-y-6 sm:space-y-8">
            <header className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <Button variant="ghost" className="absolute top-0 left-0 h-9 text-sm" onClick={handleBackNavigation}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Back to Overview</span><span className="sm:hidden">Back</span>
                </Button>
                <div className="flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base lg:text-lg pt-8 sm:pt-0">
                    <SportIcon sport={match.sport} className="h-5 sm:h-6 w-5 sm:w-6" />
                    <span>{match.sport} Match</span>
                </div>

                <div className="grid grid-cols-3 items-center w-full max-w-2xl gap-2 sm:gap-4">
                    <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 h-16 sm:h-20 lg:h-24">
                       <h2 className="font-headline text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-center">{teamA.name}</h2>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center justify-center gap-2 sm:gap-4">
                            <span className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold">{match.teamAScore}</span>
                            <span className="font-headline text-xl sm:text-2xl lg:text-3xl text-muted-foreground">-</span>
                            <span className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold">{match.teamBScore}</span>
                        </div>
                         {cricketScore && <p className="font-mono text-center text-sm sm:text-base lg:text-lg">{`${cricketScore.runs}/${cricketScore.wickets} (${cricketScore.overs})`}</p>}
                        <Badge variant={getStatusVariant(match.status)} className="mx-auto mt-1 sm:mt-2 w-fit text-xs">
                            {match.status}
                        </Badge>
                    </div>
                     <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 h-16 sm:h-20 lg:h-24">
                        <h2 className="font-headline text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-center">{teamB.name}</h2>
                    </div>
                </div>
                 {isAdmin && (
                    <Button onClick={handleRecalculate} size="sm" variant="secondary" className="text-foreground h-9 text-sm">
                        <RefreshCw className="mr-2 h-4 w-4" /> Recalculate Scores
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                     {Array.isArray(match.scoreDetails) && (
                        <Card>
                             <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="font-headline text-xl sm:text-2xl">Set Scores</CardTitle>
                                <CardDescription className="text-sm sm:text-base">Individual set results for the match.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                {match.scoreDetails.map((set) => (
                                    <Card key={set.set} className="p-2 sm:p-3">
                                        <div className="flex justify-between items-center">
                                          <p className="font-bold text-sm sm:text-base">Set {set.set}</p>
                                          {isAdmin && (
                                            editingSet?.set === set.set ? (
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-6 sm:h-7 w-6 sm:w-7" onClick={handleCancelEditSet}><X className="h-3 sm:h-4 w-3 sm:w-4"/></Button>
                                                    <Button size="icon" className="h-6 sm:h-7 w-6 sm:w-7" onClick={handleSaveSet}><Save className="h-3 sm:h-4 w-3 sm:w-4"/></Button>
                                                </div>
                                            ) : (
                                                <Button size="icon" variant="outline" className="h-6 sm:h-7 w-6 sm:w-7" onClick={() => handleEditSet(set)}><Edit className="h-3 sm:h-4 w-3 sm:w-4"/></Button>
                                            )
                                          )}
                                        </div>
                                         {editingSet?.set === set.set && editingSet ? (
                                             <div className="flex items-center gap-1 sm:gap-2 mt-2">
                                                <Input type="number" value={editingSet.teamAScore} onChange={e => setEditingSet({...editingSet, teamAScore: Number(e.target.value)})} className="w-full h-7 sm:h-8 text-sm"/>
                                                <span className="text-xs sm:text-sm">-</span>
                                                <Input type="number" value={editingSet.teamBScore} onChange={e => setEditingSet({...editingSet, teamBScore: Number(e.target.value)})} className="w-full h-7 sm:h-8 text-sm"/>
                                             </div>
                                         ) : (
                                             <p className="font-mono text-xl sm:text-2xl font-bold mt-1">{set.teamAScore} - {set.teamBScore}</p>
                                         )}
                                    </Card>
                                ))}
                               </div>
                            </CardContent>
                        </Card>
                     )}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="font-headline text-xl sm:text-2xl">Player Stats</CardTitle>
                            <CardDescription className="text-sm sm:text-base">View and manage individual player performance.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm sm:text-base">{teamA.name}</h3>
                                    <div className="responsive-table">
                                        <Table>
                                            <TableHeader><TableRow><TableHead className="text-xs sm:text-sm">Player</TableHead><TableHead className="text-right text-xs sm:text-sm">Stats</TableHead>{isAdmin && <TableHead/>}</TableRow></TableHeader>
                                            <TableBody>
                                                {teamAPlayers.map(player => renderPlayerStats(player))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <h3 className="font-semibold text-sm sm:text-base">{teamB.name}</h3>
                                    <div className="responsive-table">
                                        <Table>
                                            <TableHeader><TableRow><TableHead className="text-xs sm:text-sm">Player</TableHead><TableHead className="text-right text-xs sm:text-sm">Stats</TableHead>{isAdmin && <TableHead/>}</TableRow></TableHeader>
                                            <TableBody>
                                                {teamBPlayers.map(player => renderPlayerStats(player))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                     <Card>
                        <CardHeader className="p-4 sm:p-6"><CardTitle className="font-headline text-xl sm:text-2xl">Match Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-xs sm:text-sm p-4 sm:p-6 pt-0">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <strong>{new Date(match.startTime).toLocaleDateString()}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <strong>{new Date(match.startTime).toLocaleTimeString()}</strong>
                            </div>
                             <div className="flex justify-between items-start">
                                <span className="text-muted-foreground">Venue:</span>
                                <strong className='text-right'>{match.venue}</strong>
                            </div>
                             <div className="flex justify-between items-start">
                                <span className="text-muted-foreground">Info:</span>
                                <strong className='text-right'>{match.details}</strong>
                            </div>
                        </CardContent>
                    </Card>
                    {match.status !== 'COMPLETED' && <MatchPrediction match={match} teamA={teamA} teamB={teamB} />}
                </div>
            </div>

            {/* Performance Charts for Completed Matches */}
            {match.status === 'COMPLETED' && teamAPlayers.length > 0 && teamBPlayers.length > 0 && (
                <div className="mt-8">
                    <MatchPerformanceCharts 
                        match={match}
                        teamA={teamA}
                        teamB={teamB}
                        teamAPlayers={teamAPlayers}
                        teamBPlayers={teamBPlayers}
                    />
                </div>
            )}
        </div>
    </div>
  );
}
