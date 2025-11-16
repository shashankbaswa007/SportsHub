
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
import { Loader2, TrendingUp, Users, Trophy, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Force dynamic rendering to prevent build-time errors with Firebase
export const dynamic = 'force-dynamic';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

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
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-white/20" />
          <p className="text-sm text-white/40">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col gap-6 sm:gap-8 lg:gap-10 pb-12 px-3 sm:px-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-white/60 to-transparent rounded-full" />
            <span className="text-xs font-medium tracking-widest text-white/40 uppercase">Live Dashboard</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gradient leading-tight">
            Match Center
          </h1>
          <p className="text-base sm:text-lg text-white/50 max-w-2xl">
            Real-time scores, upcoming fixtures, and comprehensive match analytics.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <motion.div variants={itemVariants} className="glass p-3 sm:p-4 rounded-xl border hover:border-white/20 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-red-400" />
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Live</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black tabular-nums text-white/90">{liveMatches.length}</p>
              <p className="text-xs text-white/40 font-medium">Live Now</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass p-3 sm:p-4 rounded-xl border hover:border-white/20 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" />
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">Upcoming</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black tabular-nums text-white/90">{upcomingMatches.length}</p>
              <p className="text-xs text-white/40 font-medium">Scheduled</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass p-3 sm:p-4 rounded-xl border hover:border-white/20 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-green-400" />
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Done</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black tabular-nums text-white/90">{completedMatches.length}</p>
              <p className="text-xs text-white/40 font-medium">Completed</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass p-3 sm:p-4 rounded-xl border hover:border-white/20 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 sm:h-5 w-4 sm:w-5 text-purple-400" />
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">Total</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black tabular-nums text-white/90">{matches.length}</p>
              <p className="text-xs text-white/40 font-medium">All Matches</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sport Filters */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="All" onValueChange={(value) => setFilter(value as SportName | 'All')}>
          <TabsList className="inline-flex h-auto flex-wrap gap-2 bg-transparent border border-white/10 p-2 w-full justify-start rounded-xl overflow-x-auto">
            <TabsTrigger 
              value="All" 
              className="px-3 sm:px-5 py-2 sm:py-2.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 border-0 data-[state=active]:border-white/20 rounded-lg transition-all duration-300 font-medium text-sm whitespace-nowrap"
            >
              All Sports
            </TabsTrigger>
            {sports.map(sport => (
              <TabsTrigger 
                key={sport} 
                value={sport} 
                className="px-3 sm:px-5 py-2 sm:py-2.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 border-0 data-[state=active]:border-white/20 rounded-lg transition-all duration-300 font-medium text-sm whitespace-nowrap"
              >
                {sport}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="wait">
            {liveMatches.length > 0 && (
              <motion.section 
                key="live-matches"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <h2 className="font-headline text-2xl font-bold text-white/90">Live Matches</h2>
                  </div>
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-medium">
                    {liveMatches.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {liveMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
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
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <h2 className="font-headline text-2xl font-bold text-white/90">Upcoming Matches</h2>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">
                    {upcomingMatches.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {upcomingMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {completedMatches.length > 0 && (
               <motion.section
                key="completed-matches"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
               >
                <div className="flex items-center gap-3">
                  <h2 className="font-headline text-2xl font-bold text-white/90">Completed Matches</h2>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-medium">
                    {completedMatches.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {completedMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {(liveMatches.length + upcomingMatches.length + completedMatches.length) === 0 && (
            <div className="glass rounded-xl p-12 text-center border">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-white/10" />
              <p className="text-white/40 text-lg font-medium">No matches found</p>
              <p className="text-white/30 text-sm mt-2">Try selecting a different sport filter</p>
            </div>
          )}
        </div>
        
        <aside className="lg:col-span-1 sticky top-20">
            <AnimatePresence>
                {filter !== 'All' && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                    >
                        <Card className="glass-strong border-white/10 overflow-hidden">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                     <SportIcon sport={filter as SportName} className="h-6 w-6 text-white/70" />
                                     <CardTitle className="font-headline text-xl font-bold text-white/90">{filter} Standings</CardTitle>
                                </div>
                                <CardDescription className="text-white/40 mt-2">
                                  Live tournament rankings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isTableLoading ? (
                                  <div className="flex justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                                  </div>
                                ) : pointsTable.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Pos</TableHead>
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Team</TableHead>
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider text-center">P</TableHead>
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider text-center">W</TableHead>
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider text-center">D</TableHead>
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider text-center">L</TableHead>
                                            <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider text-right">Pts</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {pointsTable.map((item, index) => (
                                            <TableRow 
                                              key={item.teamId}
                                              className="border-white/5 hover:bg-white/5 transition-colors group"
                                            >
                                              <TableCell className="font-bold text-white/60 group-hover:text-white/90 transition-colors">
                                                <div className="flex items-center gap-2">
                                                  {index < 3 && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                                                  )}
                                                  {item.rank}
                                                </div>
                                              </TableCell>
                                              <TableCell className="font-semibold text-white/80 group-hover:text-white transition-colors">
                                                {item.teamName}
                                              </TableCell>
                                              <TableCell className="text-white/50 text-center tabular-nums">{item.played}</TableCell>
                                              <TableCell className="text-green-400/70 text-center tabular-nums font-medium">{item.won}</TableCell>
                                              <TableCell className="text-yellow-400/70 text-center tabular-nums font-medium">{item.drawn}</TableCell>
                                              <TableCell className="text-red-400/70 text-center tabular-nums font-medium">{item.lost}</TableCell>
                                              <TableCell className="text-right font-bold text-lg text-white/90 tabular-nums">{item.points}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                ) : (
                                    <div className="py-12 px-6 text-center">
                                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3">
                                        <Trophy className="h-6 w-6 text-white/20" />
                                      </div>
                                      <p className="text-sm text-white/40 font-medium">No standings available</p>
                                      <p className="text-xs text-white/30 mt-1">Check back after matches are completed</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
      </div>
    </motion.div>
  );
}
