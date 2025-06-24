import React from 'react';
import { Match, Sport, PlayerPerformance, TeamMatchStats } from '../types';
import { X, TrendingUp, Award, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { 
  footballTopPerformers, 
  tableTennisTopPerformers, 
  basketballTopPerformers, 
  volleyballTopPerformers, 
  throwballTopPerformers, 
  badmintonTopPerformers, 
  kabaddiTopPerformers 
} from '../data/mockData';

interface MatchAnalysisModalProps {
  match: Match;
  sport: Sport;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchAnalysisModal: React.FC<MatchAnalysisModalProps> = ({ match, sport, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getTopPerformers = () => {
    switch (sport) {
      case 'football': return footballTopPerformers[match.id];
      case 'tabletennis': return tableTennisTopPerformers[match.id];
      case 'basketball': return basketballTopPerformers[match.id];
      case 'volleyball': return volleyballTopPerformers[match.id];
      case 'throwball': return throwballTopPerformers[match.id];
      case 'badminton': return badmintonTopPerformers[match.id];
      case 'kabaddi': return kabaddiTopPerformers[match.id];
      default: return null;
    }
  };

  const topPerformers = getTopPerformers();

  const getStatsData = () => {
    if (!match.homeStats || !match.awayStats) return [];
    
    switch (sport) {
      case 'football':
        return [
          { stat: 'Possession', home: match.homeStats.possession || 0, away: match.awayStats.possession || 0 },
          { stat: 'Shots', home: match.homeStats.shots || 0, away: match.awayStats.shots || 0 },
          { stat: 'On Target', home: match.homeStats.shotsOnTarget || 0, away: match.awayStats.shotsOnTarget || 0 },
          { stat: 'Corners', home: match.homeStats.corners || 0, away: match.awayStats.corners || 0 },
          { stat: 'Fouls', home: match.homeStats.fouls || 0, away: match.awayStats.fouls || 0 },
          { stat: 'Yellow Cards', home: match.homeStats.yellowCards || 0, away: match.awayStats.yellowCards || 0 }
        ];
      case 'tabletennis':
        return [
          { stat: 'Aces', home: match.homeStats.aces || 0, away: match.awayStats.aces || 0 },
          { stat: 'Winners', home: match.homeStats.winners || 0, away: match.awayStats.winners || 0 },
          { stat: 'Errors', home: match.homeStats.unforced_errors || 0, away: match.awayStats.unforced_errors || 0 },
          { stat: 'Break Points', home: match.homeStats.break_points || 0, away: match.awayStats.break_points || 0 }
        ];
      case 'basketball':
        return [
          { stat: 'Field Goals', home: match.homeStats.field_goals || 0, away: match.awayStats.field_goals || 0 },
          { stat: '3-Pointers', home: match.homeStats.three_pointers || 0, away: match.awayStats.three_pointers || 0 },
          { stat: 'Free Throws', home: match.homeStats.free_throws || 0, away: match.awayStats.free_throws || 0 },
          { stat: 'Rebounds', home: match.homeStats.rebounds || 0, away: match.awayStats.rebounds || 0 },
          { stat: 'Assists', home: match.homeStats.assists || 0, away: match.awayStats.assists || 0 },
          { stat: 'Steals', home: match.homeStats.steals || 0, away: match.awayStats.steals || 0 }
        ];
      case 'volleyball':
        return [
          { stat: 'Kills', home: match.homeStats.kills || 0, away: match.awayStats.kills || 0 },
          { stat: 'Attacks', home: match.homeStats.attacks || 0, away: match.awayStats.attacks || 0 },
          { stat: 'Serves', home: match.homeStats.serves || 0, away: match.awayStats.serves || 0 },
          { stat: 'Digs', home: match.homeStats.digs || 0, away: match.awayStats.digs || 0 },
          { stat: 'Blocks', home: match.homeStats.blocks_volleyball || 0, away: match.awayStats.blocks_volleyball || 0 }
        ];
      case 'throwball':
        return [
          { stat: 'Catches', home: match.homeStats.catches || 0, away: match.awayStats.catches || 0 },
          { stat: 'Throws', home: match.homeStats.throws || 0, away: match.awayStats.throws || 0 },
          { stat: 'Successful Throws', home: match.homeStats.successful_throws || 0, away: match.awayStats.successful_throws || 0 },
          { stat: 'Interceptions', home: match.homeStats.interceptions || 0, away: match.awayStats.interceptions || 0 }
        ];
      case 'badminton':
        return [
          { stat: 'Smashes', home: match.homeStats.smashes || 0, away: match.awayStats.smashes || 0 },
          { stat: 'Clears', home: match.homeStats.clears || 0, away: match.awayStats.clears || 0 },
          { stat: 'Drops', home: match.homeStats.drops || 0, away: match.awayStats.drops || 0 },
          { stat: 'Net Shots', home: match.homeStats.net_shots || 0, away: match.awayStats.net_shots || 0 }
        ];
      case 'kabaddi':
        return [
          { stat: 'Raid Points', home: match.homeStats.raid_points || 0, away: match.awayStats.raid_points || 0 },
          { stat: 'Tackle Points', home: match.homeStats.tackle_points || 0, away: match.awayStats.tackle_points || 0 },
          { stat: 'Bonus Points', home: match.homeStats.bonus_points || 0, away: match.awayStats.bonus_points || 0 },
          { stat: 'All Outs', home: match.homeStats.all_outs || 0, away: match.awayStats.all_outs || 0 }
        ];
      default:
        return [];
    }
  };

  const getRadarData = () => {
    if (!match.homeStats || !match.awayStats) return [];
    
    switch (sport) {
      case 'football':
        return [
          { 
            stat: 'Possession', 
            home: match.homeStats.possession || 0, 
            away: match.awayStats.possession || 0 
          },
          { 
            stat: 'Attack', 
            home: Math.min(100, ((match.homeStats.shots || 0) / 20) * 100), 
            away: Math.min(100, ((match.awayStats.shots || 0) / 20) * 100) 
          },
          { 
            stat: 'Accuracy', 
            home: match.homeStats.shots ? Math.min(100, ((match.homeStats.shotsOnTarget || 0) / match.homeStats.shots) * 100) : 0,
            away: match.awayStats.shots ? Math.min(100, ((match.awayStats.shotsOnTarget || 0) / match.awayStats.shots) * 100) : 0
          },
          { 
            stat: 'Set Pieces', 
            home: Math.min(100, ((match.homeStats.corners || 0) / 10) * 100), 
            away: Math.min(100, ((match.awayStats.corners || 0) / 10) * 100) 
          },
          { 
            stat: 'Discipline', 
            home: Math.max(0, 100 - ((match.homeStats.fouls || 0) / 20) * 100), 
            away: Math.max(0, 100 - ((match.awayStats.fouls || 0) / 20) * 100) 
          }
        ];
      case 'tabletennis':
        return [
          { 
            stat: 'Power', 
            home: Math.min(100, ((match.homeStats.aces || 0) / 15) * 100), 
            away: Math.min(100, ((match.awayStats.aces || 0) / 15) * 100) 
          },
          { 
            stat: 'Winners', 
            home: Math.min(100, ((match.homeStats.winners || 0) / 25) * 100), 
            away: Math.min(100, ((match.awayStats.winners || 0) / 25) * 100) 
          },
          { 
            stat: 'Consistency', 
            home: Math.max(0, 100 - ((match.homeStats.unforced_errors || 0) / 20) * 100), 
            away: Math.max(0, 100 - ((match.awayStats.unforced_errors || 0) / 20) * 100) 
          },
          { 
            stat: 'Pressure', 
            home: Math.min(100, ((match.homeStats.break_points || 0) / 8) * 100), 
            away: Math.min(100, ((match.awayStats.break_points || 0) / 8) * 100) 
          }
        ];
      case 'basketball':
        return [
          { 
            stat: 'Shooting', 
            home: Math.min(100, ((match.homeStats.field_goals || 0) / 50) * 100), 
            away: Math.min(100, ((match.awayStats.field_goals || 0) / 50) * 100) 
          },
          { 
            stat: '3-Point', 
            home: Math.min(100, ((match.homeStats.three_pointers || 0) / 20) * 100), 
            away: Math.min(100, ((match.awayStats.three_pointers || 0) / 20) * 100) 
          },
          { 
            stat: 'Rebounding', 
            home: Math.min(100, ((match.homeStats.rebounds || 0) / 60) * 100), 
            away: Math.min(100, ((match.awayStats.rebounds || 0) / 60) * 100) 
          },
          { 
            stat: 'Playmaking', 
            home: Math.min(100, ((match.homeStats.assists || 0) / 35) * 100), 
            away: Math.min(100, ((match.awayStats.assists || 0) / 35) * 100) 
          },
          { 
            stat: 'Defense', 
            home: Math.min(100, (((match.homeStats.steals || 0) + (match.homeStats.blocks || 0)) / 15) * 100), 
            away: Math.min(100, (((match.awayStats.steals || 0) + (match.awayStats.blocks || 0)) / 15) * 100) 
          }
        ];
      case 'volleyball':
        return [
          { 
            stat: 'Attack', 
            home: Math.min(100, ((match.homeStats.kills || 0) / 70) * 100), 
            away: Math.min(100, ((match.awayStats.kills || 0) / 70) * 100) 
          },
          { 
            stat: 'Serving', 
            home: Math.min(100, ((match.homeStats.serves || 0) / 100) * 100), 
            away: Math.min(100, ((match.awayStats.serves || 0) / 100) * 100) 
          },
          { 
            stat: 'Defense', 
            home: Math.min(100, ((match.homeStats.digs || 0) / 50) * 100), 
            away: Math.min(100, ((match.awayStats.digs || 0) / 50) * 100) 
          },
          { 
            stat: 'Blocking', 
            home: Math.min(100, ((match.homeStats.blocks_volleyball || 0) / 20) * 100), 
            away: Math.min(100, ((match.awayStats.blocks_volleyball || 0) / 20) * 100) 
          }
        ];
      case 'throwball':
        return [
          { 
            stat: 'Catching', 
            home: Math.min(100, ((match.homeStats.catches || 0) / 40) * 100), 
            away: Math.min(100, ((match.awayStats.catches || 0) / 40) * 100) 
          },
          { 
            stat: 'Throwing', 
            home: Math.min(100, ((match.homeStats.throws || 0) / 50) * 100), 
            away: Math.min(100, ((match.awayStats.throws || 0) / 50) * 100) 
          },
          { 
            stat: 'Accuracy', 
            home: match.homeStats.throws ? Math.min(100, ((match.homeStats.successful_throws || 0) / match.homeStats.throws) * 100) : 0,
            away: match.awayStats.throws ? Math.min(100, ((match.awayStats.successful_throws || 0) / match.awayStats.throws) * 100) : 0
          },
          { 
            stat: 'Defense', 
            home: Math.min(100, ((match.homeStats.interceptions || 0) / 12) * 100), 
            away: Math.min(100, ((match.awayStats.interceptions || 0) / 12) * 100) 
          }
        ];
      case 'badminton':
        return [
          { 
            stat: 'Power', 
            home: Math.min(100, ((match.homeStats.smashes || 0) / 35) * 100), 
            away: Math.min(100, ((match.awayStats.smashes || 0) / 35) * 100) 
          },
          { 
            stat: 'Control', 
            home: Math.min(100, ((match.homeStats.clears || 0) / 30) * 100), 
            away: Math.min(100, ((match.awayStats.clears || 0) / 30) * 100) 
          },
          { 
            stat: 'Finesse', 
            home: Math.min(100, ((match.homeStats.drops || 0) / 20) * 100), 
            away: Math.min(100, ((match.awayStats.drops || 0) / 20) * 100) 
          },
          { 
            stat: 'Net Play', 
            home: Math.min(100, ((match.homeStats.net_shots || 0) / 15) * 100), 
            away: Math.min(100, ((match.awayStats.net_shots || 0) / 15) * 100) 
          }
        ];
      case 'kabaddi':
        return [
          { 
            stat: 'Raiding', 
            home: Math.min(100, ((match.homeStats.raid_points || 0) / 35) * 100), 
            away: Math.min(100, ((match.awayStats.raid_points || 0) / 35) * 100) 
          },
          { 
            stat: 'Defense', 
            home: Math.min(100, ((match.homeStats.tackle_points || 0) / 20) * 100), 
            away: Math.min(100, ((match.awayStats.tackle_points || 0) / 20) * 100) 
          },
          { 
            stat: 'Bonus', 
            home: Math.min(100, ((match.homeStats.bonus_points || 0) / 12) * 100), 
            away: Math.min(100, ((match.awayStats.bonus_points || 0) / 12) * 100) 
          },
          { 
            stat: 'Dominance', 
            home: Math.min(100, ((match.homeStats.all_outs || 0) / 3) * 100), 
            away: Math.min(100, ((match.awayStats.all_outs || 0) / 3) * 100) 
          }
        ];
      default:
        return [];
    }
  };

  const getSportTheme = () => {
    switch (sport) {
      case 'football':
        return {
          primary: '#15803d',
          secondary: '#16a34a',
          modalBg: 'bg-gradient-to-br from-green-900/95 via-emerald-800/95 to-green-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-green-700 via-emerald-600 to-green-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-green-50/90 to-emerald-50/95',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'tabletennis':
        return {
          primary: '#2563eb',
          secondary: '#3b82f6',
          modalBg: 'bg-gradient-to-br from-blue-900/95 via-indigo-800/95 to-blue-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/95',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'basketball':
        return {
          primary: '#ea580c',
          secondary: '#f97316',
          modalBg: 'bg-gradient-to-br from-orange-900/95 via-amber-800/95 to-orange-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-orange-700 via-amber-600 to-orange-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/95',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'volleyball':
        return {
          primary: '#9333ea',
          secondary: '#a855f7',
          modalBg: 'bg-gradient-to-br from-purple-900/95 via-violet-800/95 to-purple-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-purple-700 via-violet-600 to-purple-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-purple-50/90 to-violet-50/95',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
      case 'throwball':
        return {
          primary: '#dc2626',
          secondary: '#ef4444',
          modalBg: 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-red-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-red-700 via-rose-600 to-red-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-red-50/90 to-rose-50/95',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'badminton':
        return {
          primary: '#ca8a04',
          secondary: '#eab308',
          modalBg: 'bg-gradient-to-br from-yellow-900/95 via-amber-800/95 to-yellow-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-yellow-700 via-amber-600 to-yellow-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-yellow-50/90 to-amber-50/95',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'kabaddi':
        return {
          primary: '#0891b2',
          secondary: '#06b6d4',
          modalBg: 'bg-gradient-to-br from-teal-900/95 via-cyan-800/95 to-teal-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-teal-700 via-cyan-600 to-teal-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-teal-50/90 to-cyan-50/95',
          iconBg: 'bg-teal-100',
          iconColor: 'text-teal-600'
        };
      default:
        return {
          primary: '#6b7280',
          secondary: '#9ca3af',
          modalBg: 'bg-gradient-to-br from-gray-900/95 via-slate-800/95 to-gray-900/95 backdrop-blur-lg',
          headerBg: 'bg-gradient-to-r from-gray-700 via-slate-600 to-gray-800',
          contentBg: 'bg-gradient-to-br from-white/95 via-gray-50/90 to-slate-50/95',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  const theme = getSportTheme();
  const statsData = getStatsData();
  const radarData = getRadarData();

  const renderPlayerStats = (player: PlayerPerformance) => {
    switch (sport) {
      case 'football':
        return (
          <>
            <span>Goals: <span className="font-bold text-gray-800">{player.goals}</span></span>
            <span>Assists: <span className="font-bold text-gray-800">{player.assists}</span></span>
          </>
        );
      case 'tabletennis':
        return (
          <>
            <span>Points: <span className="font-bold text-gray-800">{player.points_won}</span></span>
            <span>Aces: <span className="font-bold text-gray-800">{player.aces}</span></span>
            <span>Winners: <span className="font-bold text-gray-800">{player.winners}</span></span>
          </>
        );
      case 'basketball':
        return (
          <>
            <span>Points: <span className="font-bold text-gray-800">{player.points}</span></span>
            <span>Rebounds: <span className="font-bold text-gray-800">{player.rebounds}</span></span>
            <span>Assists: <span className="font-bold text-gray-800">{player.assists_basketball}</span></span>
          </>
        );
      case 'volleyball':
        return (
          <>
            <span>Kills: <span className="font-bold text-gray-800">{player.kills}</span></span>
            <span>Digs: <span className="font-bold text-gray-800">{player.digs}</span></span>
            <span>Blocks: <span className="font-bold text-gray-800">{player.blocks_volleyball}</span></span>
          </>
        );
      case 'throwball':
        return (
          <>
            <span>Catches: <span className="font-bold text-gray-800">{player.catches}</span></span>
            <span>Successful Throws: <span className="font-bold text-gray-800">{player.successful_throws}</span></span>
          </>
        );
      case 'badminton':
        return (
          <>
            <span>Smashes: <span className="font-bold text-gray-800">{player.smashes}</span></span>
          </>
        );
      case 'kabaddi':
        return (
          <>
            <span>Raid Points: <span className="font-bold text-gray-800">{player.raid_points}</span></span>
            <span>Tackle Points: <span className="font-bold text-gray-800">{player.tackle_points}</span></span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme.modalBg} rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20`}>
        {/* Header */}
        <div className={`${theme.headerBg} text-white p-8 rounded-t-3xl relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-8 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Match Analysis</h2>
              <div className="flex items-center space-x-6">
                <span className="text-xl font-bold">{match.homeTeam}</span>
                {match.homeScore !== undefined && match.awayScore !== undefined && (
                  <span className="text-3xl font-black bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                    {match.homeScore} - {match.awayScore}
                  </span>
                )}
                <span className="text-xl font-bold">{match.awayTeam}</span>
              </div>
              <p className="text-sm opacity-90 mt-2 font-medium">{match.date} • {match.venue}</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Performance Comparison Charts */}
          {statsData.length > 0 && (
            <>
              {/* Bar Chart */}
              <div className={`${theme.contentBg} rounded-2xl p-8 backdrop-blur-sm border border-white/30`}>
                <div className="flex items-center space-x-4 mb-8">
                  <div className={`p-3 rounded-xl ${theme.iconBg}`}>
                    <TrendingUp className={`w-6 h-6 ${theme.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Performance Statistics</h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="stat" tick={{ fontSize: 12, fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="home" fill={theme.primary} name={match.homeTeam} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="away" fill={theme.secondary} name={match.awayTeam} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className={`${theme.contentBg} rounded-2xl p-8 backdrop-blur-sm border border-white/30`}>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`p-3 rounded-xl ${theme.iconBg}`}>
                      <Target className={`w-6 h-6 ${theme.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Performance Radar</h3>
                  </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis 
                          dataKey="stat" 
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#374151' }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                        />
                        <Radar
                          name={match.homeTeam}
                          dataKey="home"
                          stroke={theme.primary}
                          fill={theme.primary}
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                        <Radar
                          name={match.awayTeam}
                          dataKey="away"
                          stroke={theme.secondary}
                          fill={theme.secondary}
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                        <Legend />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Top Performers */}
          {topPerformers && (
            <div className={`${theme.contentBg} rounded-2xl p-8 backdrop-blur-sm border border-white/30`}>
              <div className="flex items-center space-x-4 mb-8">
                <div className={`p-3 rounded-xl ${theme.iconBg}`}>
                  <Award className={`w-6 h-6 ${theme.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Top Performers</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Home Team Performers */}
                <div>
                  <h4 className="font-bold text-xl mb-6 text-gray-800">{match.homeTeam}</h4>
                  <div className="space-y-4">
                    {topPerformers.home.map((player, index) => (
                      <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-200 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-bold text-lg text-gray-800">{player.name}</h5>
                            {player.position && <p className="text-sm text-gray-600 font-medium">{player.position}</p>}
                          </div>
                          <div className={`px-3 py-2 rounded-full text-sm font-bold ${
                            player.rating >= 8.5 ? 'bg-green-100 text-green-800' :
                            player.rating >= 7.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {player.rating}
                          </div>
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-600 font-medium">
                          {renderPlayerStats(player)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Team Performers */}
                <div>
                  <h4 className="font-bold text-xl mb-6 text-gray-800">{match.awayTeam}</h4>
                  <div className="space-y-4">
                    {topPerformers.away.map((player, index) => (
                      <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-200 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-bold text-lg text-gray-800">{player.name}</h5>
                            {player.position && <p className="text-sm text-gray-600 font-medium">{player.position}</p>}
                          </div>
                          <div className={`px-3 py-2 rounded-full text-sm font-bold ${
                            player.rating >= 8.5 ? 'bg-green-100 text-green-800' :
                            player.rating >= 7.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {player.rating}
                          </div>
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-600 font-medium">
                          {renderPlayerStats(player)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};