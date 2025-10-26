
export type SportName =
  | 'Football'
  | 'Basketball'
  | 'Volleyball'
  | 'Cricket'
  | 'Throwball'
  | 'Badminton'
  | 'Table Tennis'
  | 'Kabaddi';

export type MatchStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED';

export type Team = {
  id: string;
  name: string;
  logoUrl: string;
  sport: SportName;
};

export type Player = {
  id: string;
  name: string;
  teamId: string;
  stats: Record<string, string | number>;
  sport: SportName;
};

export type SetScore = {
  set: number;
  teamAScore: number;
  teamBScore: number;
};

export type CricketScore = {
  runs: number;
  wickets: number;
  overs: number;
};

export type MatchScore = SetScore[] | CricketScore | object;

export type Match = {
  id: string;
  sport: SportName;
  teamAId: string;
  teamBId: string;
  teamAScore: number; // For overall score / sets won
  teamBScore: number; // For overall score / sets won
  scoreDetails: MatchScore; // Detailed score breakdown
  status: MatchStatus;
  startTime: string;
  details: string;
  venue: string;
};

export type PointsTableItem = {
    teamId: string;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    drawn: number;
    points: number;
    rank: number;
};


    