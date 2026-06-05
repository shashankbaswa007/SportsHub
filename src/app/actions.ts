
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
       const firebaseServices = initializeFirebase();
       if (firebaseServices) {
           const { firestore } = firebaseServices;
           const matchesRef = collection(firestore, 'matches');
           
           // We fetch all completed matches involving either team A or team B
           const q = query(
             matchesRef, 
             and(
               where('status', '==', 'COMPLETED'),
               or(
                  where('teamAId', 'in', [parsedInput.data.teamAId, parsedInput.data.teamBId]),
                  where('teamBId', 'in', [parsedInput.data.teamAId, parsedInput.data.teamBId])
               )
             )
           );

           const snapshot = await getDocs(q);
           const pastMatches: Match[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));

           if (pastMatches.length > 0) {
              const formattedMatches = pastMatches.map(m => {
                 return `- ${m.sport} Match: ${m.teamAScore} to ${m.teamBScore} (Date: ${new Date(m.startTime).toLocaleDateString()})`;
              }).join('\n');
              
              historicalContext = `Recent past completed matches involving these teams:\n${formattedMatches}`;
           }
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
