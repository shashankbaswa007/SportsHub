import { Match, PlayerPerformance } from '../types';

export const footballMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 1,
    status: 'completed',
    date: '2025-01-15',
    time: '15:30',
    venue: 'Etihad Stadium',
    league: 'Premier League',
    homeStats: {
      possession: 58,
      shots: 14,
      shotsOnTarget: 6,
      corners: 7,
      fouls: 12,
      yellowCards: 2,
      redCards: 0
    },
    awayStats: {
      possession: 42,
      shots: 11,
      shotsOnTarget: 4,
      corners: 5,
      fouls: 15,
      yellowCards: 3,
      redCards: 0
    }
  },
  {
    id: '2',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 3,
    awayScore: 1,
    status: 'completed',
    date: '2025-01-16',
    time: '17:30',
    venue: 'Emirates Stadium',
    league: 'Premier League',
    homeStats: {
      possession: 62,
      shots: 16,
      shotsOnTarget: 8,
      corners: 9,
      fouls: 8,
      yellowCards: 1,
      redCards: 0
    },
    awayStats: {
      possession: 38,
      shots: 9,
      shotsOnTarget: 3,
      corners: 3,
      fouls: 14,
      yellowCards: 2,
      redCards: 1
    }
  },
  {
    id: '3',
    homeTeam: 'Tottenham',
    awayTeam: 'Manchester United',
    homeScore: 1,
    awayScore: 3,
    status: 'completed',
    date: '2025-01-14',
    time: '14:00',
    venue: 'Tottenham Hotspur Stadium',
    league: 'Premier League',
    homeStats: {
      possession: 45,
      shots: 12,
      shotsOnTarget: 4,
      corners: 6,
      fouls: 16,
      yellowCards: 4,
      redCards: 0
    },
    awayStats: {
      possession: 55,
      shots: 15,
      shotsOnTarget: 7,
      corners: 8,
      fouls: 11,
      yellowCards: 2,
      redCards: 0
    }
  },
  {
    id: '4',
    homeTeam: 'Newcastle',
    awayTeam: 'Brighton',
    homeScore: 2,
    awayScore: 2,
    status: 'completed',
    date: '2025-01-15',
    time: '12:30',
    venue: 'St. James\' Park',
    league: 'Premier League',
    homeStats: {
      possession: 52,
      shots: 13,
      shotsOnTarget: 5,
      corners: 7,
      fouls: 13,
      yellowCards: 3,
      redCards: 0
    },
    awayStats: {
      possession: 48,
      shots: 10,
      shotsOnTarget: 6,
      corners: 4,
      fouls: 12,
      yellowCards: 2,
      redCards: 0
    }
  },
  {
    id: '5',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    status: 'upcoming',
    date: '2025-01-18',
    time: '16:00',
    venue: 'Anfield',
    league: 'Premier League'
  },
  {
    id: '6',
    homeTeam: 'Manchester United',
    awayTeam: 'Arsenal',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    date: '2025-01-17',
    time: '20:00',
    venue: 'Old Trafford',
    league: 'Premier League',
    homeStats: {
      possession: 48,
      shots: 8,
      shotsOnTarget: 3,
      corners: 4,
      fouls: 9,
      yellowCards: 1,
      redCards: 0
    },
    awayStats: {
      possession: 52,
      shots: 10,
      shotsOnTarget: 4,
      corners: 6,
      fouls: 7,
      yellowCards: 2,
      redCards: 0
    }
  }
];

export const tableTennisMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Zhang Wei',
    awayTeam: 'Ma Long',
    homeScore: 2,
    awayScore: 3,
    status: 'completed',
    date: '2025-01-15',
    time: '14:00',
    venue: 'Olympic Sports Center',
    league: 'World Championship',
    homeStats: {
      aces: 8,
      winners: 15,
      unforced_errors: 12,
      break_points: 4
    },
    awayStats: {
      aces: 12,
      winners: 18,
      unforced_errors: 8,
      break_points: 6
    }
  },
  {
    id: '2',
    homeTeam: 'Fan Zhendong',
    awayTeam: 'Xu Xin',
    homeScore: 3,
    awayScore: 1,
    status: 'completed',
    date: '2025-01-16',
    time: '16:00',
    venue: 'National Stadium',
    league: 'World Championship',
    homeStats: {
      aces: 10,
      winners: 20,
      unforced_errors: 6,
      break_points: 5
    },
    awayStats: {
      aces: 6,
      winners: 12,
      unforced_errors: 14,
      break_points: 2
    }
  },
  {
    id: '3',
    homeTeam: 'Lin Gaoyuan',
    awayTeam: 'Wang Chuqin',
    homeScore: 4,
    awayScore: 1,
    status: 'completed',
    date: '2025-01-14',
    time: '13:00',
    venue: 'Sports Complex',
    league: 'World Championship',
    homeStats: {
      aces: 14,
      winners: 22,
      unforced_errors: 5,
      break_points: 7
    },
    awayStats: {
      aces: 4,
      winners: 8,
      unforced_errors: 18,
      break_points: 1
    }
  },
  {
    id: '4',
    homeTeam: 'Ma Long',
    awayTeam: 'Fan Zhendong',
    homeScore: 2,
    awayScore: 2,
    status: 'live',
    date: '2025-01-17',
    time: '15:00',
    venue: 'Championship Arena',
    league: 'World Championship',
    homeStats: {
      aces: 6,
      winners: 12,
      unforced_errors: 8,
      break_points: 3
    },
    awayStats: {
      aces: 8,
      winners: 14,
      unforced_errors: 6,
      break_points: 4
    }
  },
  {
    id: '5',
    homeTeam: 'Xu Xin',
    awayTeam: 'Zhang Wei',
    status: 'upcoming',
    date: '2025-01-18',
    time: '14:30',
    venue: 'Olympic Sports Center',
    league: 'World Championship'
  }
];

export const basketballMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeScore: 112,
    awayScore: 108,
    status: 'completed',
    date: '2025-01-15',
    time: '19:30',
    venue: 'Crypto.com Arena',
    league: 'NBA',
    homeStats: {
      field_goals: 42,
      field_goal_attempts: 88,
      three_pointers: 12,
      three_point_attempts: 32,
      free_throws: 16,
      free_throw_attempts: 20,
      rebounds: 48,
      assists: 28,
      steals: 8,
      blocks: 6,
      turnovers: 14
    },
    awayStats: {
      field_goals: 40,
      field_goal_attempts: 85,
      three_pointers: 14,
      three_point_attempts: 38,
      free_throws: 14,
      free_throw_attempts: 18,
      rebounds: 44,
      assists: 26,
      steals: 10,
      blocks: 4,
      turnovers: 16
    }
  },
  {
    id: '2',
    homeTeam: 'Celtics',
    awayTeam: 'Heat',
    homeScore: 98,
    awayScore: 95,
    status: 'completed',
    date: '2025-01-16',
    time: '20:00',
    venue: 'TD Garden',
    league: 'NBA',
    homeStats: {
      field_goals: 38,
      field_goal_attempts: 82,
      three_pointers: 10,
      three_point_attempts: 28,
      free_throws: 12,
      free_throw_attempts: 16,
      rebounds: 42,
      assists: 24,
      steals: 6,
      blocks: 8,
      turnovers: 12
    },
    awayStats: {
      field_goals: 36,
      field_goal_attempts: 80,
      three_pointers: 11,
      three_point_attempts: 30,
      free_throws: 12,
      free_throw_attempts: 15,
      rebounds: 38,
      assists: 22,
      steals: 8,
      blocks: 5,
      turnovers: 15
    }
  },
  {
    id: '3',
    homeTeam: 'Nets',
    awayTeam: 'Knicks',
    homeScore: 105,
    awayScore: 110,
    status: 'completed',
    date: '2025-01-14',
    time: '19:00',
    venue: 'Barclays Center',
    league: 'NBA',
    homeStats: {
      field_goals: 38,
      three_pointers: 11,
      free_throws: 18,
      rebounds: 41,
      assists: 22,
      steals: 7,
      blocks: 3
    },
    awayStats: {
      field_goals: 42,
      three_pointers: 13,
      free_throws: 13,
      rebounds: 46,
      assists: 25,
      steals: 9,
      blocks: 6
    }
  },
  {
    id: '4',
    homeTeam: 'Bulls',
    awayTeam: 'Bucks',
    homeScore: 88,
    awayScore: 92,
    status: 'live',
    date: '2025-01-17',
    time: '20:30',
    venue: 'United Center',
    league: 'NBA',
    homeStats: {
      field_goals: 32,
      three_pointers: 8,
      free_throws: 16,
      rebounds: 38,
      assists: 18,
      steals: 5,
      blocks: 4
    },
    awayStats: {
      field_goals: 35,
      three_pointers: 10,
      free_throws: 12,
      rebounds: 42,
      assists: 21,
      steals: 7,
      blocks: 6
    }
  },
  {
    id: '5',
    homeTeam: 'Clippers',
    awayTeam: 'Suns',
    status: 'upcoming',
    date: '2025-01-18',
    time: '21:00',
    venue: 'Crypto.com Arena',
    league: 'NBA'
  }
];

export const volleyballMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Brazil',
    awayTeam: 'Italy',
    homeScore: 3,
    awayScore: 1,
    status: 'completed',
    date: '2025-01-15',
    time: '18:00',
    venue: 'Olympic Arena',
    league: 'World Championship',
    homeStats: {
      kills: 58,
      attacks: 142,
      attack_errors: 18,
      serves: 85,
      service_errors: 12,
      digs: 42,
      blocks_volleyball: 14
    },
    awayStats: {
      kills: 48,
      attacks: 128,
      attack_errors: 22,
      serves: 78,
      service_errors: 15,
      digs: 38,
      blocks_volleyball: 10
    }
  },
  {
    id: '2',
    homeTeam: 'USA',
    awayTeam: 'Poland',
    homeScore: 3,
    awayScore: 2,
    status: 'completed',
    date: '2025-01-16',
    time: '19:30',
    venue: 'Sports Complex',
    league: 'World Championship',
    homeStats: {
      kills: 52,
      attacks: 135,
      serves: 82,
      digs: 45,
      blocks_volleyball: 12
    },
    awayStats: {
      kills: 49,
      attacks: 130,
      serves: 79,
      digs: 41,
      blocks_volleyball: 11
    }
  },
  {
    id: '3',
    homeTeam: 'Russia',
    awayTeam: 'Serbia',
    homeScore: 2,
    awayScore: 3,
    status: 'completed',
    date: '2025-01-14',
    time: '17:00',
    venue: 'National Stadium',
    league: 'World Championship',
    homeStats: {
      kills: 44,
      attacks: 118,
      serves: 75,
      digs: 36,
      blocks_volleyball: 8
    },
    awayStats: {
      kills: 51,
      attacks: 125,
      serves: 80,
      digs: 40,
      blocks_volleyball: 13
    }
  },
  {
    id: '4',
    homeTeam: 'Japan',
    awayTeam: 'China',
    homeScore: 1,
    awayScore: 2,
    status: 'live',
    date: '2025-01-17',
    time: '16:00',
    venue: 'Tokyo Arena',
    league: 'World Championship',
    homeStats: {
      kills: 28,
      attacks: 75,
      serves: 48,
      digs: 25,
      blocks_volleyball: 6
    },
    awayStats: {
      kills: 32,
      attacks: 82,
      serves: 52,
      digs: 28,
      blocks_volleyball: 8
    }
  },
  {
    id: '5',
    homeTeam: 'France',
    awayTeam: 'Germany',
    status: 'upcoming',
    date: '2025-01-18',
    time: '18:30',
    venue: 'Paris Arena',
    league: 'World Championship'
  }
];

export const throwballMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Team Alpha',
    awayTeam: 'Team Beta',
    homeScore: 15,
    awayScore: 12,
    status: 'completed',
    date: '2025-01-15',
    time: '16:00',
    venue: 'Sports Ground A',
    league: 'National Championship',
    homeStats: {
      catches: 28,
      throws: 35,
      successful_throws: 22,
      interceptions: 8
    },
    awayStats: {
      catches: 24,
      throws: 32,
      successful_throws: 18,
      interceptions: 6
    }
  },
  {
    id: '2',
    homeTeam: 'Team Gamma',
    awayTeam: 'Team Delta',
    homeScore: 18,
    awayScore: 14,
    status: 'completed',
    date: '2025-01-16',
    time: '17:00',
    venue: 'Sports Ground B',
    league: 'National Championship',
    homeStats: {
      catches: 32,
      throws: 38,
      successful_throws: 25,
      interceptions: 9
    },
    awayStats: {
      catches: 26,
      throws: 34,
      successful_throws: 20,
      interceptions: 7
    }
  },
  {
    id: '3',
    homeTeam: 'Team Epsilon',
    awayTeam: 'Team Zeta',
    homeScore: 12,
    awayScore: 16,
    status: 'completed',
    date: '2025-01-14',
    time: '15:30',
    venue: 'Sports Ground C',
    league: 'National Championship',
    homeStats: {
      catches: 22,
      throws: 28,
      successful_throws: 16,
      interceptions: 5
    },
    awayStats: {
      catches: 28,
      throws: 33,
      successful_throws: 21,
      interceptions: 8
    }
  },
  {
    id: '4',
    homeTeam: 'Team Eta',
    awayTeam: 'Team Theta',
    homeScore: 10,
    awayScore: 8,
    status: 'live',
    date: '2025-01-17',
    time: '16:30',
    venue: 'Sports Ground A',
    league: 'National Championship',
    homeStats: {
      catches: 18,
      throws: 24,
      successful_throws: 14,
      interceptions: 6
    },
    awayStats: {
      catches: 15,
      throws: 21,
      successful_throws: 12,
      interceptions: 4
    }
  },
  {
    id: '5',
    homeTeam: 'Team Iota',
    awayTeam: 'Team Kappa',
    status: 'upcoming',
    date: '2025-01-18',
    time: '17:30',
    venue: 'Sports Ground B',
    league: 'National Championship'
  }
];

export const badmintonMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Lin Dan',
    awayTeam: 'Lee Chong Wei',
    homeScore: 2,
    awayScore: 1,
    status: 'completed',
    date: '2025-01-15',
    time: '14:30',
    venue: 'Badminton Arena',
    league: 'World Championship',
    homeStats: {
      smashes: 24,
      clears: 18,
      drops: 12,
      net_shots: 8
    },
    awayStats: {
      smashes: 20,
      clears: 22,
      drops: 10,
      net_shots: 6
    }
  },
  {
    id: '2',
    homeTeam: 'Viktor Axelsen',
    awayTeam: 'Kento Momota',
    homeScore: 2,
    awayScore: 0,
    status: 'completed',
    date: '2025-01-16',
    time: '15:00',
    venue: 'Championship Court',
    league: 'World Championship',
    homeStats: {
      smashes: 28,
      clears: 15,
      drops: 14,
      net_shots: 10
    },
    awayStats: {
      smashes: 18,
      clears: 20,
      drops: 8,
      net_shots: 5
    }
  },
  {
    id: '3',
    homeTeam: 'Chen Long',
    awayTeam: 'Anthony Ginting',
    homeScore: 1,
    awayScore: 2,
    status: 'completed',
    date: '2025-01-14',
    time: '13:30',
    venue: 'Olympic Hall',
    league: 'World Championship',
    homeStats: {
      smashes: 22,
      clears: 16,
      drops: 9,
      net_shots: 7
    },
    awayStats: {
      smashes: 26,
      clears: 19,
      drops: 11,
      net_shots: 9
    }
  },
  {
    id: '4',
    homeTeam: 'Tai Tzu-ying',
    awayTeam: 'Carolina Marin',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    date: '2025-01-17',
    time: '14:00',
    venue: 'Badminton Arena',
    league: 'World Championship',
    homeStats: {
      smashes: 16,
      clears: 12,
      drops: 8,
      net_shots: 6
    },
    awayStats: {
      smashes: 18,
      clears: 14,
      drops: 9,
      net_shots: 7
    }
  },
  {
    id: '5',
    homeTeam: 'P.V. Sindhu',
    awayTeam: 'Nozomi Okuhara',
    status: 'upcoming',
    date: '2025-01-18',
    time: '15:30',
    venue: 'Championship Court',
    league: 'World Championship'
  }
];

export const kabaddiMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Patna Pirates',
    awayTeam: 'Bengaluru Bulls',
    homeScore: 42,
    awayScore: 38,
    status: 'completed',
    date: '2025-01-15',
    time: '20:00',
    venue: 'Pro Kabaddi Arena',
    league: 'Pro Kabaddi League',
    homeStats: {
      raid_points: 28,
      tackle_points: 12,
      bonus_points: 8,
      all_outs: 2
    },
    awayStats: {
      raid_points: 24,
      tackle_points: 10,
      bonus_points: 6,
      all_outs: 1
    }
  },
  {
    id: '2',
    homeTeam: 'Jaipur Pink Panthers',
    awayTeam: 'U Mumba',
    homeScore: 35,
    awayScore: 32,
    status: 'completed',
    date: '2025-01-16',
    time: '21:00',
    venue: 'Kabaddi Stadium',
    league: 'Pro Kabaddi League',
    homeStats: {
      raid_points: 22,
      tackle_points: 10,
      bonus_points: 5,
      all_outs: 1
    },
    awayStats: {
      raid_points: 20,
      tackle_points: 8,
      bonus_points: 6,
      all_outs: 1
    }
  },
  {
    id: '3',
    homeTeam: 'Tamil Thalaivas',
    awayTeam: 'Telugu Titans',
    homeScore: 28,
    awayScore: 31,
    status: 'completed',
    date: '2025-01-14',
    time: '19:30',
    venue: 'Sports Complex',
    league: 'Pro Kabaddi League',
    homeStats: {
      raid_points: 18,
      tackle_points: 8,
      bonus_points: 4,
      all_outs: 0
    },
    awayStats: {
      raid_points: 21,
      tackle_points: 7,
      bonus_points: 5,
      all_outs: 1
    }
  },
  {
    id: '4',
    homeTeam: 'Haryana Steelers',
    awayTeam: 'UP Yoddha',
    homeScore: 25,
    awayScore: 22,
    status: 'live',
    date: '2025-01-17',
    time: '20:30',
    venue: 'Pro Kabaddi Arena',
    league: 'Pro Kabaddi League',
    homeStats: {
      raid_points: 16,
      tackle_points: 7,
      bonus_points: 4,
      all_outs: 1
    },
    awayStats: {
      raid_points: 14,
      tackle_points: 6,
      bonus_points: 3,
      all_outs: 0
    }
  },
  {
    id: '5',
    homeTeam: 'Puneri Paltan',
    awayTeam: 'Gujarat Giants',
    status: 'upcoming',
    date: '2025-01-18',
    time: '21:30',
    venue: 'Kabaddi Stadium',
    league: 'Pro Kabaddi League'
  }
];

export const footballTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'Erling Haaland', position: 'Forward', goals: 2, assists: 0, rating: 9.2 },
      { name: 'Kevin De Bruyne', position: 'Midfielder', goals: 0, assists: 1, rating: 8.5 },
      { name: 'Ruben Dias', position: 'Defender', goals: 0, assists: 0, rating: 8.0 }
    ],
    away: [
      { name: 'Mohamed Salah', position: 'Forward', goals: 1, assists: 0, rating: 8.8 },
      { name: 'Virgil van Dijk', position: 'Defender', goals: 0, assists: 0, rating: 7.5 },
      { name: 'Sadio Mane', position: 'Forward', goals: 0, assists: 1, rating: 7.2 }
    ]
  },
  '2': {
    home: [
      { name: 'Gabriel Jesus', position: 'Forward', goals: 2, assists: 0, rating: 9.0 },
      { name: 'Martin Odegaard', position: 'Midfielder', goals: 1, assists: 1, rating: 8.7 },
      { name: 'William Saliba', position: 'Defender', goals: 0, assists: 0, rating: 8.2 }
    ],
    away: [
      { name: 'Raheem Sterling', position: 'Forward', goals: 1, assists: 0, rating: 7.8 },
      { name: 'Thiago Silva', position: 'Defender', goals: 0, assists: 0, rating: 7.0 },
      { name: 'Mason Mount', position: 'Midfielder', goals: 0, assists: 0, rating: 6.5 }
    ]
  },
  '3': {
    home: [
      { name: 'Harry Kane', position: 'Forward', goals: 1, assists: 0, rating: 7.5 },
      { name: 'Son Heung-min', position: 'Forward', goals: 0, assists: 1, rating: 7.0 },
      { name: 'Pierre Hojbjerg', position: 'Midfielder', goals: 0, assists: 0, rating: 6.8 }
    ],
    away: [
      { name: 'Marcus Rashford', position: 'Forward', goals: 2, assists: 0, rating: 9.1 },
      { name: 'Bruno Fernandes', position: 'Midfielder', goals: 1, assists: 1, rating: 8.6 },
      { name: 'Casemiro', position: 'Midfielder', goals: 0, assists: 1, rating: 8.0 }
    ]
  },
  '6': {
    home: [
      { name: 'Marcus Rashford', position: 'Forward', goals: 1, assists: 0, rating: 8.5 },
      { name: 'Bruno Fernandes', position: 'Midfielder', goals: 0, assists: 1, rating: 8.2 },
      { name: 'Casemiro', position: 'Midfielder', goals: 0, assists: 0, rating: 7.8 }
    ],
    away: [
      { name: 'Gabriel Jesus', position: 'Forward', goals: 1, assists: 0, rating: 8.3 },
      { name: 'Martin Odegaard', position: 'Midfielder', goals: 0, assists: 1, rating: 8.0 },
      { name: 'William Saliba', position: 'Defender', goals: 0, assists: 0, rating: 7.7 }
    ]
  }
};

export const tableTennisTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'Zhang Wei', points_won: 45, aces: 8, winners: 15, rating: 8.2 }
    ],
    away: [
      { name: 'Ma Long', points_won: 52, aces: 12, winners: 18, rating: 9.1 }
    ]
  },
  '2': {
    home: [
      { name: 'Fan Zhendong', points_won: 58, aces: 10, winners: 20, rating: 9.3 }
    ],
    away: [
      { name: 'Xu Xin', points_won: 41, aces: 6, winners: 12, rating: 7.8 }
    ]
  },
  '3': {
    home: [
      { name: 'Lin Gaoyuan', points_won: 62, aces: 14, winners: 22, rating: 9.5 }
    ],
    away: [
      { name: 'Wang Chuqin', points_won: 38, aces: 4, winners: 8, rating: 6.9 }
    ]
  },
  '4': {
    home: [
      { name: 'Ma Long', points_won: 38, aces: 6, winners: 12, rating: 8.0 }
    ],
    away: [
      { name: 'Fan Zhendong', points_won: 42, aces: 8, winners: 14, rating: 8.4 }
    ]
  }
};

export const basketballTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'LeBron James', position: 'Forward', points: 28, rebounds: 8, assists_basketball: 12, rating: 9.2 },
      { name: 'Anthony Davis', position: 'Center', points: 24, rebounds: 14, blocks: 4, rating: 8.8 },
      { name: 'Russell Westbrook', position: 'Guard', points: 18, assists_basketball: 8, steals: 3, rating: 8.0 }
    ],
    away: [
      { name: 'Stephen Curry', position: 'Guard', points: 32, assists_basketball: 6, rating: 9.0 },
      { name: 'Klay Thompson', position: 'Guard', points: 26, rating: 8.5 },
      { name: 'Draymond Green', position: 'Forward', rebounds: 12, assists_basketball: 10, rating: 8.2 }
    ]
  },
  '2': {
    home: [
      { name: 'Jayson Tatum', position: 'Forward', points: 26, rebounds: 7, assists_basketball: 5, rating: 8.8 },
      { name: 'Jaylen Brown', position: 'Guard', points: 22, rebounds: 6, rating: 8.4 },
      { name: 'Robert Williams', position: 'Center', rebounds: 12, blocks: 4, rating: 8.0 }
    ],
    away: [
      { name: 'Jimmy Butler', position: 'Forward', points: 24, rebounds: 8, assists_basketball: 6, rating: 8.6 },
      { name: 'Bam Adebayo', position: 'Center', points: 18, rebounds: 10, rating: 8.2 },
      { name: 'Tyler Herro', position: 'Guard', points: 20, rating: 7.8 }
    ]
  },
  '4': {
    home: [
      { name: 'DeMar DeRozan', position: 'Forward', points: 22, rebounds: 5, assists_basketball: 4, rating: 8.2 },
      { name: 'Zach LaVine', position: 'Guard', points: 20, rebounds: 4, rating: 7.9 },
      { name: 'Nikola Vucevic', position: 'Center', points: 16, rebounds: 12, rating: 7.7 }
    ],
    away: [
      { name: 'Giannis Antetokounmpo', position: 'Forward', points: 28, rebounds: 11, assists_basketball: 7, rating: 9.1 },
      { name: 'Khris Middleton', position: 'Guard', points: 22, assists_basketball: 6, rating: 8.5 },
      { name: 'Brook Lopez', position: 'Center', points: 14, rebounds: 8, blocks: 3, rating: 8.0 }
    ]
  }
};

export const volleyballTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'Bruno Rezende', position: 'Setter', assists: 45, rating: 9.0 },
      { name: 'Wallace de Souza', position: 'Outside Hitter', kills: 18, rating: 8.8 },
      { name: 'Lucao', position: 'Middle Blocker', blocks_volleyball: 6, rating: 8.5 }
    ],
    away: [
      { name: 'Ivan Zaytsev', position: 'Outside Hitter', kills: 16, rating: 8.6 },
      { name: 'Simone Giannelli', position: 'Setter', assists: 38, rating: 8.2 },
      { name: 'Osmany Juantorena', position: 'Opposite', kills: 14, rating: 8.0 }
    ]
  },
  '2': {
    home: [
      { name: 'Matt Anderson', position: 'Outside Hitter', kills: 17, rating: 8.7 },
      { name: 'Micah Christenson', position: 'Setter', assists: 42, rating: 8.4 },
      { name: 'Max Holt', position: 'Middle Blocker', blocks_volleyball: 5, rating: 8.1 }
    ],
    away: [
      { name: 'Bartosz Kurek', position: 'Opposite', kills: 16, rating: 8.5 },
      { name: 'Fabian Drzyzga', position: 'Setter', assists: 39, rating: 8.2 },
      { name: 'Piotr Nowakowski', position: 'Middle Blocker', blocks_volleyball: 4, rating: 7.9 }
    ]
  },
  '4': {
    home: [
      { name: 'Yuji Nishida', position: 'Outside Hitter', kills: 12, rating: 8.3 },
      { name: 'Masahiro Sekita', position: 'Setter', assists: 28, rating: 8.0 },
      { name: 'Akihiro Yamauchi', position: 'Middle Blocker', blocks_volleyball: 3, rating: 7.8 }
    ],
    away: [
      { name: 'Zhang Jingyin', position: 'Outside Hitter', kills: 14, rating: 8.5 },
      { name: 'Yu Yaochen', position: 'Setter', assists: 32, rating: 8.2 },
      { name: 'Li Yongzhen', position: 'Middle Blocker', blocks_volleyball: 4, rating: 8.0 }
    ]
  }
};

export const throwballTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'Player A1', catches: 12, successful_throws: 8, rating: 8.5 },
      { name: 'Player A2', catches: 10, successful_throws: 7, rating: 8.2 },
      { name: 'Player A3', catches: 6, successful_throws: 7, rating: 7.8 }
    ],
    away: [
      { name: 'Player B1', catches: 8, successful_throws: 6, rating: 7.9 },
      { name: 'Player B2', catches: 9, successful_throws: 5, rating: 7.5 },
      { name: 'Player B3', catches: 7, successful_throws: 7, rating: 7.7 }
    ]
  },
  '2': {
    home: [
      { name: 'Player G1', catches: 14, successful_throws: 9, rating: 8.7 },
      { name: 'Player G2', catches: 11, successful_throws: 8, rating: 8.3 },
      { name: 'Player G3', catches: 7, successful_throws: 8, rating: 8.0 }
    ],
    away: [
      { name: 'Player D1', catches: 9, successful_throws: 7, rating: 8.0 },
      { name: 'Player D2', catches: 10, successful_throws: 6, rating: 7.6 },
      { name: 'Player D3', catches: 7, successful_throws: 7, rating: 7.8 }
    ]
  },
  '4': {
    home: [
      { name: 'Player E1', catches: 8, successful_throws: 6, rating: 8.1 },
      { name: 'Player E2', catches: 6, successful_throws: 5, rating: 7.8 },
      { name: 'Player E3', catches: 4, successful_throws: 3, rating: 7.5 }
    ],
    away: [
      { name: 'Player T1', catches: 6, successful_throws: 5, rating: 7.7 },
      { name: 'Player T2', catches: 5, successful_throws: 4, rating: 7.4 },
      { name: 'Player T3', catches: 4, successful_throws: 3, rating: 7.2 }
    ]
  }
};

export const badmintonTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'Lin Dan', smashes: 24, rating: 8.8 }
    ],
    away: [
      { name: 'Lee Chong Wei', smashes: 20, rating: 8.5 }
    ]
  },
  '2': {
    home: [
      { name: 'Viktor Axelsen', smashes: 28, rating: 9.2 }
    ],
    away: [
      { name: 'Kento Momota', smashes: 18, rating: 7.8 }
    ]
  },
  '4': {
    home: [
      { name: 'Tai Tzu-ying', smashes: 16, rating: 8.4 }
    ],
    away: [
      { name: 'Carolina Marin', smashes: 18, rating: 8.6 }
    ]
  }
};

export const kabaddiTopPerformers: { [matchId: string]: { home: PlayerPerformance[], away: PlayerPerformance[] } } = {
  '1': {
    home: [
      { name: 'Pardeep Narwal', position: 'Raider', raid_points: 18, rating: 9.2 },
      { name: 'Fazel Atrachali', position: 'Defender', tackle_points: 8, rating: 8.5 },
      { name: 'Monu Goyat', position: 'Raider', raid_points: 10, rating: 8.0 }
    ],
    away: [
      { name: 'Pawan Sehrawat', position: 'Raider', raid_points: 16, rating: 8.8 },
      { name: 'Mahender Singh', position: 'Defender', tackle_points: 6, rating: 7.8 },
      { name: 'Rohit Kumar', position: 'Raider', raid_points: 8, rating: 7.5 }
    ]
  },
  '2': {
    home: [
      { name: 'Deepak Hooda', position: 'Raider', raid_points: 14, rating: 8.6 },
      { name: 'Sandeep Dhull', position: 'Defender', tackle_points: 7, rating: 8.2 },
      { name: 'Arjun Deshwal', position: 'Raider', raid_points: 8, rating: 7.9 }
    ],
    away: [
      { name: 'Abhishek Singh', position: 'Raider', raid_points: 12, rating: 8.3 },
      { name: 'Fazel Atrachali', position: 'Defender', tackle_points: 5, rating: 7.9 },
      { name: 'Ajith Kumar', position: 'Raider', raid_points: 8, rating: 7.6 }
    ]
  },
  '4': {
    home: [
      { name: 'Vikash Kandola', position: 'Raider', raid_points: 10, rating: 8.4 },
      { name: 'Jaideep', position: 'Defender', tackle_points: 5, rating: 8.0 },
      { name: 'Meetu Sharma', position: 'Raider', raid_points: 6, rating: 7.7 }
    ],
    away: [
      { name: 'Surender Gill', position: 'Raider', raid_points: 9, rating: 8.1 },
      { name: 'Nitesh Kumar', position: 'Defender', tackle_points: 4, rating: 7.8 },
      { name: 'Shrikant Jadhav', position: 'Raider', raid_points: 5, rating: 7.5 }
    ]
  }
};