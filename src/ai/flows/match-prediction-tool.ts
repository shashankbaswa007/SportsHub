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
  teamB: z.string().describe('The name of team B.'),
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

export async function getMatchPrediction(input: MatchPredictionInput): Promise<MatchPredictionOutput> {
  return matchPredictionFlow(input);
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
  `,
});

const matchPredictionFlow = ai.defineFlow(
  {
    name: 'matchPredictionFlow',
    inputSchema: MatchPredictionInputSchema,
    outputSchema: MatchPredictionOutputSchema,
  },
  async input => {
    const {output} = await matchPredictionPrompt(input);
    return output!;
  }
);
