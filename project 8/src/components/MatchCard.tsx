import React from 'react';
import { Match, Sport } from '../types';
import { Clock, MapPin, Trophy, Circle, BarChart3 } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  sport: Sport;
  onClick: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, sport, onClick }) => {
  const getSportTheme = () => {
    switch (sport) {
      case 'football':
        return {
          statusLive: 'bg-gradient-to-r from-green-600 to-emerald-600',
          cardBg: 'bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50',
          border: 'border-green-300 shadow-green-100',
          scoreColor: 'text-green-600',
          iconColor: 'text-green-600'
        };
      case 'tabletennis':
        return {
          statusLive: 'bg-gradient-to-r from-blue-600 to-indigo-600',
          cardBg: 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50',
          border: 'border-blue-300 shadow-blue-100',
          scoreColor: 'text-blue-600',
          iconColor: 'text-blue-600'
        };
      case 'basketball':
        return {
          statusLive: 'bg-gradient-to-r from-orange-600 to-amber-600',
          cardBg: 'bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50',
          border: 'border-orange-300 shadow-orange-100',
          scoreColor: 'text-orange-600',
          iconColor: 'text-orange-600'
        };
      case 'volleyball':
        return {
          statusLive: 'bg-gradient-to-r from-purple-600 to-violet-600',
          cardBg: 'bg-gradient-to-br from-white via-purple-50/30 to-violet-50/50',
          border: 'border-purple-300 shadow-purple-100',
          scoreColor: 'text-purple-600',
          iconColor: 'text-purple-600'
        };
      case 'throwball':
        return {
          statusLive: 'bg-gradient-to-r from-red-600 to-rose-600',
          cardBg: 'bg-gradient-to-br from-white via-red-50/30 to-rose-50/50',
          border: 'border-red-300 shadow-red-100',
          scoreColor: 'text-red-600',
          iconColor: 'text-red-600'
        };
      case 'badminton':
        return {
          statusLive: 'bg-gradient-to-r from-yellow-600 to-amber-600',
          cardBg: 'bg-gradient-to-br from-white via-yellow-50/30 to-amber-50/50',
          border: 'border-yellow-300 shadow-yellow-100',
          scoreColor: 'text-yellow-600',
          iconColor: 'text-yellow-600'
        };
      case 'kabaddi':
        return {
          statusLive: 'bg-gradient-to-r from-teal-600 to-cyan-600',
          cardBg: 'bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/50',
          border: 'border-teal-300 shadow-teal-100',
          scoreColor: 'text-teal-600',
          iconColor: 'text-teal-600'
        };
      default:
        return {
          statusLive: 'bg-gradient-to-r from-gray-600 to-slate-600',
          cardBg: 'bg-gradient-to-br from-white via-gray-50/30 to-slate-50/50',
          border: 'border-gray-300 shadow-gray-100',
          scoreColor: 'text-gray-600',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getStatusColor = () => {
    const theme = getSportTheme();
    switch (match.status) {
      case 'live': return theme.statusLive;
      case 'upcoming': return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'completed': return 'bg-gradient-to-r from-gray-600 to-slate-600';
      default: return 'bg-gradient-to-r from-gray-600 to-slate-600';
    }
  };

  const getCardBackground = () => {
    const theme = getSportTheme();
    if (match.status === 'live') {
      return theme.cardBg;
    }
    return 'bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30';
  };

  const getCardBorder = () => {
    const theme = getSportTheme();
    if (match.status === 'live') {
      return theme.border;
    }
    return 'border-gray-200 shadow-gray-100';
  };

  const canShowAnalysis = match.status === 'completed' || match.status === 'live';
  const theme = getSportTheme();

  return (
    <div 
      className={`${getCardBackground()} rounded-2xl shadow-xl border-2 ${getCardBorder()} overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] backdrop-blur-sm ${canShowAnalysis ? 'cursor-pointer group' : ''}`}
      onClick={canShowAnalysis ? onClick : undefined}
    >
      {/* Status Banner */}
      <div className={`${getStatusColor()} px-6 py-3 flex items-center justify-between shadow-lg`}>
        <div className="flex items-center space-x-3 text-white">
          {match.status === 'live' && <Circle className="w-4 h-4 fill-current animate-pulse" />}
          <span className="font-bold text-sm tracking-wide">
            {match.status === 'live' ? 'LIVE' : match.status.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-white/90 text-sm">
          <Trophy className="w-4 h-4" />
          <span className="font-medium">{match.league}</span>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-6">
        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xl text-gray-800">{match.homeTeam}</span>
              {match.homeScore !== undefined && (
                <span className={`text-3xl font-black ${theme.scoreColor}`}>
                  {match.homeScore}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xl text-gray-800">{match.awayTeam}</span>
              {match.awayScore !== undefined && (
                <span className={`text-3xl font-black ${theme.scoreColor}`}>
                  {match.awayScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="border-t-2 border-gray-100 pt-4 space-y-3">
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-5 h-5 mr-3 text-gray-500" />
            <span className="font-medium">{match.date} at {match.time}</span>
          </div>
          {match.venue && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-5 h-5 mr-3 text-gray-500" />
              <span className="font-medium">{match.venue}</span>
            </div>
          )}
          {canShowAnalysis && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className={`flex items-center space-x-2 text-sm font-semibold ${theme.iconColor} group-hover:scale-105 transition-transform duration-300`}>
                <BarChart3 className="w-4 h-4" />
                <span>Click for detailed match analysis</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};