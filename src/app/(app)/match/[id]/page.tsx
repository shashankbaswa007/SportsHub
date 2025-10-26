
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updatePlayerStats, recalculateMatchScores, updateSetScore } from '@/lib/data-client';
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
import { doc, onSnapshot, collection, query, where, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


const getStatusVariant = (status: 'LIVE' | 'UPCOMING' | 'COMPLETED') => {
  switch (status) {
    case 'LIVE': return 'destructive';
    case 'UPCOMING': return 'secondary';
    case 'COMPLETED': return 'default';
  }
};

const sportBgGradients: Record<SportName, string> = {
    'Football': 'linear-gradient(135deg, #27ae60, #2ecc71)',
    'Cricket': 'linear-gradient(135deg, #0a3d62, #1e6091)',
    'Basketball': 'linear-gradient(135deg, #e67e22, #f39c12)',
    'Volleyball': 'linear-gradient(135deg, #2980b9, #6dd5fa)',
    'Table Tennis': 'linear-gradient(135deg, #8e44ad, #00cec9)',
    'Badminton': 'linear-gradient(135deg, #1abc9c, #2ecc71)',
    'Kabaddi': 'linear-gradient(135deg, #8d5524, #e17055)',
    'Throwball': 'linear-gradient(135deg, #d35400, #e67e22)',
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
    if (!id) {
        setLoading(false);
        return;
    };

    const unsubMatch = onSnapshot(doc(firestore, "matches", id), async (doc) => {
        if (doc.exists()) {
            const matchData = { id: doc.id, ...doc.data() } as Match;
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

  const backgroundStyle = {
    background: sportBgGradients[match.sport] || 'hsl(var(--background))',
  };

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
                <TableCell>{player.name}</TableCell>
                <TableCell colSpan={isAdmin ? 2 : 1} className="text-right">
                    <div className="space-y-2">
                        {Object.keys(player.stats).map((key) => (
                            <div key={key} className="flex items-center justify-end gap-2">
                                <span className="text-xs font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handlePlayerStatDecrement(key)}><Minus className="h-3 w-3" /></Button>
                                    <Input 
                                      type="number" 
                                      className="w-14 h-8 text-center" 
                                      value={editingPlayerStats[key]} 
                                      onChange={(e) => handlePlayerStatChange(key, e.target.value)}
                                    />
                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handlePlayerStatIncrement(key)}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button size="sm" variant="ghost" onClick={handleCancelEditPlayer}><X className="mr-1 h-4 w-4" /> Cancel</Button>
                        <Button size="sm" onClick={() => handleSavePlayerStats(player.id)}><Save className="mr-1 h-4 w-4" /> Save</Button>
                    </div>
                </TableCell>
            </TableRow>
        )
    }

    return (
        <TableRow key={player.id}>
            <TableCell>{player.name}</TableCell>
            <TableCell className="text-right text-xs">
                {Object.entries(player.stats).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${value}`).join(', ')}
            </TableCell>
            {isAdmin && <TableCell className="text-right"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEditPlayer(player)}><Edit className="h-4 w-4" /></Button></TableCell>}
        </TableRow>
    );
  };
  
  const cricketScore = match.sport === 'Cricket' ? match.scoreDetails as CricketScore : null;

  return (
    <div className="relative min-h-full" style={backgroundStyle}>
        <div className="relative z-10 space-y-8 p-4 md:p-8 bg-background/30 backdrop-blur-sm min-h-full">
            <header className="flex flex-col items-center text-center gap-4 pt-8 text-white">
                <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-white" onClick={handleBackNavigation}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Overview
                </Button>
                <div className="flex items-center gap-3 font-semibold text-lg text-white/90">
                    <SportIcon sport={match.sport} className="h-6 w-6" />
                    <span>{match.sport} Match</span>
                </div>

                <div className="grid grid-cols-3 items-center w-full max-w-2xl">
                    <div className="flex flex-col items-center justify-center gap-2 h-24">
                       <h2 className="font-headline text-3xl md:text-4xl font-black text-center">{teamA.name}</h2>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center justify-center gap-4">
                            <span className="font-headline text-5xl font-bold">{match.teamAScore}</span>
                            <span className="font-headline text-3xl text-white/80">-</span>
                            <span className="font-headline text-5xl font-bold">{match.teamBScore}</span>
                        </div>
                         {cricketScore && <p className="font-mono text-center text-lg">{`${cricketScore.runs}/${cricketScore.wickets} (${cricketScore.overs})`}</p>}
                        <Badge variant={getStatusVariant(match.status)} className="mx-auto mt-2 w-fit">
                            {match.status}
                        </Badge>
                    </div>
                     <div className="flex flex-col items-center justify-center gap-2 h-24">
                        <h2 className="font-headline text-3xl md:text-4xl font-black text-center">{teamB.name}</h2>
                    </div>
                </div>
                 {isAdmin && (
                    <Button onClick={handleRecalculate} size="sm" variant="secondary" className="text-foreground">
                        <RefreshCw className="mr-2 h-4 w-4" /> Recalculate Scores
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     {Array.isArray(match.scoreDetails) && (
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Set Scores</CardTitle>
                                <CardDescription>Individual set results for the match.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {match.scoreDetails.map((set) => (
                                    <Card key={set.set} className="p-3">
                                        <div className="flex justify-between items-center">
                                          <p className="font-bold">Set {set.set}</p>
                                          {isAdmin && (
                                            editingSet?.set === set.set ? (
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEditSet}><X className="h-4 w-4"/></Button>
                                                    <Button size="icon" className="h-7 w-7" onClick={handleSaveSet}><Save className="h-4 w-4"/></Button>
                                                </div>
                                            ) : (
                                                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleEditSet(set)}><Edit className="h-4 w-4"/></Button>
                                            )
                                          )}
                                        </div>
                                         {editingSet?.set === set.set ? (
                                             <div className="flex items-center gap-2 mt-2">
                                                <Input type="number" value={editingSet.teamAScore} onChange={e => setEditingSet({...editingSet, teamAScore: Number(e.target.value)})} className="w-full h-8"/>
                                                <span>-</span>
                                                <Input type="number" value={editingSet.teamBScore} onChange={e => setEditingSet({...editingSet, teamBScore: Number(e.target.value)})} className="w-full h-8"/>
                                             </div>
                                         ) : (
                                             <p className="font-mono text-2xl font-bold mt-1">{set.teamAScore} - {set.teamBScore}</p>
                                         )}
                                    </Card>
                                ))}
                               </div>
                            </CardContent>
                        </Card>
                     )}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Player Stats</CardTitle>
                            <CardDescription>View and manage individual player performance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">{teamA.name}</h3>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Player</TableHead><TableHead className="text-right">Stats</TableHead>{isAdmin && <TableHead/>}</TableRow></TableHeader>
                                        <TableBody>
                                            {teamAPlayers.map(player => renderPlayerStats(player))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="space-y-2">
                                     <h3 className="font-semibold">{teamB.name}</h3>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Player</TableHead><TableHead className="text-right">Stats</TableHead>{isAdmin && <TableHead/>}</TableRow></TableHeader>
                                        <TableBody>
                                            {teamBPlayers.map(player => renderPlayerStats(player))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader><CardTitle className="font-headline">Match Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
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
                    <MatchPrediction match={match} teamA={teamA} teamB={teamB} />
                </div>
            </div>
        </div>
    </div>
  );
}
