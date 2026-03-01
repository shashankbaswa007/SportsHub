import type { Match, Team } from '@/lib/types';

interface MatchInsightInput {
  match: Match;
  teamA: Team;
  teamB: Team;
  allMatches: Match[];
  teamsById: Map<string, Team>;
}

export function generateMatchInsights(input: MatchInsightInput): string[] {
  const { match, teamA, teamB, allMatches, teamsById } = input;
  const insights: string[] = [];

  const totalScore = match.teamAScore + match.teamBScore;
  const scoreDiff = Math.abs(match.teamAScore - match.teamBScore);
  const leader = match.teamAScore > match.teamBScore ? teamA : teamB;
  const trailer = match.teamAScore > match.teamBScore ? teamB : teamA;
  const isDraw = match.teamAScore === match.teamBScore;

  // --- Helpers ---

  function getTeamRecord(teamId: string) {
    let wins = 0, losses = 0, draws = 0, totalScored = 0, totalConceded = 0;
    allMatches
      .filter(m => m.status === 'COMPLETED' && (m.teamAId === teamId || m.teamBId === teamId))
      .forEach(m => {
        const isTeamA = m.teamAId === teamId;
        const scored = isTeamA ? m.teamAScore : m.teamBScore;
        const conceded = isTeamA ? m.teamBScore : m.teamAScore;
        totalScored += scored;
        totalConceded += conceded;
        if (scored > conceded) wins++;
        else if (scored < conceded) losses++;
        else draws++;
      });
    return { wins, losses, draws, totalScored, totalConceded, played: wins + losses + draws };
  }

  function getWinStreak(teamId: string): number {
    const teamMatches = allMatches
      .filter(m => m.status === 'COMPLETED' && (m.teamAId === teamId || m.teamBId === teamId))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    let streak = 0;
    for (const m of teamMatches) {
      const isTeamA = m.teamAId === teamId;
      const scored = isTeamA ? m.teamAScore : m.teamBScore;
      const conceded = isTeamA ? m.teamBScore : m.teamAScore;
      if (scored > conceded) streak++;
      else break;
    }
    return streak;
  }

  function getHeadToHead(teamAId: string, teamBId: string) {
    let aWins = 0, bWins = 0, draws = 0;
    allMatches
      .filter(m =>
        m.status === 'COMPLETED' &&
        ((m.teamAId === teamAId && m.teamBId === teamBId) ||
         (m.teamAId === teamBId && m.teamBId === teamAId))
      )
      .forEach(m => {
        const aIsTeamA = m.teamAId === teamAId;
        const aScore = aIsTeamA ? m.teamAScore : m.teamBScore;
        const bScore = aIsTeamA ? m.teamBScore : m.teamAScore;
        if (aScore > bScore) aWins++;
        else if (bScore > aScore) bWins++;
        else draws++;
      });
    return { aWins, bWins, draws, total: aWins + bWins + draws };
  }

  function getSportAverage(sport: string) {
    const sportMatches = allMatches.filter(m => m.sport === sport && m.status === 'COMPLETED');
    if (sportMatches.length === 0) return 0;
    const totalPoints = sportMatches.reduce((s, m) => s + m.teamAScore + m.teamBScore, 0);
    return totalPoints / sportMatches.length;
  }

  function getHighestScoringMatch(sport: string): { match: Match | null; total: number } {
    let highest: Match | null = null;
    let highestTotal = 0;
    allMatches
      .filter(m => m.sport === sport && m.status === 'COMPLETED')
      .forEach(m => {
        const t = m.teamAScore + m.teamBScore;
        if (t > highestTotal) { highest = m; highestTotal = t; }
      });
    return { match: highest, total: highestTotal };
  }

  // --- Generate insights based on match status ---

  const recordA = getTeamRecord(teamA.id);
  const recordB = getTeamRecord(teamB.id);
  const streakA = getWinStreak(teamA.id);
  const streakB = getWinStreak(teamB.id);
  const h2h = getHeadToHead(teamA.id, teamB.id);
  const sportAvg = getSportAverage(match.sport);

  if (match.status === 'UPCOMING') {
    if (h2h.total > 0) {
      if (h2h.aWins > h2h.bWins) {
        insights.push(`${teamA.name} leads the head-to-head ${h2h.aWins}-${h2h.bWins} in past meetings`);
      } else if (h2h.bWins > h2h.aWins) {
        insights.push(`${teamB.name} leads the head-to-head ${h2h.bWins}-${h2h.aWins} in past meetings`);
      } else {
        insights.push(`These teams are evenly matched with ${h2h.draws} draw(s) in ${h2h.total} meetings`);
      }
    } else {
      insights.push(`First ever meeting between ${teamA.name} and ${teamB.name}!`);
    }

    if (streakA >= 2) {
      insights.push(`${teamA.name} is on a ${streakA}-match winning streak`);
    }
    if (streakB >= 2) {
      insights.push(`${teamB.name} is riding a ${streakB}-match winning streak`);
    }

    if (recordA.played > 0 && recordB.played > 0) {
      const winRateA = recordA.wins / recordA.played;
      const winRateB = recordB.wins / recordB.played;
      if (winRateA > winRateB + 0.2) {
        insights.push(`${teamA.name} has a stronger win rate (${Math.round(winRateA * 100)}%) vs ${teamB.name} (${Math.round(winRateB * 100)}%)`);
      } else if (winRateB > winRateA + 0.2) {
        insights.push(`${teamB.name} has the better record with a ${Math.round(winRateB * 100)}% win rate`);
      } else {
        insights.push(`Both teams are closely matched in form — expect a tight contest`);
      }
    }

    if (recordA.played > 0) {
      const avgScored = (recordA.totalScored / recordA.played).toFixed(1);
      insights.push(`${teamA.name} averages ${avgScored} points per match`);
    }
    if (recordB.played > 0) {
      const avgScored = (recordB.totalScored / recordB.played).toFixed(1);
      insights.push(`${teamB.name} averages ${avgScored} points per match`);
    }

  } else if (match.status === 'LIVE') {
    if (isDraw) {
      insights.push(`It's all square at ${match.teamAScore}-${match.teamBScore} — either team could take this`);
    } else {
      insights.push(`${leader.name} leads by ${scoreDiff} — ${trailer.name} needs to find a response`);
    }

    if (totalScore === 0) {
      insights.push(`A cagey affair so far — neither team has broken the deadlock`);
    } else if (sportAvg > 0 && totalScore > sportAvg * 1.3) {
      insights.push(`This is a high-scoring game — already above the ${match.sport} tournament average`);
    } else if (sportAvg > 0 && totalScore < sportAvg * 0.5) {
      insights.push(`Scoring is below the tournament average — defenses are on top`);
    }

    if (scoreDiff >= 3) {
      insights.push(`${trailer.name} faces a tough climb back from ${scoreDiff} points down`);
    } else if (scoreDiff === 1) {
      insights.push(`Just one point separates the teams — this could go either way`);
    }

    if (streakA >= 3) {
      insights.push(`${teamA.name} has won ${streakA} straight — they know how to close out`);
    }
    if (streakB >= 3) {
      insights.push(`${teamB.name}'s ${streakB}-match streak shows they perform under pressure`);
    }

  } else if (match.status === 'COMPLETED') {
    if (isDraw) {
      insights.push(`A fair result — both teams matched each other at ${match.teamAScore} apiece`);
    } else {
      if (scoreDiff === 1) {
        insights.push(`${leader.name} edged it by the narrowest of margins — a real nail-biter`);
      } else if (scoreDiff >= 5) {
        insights.push(`A dominant ${scoreDiff}-point victory for ${leader.name} — a statement performance`);
      } else {
        insights.push(`${leader.name} takes the win with a solid ${scoreDiff}-point cushion`);
      }
    }

    const highest = getHighestScoringMatch(match.sport);
    if (highest.match && highest.match.id === match.id) {
      insights.push(`This is the highest-scoring ${match.sport} match of the tournament with ${totalScore} total points!`);
    } else if (sportAvg > 0) {
      if (totalScore > sportAvg * 1.5) {
        insights.push(`An entertaining game — ${totalScore} total points is well above the ${match.sport} average`);
      } else if (totalScore < sportAvg * 0.5 && totalScore > 0) {
        insights.push(`A tight, low-scoring battle compared to other ${match.sport} games`);
      }
    }

    if (!isDraw) {
      const winnerRecord = match.teamAScore > match.teamBScore ? recordA : recordB;
      if (winnerRecord.played > 0) {
        insights.push(`${leader.name} now has ${winnerRecord.wins} win(s) from ${winnerRecord.played} match(es)`);
      }
    }

    if (!isDraw) {
      const loserRecord = match.teamAScore > match.teamBScore ? recordB : recordA;
      if (loserRecord.losses >= 3) {
        insights.push(`${trailer.name} has now lost ${loserRecord.losses} matches — they'll need a turnaround`);
      }
    }

    if (h2h.total > 1) {
      insights.push(`In their ${h2h.total} meetings: ${teamA.name} ${h2h.aWins}W, ${teamB.name} ${h2h.bWins}W`);
    }
  }

  // Fallback insights
  if (insights.length < 3) {
    const sportMatches = allMatches.filter(m => m.sport === match.sport);
    insights.push(`This is match #${sportMatches.length} in the ${match.sport} category`);
  }

  if (insights.length < 3) {
    if (recordA.played === 0 && recordB.played === 0) {
      insights.push(`Both teams are making their tournament debut — anything can happen!`);
    }
  }

  if (insights.length < 3) {
    insights.push(`${match.sport} action at ${match.venue}`);
  }

  return insights.slice(0, 4);
}
