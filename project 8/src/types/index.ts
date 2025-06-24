export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'live' | 'upcoming' | 'completed';
  date: string;
  time: string;
  venue?: string;
  league: string;
  homeStats?: TeamMatchStats;
  awayStats?: TeamMatchStats;
}

export interface TeamMatchStats {
  // Football specific
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  
  // Table Tennis specific
  aces?: number;
  winners?: number;
  unforced_errors?: number;
  break_points?: number;
  
  // Basketball specific
  field_goals?: number;
  field_goal_attempts?: number;
  three_pointers?: number;
  three_point_attempts?: number;
  free_throws?: number;
  free_throw_attempts?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  
  // Volleyball specific
  kills?: number;
  attacks?: number;
  attack_errors?: number;
  serves?: number;
  service_errors?: number;
  digs?: number;
  blocks_volleyball?: number;
  
  // Throwball specific
  catches?: number;
  throws?: number;
  successful_throws?: number;
  interceptions?: number;
  
  // Badminton specific
  smashes?: number;
  clears?: number;
  drops?: number;
  net_shots?: number;
  
  // Kabaddi specific
  raid_points?: number;
  tackle_points?: number;
  bonus_points?: number;
  all_outs?: number;
}

export interface TeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn?: number;
  lost: number;
  goalsFor?: number;
  goalsAgainst?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  points: number;
}

export interface PlayerPerformance {
  name: string;
  position?: string;
  goals?: number;
  assists?: number;
  rating: number;
  
  // Table Tennis specific
  points_won?: number;
  aces?: number;
  winners?: number;
  
  // Basketball specific
  points?: number;
  rebounds?: number;
  assists_basketball?: number;
  steals?: number;
  blocks?: number;
  
  // Volleyball specific
  kills?: number;
  digs?: number;
  blocks_volleyball?: number;
  
  // Throwball specific
  catches?: number;
  successful_throws?: number;
  
  // Badminton specific
  smashes?: number;
  
  // Kabaddi specific
  raid_points?: number;
  tackle_points?: number;
}

export interface User {
  username: string;
  password: string;
  notifications: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export type Sport = 'football' | 'tabletennis' | 'basketball' | 'volleyball' | 'throwball' | 'badminton' | 'kabaddi';