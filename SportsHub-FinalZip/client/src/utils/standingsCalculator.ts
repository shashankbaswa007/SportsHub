import { Match, TeamStanding } from '../types';

export const calculateStandings = (matches: Match[], sport: string): TeamStanding[] => {
  const teamStats: { [team: string]: TeamStanding } = {};
  
  // Get all unique teams from matches
  const allTeams = new Set<string>();
  matches.forEach(match => {
    allTeams.add(match.homeTeam);
    allTeams.add(match.awayTeam);
  });
  
  // Initialize all teams with 0 points
  allTeams.forEach(team => {
    teamStats[team] = {
      position: 0,
      team,
      played: 0,
      won: 0,
      drawn: ['football', 'volleyball'].includes(sport) ? 0 : undefined,
      lost: 0,
      goalsFor: ['football'].includes(sport) ? 0 : undefined,
      goalsAgainst: ['football'].includes(sport) ? 0 : undefined,
      pointsFor: ['basketball', 'volleyball', 'throwball', 'badminton', 'kabaddi'].includes(sport) ? 0 : undefined,
      pointsAgainst: ['basketball', 'volleyball', 'throwball', 'badminton', 'kabaddi'].includes(sport) ? 0 : undefined,
      points: 0
    };
  });
  
  // Process completed matches
  matches
    .filter(match => match.status === 'completed' && match.homeScore !== undefined && match.awayScore !== undefined)
    .forEach(match => {
      const homeTeam = teamStats[match.homeTeam];
      const awayTeam = teamStats[match.awayTeam];
      
      homeTeam.played++;
      awayTeam.played++;
      
      // Update scores based on sport
      if (sport === 'football') {
        homeTeam.goalsFor! += match.homeScore!;
        homeTeam.goalsAgainst! += match.awayScore!;
        awayTeam.goalsFor! += match.awayScore!;
        awayTeam.goalsAgainst! += match.homeScore!;
      } else if (['basketball', 'volleyball', 'throwball', 'badminton', 'kabaddi'].includes(sport)) {
        homeTeam.pointsFor! += match.homeScore!;
        homeTeam.pointsAgainst! += match.awayScore!;
        awayTeam.pointsFor! += match.awayScore!;
        awayTeam.pointsAgainst! += match.homeScore!;
      }
      
      // Determine winner and assign points
      if (match.homeScore! > match.awayScore!) {
        // Home team wins
        homeTeam.won++;
        awayTeam.lost++;
        
        if (sport === 'football') {
          homeTeam.points += 3; // 3 points for win in football
        } else if (sport === 'volleyball') {
          homeTeam.points += 3; // 3 points for win in volleyball
        } else {
          homeTeam.points += 2; // 2 points for win in other sports
        }
      } else if (match.homeScore! < match.awayScore!) {
        // Away team wins
        awayTeam.won++;
        homeTeam.lost++;
        
        if (sport === 'football') {
          awayTeam.points += 3;
        } else if (sport === 'volleyball') {
          awayTeam.points += 3;
        } else {
          awayTeam.points += 2;
        }
      } else {
        // Draw (only for football and volleyball)
        if (['football', 'volleyball'].includes(sport)) {
          homeTeam.drawn!++;
          awayTeam.drawn!++;
          homeTeam.points += 1; // 1 point for draw
          awayTeam.points += 1;
        }
      }
    });
  
  // Convert to array and sort
  const standings = Object.values(teamStats).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    
    // Secondary sorting criteria based on sport
    if (sport === 'football') {
      const aGoalDiff = (a.goalsFor || 0) - (a.goalsAgainst || 0);
      const bGoalDiff = (b.goalsFor || 0) - (b.goalsAgainst || 0);
      if (bGoalDiff !== aGoalDiff) {
        return bGoalDiff - aGoalDiff;
      }
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    } else if (['basketball', 'volleyball', 'throwball', 'badminton', 'kabaddi'].includes(sport)) {
      const aPointDiff = (a.pointsFor || 0) - (a.pointsAgainst || 0);
      const bPointDiff = (b.pointsFor || 0) - (b.pointsAgainst || 0);
      if (bPointDiff !== aPointDiff) {
        return bPointDiff - aPointDiff;
      }
      return (b.pointsFor || 0) - (a.pointsFor || 0);
    }
    
    return b.won - a.won;
  });
  
  // Assign positions
  standings.forEach((team, index) => {
    team.position = index + 1;
  });
  
  return standings;
};