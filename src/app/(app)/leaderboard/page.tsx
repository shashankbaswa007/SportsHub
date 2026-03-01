"use client";

import { useState, useMemo } from 'react';
import { sports } from '@/lib/data-client';
import type { SportName, PointsTableItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SportIcon } from '@/components/sport-icon';
import { Loader2, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data-context';
import { ExportResults } from '@/components/export-results';
import { TournamentBracket } from '@/components/tournament-bracket';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
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
  const { leaderboards, loading, matches, teamsById } = useAppData();

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
  const accent = (sportAccents[selectedSport] || sportAccents['Football'])!;

  const sportCompletedMatches = useMemo(
    () => matches.filter(m => m.sport === selectedSport && m.status === 'COMPLETED'),
    [matches, selectedSport]
  );

  const teamNameMap = useMemo(() => {
    const m = new Map<string, string>();
    teamsById.forEach((team, id) => m.set(id, team.name));
    return m;
  }, [teamsById]);

  return (
    <motion.div 
      className="flex flex-col gap-6 sm:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Header */}
      <motion.div variants={headerVariants} className="relative">
        <div className="absolute -top-4 -left-4 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="relative space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gradient">
              Leaderboards
            </h1>
            <ExportResults
              leaderboard={currentLeaderboard}
              matches={sportCompletedMatches}
              filename={`${selectedSport.toLowerCase().replace(/\s+/g, '-')}-results`}
              sportName={selectedSport}
              teamNames={teamNameMap}
            />
          </div>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg">
            Team rankings and standings across all sports competitions
          </p>
        </div>
      </motion.div>

      <Tabs value={selectedSport} onValueChange={(value) => setSelectedSport(value as SportName)}>
        {/* Premium Sport Tabs */}
        <motion.div variants={contentVariants}>
          <TabsList className="inline-flex h-auto flex-wrap gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 sm:p-2 w-full justify-start rounded-xl overflow-x-auto">
            {sports.map(sport => {
              const sportAccent = (sportAccents[sport] || sportAccents['Football'])!;
              const isActive = selectedSport === sport;
              
              return (
                <TabsTrigger 
                  key={sport} 
                  value={sport} 
                  className={`
                    flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg whitespace-nowrap
                    transition-all duration-300
                    hover:bg-white/10
                    text-xs sm:text-sm
                    ${isActive ? `${sportAccent.bg} border-2 ${sportAccent.border} ${sportAccent.color}` : ''}
                  `}
                >
                  <SportIcon sport={sport} className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span className="font-semibold">{sport}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </motion.div>


        {sports.filter(sport => sport === selectedSport).map(sport => (
          <TabsContent key={sport} value={sport} className="mt-4 sm:mt-6">
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
                  
                  <CardHeader className="pb-4 sm:pb-6 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${accent.bg} border-2 ${accent.border}`}>
                        <SportIcon sport={sport} className={`h-5 sm:h-6 lg:h-7 w-5 sm:w-6 lg:w-7 ${accent.color}`} />
                      </div>
                      <div>
                        <CardTitle className={`font-headline text-xl sm:text-2xl lg:text-3xl font-black ${accent.color}`}>
                          {sport} Standings
                        </CardTitle>
                        <p className="text-white/50 text-xs sm:text-sm mt-1">Current season rankings</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {currentLeaderboard.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-white/40">
                        <Trophy className="h-16 sm:h-20 w-16 sm:w-20 mb-3 sm:mb-4 opacity-10" />
                        <p className="text-base sm:text-lg font-semibold">No completed matches yet</p>
                        <p className="text-xs sm:text-sm">Leaderboard will appear once matches are completed</p>
                      </div>
                    ) : (
                      <div className="responsive-table rounded-xl border border-white/10">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10 bg-white/5">
                              <TableHead className="font-bold text-white/90 text-xs sm:text-sm">Rank</TableHead>
                              <TableHead className="font-bold text-white/90 text-xs sm:text-sm">Team</TableHead>
                              <TableHead className="text-center font-bold text-white/90 text-xs sm:text-sm">P</TableHead>
                              <TableHead className="text-center font-bold text-white/90 text-xs sm:text-sm">W</TableHead>
                              <TableHead className="text-center font-bold text-white/90 text-xs sm:text-sm">L</TableHead>
                              <TableHead className="text-center font-bold text-white/90 text-xs sm:text-sm">D</TableHead>
                              <TableHead className="text-center font-bold text-white/90 text-xs sm:text-sm">PTS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentLeaderboard.map((item, index) => (
                              <motion.tr
                                key={item.teamId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.1, delay: Math.min(index * 0.02, 0.1) }}
                                className={`
                                  border-white/10 hover:bg-white/5 transition-all
                                  ${item.rank === 1 ? 'bg-yellow-500/10 hover:bg-yellow-500/15' : 
                                    item.rank === 2 ? 'bg-gray-400/5 hover:bg-gray-400/10' : 
                                    item.rank === 3 ? 'bg-amber-600/5 hover:bg-amber-600/10' : ''}
                                `}
                              >
                                <TableCell className="font-medium text-xs sm:text-sm">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    {getRankIcon(item.rank)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="font-bold text-white/95">{item.teamName}</span>
                                    {item.rank <= 3 && (
                                      <Badge variant={getRankBadge(item.rank)} className="ml-1 sm:ml-2 text-xs">
                                        {item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : '🥉'}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-white/70 font-medium text-xs sm:text-sm">
                                  {item.played}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="inline-flex items-center justify-center min-w-[1.5rem] sm:min-w-[2rem] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-green-500/10 border border-green-500/20">
                                    <span className="font-bold text-green-400 text-xs sm:text-sm">{item.won}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="inline-flex items-center justify-center min-w-[1.5rem] sm:min-w-[2rem] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-red-500/10 border border-red-500/20">
                                    <span className="font-bold text-red-400 text-xs sm:text-sm">{item.lost}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-white/50 font-medium text-xs sm:text-sm">
                                  {item.drawn}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant={item.rank === 1 ? "default" : "outline"} 
                                    className={`font-black text-sm sm:text-base ${item.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'border-white/20 text-white/90'}`}
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

                {/* Tournament Bracket */}
                <Card className="glass-strong border-white/10 mt-6 overflow-hidden">
                  <div className="h-[2px] bg-gradient-to-r from-white/10 via-white/20 to-white/10" />
                  <CardHeader className="p-4 sm:p-6 pb-3">
                    <CardTitle className="font-headline text-lg sm:text-xl font-bold text-white/90 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-white/40" />
                      Match Bracket
                    </CardTitle>
                    <p className="text-xs text-white/40">All {sport} matches visualized as a bracket</p>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <TournamentBracket matches={matches} teamsById={teamsById} sport={sport} />
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
