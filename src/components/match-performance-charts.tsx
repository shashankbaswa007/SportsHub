'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import type { Match, Player, Team, SportName } from '@/lib/types';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

interface MatchPerformanceChartsProps {
  match: Match;
  teamA: Team;
  teamB: Team;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}

const chartConfig = {
  teamA: {
    label: "Team A",
    color: "hsl(var(--chart-1))",
  },
  teamB: {
    label: "Team B",
    color: "hsl(var(--chart-2))",
  },
};

export function MatchPerformanceCharts({ match, teamA, teamB, teamAPlayers, teamBPlayers }: MatchPerformanceChartsProps) {
  
  // Calculate team statistics based on sport
  const teamStats = useMemo(() => {
    const getPlayerTotal = (players: Player[], stat: string) => {
      return players.reduce((sum, p) => sum + (Number(p.stats[stat]) || 0), 0);
    };

    const stats: any = {
      teamAName: teamA.name,
      teamBName: teamB.name,
    };

    switch (match.sport) {
      case 'Football':
        stats.goals = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Goals') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Goals') }
        ];
        stats.assists = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Assists') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Assists') }
        ];
        stats.cards = [
          { name: teamA.name, yellow: getPlayerTotal(teamAPlayers, 'Yellow Cards'), red: getPlayerTotal(teamAPlayers, 'Red Cards') },
          { name: teamB.name, yellow: getPlayerTotal(teamBPlayers, 'Yellow Cards'), red: getPlayerTotal(teamBPlayers, 'Red Cards') }
        ];
        break;

      case 'Basketball':
        stats.points = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Points') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Points') }
        ];
        stats.rebounds = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Rebounds') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Rebounds') }
        ];
        stats.assists = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Assists') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Assists') }
        ];
        break;

      case 'Cricket':
        stats.runs = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Runs') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Runs') }
        ];
        stats.wickets = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Wickets') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Wickets') }
        ];
        stats.boundaries = [
          { name: teamA.name, fours: getPlayerTotal(teamAPlayers, 'Fours'), sixes: getPlayerTotal(teamAPlayers, 'Sixes') },
          { name: teamB.name, fours: getPlayerTotal(teamBPlayers, 'Fours'), sixes: getPlayerTotal(teamBPlayers, 'Sixes') }
        ];
        break;

      case 'Volleyball':
      case 'Throwball':
        stats.points = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Points') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Points') }
        ];
        stats.aces = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Aces') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Aces') }
        ];
        if (match.sport === 'Volleyball') {
          stats.blocks = [
            { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Blocks') },
            { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Blocks') }
          ];
        }
        break;

      case 'Kabaddi':
        stats.raidPoints = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Raid Points') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Raid Points') }
        ];
        stats.tacklePoints = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Tackle Points') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Tackle Points') }
        ];
        stats.totalPoints = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Total Points') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Total Points') }
        ];
        break;

      case 'Badminton (Singles)':
      case 'Badminton (Doubles)':
      case 'Table Tennis (Singles)':
      case 'Table Tennis (Doubles)':
        stats.points = [
          { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Points') },
          { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Points') }
        ];
        if (match.sport.includes('Badminton')) {
          stats.smashes = [
            { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Smashes') },
            { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Smashes') }
          ];
        } else {
          stats.aces = [
            { name: teamA.name, value: getPlayerTotal(teamAPlayers, 'Aces') },
            { name: teamB.name, value: getPlayerTotal(teamBPlayers, 'Aces') }
          ];
        }
        break;
    }

    return stats;
  }, [match.sport, teamA, teamB, teamAPlayers, teamBPlayers]);

  // Top performers data
  const topPerformers = useMemo(() => {
    const getMainStat = (sport: SportName): string => {
      switch (sport) {
        case 'Football': return 'Goals';
        case 'Basketball': return 'Points';
        case 'Cricket': return 'Runs';
        case 'Volleyball':
        case 'Throwball':
        case 'Badminton (Singles)':
        case 'Badminton (Doubles)':
        case 'Table Tennis (Singles)':
        case 'Table Tennis (Doubles)':
          return 'Points';
        case 'Kabaddi': return 'Total Points';
        default: return 'Points';
      }
    };

    const mainStat = getMainStat(match.sport);
    const allPlayers = [...teamAPlayers, ...teamBPlayers];
    
    return allPlayers
      .map(p => ({
        name: p.name,
        team: teamAPlayers.find(tp => tp.id === p.id) ? teamA.name : teamB.name,
        value: Number(p.stats[mainStat]) || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [match.sport, teamA, teamB, teamAPlayers, teamBPlayers]);

  // Radar chart data for overall comparison
  const radarData = useMemo(() => {
    const statKeys = Object.keys(teamStats).filter(key => 
      !['teamAName', 'teamBName'].includes(key) && Array.isArray(teamStats[key])
    );

    return statKeys.map(statKey => {
      const data = teamStats[statKey];
      return {
        stat: statKey.charAt(0).toUpperCase() + statKey.slice(1),
        [teamA.name]: data[0]?.value || data[0]?.yellow || data[0]?.fours || 0,
        [teamB.name]: data[1]?.value || data[1]?.yellow || data[1]?.fours || 0,
      };
    });
  }, [teamStats, teamA.name, teamB.name]);

  return (
    <div className="space-y-6">
      {/* Match Result Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Match Result
              </CardTitle>
              <CardDescription>Final score and winner</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold font-mono">
                {match.teamAScore} - {match.teamBScore}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {match.teamAScore > match.teamBScore ? (
                  <span className="text-green-600 font-semibold">🏆 {teamA.name} Wins!</span>
                ) : match.teamBScore > match.teamAScore ? (
                  <span className="text-green-600 font-semibold">🏆 {teamB.name} Wins!</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">🤝 Draw</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>Leading players by performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Overall Team Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance Comparison
          </CardTitle>
          <CardDescription>Comprehensive statistical analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" />
                <PolarRadiusAxis />
                <Radar
                  name={teamA.name}
                  dataKey={teamA.name}
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
                <Radar
                  name={teamB.name}
                  dataKey={teamB.name}
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sport-Specific Charts */}
      {match.sport === 'Football' && teamStats.goals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Goals Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.goals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assists Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.assists}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {match.sport === 'Cricket' && teamStats.runs && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Runs Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.runs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Boundaries Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.boundaries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="fours" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="sixes" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {match.sport === 'Kabaddi' && teamStats.raidPoints && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Raid Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.raidPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tackle Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.tacklePoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
