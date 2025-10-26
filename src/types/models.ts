import { Timestamp } from 'firebase/firestore';

export type SportName = 
  | 'Football'
  | 'Basketball'
  | 'Cricket'
  | 'Volleyball'
  | 'Throwball'
  | 'Badminton (Singles)'
  | 'Badminton (Doubles)'
  | 'Table Tennis (Singles)'
  | 'Table Tennis (Doubles)'
  | 'Kabaddi';

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface Match {
  id: string;
  sport: SportName;
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  status: MatchStatus;
  venue?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  winnerId?: string;
  prediction?: {
    predictedWinner: string;
    confidence: number;
    factors: string[];
  };
}

export interface Team {
  id: string;
  name: string;
  sport: SportName;
  players: Player[];
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface Player {
  id: string;
  name: string;
  rollNumber: string;
  teamIds: string[];
  stats?: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    [key: string]: number | undefined; // For sport-specific stats
  };
}

export interface User {
  id: string;
  rollNumber: string;
  isAdmin: boolean;
  playerProfile?: Player;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    favoriteTeams: string[];
  };
}

export interface Analytic {
  id: string;
  type: 'match' | 'user' | 'team';
  timestamp: Timestamp;
  data: Record<string, any>;
}