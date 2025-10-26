
"use client";

import type { SportName, Team, Player, Match, PointsTableItem, SetScore, CricketScore, MatchStatus } from './types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  documentId,
  addDoc,
  type Firestore,
} from 'firebase/firestore';


export const sports: SportName[] = [
  'Football',
  'Basketball',
  'Volleyball',
  'Cricket',
  'Throwball',
  'Badminton (Singles)',
  'Badminton (Doubles)',
  'Table Tennis (Singles)',
  'Table Tennis (Doubles)',
  'Kabaddi',
];

export const getStatFieldsForSport = (sport: SportName): Record<string, number> => {
    switch (sport) {
        case 'Football': return { 'Goals': 0, 'Assists': 0, 'Yellow Cards': 0, 'Red Cards': 0 };
        case 'Basketball': return { 'Points': 0, 'Rebounds': 0, 'Assists': 0 };
        case 'Cricket': return { 'Runs': 0, 'Fours': 0, 'Sixes': 0, 'Wickets': 0, 'Overs Bowled': 0, 'Balls Bowled': 0 };
        case 'Volleyball': return { 'Points': 0, 'Aces': 0, 'Blocks': 0 };
        case 'Throwball': return { 'Points': 0, 'Catches': 0 };
        case 'Badminton (Singles)':
        case 'Badminton (Doubles)':
            return { 'Points': 0, 'Smashes': 0 };
        case 'Table Tennis (Singles)':
        case 'Table Tennis (Doubles)':
            return { 'Points': 0, 'Aces': 0 };
        case 'Kabaddi': return { 'Raid Points': 0, 'Tackle Points': 0, 'Total Points': 0 };
        default: return {};
    }
}

export const getDefaultScoreDetails = (sport: SportName) => {
    switch (sport) {
        case 'Football':
        case 'Basketball':
        case 'Kabaddi':
            return {}; 
        case 'Cricket':
            return { runs: 0, wickets: 0, overs: 0 };
        case 'Volleyball':
        case 'Throwball':
             return Array.from({ length: 3 }, (_, i) => ({ set: i + 1, teamAScore: 0, teamBScore: 0 }));
        case 'Badminton (Singles)':
        case 'Badminton (Doubles)':
            return Array.from({ length: 3 }, (_, i) => ({ set: i + 1, teamAScore: 0, teamBScore: 0 }));
        case 'Table Tennis (Singles)':
        case 'Table Tennis (Doubles)':
             return Array.from({ length: 5 }, (_, i) => ({ set: i + 1, teamAScore: 0, teamBScore: 0 }));
        default:
            return {};
    }
};

export const getTeamById = async (db: Firestore, id: string): Promise<Team | undefined> => {
  if (!id) return undefined;
  const docRef = doc(db, 'teams', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Team;
  }
  return undefined;
};

export const getPlayersByTeam = async (db: Firestore, teamId: string): Promise<Player[]> => {
  const q = query(collection(db, 'players'), where('teamId', '==', teamId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
};

const getScoreStat = (sport: SportName) => {
    switch (sport) {
        case 'Football': return 'Goals';
        case 'Basketball': return 'Points';
        case 'Kabaddi': return 'Total Points';
        default: return null;
    }
}

export const recalculateMatchScores = async (db: Firestore, matchId: string): Promise<void> => {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) return;

    const match = { id: matchSnap.id, ...matchSnap.data() } as Match;
    
    if (!match.teamAId || !match.teamBId) return;

    const teamAPlayers = await getPlayersByTeam(db, match.teamAId);
    const teamBPlayers = await getPlayersByTeam(db, match.teamBId);

    let newTeamAScore = 0;
    let newTeamBScore = 0;
    let newScoreDetails = match.scoreDetails;

    if (['Football', 'Basketball', 'Kabaddi'].includes(match.sport)) {
        const calculateTeamScore = async (players: Player[]) => {
            let teamTotal = 0;

            if (match.sport === 'Kabaddi') {
                const batch = writeBatch(db);
                for (const player of players) {
                    const raidPoints = Number(player.stats['Raid Points'] || 0);
                    const tacklePoints = Number(player.stats['Tackle Points'] || 0);
                    const totalPlayerPoints = raidPoints + tacklePoints;
                    teamTotal += totalPlayerPoints;
                    
                    if (player.stats['Total Points'] !== totalPlayerPoints) {
                        const playerRef = doc(db, 'players', player.id);
                        batch.update(playerRef, { 'stats.Total Points': totalPlayerPoints });
                    }
                }
                await batch.commit();
            } else {
                 const scoreStat = getScoreStat(match.sport);
                 if (!scoreStat) return 0;
                 teamTotal = players.reduce((sum, p) => sum + (Number(p.stats[scoreStat] || 0)), 0);
            }
            return teamTotal;
        };
        
        newTeamAScore = await calculateTeamScore(teamAPlayers);
        newTeamBScore = await calculateTeamScore(teamBPlayers);

    } else if (match.sport === 'Cricket') {
        const teamARuns = teamAPlayers.reduce((sum, p) => sum + Number(p.stats['Runs'] || 0), 0);
        const teamAWickets = teamBPlayers.reduce((sum, p) => sum + Number(p.stats['Wickets'] || 0), 0);
        const teamABalls = teamBPlayers.reduce((sum, p) => sum + Number(p.stats['Balls Bowled'] || 0), 0);
        const teamAOvers = Math.floor(teamABalls / 6) + (teamABalls % 6) / 10;
        
        newScoreDetails = { runs: teamARuns, wickets: teamAWickets, overs: teamAOvers };
        newTeamAScore = teamARuns; 
    } else if (Array.isArray(match.scoreDetails)) { // Set-based sports
        let teamASetsWon = 0;
        let teamBSetsWon = 0;
        
        (match.scoreDetails as SetScore[]).forEach(set => {
            const teamAScoreNum = Number(set.teamAScore);
            const teamBScoreNum = Number(set.teamBScore);
            
            if (teamAScoreNum > teamBScoreNum) teamASetsWon++;
            else if (teamBScoreNum > teamAScoreNum) teamBSetsWon++;
        });

        newTeamAScore = teamASetsWon;
        newTeamBScore = teamBSetsWon;
    }

    await updateDoc(doc(db, "matches", matchId), {
        teamAScore: newTeamAScore,
        teamBScore: newTeamBScore,
        scoreDetails: newScoreDetails,
    });
};

export const calculatePointsTable = async (db: Firestore, sport: SportName): Promise<PointsTableItem[]> => {
    const matchesQuery = query(collection(db, 'matches'), where('sport', '==', sport), where('status', '==', 'COMPLETED'));
    const sportMatchesSnap = await getDocs(matchesQuery);
    const sportMatches = sportMatchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));

    if (sportMatches.length === 0) return [];

    const teamIds = [
      ...new Set(sportMatches.flatMap(m => [m.teamAId, m.teamBId]))
    ].filter(id => id);
    
    if (teamIds.length === 0) return [];

    const teamsQuery = query(collection(db, 'teams'), where(documentId(), 'in', teamIds));
    const sportTeamsSnap = await getDocs(teamsQuery);
    const sportTeams = sportTeamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

    const table: { [key: string]: PointsTableItem } = {};

    sportTeams.forEach(team => {
        table[team.id] = {
            teamId: team.id,
            teamName: team.name,
            played: 0,
            won: 0,
            lost: 0,
            drawn: 0,
            points: 0,
            rank: 0,
        }
    });

    sportMatches.forEach(match => {
        const teamA = match.teamAId ? table[match.teamAId] : undefined;
        const teamB = match.teamBId ? table[match.teamBId] : undefined;

        if (teamA && teamB) {
            teamA.played++;
            teamB.played++;

            const isDraw = match.teamAScore === match.teamBScore;
            const teamAWon = match.teamAScore > match.teamBScore;

            if (isDraw) {
                teamA.drawn++;
                teamA.points += 1;
                teamB.drawn++;
                teamB.points += 1;
            } else if (teamAWon) {
                teamA.won++;
                teamA.points += 2;
                teamB.lost++;
            } else {
                teamB.won++;
                teamB.lost++;
                teamA.points += 0;
            }
        }
    });

    const sortedTable = Object.values(table).sort((a, b) => b.points - a.points || (b.won - a.won));
    
    return sortedTable.map((item, index) => ({
        ...item,
        rank: index + 1
    }));
};

export const updatePlayerName = async (db: Firestore, playerId: string, newName: string) => {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, { name: newName });
};

export const updatePlayerStats = async (db: Firestore, playerId: string, newStats: Record<string, number>) => {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, { stats: newStats });
};

export const deletePlayer = async (db: Firestore, playerId: string) => {
    await deleteDoc(doc(db, 'players', playerId));
};

export const deleteTeam = async (db: Firestore, teamId: string) => {
    const batch = writeBatch(db);
    
    const teamRef = doc(db, 'teams', teamId);
    batch.delete(teamRef);

    const playersQuery = query(collection(db, 'players'), where('teamId', '==', teamId));
    const playersSnap = await getDocs(playersQuery);
    if (!playersSnap.empty) {
        playersSnap.forEach(doc => batch.delete(doc.ref));
    }

    const matchesQueryA = query(collection(db, 'matches'), where('teamAId', '==', teamId));
    const matchesSnapA = await getDocs(matchesQueryA);
    if (!matchesSnapA.empty) {
        matchesSnapA.forEach(doc => batch.delete(doc.ref));
    }

    const matchesQueryB = query(collection(db, 'matches'), where('teamBId', '==', teamId));
    const matchesSnapB = await getDocs(matchesQueryB);
     if (!matchesSnapB.empty) {
        matchesSnapB.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();
};

export const updateMatch = async (db: Firestore, matchId: string, updates: Partial<Omit<Match, 'id'>>) => {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, updates);
}

export const updateSetScore = async (db: Firestore, matchId: string, setNumber: number, teamAScore: number, teamBScore: number) => {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return;

    const matchData = matchSnap.data() as Match;
    const scoreDetails = matchData.scoreDetails as SetScore[];
    const setIndex = scoreDetails.findIndex(s => s.set === setNumber);

    if (setIndex > -1) {
        scoreDetails[setIndex] = { set: setNumber, teamAScore, teamBScore };
        await updateDoc(matchRef, { scoreDetails });
    }
}

export const deleteMatch = async (db: Firestore, matchId: string) => {
    await deleteDoc(doc(db, 'matches', matchId));
}

export const addPlayerToTeam = async (db: Firestore, teamId: string, playerName: string, sport: SportName): Promise<Player> => {
    const newPlayer = {
        name: playerName,
        teamId: teamId,
        sport: sport,
        stats: getStatFieldsForSport(sport),
    };
    const docRef = await addDoc(collection(db, 'players'), newPlayer);
    return { id: docRef.id, ...newPlayer } as Player;
};


export const getOrCreateTeam = async (db: Firestore, name: string, sport: SportName): Promise<{ success: boolean; teamId?: string; error?: string }> => {
    if (!name.trim()) return { success: false, error: "Team name cannot be empty." };
    
    try {
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('name', '==', name), where('sport', '==', sport));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const firstDoc = querySnapshot.docs[0];
            if (firstDoc) {
                const teamId = firstDoc.id;
                return { success: true, teamId };
            } else {
                // Defensive fallback — should not happen because querySnapshot.empty is false,
                // but satisfies TypeScript's possible 'undefined' check.
                return { success: false, error: "Unexpected error: no team document found." };
            }
        } else {
            const newTeamData = { name, sport, logoUrl: '' };
            const docRef = await addDoc(teamsRef, newTeamData);
            return { success: true, teamId: docRef.id };
        }
    } catch (error: any) {
        console.error("Error in getOrCreateTeam (client):", error);
        return { success: false, error: `Firestore operation failed: ${error.message}` };
    }
};

export const createMatch = async (db: Firestore, data: {
    teamAId: string;
    teamBId: string;
    sport: SportName;
    status: MatchStatus;
    startTime: string;
    venue: string;
    details?: string;
}): Promise<{ success: boolean; matchId?: string; error?: string }> => {
    try {
        // Validate the existence of both teams
        const [teamADoc, teamBDoc] = await Promise.all([
            getDoc(doc(db, 'teams', data.teamAId)),
            getDoc(doc(db, 'teams', data.teamBId))
        ]);

        if (!teamADoc.exists()) {
            return { success: false, error: "Team A does not exist" };
        }
        if (!teamBDoc.exists()) {
            return { success: false, error: "Team B does not exist" };
        }

        const teamA = teamADoc.data();
        const teamB = teamBDoc.data();

        // Create the match document with initialized scores
        const newMatchData = {
            ...data,
            details: data.details || `${teamA?.name || 'Team A'} vs ${teamB?.name || 'Team B'}`,
            teamAScore: 0,
            teamBScore: 0,
            scoreDetails: getDefaultScoreDetails(data.sport),
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            teamAName: teamA?.name,
            teamBName: teamB?.name,
        };

        // Create the match document
        const matchRef = await addDoc(collection(db, 'matches'), newMatchData);
        
        return { success: true, matchId: matchRef.id };
    } catch (error: any) {
        console.error("Error in createMatch (client): ", error);
        return { 
            success: false, 
            error: error.message || "An error occurred while creating the match." 
        };
    }
};

    