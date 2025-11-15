"use client";

import { useState, useEffect } from 'react';
import { sports, calculatePointsTable } from '@/lib/data-client';
import type { SportName, PointsTableItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SportIcon } from '@/components/sport-icon';
import { useFirestore } from '@/firebase';
import { Loader2, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Sport accent colors
const sportAccents: Record<string, { color: string; bg: string; border: string }> = {
  'Football': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'Basketball': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Volleyball': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  'Cricket': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  'Throwball': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'Badminton (Singles)': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'Badminton (Doubles)': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'Table Tennis (Singles)': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  'Table Tennis (Doubles)': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  'Kabaddi': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

export default function LeaderboardPage() {
  const [selectedSport, setSelectedSport] = useState<SportName>('Football');
  const [leaderboards, setLeaderboards] = useState<Record<SportName, PointsTableItem[]>>({} as Record<SportName, PointsTableItem[]>);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    async function loadLeaderboards() {
      setLoading(true);
      const boards: Record<SportName, PointsTableItem[]> = {} as Record<SportName, PointsTableItem[]>;
      
      for (const sport of sports) {
        const table = await calculatePointsTable(firestore, sport);
        boards[sport] = table;
      }
      
      setLeaderboards(boards);
      setLoading(false);
    }
    
    loadLeaderboards();
  }, [firestore]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center font-bold text-white/40">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "default";
    if (rank <= 3) return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
      </div>
    );
  }

  const currentLeaderboard = leaderboards[selectedSport] || [];
  const accent = sportAccents[selectedSport] || sportAccents['Football'];

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Header */}
      <motion.div variants={headerVariants} className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tight text-gradient">
            Leaderboards
          </h1>
          <p className="text-white/60 text-lg">
            Team rankings and standings across all sports competitions
          </p>
        </div>
      </motion.div>

      <Tabs value={selectedSport} onValueChange={(value) => setSelectedSport(value as SportName)}>
        {/* Premium Sport Tabs */}
        <motion.div variants={contentVariants}>
          <TabsList className="inline-flex h-auto flex-wrap gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-2 w-full justify-start rounded-xl">
            {sports.map(sport => {
              const sportAccent = sportAccents[sport] || sportAccents['Football'];
              return (
                <TabsTrigger 
                  key={sport} 
                  value={sport} 
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg
                    data-[state=active]:${sportAccent.bg}
                    data-[state=active]:border-2
                    data-[state=active]:${sportAccent.border}
                    data-[state=active]:${sportAccent.color}
                    transition-all duration-300
                    hover:bg-white/10
                  `}
                >
                  <SportIcon sport={sport} className="h-5 w-5" />
                  <span className="font-semibold">{sport}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </motion.div>


        {sports.map(sport => (
          <TabsContent key={sport} value={sport} className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={sport}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`
                  glass-strong border-2 ${accent.border}
                  hover:shadow-2xl transition-all duration-500
                  overflow-hidden
                `}>
                  {/* Top accent line */}
                  <div className={`h-1 ${accent.bg} opacity-60`} />
                  
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${accent.bg} border-2 ${accent.border}`}>
                        <SportIcon sport={sport} className={`h-7 w-7 ${accent.color}`} />
                      </div>
                      <div>
                        <CardTitle className={`font-headline text-3xl font-black ${accent.color}`}>
                          {sport} Standings
                        </CardTitle>
                        <p className="text-white/50 text-sm mt-1">Current season rankings</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {currentLeaderboard.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-white/40">
                        <Trophy className="h-20 w-20 mb-4 opacity-10" />
                        <p className="text-lg font-semibold">No completed matches yet</p>
                        <p className="text-sm">Leaderboard will appear once matches are completed</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10 bg-white/5">
                              <TableHead className="font-bold text-white/90">Rank</TableHead>
                              <TableHead className="font-bold text-white/90">Team</TableHead>
                              <TableHead className="text-center font-bold text-white/90">P</TableHead>
                              <TableHead className="text-center font-bold text-white/90">W</TableHead>
                              <TableHead className="text-center font-bold text-white/90">L</TableHead>
                              <TableHead className="text-center font-bold text-white/90">D</TableHead>
                              <TableHead className="text-center font-bold text-white/90">PTS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentLeaderboard.map((item, index) => (
                              <motion.tr
                                key={item.teamId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`
                                  border-white/10 hover:bg-white/5 transition-all
                                  ${item.rank === 1 ? 'bg-yellow-500/10 hover:bg-yellow-500/15' : 
                                    item.rank === 2 ? 'bg-gray-400/5 hover:bg-gray-400/10' : 
                                    item.rank === 3 ? 'bg-amber-600/5 hover:bg-amber-600/10' : ''}
                                `}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                    {getRankIcon(item.rank)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-white/95">{item.teamName}</span>
                                    {item.rank <= 3 && (
                                      <Badge variant={getRankBadge(item.rank)} className="ml-2">
                                        {item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : '🥉'}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-white/70 font-medium">
                                  {item.played}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                                    <span className="font-bold text-green-400">{item.won}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                                    <span className="font-bold text-red-400">{item.lost}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-white/50 font-medium">
                                  {item.drawn}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant={item.rank === 1 ? "default" : "outline"} 
                                    className={`font-black text-base ${item.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'border-white/20 text-white/90'}`}
                                  >
                                    {item.points}
                                  </Badge>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
