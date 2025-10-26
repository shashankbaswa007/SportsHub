
"use client";

import { useState, useEffect, useMemo } from 'react';
import { sports, calculatePointsTable } from '@/lib/data-client';
import type { Match, SportName, PointsTableItem } from '@/lib/types';
import { MatchCard } from '@/components/match-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnimatePresence, motion } from "framer-motion"
import { SportIcon } from '@/components/sport-icon';
import { collection, onSnapshot, query }from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function OverviewPage() {
  const [filter, setFilter] = useState<SportName | 'All'>('All');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, "matches"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const matchesData: Match[] = [];
      querySnapshot.forEach((doc) => {
        matchesData.push({ id: doc.id, ...doc.data() } as Match);
      });
      setMatches(matchesData.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const filteredMatches = useMemo(() => matches.filter(match => filter === 'All' || match.sport === filter), [matches, filter]);

  const liveMatches = useMemo(() => filteredMatches.filter(m => m.status === 'LIVE'), [filteredMatches]);
  const upcomingMatches = useMemo(() => filteredMatches.filter(m => m.status === 'UPCOMING'), [filteredMatches]);
  const completedMatches = useMemo(() => filteredMatches.filter(m => m.status === 'COMPLETED'), [filteredMatches]);
  
  const [pointsTable, setPointsTable] = useState<PointsTableItem[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);

  useEffect(() => {
    async function updatePointsTable() {
      if (filter !== 'All') {
        setIsTableLoading(true);
        const table = await calculatePointsTable(firestore, filter);
        setPointsTable(table);
        setIsTableLoading(false);
      } else {
        setPointsTable([]);
      }
    }
    updatePointsTable();
  }, [filter, completedMatches, firestore]); 

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Match Overview</h1>
        <p className="text-muted-foreground">Live scores, upcoming matches, and results.</p>
      </div>

      <Tabs defaultValue="All" onValueChange={(value) => setFilter(value as SportName | 'All')}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="All">All</TabsTrigger>
          {sports.map(sport => (
            <TabsTrigger key={sport} value={sport}>{sport}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {liveMatches.length > 0 && (
              <motion.section 
                key="live-matches"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="font-headline text-2xl font-bold">Live Matches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {upcomingMatches.length > 0 && (
               <motion.section 
                key="upcoming-matches"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="font-headline text-2xl font-bold">Upcoming Matches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {completedMatches.length > 0 && (
               <motion.section>
                <h2 className="font-headline text-2xl font-bold">Completed Matches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {(liveMatches.length + upcomingMatches.length + completedMatches.length) === 0 && (
            <p className="text-muted-foreground text-center py-8">No matches found for this filter.</p>
          )}
        </div>
        
        <aside className="lg:col-span-1 sticky top-20">
            <AnimatePresence>
                {filter !== 'All' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                     <SportIcon sport={filter as SportName} className="h-6 w-6" />
                                     <CardTitle className="font-headline">{filter} Points Table</CardTitle>
                                </div>
                                <CardDescription>Team standings for the {filter} tournament.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isTableLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> :
                                pointsTable.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Rank</TableHead>
                                            <TableHead>Team</TableHead>
                                            <TableHead>P</TableHead>
                                            <TableHead>W</TableHead>
                                            <TableHead>D</TableHead>
                                            <TableHead>L</TableHead>
                                            <TableHead className="text-right">Pts</TableHead>
                                        </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {pointsTable.map(item => (
                                            <TableRow key={item.teamId}>
                                                <TableCell className="font-bold">{item.rank}</TableCell>
                                                <TableCell className="font-medium">{item.teamName}</TableCell>
                                                <TableCell>{item.played}</TableCell>
                                                <TableCell>{item.won}</TableCell>
                                                <TableCell>{item.drawn}</TableCell>
                                                <TableCell>{item.lost}</TableCell>
                                                <TableCell className="text-right font-bold text-lg">{item.points}</TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No completed matches for this sport yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
