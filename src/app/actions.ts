
"use server";

import { getMatchPrediction } from "@/ai/flows/match-prediction-tool";
import type { MatchPredictionInput, MatchPredictionOutput } from "@/ai/flows/match-prediction-tool";
import { z } from "zod";
import { initializeFirebase } from "@/firebase";
import { collection, query, where, getDocs, or, and } from "firebase/firestore";
import type { Match } from "@/lib/types";


const ActionInputSchema = z.object({
  teamA: z.string(),
  teamAId: z.string().optional(),
  teamB: z.string(),
  teamBId: z.string().optional(),
  sport: z.string(),
  matchStatus: z.enum(['LIVE', 'UPCOMING', 'COMPLETED']),
  teamAScore: z.number().optional(),
  teamBScore: z.number().optional(),
  matchDetails: z.string().optional(),
});

export async function predictMatchWinner(input: MatchPredictionInput): Promise<{
  success: boolean;
  data?: MatchPredictionOutput;
  error?: string;
}> {
  const parsedInput = ActionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    let historicalContext = "";

    // Retrieval Step: Fetch past completed matches for these teams
    if (parsedInput.data.teamAId && parsedInput.data.teamBId) {
       // Initialize Firebase directly on the server to avoid "use client" errors
       const { initializeApp, getApps, getApp } = await import("firebase/app");
       const { getFirestore } = await import("firebase/firestore");
       const { firebaseConfig } = await import("@/firebase/config");
       
       const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
       const firestore = getFirestore(app);
       
       const matchesRef = collection(firestore, 'matches');
       
       // Fetch matches where Team A or Team B is the primary team
           const qA = query(matchesRef, 
              where('status', '==', 'COMPLETED'),
              where('teamAId', 'in', [parsedInput.data.teamAId, parsedInput.data.teamBId])
           );
           
           // Fetch matches where Team A or Team B is the secondary team
           const qB = query(matchesRef, 
              where('status', '==', 'COMPLETED'),
              where('teamBId', 'in', [parsedInput.data.teamAId, parsedInput.data.teamBId])
           );

           const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);
           
           const pastMatchesMap = new Map<string, Match>();
           snapA.docs.forEach(doc => pastMatchesMap.set(doc.id, { id: doc.id, ...doc.data() } as Match));
           snapB.docs.forEach(doc => pastMatchesMap.set(doc.id, { id: doc.id, ...doc.data() } as Match));
           
           const pastMatches = Array.from(pastMatchesMap.values());

           if (pastMatches.length > 0) {
              const formattedMatches = pastMatches.map(m => {
                 let scoreA = m.teamAScore;
                 let scoreB = m.teamBScore;
                 
                 // Handle Cricket dual-innings
                 if (m.sport === 'Cricket' && m.scoreDetails && typeof (m.scoreDetails as any).teamA?.runs === 'number') {
                     scoreA = (m.scoreDetails as any).teamA.runs;
                     scoreB = (m.scoreDetails as any).teamB.runs;
                 }
                 
                 return `- ${m.sport} Match: ${scoreA} to ${scoreB} (Date: ${new Date(m.startTime).toLocaleDateString()})`;
              }).join('\n');
              
              historicalContext = `Recent past completed matches involving these teams:\n${formattedMatches}`;
           }
    }

    // Augmentation Step: Pass the context into the Genkit flow
    const prediction = await getMatchPrediction({
        ...parsedInput.data,
        historicalContext: historicalContext || undefined
    });
    
    return { success: true, data: prediction };
  } catch (error) {
    console.error("Prediction failed:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get prediction from AI." };
  }
}
