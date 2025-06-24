import React from 'react';
import { Sport } from '../types';
import { Zap, Crown, Trophy, Target, Circle, Flame, Shield } from 'lucide-react';

interface SportHeaderProps {
  currentSport: Sport;
  onSportChange: (sport: Sport) => void;
}

export const SportHeader: React.FC<SportHeaderProps> = ({ currentSport, onSportChange }) => {
  const getSportConfig = (sport: Sport) => {
    switch (sport) {
      case 'football':
        return {
          title: 'Football Championship',
          subtitle: 'Live scores • Standings • Match analysis',
          icon: <Crown className="w-10 h-10 text-green-300" />,
          bgGradient: 'bg-gradient-to-r from-green-800 via-emerald-700 to-green-900',
          buttonBg: 'bg-green-500/10 border border-green-400/20',
          activeButton: 'bg-green-600 text-white shadow-2xl scale-105 border-2 border-green-400',
          iconBg: 'bg-green-500/20 border-2 border-green-400/30'
        };
      case 'tabletennis':
        return {
          title: 'Table Tennis Championship',
          subtitle: 'Tournament tracker • Live results • Player stats',
          icon: <Zap className="w-10 h-10 text-blue-300" />,
          bgGradient: 'bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900',
          buttonBg: 'bg-blue-500/10 border border-blue-400/20',
          activeButton: 'bg-blue-600 text-white shadow-2xl scale-105 border-2 border-blue-400',
          iconBg: 'bg-blue-500/20 border-2 border-blue-400/30'
        };
      case 'basketball':
        return {
          title: 'Basketball League',
          subtitle: 'Live games • Team standings • Player statistics',
          icon: <Circle className="w-10 h-10 text-orange-300" />,
          bgGradient: 'bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900',
          buttonBg: 'bg-orange-500/10 border border-orange-400/20',
          activeButton: 'bg-orange-600 text-white shadow-2xl scale-105 border-2 border-orange-400',
          iconBg: 'bg-orange-500/20 border-2 border-orange-400/30'
        };
      case 'volleyball':
        return {
          title: 'Volleyball Tournament',
          subtitle: 'Match results • Team rankings • Performance stats',
          icon: <Trophy className="w-10 h-10 text-purple-300" />,
          bgGradient: 'bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900',
          buttonBg: 'bg-purple-500/10 border border-purple-400/20',
          activeButton: 'bg-purple-600 text-white shadow-2xl scale-105 border-2 border-purple-400',
          iconBg: 'bg-purple-500/20 border-2 border-purple-400/30'
        };
      case 'throwball':
        return {
          title: 'Throwball Championship',
          subtitle: 'Live matches • League table • Team analysis',
          icon: <Target className="w-10 h-10 text-red-300" />,
          bgGradient: 'bg-gradient-to-r from-red-800 via-rose-700 to-red-900',
          buttonBg: 'bg-red-500/10 border border-red-400/20',
          activeButton: 'bg-red-600 text-white shadow-2xl scale-105 border-2 border-red-400',
          iconBg: 'bg-red-500/20 border-2 border-red-400/30'
        };
      case 'badminton':
        return {
          title: 'Badminton Tournament',
          subtitle: 'Tournament brackets • Match scores • Player rankings',
          icon: <Flame className="w-10 h-10 text-yellow-300" />,
          bgGradient: 'bg-gradient-to-r from-yellow-800 via-amber-700 to-yellow-900',
          buttonBg: 'bg-yellow-500/10 border border-yellow-400/20',
          activeButton: 'bg-yellow-600 text-white shadow-2xl scale-105 border-2 border-yellow-400',
          iconBg: 'bg-yellow-500/20 border-2 border-yellow-400/30'
        };
      case 'kabaddi':
        return {
          title: 'Kabaddi League',
          subtitle: 'Live raids • Team standings • Player performance',
          icon: <Shield className="w-10 h-10 text-teal-300" />,
          bgGradient: 'bg-gradient-to-r from-teal-800 via-cyan-700 to-teal-900',
          buttonBg: 'bg-teal-500/10 border border-teal-400/20',
          activeButton: 'bg-teal-600 text-white shadow-2xl scale-105 border-2 border-teal-400',
          iconBg: 'bg-teal-500/20 border-2 border-teal-400/30'
        };
      default:
        return {
          title: 'Sports Championship',
          subtitle: 'Live scores • Standings • Analysis',
          icon: <Trophy className="w-10 h-10 text-gray-300" />,
          bgGradient: 'bg-gradient-to-r from-gray-800 via-slate-700 to-gray-900',
          buttonBg: 'bg-gray-500/10 border border-gray-400/20',
          activeButton: 'bg-gray-600 text-white shadow-2xl scale-105 border-2 border-gray-400',
          iconBg: 'bg-gray-500/20 border-2 border-gray-400/30'
        };
    }
  };

  const config = getSportConfig(currentSport);

  const getHeaderPattern = () => {
    switch (currentSport) {
      case 'football':
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 right-8 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-white rounded-full"></div>
            <div className="absolute top-6 right-1/3 w-6 h-6 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-30"></div>
          </div>
        );
      case 'tabletennis':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-6 left-12 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-8 right-16 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute top-4 right-20 transform rotate-45">
              <div className="w-8 h-10 bg-white rounded-full border-2 border-white opacity-60"></div>
              <div className="w-1 h-6 bg-white mx-auto -mt-1"></div>
            </div>
          </div>
        );
      case 'basketball':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-8 left-16 w-16 h-16 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-12 right-20 w-12 h-12 border-3 border-white rounded-full"></div>
            <div className="absolute top-1/3 right-1/4 w-8 h-8 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/3 w-6 h-6 border-2 border-white rounded-full"></div>
          </div>
        );
      case 'volleyball':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-1/2 left-1/2 w-20 h-20 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-8 left-12 w-8 h-8 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-8 right-12 w-6 h-6 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/4 right-1/4 w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
        );
      case 'throwball':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-6 left-8 w-12 h-12 border-3 border-white rounded-full"></div>
            <div className="absolute bottom-8 right-16 w-10 h-10 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-6 h-6 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/4 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
        );
      case 'badminton':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-8 left-16 transform rotate-45">
              <div className="w-12 h-16 border-3 border-white rounded-full"></div>
              <div className="w-2 h-12 bg-white mx-auto -mt-2"></div>
            </div>
            <div className="absolute bottom-12 right-20 transform -rotate-12">
              <div className="w-10 h-14 border-2 border-white rounded-full"></div>
              <div className="w-1.5 h-10 bg-white mx-auto -mt-1"></div>
            </div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white rounded-full"></div>
          </div>
        );
      case 'kabaddi':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white opacity-40"></div>
            <div className="absolute top-8 left-12 w-8 h-8 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-8 right-12 w-6 h-6 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/4 right-1/4 w-10 h-10 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const sports = [
    { key: 'football', label: 'Football' },
    { key: 'tabletennis', label: 'Table Tennis' },
    { key: 'basketball', label: 'Basketball' },
    { key: 'volleyball', label: 'Volleyball' },
    { key: 'throwball', label: 'Throwball' },
    { key: 'badminton', label: 'Badminton' },
    { key: 'kabaddi', label: 'Kabaddi' }
  ];

  return (
    <div className={`${config.bgGradient} text-white py-12 relative overflow-hidden`}>
      {getHeaderPattern()}

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className={`p-4 rounded-full backdrop-blur-sm ${config.iconBg}`}>
              {config.icon}
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-2 tracking-tight">CBIT SportsHub</h1>
              <h2 className="text-2xl font-semibold mb-2 text-gray-200">{config.title}</h2>
              <p className="text-lg text-gray-300 font-medium">{config.subtitle}</p>
            </div>
          </div>
          
          <div className={`flex flex-wrap justify-center gap-3 p-4 rounded-2xl backdrop-blur-sm ${config.buttonBg}`}>
            {sports.map((sport) => (
              <button
                key={sport.key}
                onClick={() => onSportChange(sport.key as Sport)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                  currentSport === sport.key
                    ? getSportConfig(sport.key as Sport).activeButton
                    : 'text-gray-200 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};