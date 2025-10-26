'use server'

import { createMatch, getOrCreateTeam } from '@/lib/data-client';
import type { SportName, MatchStatus } from '@/lib/types';
import { Firestore } from 'firebase/firestore';

export async function createMatchWithTeams(
    db: Firestore,
    data: {
        sport: SportName;
        teamAName: string;
        teamBName: string;
        status: MatchStatus;
        startTime: string;
        venue: string;
    }
) {
    try {
        // Create or get teams first
        const [teamAResult, teamBResult] = await Promise.all([
            getOrCreateTeam(db, data.teamAName, data.sport),
            getOrCreateTeam(db, data.teamBName, data.sport)
        ]);

        if (!teamAResult.success || !teamAResult.teamId) {
            return { 
                success: false, 
                error: `Error creating team A: ${teamAResult.error}` 
            };
        }
        if (!teamBResult.success || !teamBResult.teamId) {
            return { 
                success: false, 
                error: `Error creating team B: ${teamBResult.error}` 
            };
        }

        // Create the match with the team IDs
        const matchResult = await createMatch(db, {
            sport: data.sport,
            teamAId: teamAResult.teamId,
            teamBId: teamBResult.teamId,
            status: data.status,
            startTime: data.startTime,
            venue: data.venue,
            details: `${data.teamAName} vs ${data.teamBName}`
        });

        return matchResult;

    } catch (error: any) {
        console.error("Error in createMatchWithTeams:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred while creating the match."
        };
    }
}