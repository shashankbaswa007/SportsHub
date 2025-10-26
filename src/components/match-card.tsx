
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Match, Team, SportName, CricketScore, SetScore } from '@/lib/types';
import { SportIcon } from './sport-icon';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


interface MatchCardProps {
  match: Match;
}

const getStatusVariant = (status: Match['status']) => {
  switch (status) {
    case 'LIVE':
      return 'destructive';
    case 'UPCOMING':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
  }
};

const sportColors: Record<SportName, string> = {
    'Football': 'border-green-500/50 hover:border-green-500/80',
    'Basketball': 'border-orange-500/50 hover:border-orange-500/80',
    'Volleyball': 'border-yellow-500/50 hover:border-yellow-500/80',
    'Cricket': 'border-blue-500/50 hover:border-blue-500/80',
    'Throwball': 'border-purple-500/50 hover:border-purple-500/80',
    'Badminton (Singles)': 'border-red-500/50 hover:border-red-500/80',
    'Badminton (Doubles)': 'border-red-500/50 hover:border-red-500/80',
    'Table Tennis (Singles)': 'border-pink-500/50 hover:border-pink-500/80',
    'Table Tennis (Doubles)': 'border-pink-500/50 hover:border-pink-500/80',
    'Kabaddi': 'border-amber-500/50 hover:border-amber-500/80',
};

const ScoreDisplay = ({ match }: { match: Match }) => {
    if (match.status === 'UPCOMING') {
        return (
            <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-2xl font-bold">vs</span>
                <span className="text-xs text-muted-foreground mt-1">
                    {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        );
    }
    
    if (match.sport === 'Cricket' && match.scoreDetails) {
        const score = match.scoreDetails as CricketScore;
        return (
             <div className="flex flex-col items-center">
                <div className="font-headline text-2xl font-bold">{score.runs}/{score.wickets}</div>
                <div className="text-xs text-muted-foreground">({score.overs} Overs)</div>
            </div>
        )
    }

    // Default for Football, Basketball, Kabaddi and Set-based sports (showing sets won)
    return (
        <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-2">
                <span className="font-headline text-4xl font-bold">{match.teamAScore}</span>
                <span className="text-muted-foreground">-</span>
                <span className="font-headline text-4xl font-bold">{match.teamBScore}</span>
            </div>
            {Array.isArray(match.scoreDetails) && <span className="text-xs text-muted-foreground mt-1">Sets</span>}
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
        unsubA = onSnapshot(doc(firestore, "teams", match.teamAId), (doc) => {
            if (doc.exists()) {
                setTeamA({ id: doc.id, ...doc.data() } as Team);
            }
        });
    }

    if (match.teamBId) {
        unsubB = onSnapshot(doc(firestore, "teams", match.teamBId), (doc) => {
            if (doc.exists()) {
                setTeamB({ id: doc.id, ...doc.data() } as Team);
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


  const sportColorClass = sportColors[match.sport] || 'hover:border-primary/50';
  const isSetBased = Array.isArray(match.scoreDetails);

  const getButtonText = () => {
    if (match.status === 'UPCOMING') return 'View Match';
    return 'Manage Stats & Details';
  }

  if (loading) {
      return (
          <Card className="flex flex-col overflow-hidden transition-all h-full bg-card/70 backdrop-blur-sm border-2 min-h-[250px] justify-between">
              <CardHeader className="flex-row items-center space-y-0 p-4 border-b">
                  <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="ml-auto h-5 w-16 bg-muted rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent className="flex-grow p-6 flex flex-col justify-center items-center">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
              <div className="bg-muted/50 p-3 mt-auto">
                 <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
              </div>
          </Card>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
        <Card className={`flex flex-col overflow-hidden transition-all h-full bg-card/70 backdrop-blur-sm border-2 ${sportColorClass}`}>
          <CardHeader className="flex-row items-center space-y-0 p-4 border-b">
            <div className="flex items-center gap-2">
                <SportIcon sport={match.sport} className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-base">{match.sport}</h3>
            </div>
            <Badge variant={getStatusVariant(match.status)} className="ml-auto">
              {match.status}
            </Badge>
          </CardHeader>
          <CardContent className="flex-grow p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center justify-center gap-2 text-center w-2/5 h-20">
                <span className="font-headline text-2xl font-black text-center leading-tight">{teamA?.name || 'Team A'}</span>
              </div>
              
              <ScoreDisplay match={match} />
              
              <div className="flex flex-col items-center justify-center gap-2 text-center w-2/5 h-20">
                <span className="font-headline text-2xl font-black text-center leading-tight">{teamB?.name || 'Team B'}</span>
              </div>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground gap-2 mt-4">
                <MapPin className="h-4 w-4" />
                <span>{match.venue}</span>
            </div>
          </CardContent>

          {isSetBased && match.status !== 'UPCOMING' && (
             <Accordion type="single" collapsible className="w-full bg-muted/20">
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="text-xs font-semibold hover:no-underline justify-center py-2">
                        Set Details
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <div className="space-y-2 text-sm">
                            {(match.scoreDetails as SetScore[]).map(set => (
                                <div key={set.set} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Set {set.set}</span>
                                    <span className={`font-mono font-bold ${set.teamAScore > set.teamBScore ? 'text-primary' : ''}`}>{set.teamAScore}</span>
                                    <span>-</span>
                                     <span className={`font-mono font-bold ${set.teamBScore > set.teamAScore ? 'text-primary' : ''}`}>{set.teamBScore}</span>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          )}

          <div className="bg-muted/50 p-3 mt-auto">
            <Button asChild variant="link" size="sm" className="w-full text-foreground/80 hover:text-primary">
              <Link href={`/match/${match.id}`}>
                {getButtonText()} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
    </motion.div>
  );
}
