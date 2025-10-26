
"use client";

import { sports } from '@/lib/data-client';
import { SportIcon } from '@/components/sport-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Team, Player } from '@/lib/types';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        const unsubTeams = onSnapshot(collection(firestore, "teams"), (snap) => {
            setTeams(snap.docs.map(doc => ({id: doc.id, ...doc.data() as Omit<Team, 'id'>})));
            setLoading(false);
        });
        const unsubPlayers = onSnapshot(collection(firestore, "players"), (snap) => {
            setPlayers(snap.docs.map(doc => ({id: doc.id, ...doc.data() as Omit<Player, 'id'>})));
        });

        return () => {
            unsubTeams();
            unsubPlayers();
        };
    }, [firestore]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold tracking-tight">Teams & Players</h1>
                <p className="text-muted-foreground">Browse all the teams and their members by sport.</p>
            </header>

            <div className="space-y-12">
                <AnimatePresence>
                    {sports.map((sport, sportIndex) => {
                        const sportTeams = teams.filter(t => t.sport === sport);
                        if (sportTeams.length === 0) return null;

                        return (
                        <motion.section 
                            key={sport}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: sportIndex * 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <SportIcon sport={sport} className="h-8 w-8 text-primary" />
                                <h2 className="font-headline text-3xl font-bold">{sport}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sportTeams.map(team => {
                                    const teamPlayers = players.filter(p => p.teamId === team.id);
                                    return (
                                        <Card key={team.id} className="bg-card/70 backdrop-blur-sm border-2 border-transparent hover:border-primary/50 transition-all">
                                            <CardHeader>
                                                <CardTitle className="font-headline text-2xl">{team.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-3">
                                                    {teamPlayers.length > 0 ? teamPlayers.map(player => (
                                                        <li key={player.id} className="flex items-center gap-3">
                                                            <User className="h-5 w-5 text-muted-foreground" />
                                                            <span className="font-medium">{player.name}</span>
                                                        </li>
                                                    )) : (
                                                        <p className="text-sm text-muted-foreground">No players listed for this team.</p>
                                                    )}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </motion.section>
                    )})}
                </AnimatePresence>
            </div>
        </div>
    );
}
