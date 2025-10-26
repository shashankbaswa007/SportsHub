
"use server";

import { getMatchPrediction, MatchPredictionInput, MatchPredictionOutput } from "@/ai/flows/match-prediction-tool";
import { z } from "zod";


const ActionInputSchema = z.object({
  teamA: z.string(),
  teamB: z.string(),
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
    const prediction = await getMatchPrediction(parsedInput.data);
    return { success: true, data: prediction };
  } catch (error) {
    console.error("Prediction failed:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get prediction from AI." };
  }
}
