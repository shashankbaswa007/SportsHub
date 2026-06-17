'use server';

/**
 * @fileOverview A match prediction tool that uses AI to determine the likely winner of live and upcoming matches.
 *
 * - getMatchPrediction - A function that handles the match prediction process.
 * - MatchPredictionInput - The input type for the getMatchPrediction function.
 * - MatchPredictionOutput - The return type for the getMatchPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchPredictionInputSchema = z.object({
  teamA: z.string().describe('The name of team A.'),
  teamAId: z.string().optional().describe('The ID of team A for database lookups.'),
  teamB: z.string().describe('The name of team B.'),
  teamBId: z.string().optional().describe('The ID of team B for database lookups.'),
  sport: z.string().describe('The sport the teams are playing.'),
  matchStatus: z
    .enum(['LIVE', 'UPCOMING', 'COMPLETED'])
    .describe('The status of the match.'),
  teamAScore: z.number().optional().describe('The score of team A.'),
  teamBScore: z.number().optional().describe('The score of team B.'),
  matchDetails: z
    .string()
    .optional()
    .describe('Any additional details about the match.'),
  historicalContext: z
    .string()
    .optional()
    .describe('Historical context about past matches between these teams or their overall performance, retrieved from the database.'),
});
export type MatchPredictionInput = z.infer<typeof MatchPredictionInputSchema>;

const MatchPredictionOutputSchema = z.object({
  predictedWinner: z
    .string()
    .describe('The predicted winner of the match (either Team A or Team B).'),
  confidenceLevel: z
    .number()
    .describe('A number from 0 to 1 indicating the confidence level in the prediction.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the prediction, including factors considered.'),
});
export type MatchPredictionOutput = z.infer<typeof MatchPredictionOutputSchema>;

// Simple in-memory cache to prevent redundant API calls for the same match state
// (Lasts for the lifetime of the server instance or serverless function)
const predictionCache = new Map<string, { data: MatchPredictionOutput, timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getMatchPrediction(input: MatchPredictionInput): Promise<MatchPredictionOutput> {
  const cacheKey = JSON.stringify(input);
  const cached = predictionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log("Returning cached prediction for match.");
    return cached.data;
  }

  const result = await matchPredictionFlow(input);
  
  predictionCache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  // Keep cache size manageable
  if (predictionCache.size > 100) {
    const firstKey = predictionCache.keys().next().value;
    if (firstKey) predictionCache.delete(firstKey);
  }
  
  return result;
}

const matchPredictionPrompt = ai.definePrompt({
  name: 'matchPredictionPrompt',
  input: {schema: MatchPredictionInputSchema},
  output: {schema: MatchPredictionOutputSchema},
  prompt: `You are an AI expert at predicting sports matches.

  Based on the following match information, predict the winner (either Team A or Team B).
  Also provide a confidence level (0 to 1) for your prediction, and your reasoning.

  Team A: {{{teamA}}}
  Team B: {{{teamB}}}
  Sport: {{{sport}}}
  Match Status: {{{matchStatus}}}
  {{#if teamAScore}}
  Team A Score: {{{teamAScore}}}
  {{/if}}
  {{#if teamBScore}}
  Team B Score: {{{teamBScore}}}
  {{/if}}
  {{#if matchDetails}}
  Match Details: {{{matchDetails}}}
  {{/if}}
  
  {{#if historicalContext}}
  === HISTORICAL CONTEXT ===
  The following historical data was retrieved from the database regarding these teams. Use this data heavily to inform your prediction and reasoning:
  {{{historicalContext}}}
  ==========================
  {{/if}}
  `,
});

const matchPredictionFlow = ai.defineFlow(
  {
    name: 'matchPredictionFlow',
    inputSchema: MatchPredictionInputSchema,
    outputSchema: MatchPredictionOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let delay = 1500; // Start with 1.5s delay
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await matchPredictionPrompt(input);
        return output!;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if it's definitively a bad input error, but retry on network/503/429 errors
        const isTransient = error?.message?.includes('503') || 
                            error?.message?.includes('429') || 
                            error?.message?.includes('fetch failed') ||
                            error?.message?.includes('high demand') ||
                            error?.message?.includes('temporarily');
                            
        if (attempt === maxRetries || !isTransient) {
          break; // Stop retrying if max attempts reached or error is not transient
        }
        
        console.warn(`[Genkit] Prediction failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error?.message || "Unknown error");
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff (1.5s -> 3s -> 6s)
      }
    }
    
    throw lastError;
  }
);
