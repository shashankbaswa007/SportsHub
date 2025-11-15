
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Match, Team, SportName, CricketScore, SetScore } from '@/lib/types';
import { SportIcon } from './sport-icon';
import { ArrowRight, Loader2, MapPin, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


interface MatchCardProps {
  match: Match;
}

const getStatusConfig = (status: Match['status']) => {
  switch (status) {
    case 'LIVE':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500/10 text-red-400 border-red-500/20 backdrop-blur-sm',
        icon: true
      };
    case 'UPCOMING':
      return {
        variant: 'secondary' as const,
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20 backdrop-blur-sm',
        icon: false
      };
    case 'COMPLETED':
      return {
        variant: 'default' as const,
        className: 'bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-sm',
        icon: false
      };
  }
};

// Premium sport-specific accent colors - Enhanced prominence
const sportAccents: Record<SportName, { 
  border: string; 
  glow: string; 
  text: string;
  bg: string;
  headerBg: string;
  divider: string;
}> = {
    'Football': { 
      border: 'border-emerald-500/50', 
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      headerBg: 'bg-gradient-to-r from-emerald-500/10 to-transparent',
      divider: 'border-emerald-500/20'
    },
    'Basketball': { 
      border: 'border-orange-500/50', 
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.25)]',
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      headerBg: 'bg-gradient-to-r from-orange-500/10 to-transparent',
      divider: 'border-orange-500/20'
    },
    'Volleyball': { 
      border: 'border-yellow-500/50', 
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.25)]',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      headerBg: 'bg-gradient-to-r from-yellow-500/10 to-transparent',
      divider: 'border-yellow-500/20'
    },
    'Cricket': { 
      border: 'border-blue-500/50', 
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.25)]',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      headerBg: 'bg-gradient-to-r from-blue-500/10 to-transparent',
      divider: 'border-blue-500/20'
    },
    'Throwball': { 
      border: 'border-purple-500/50', 
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.25)]',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      headerBg: 'bg-gradient-to-r from-purple-500/10 to-transparent',
      divider: 'border-purple-500/20'
    },
    'Badminton (Singles)': { 
      border: 'border-rose-500/50', 
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      headerBg: 'bg-gradient-to-r from-rose-500/10 to-transparent',
      divider: 'border-rose-500/20'
    },
    'Badminton (Doubles)': { 
      border: 'border-rose-500/50', 
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      headerBg: 'bg-gradient-to-r from-rose-500/10 to-transparent',
      divider: 'border-rose-500/20'
    },
    'Table Tennis (Singles)': { 
      border: 'border-pink-500/50', 
      glow: 'shadow-[0_0_30px_rgba(236,72,153,0.25)]',
      text: 'text-pink-400',
      bg: 'bg-pink-500/10',
      headerBg: 'bg-gradient-to-r from-pink-500/10 to-transparent',
      divider: 'border-pink-500/20'
    },
    'Table Tennis (Doubles)': { 
      border: 'border-pink-500/50', 
      glow: 'shadow-[0_0_30px_rgba(236,72,153,0.25)]',
      text: 'text-pink-400',
      bg: 'bg-pink-500/10',
      headerBg: 'bg-gradient-to-r from-pink-500/10 to-transparent',
      divider: 'border-pink-500/20'
    },
    'Kabaddi': { 
      border: 'border-amber-500/50', 
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      headerBg: 'bg-gradient-to-r from-amber-500/10 to-transparent',
      divider: 'border-amber-500/20'
    },
};

const ScoreDisplay = ({ match }: { match: Match }) => {
    if (match.status === 'UPCOMING') {
        return (
            <div className="flex flex-col items-center gap-2">
                <span className="text-4xl font-bold text-white/20">VS</span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">
                    {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
            </div>
        );
    }
    
    if (match.sport === 'Cricket' && match.scoreDetails) {
        const score = match.scoreDetails as CricketScore;
        return (
             <div className="flex flex-col items-center gap-1">
                <div className="font-headline text-3xl font-black tabular-nums text-white/95">
                  {score.runs}/{score.wickets}
                </div>
                <div className="text-xs font-medium text-white/40 tracking-wide">
                  ({score.overs} OV)
                </div>
            </div>
        )
    }

    // Default for Football, Basketball, Kabaddi and Set-based sports (showing sets won)
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
                <span className="font-headline text-5xl font-black tabular-nums text-white/95">{match.teamAScore}</span>
                <span className="text-2xl text-white/20 font-light">:</span>
                <span className="font-headline text-5xl font-black tabular-nums text-white/95">{match.teamBScore}</span>
            </div>
            {Array.isArray(match.scoreDetails) && (
              <span className="text-xs font-medium text-white/40 tracking-wide uppercase">Sets</span>
            )}
        </div>
    );
};

export function MatchCard({ match }: MatchCardProps) {
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    let unsubA: (() => void) | undefined;
    let unsubB: (() => void) | undefined;
    
    setLoading(true);
    setTeamA(null);
    setTeamB(null);


    if (match.teamAId) {
        unsubA = onSnapshot(doc(firestore, "teams", match.teamAId), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setTeamA({ id: docSnapshot.id, ...docSnapshot.data() } as Team);
            }
        });
    }

    if (match.teamBId) {
        unsubB = onSnapshot(doc(firestore, "teams", match.teamBId), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setTeamB({ id: docSnapshot.id, ...docSnapshot.data() } as Team);
            }
        });
    }

    return () => {
        if (unsubA) unsubA();
        if (unsubB) unsubB();
    };
}, [match.id, match.teamAId, match.teamBId, firestore]);

  useEffect(() => {
    if ((!match.teamAId || teamA) && (!match.teamBId || teamB)) {
      setLoading(false);
    }
  }, [teamA, teamB, match.teamAId, match.teamBId]);


  const accent = sportAccents[match.sport] || sportAccents['Football'];
  const statusConfig = getStatusConfig(match.status);
  const isSetBased = Array.isArray(match.scoreDetails);

  const getButtonText = () => {
    if (match.status === 'UPCOMING') return 'View Details';
    return 'View Match';
  }

  if (loading) {
      return (
          <Card className="relative flex flex-col overflow-hidden h-full glass border min-h-[280px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex-row items-center space-y-0 p-6 border-b border-white/5">
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
                  <div className="ml-auto h-6 w-20 bg-white/5 rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent className="flex-grow p-8 flex flex-col justify-center items-center">
                 <Loader2 className="h-10 w-10 animate-spin text-white/20" />
              </CardContent>
              <div className="p-6 border-t border-white/5">
                 <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse"></div>
              </div>
          </Card>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="h-full group"
    >
        <Card className={`
          relative flex flex-col overflow-hidden h-full 
          glass border-2 ${accent.border}
          hover:shadow-2xl ${accent.glow}
          transition-all duration-500 ease-out
          hover:-translate-y-1
          min-h-[280px]
        `}>
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 ${accent.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
          
          {/* Top accent line - stronger */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent.headerBg.replace('bg-gradient-to-r', 'bg-gradient-to-r')} opacity-80`} />
          
          <CardHeader className={`relative flex-row items-center justify-between space-y-0 p-6 border-b ${accent.divider} ${accent.headerBg}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${accent.bg} border-2 ${accent.border}`}>
                  <SportIcon sport={match.sport} className={`h-5 w-5 ${accent.text}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm tracking-wide ${accent.text}`}>{match.sport}</h3>
                  <p className="text-xs text-white/40 mt-0.5">Match</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.className} font-medium tracking-wide px-3 py-1`}>
                {statusConfig.icon && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 pulse-dot" />
                )}
                {match.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="relative flex-grow p-8 flex flex-col justify-center">
            {/* Team matchup */}
            <div className="flex items-stretch justify-between gap-6 mb-6">
              {/* Team A */}
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-1">
                  <span className="text-xl font-bold text-white/80">
                    {teamA?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="font-headline text-lg font-bold text-white/90 leading-tight line-clamp-2">
                  {teamA?.name || 'Team A'}
                </span>
              </div>
              
              {/* Score Display */}
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                <ScoreDisplay match={match} />
              </div>
              
              {/* Team B */}
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-1">
                  <span className="text-xl font-bold text-white/80">
                    {teamB?.name?.charAt(0) || 'B'}
                  </span>
                </div>
                <span className="font-headline text-lg font-bold text-white/90 leading-tight line-clamp-2">
                  {teamB?.name || 'Team B'}
                </span>
              </div>
            </div>
            
            {/* Match info */}
            <div className="flex items-center justify-center gap-4 text-xs text-white/40 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{match.venue}</span>
                </div>
                {match.status === 'UPCOMING' && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(match.startTime).toLocaleDateString()}</span>
                  </div>
                )}
            </div>
          </CardContent>

          {isSetBased && match.status !== 'UPCOMING' && (
             <Accordion type="single" collapsible className="w-full border-t border-white/5">
                <AccordionItem value="item-1" className="border-0">
                    <AccordionTrigger className="text-xs font-medium hover:no-underline justify-center py-3 px-6 text-white/60 hover:text-white/80 transition-colors">
                        View Set Details
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                        <div className="space-y-2.5">
                            {(match.scoreDetails as SetScore[]).map(set => (
                                <div key={set.set} className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-xs font-medium text-white/50">Set {set.set}</span>
                                    <div className="flex items-center gap-3">
                                      <span className={`font-mono font-bold text-sm ${set.teamAScore > set.teamBScore ? accent.text : 'text-white/60'}`}>
                                        {set.teamAScore}
                                      </span>
                                      <span className="text-white/30">-</span>
                                      <span className={`font-mono font-bold text-sm ${set.teamBScore > set.teamAScore ? accent.text : 'text-white/60'}`}>
                                        {set.teamBScore}
                                      </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          )}

          <div className="relative p-6 border-t border-white/5">
            <Link href={`/match/${match.id}`} className="group/btn block">
              <Button 
                variant="ghost" 
                className={`
                  w-full h-11 
                  bg-white/5 hover:bg-white/10 
                  border border-white/10 hover:border-white/20
                  text-white/80 hover:text-white
                  font-medium tracking-wide
                  transition-all duration-300
                  group-hover/btn:${accent.bg}
                  group-hover/btn:border-${accent.border}
                `}
              >
                {getButtonText()}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </div>
        </Card>
    </motion.div>
  );
}
