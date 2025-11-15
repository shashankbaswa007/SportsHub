
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';
import type { Match, Team } from '@/lib/types';
import { predictMatchWinner } from '@/app/actions';
import type { MatchPredictionOutput } from '@/ai/flows/match-prediction-tool';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchPredictionProps {
  match: Match;
  teamA: Team;
  teamB: Team;
}

export function MatchPrediction({ match, teamA, teamB }: MatchPredictionProps) {
  const [prediction, setPrediction] = useState<MatchPredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await predictMatchWinner({
        teamA: teamA.name,
        teamB: teamB.name,
        sport: match.sport,
        matchStatus: match.status,
        teamAScore: match.teamAScore,
        teamBScore: match.teamBScore,
        matchDetails: match.details,
      });

      if (result.success && result.data) {
        setPrediction(result.data);
      } else {
        setError(result.error || "An unknown error occurred.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch prediction.");
    } finally {
      setLoading(false);
    }
  };
  
  const predictedWinnerName = prediction?.predictedWinner === 'Team A' ? teamA.name : teamB.name;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 sm:h-6 w-5 sm:w-6 text-primary"/>
            <CardTitle className="font-headline text-xl sm:text-2xl">AI Match Prediction</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">Get an AI-powered prediction for the match outcome.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        
        <AnimatePresence mode="wait">
            {!prediction && !loading && !error && (
                 <motion.div
                    key="initial"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg"
                >
                    <p className="text-xs sm:text-sm text-muted-foreground">Click the button to generate an AI prediction based on the current match data.</p>
                </motion.div>
            )}

            {loading && (
                 <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center space-y-2 p-3 sm:p-4"
                >
                    <Loader2 className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-primary" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Analyzing match data...</p>
                </motion.div>
            )}

            {error && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center space-y-2 p-3 sm:p-4 bg-destructive/10 rounded-lg text-destructive"
                >
                    <AlertCircle className="h-6 sm:h-8 w-6 sm:w-8" />
                    <p className="text-xs sm:text-sm font-medium text-center">Error fetching prediction</p>
                    <p className="text-[10px] sm:text-xs text-center">{error}</p>
                </motion.div>
            )}

            {prediction && (
                <motion.div
                    key="prediction"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-3 sm:space-y-4"
                >
                   <div className="text-center bg-primary/10 p-3 sm:p-4 rounded-lg">
                     <p className="text-xs sm:text-sm text-primary font-semibold">Predicted Winner</p>
                     <p className="text-xl sm:text-2xl font-bold font-headline text-primary">{predictedWinnerName}</p>
                     <p className="text-[10px] sm:text-xs text-primary/80">Confidence: {(prediction.confidenceLevel * 100).toFixed(0)}%</p>
                   </div>
                   <div className="space-y-2">
                        <h4 className="font-semibold text-xs sm:text-sm">AI Reasoning:</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 p-2 sm:p-3 rounded-md border">{prediction.reasoning}</p>
                   </div>
                </motion.div>
            )}
        </AnimatePresence>

      </CardContent>
      <div className="border-t bg-muted/30 p-3 sm:p-4">
         <Button onClick={getPrediction} disabled={loading} className="w-full h-9 sm:h-10 text-sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {prediction ? 'Regenerate Prediction' : 'Generate Prediction'}
        </Button>
      </div>
    </Card>
  );
}
