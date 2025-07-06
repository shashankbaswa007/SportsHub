import React from 'react';
import { TeamStanding, Sport } from '../types';
import { Trophy, TrendingUp, Award, Medal } from 'lucide-react';

interface StandingsTableProps {
  standings: TeamStanding[];
  sport: Sport;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings, sport }) => {
  const getSportTheme = () => {
    switch (sport) {
      case 'football':
        return {
          tableBg: 'bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30',
          headerBg: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
          positionBg1: 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500',
          positionBg2: 'bg-gradient-to-r from-green-25 to-emerald-25 border-l-4 border-green-400',
          pointsBg: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
        };
      case 'tabletennis':
        return {
          tableBg: 'bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30',
          headerBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600',
          positionBg1: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500',
          positionBg2: 'bg-gradient-to-r from-blue-25 to-indigo-25 border-l-4 border-blue-400',
          pointsBg: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
        };
      case 'basketball':
        return {
          tableBg: 'bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30',
          headerBg: 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600',
          positionBg1: 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500',
          positionBg2: 'bg-gradient-to-r from-orange-25 to-amber-25 border-l-4 border-orange-400',
          pointsBg: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800'
        };
      case 'volleyball':
        return {
          tableBg: 'bg-gradient-to-br from-white via-purple-50/20 to-violet-50/30',
          headerBg: 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600',
          positionBg1: 'bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-500',
          positionBg2: 'bg-gradient-to-r from-purple-25 to-violet-25 border-l-4 border-purple-400',
          pointsBg: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800'
        };
      case 'throwball':
        return {
          tableBg: 'bg-gradient-to-br from-white via-red-50/20 to-rose-50/30',
          headerBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600',
          positionBg1: 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500',
          positionBg2: 'bg-gradient-to-r from-red-25 to-rose-25 border-l-4 border-red-400',
          pointsBg: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800'
        };
      case 'badminton':
        return {
          tableBg: 'bg-gradient-to-br from-white via-yellow-50/20 to-amber-50/30',
          headerBg: 'bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-600',
          positionBg1: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500',
          positionBg2: 'bg-gradient-to-r from-yellow-25 to-amber-25 border-l-4 border-yellow-400',
          pointsBg: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800'
        };
      case 'kabaddi':
        return {
          tableBg: 'bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/30',
          headerBg: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600',
          positionBg1: 'bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500',
          positionBg2: 'bg-gradient-to-r from-teal-25 to-cyan-25 border-l-4 border-teal-400',
          pointsBg: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800'
        };
      default:
        return {
          tableBg: 'bg-gradient-to-br from-white via-gray-50/20 to-slate-50/30',
          headerBg: 'bg-gradient-to-r from-gray-600 via-slate-600 to-gray-600',
          positionBg1: 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500',
          positionBg2: 'bg-gradient-to-r from-gray-25 to-slate-25 border-l-4 border-gray-400',
          pointsBg: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800'
        };
    }
  };

  const getPositionColor = (position: number) => {
    const theme = getSportTheme();
    if (position === 1) {
      return theme.positionBg1;
    } else if (position <= 3) {
      return theme.positionBg2;
    }
    return 'bg-gradient-to-r from-white to-gray-50/50';
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">{position}</span>;
    }
  };

  const theme = getSportTheme();

  const getScoreColumns = () => {
    switch (sport) {
      case 'football':
        return (
          <>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Drawn</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">GF</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">GA</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">GD</th>
          </>
        );
      case 'volleyball':
        return (
          <>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Drawn</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">PF</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">PA</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">PD</th>
          </>
        );
      case 'basketball':
      case 'throwball':
      case 'badminton':
      case 'kabaddi':
        return (
          <>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">PF</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">PA</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">PD</th>
          </>
        );
      default:
        return null;
    }
  };

  const getScoreData = (team: TeamStanding) => {
    switch (sport) {
      case 'football':
        const goalDiff = (team.goalsFor || 0) - (team.goalsAgainst || 0);
        return (
          <>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-yellow-600 font-bold">{team.drawn}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">{team.goalsFor}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">{team.goalsAgainst}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm font-bold">
              <span className={`${
                goalDiff > 0 ? 'text-green-600' : 
                goalDiff < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {goalDiff > 0 ? '+' : ''}{goalDiff}
              </span>
            </td>
          </>
        );
      case 'volleyball':
        const volleyballPointDiff = (team.pointsFor || 0) - (team.pointsAgainst || 0);
        return (
          <>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-yellow-600 font-bold">{team.drawn}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">{team.pointsFor}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">{team.pointsAgainst}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm font-bold">
              <span className={`${
                volleyballPointDiff > 0 ? 'text-green-600' : 
                volleyballPointDiff < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {volleyballPointDiff > 0 ? '+' : ''}{volleyballPointDiff}
              </span>
            </td>
          </>
        );
      case 'basketball':
      case 'throwball':
      case 'badminton':
      case 'kabaddi':
        const pointDiff = (team.pointsFor || 0) - (team.pointsAgainst || 0);
        return (
          <>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">{team.pointsFor}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">{team.pointsAgainst}</td>
            <td className="px-8 py-5 whitespace-nowrap text-sm font-bold">
              <span className={`${
                pointDiff > 0 ? 'text-green-600' : 
                pointDiff < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {pointDiff > 0 ? '+' : ''}{pointDiff}
              </span>
            </td>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${theme.tableBg} rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-gray-200`}>
      <div className={`px-8 py-6 ${theme.headerBg} text-white relative overflow-hidden`}>
        {/* Header Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 w-12 h-12 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">League Standings</h3>
            <p className="text-sm opacity-90 font-medium">(Calculated from match results)</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Position</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Team</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Played</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Won</th>
              {getScoreColumns()}
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Lost</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {standings.map((team, index) => (
              <tr 
                key={team.team} 
                className={`${getPositionColor(team.position)} hover:bg-gray-50/80 transition-all duration-300 hover:scale-[1.01]`}
              >
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {getPositionIcon(team.position)}
                  </div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="font-bold text-lg text-gray-900">{team.team}</div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{team.played}</td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-green-600 font-bold">{team.won}</td>
                {getScoreData(team)}
                <td className="px-8 py-5 whitespace-nowrap text-sm text-red-600 font-bold">{team.lost}</td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full shadow-lg ${theme.pointsBg}`}>
                    {team.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};