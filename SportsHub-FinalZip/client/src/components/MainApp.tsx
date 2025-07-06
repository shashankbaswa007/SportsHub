import React, { useState, useMemo } from 'react';
import { Sport } from '../types';
import { SportHeader } from './SportHeader';
import { MatchSection } from './MatchSection';
import { StandingsTable } from './StandingsTable';
import { SettingsModal } from './SettingsModal';
import { AdminPanel } from './AdminPanel';
import { useAuth } from '../contexts/AuthContext';
import { 
  footballMatches, 
  tableTennisMatches, 
  basketballMatches, 
  volleyballMatches, 
  throwballMatches, 
  badmintonMatches, 
  kabaddiMatches 
} from '../data/mockData';
import { calculateStandings } from '../utils/standingsCalculator';
import { Play, Clock, CheckCircle, Settings, Shield } from 'lucide-react';

export const MainApp: React.FC = () => {
  const { authState } = useAuth();
  const [currentSport, setCurrentSport] = useState<Sport>('football');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Check if user is admin
  const isAdmin = authState.user?.username === '160123771030';

  const getMatches = () => {
    switch (currentSport) {
      case 'football': return footballMatches;
      case 'tabletennis': return tableTennisMatches;
      case 'basketball': return basketballMatches;
      case 'volleyball': return volleyballMatches;
      case 'throwball': return throwballMatches;
      case 'badminton': return badmintonMatches;
      case 'kabaddi': return kabaddiMatches;
      default: return footballMatches;
    }
  };

  const matches = getMatches();
  
  // Calculate standings dynamically from match results
  const standings = useMemo(() => {
    return calculateStandings(matches, currentSport);
  }, [matches, currentSport, dataVersion]);

  const liveMatches = matches.filter(match => match.status === 'live');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');

  const handleDataUpdate = () => {
    setDataVersion(prev => prev + 1);
  };

  const getSportTheme = () => {
    switch (currentSport) {
      case 'football':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative overflow-hidden',
          iconColor: 'text-green-600'
        };
      case 'tabletennis':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-cyan-900 relative overflow-hidden',
          iconColor: 'text-blue-600'
        };
      case 'basketball':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-orange-900 relative overflow-hidden',
          iconColor: 'text-orange-600'
        };
      case 'volleyball':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 relative overflow-hidden',
          iconColor: 'text-purple-600'
        };
      case 'throwball':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-red-900 relative overflow-hidden',
          iconColor: 'text-red-600'
        };
      case 'badminton':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-yellow-900 via-amber-900 to-yellow-900 relative overflow-hidden',
          iconColor: 'text-yellow-600'
        };
      case 'kabaddi':
        return {
          bg: 'min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-900 relative overflow-hidden',
          iconColor: 'text-teal-600'
        };
      default:
        return {
          bg: 'min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getSportBackground = () => {
    switch (currentSport) {
      case 'football':
        return (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-0 w-16 h-24 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-16 h-24 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-0 w-32 h-48 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-32 h-48 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-2 border-white border-t-0 border-l-0 rounded-br-full"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-2 border-white border-t-0 border-r-0 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-2 border-white border-b-0 border-l-0 rounded-tr-full"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-2 border-white border-b-0 border-r-0 rounded-tl-full"></div>
            </div>
          </div>
        );
      case 'tabletennis':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 w-96 h-48 border-4 border-white rounded-lg transform -translate-x-1/2 -translate-y-1/2">
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white transform -translate-x-1/2"></div>
              <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-white opacity-60"></div>
              <div className="absolute top-0 bottom-0 right-1/4 w-0.5 bg-white opacity-60"></div>
            </div>
            <div className="absolute top-20 left-20 w-4 h-4 bg-white rounded-full shadow-lg"></div>
            <div className="absolute top-32 right-24 w-3 h-3 bg-white rounded-full shadow-lg"></div>
            <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-white rounded-full shadow-lg"></div>
          </div>
        );
      case 'basketball':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-3 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-8 w-16 h-32 border-2 border-white rounded-t-full"></div>
            <div className="absolute top-1/2 right-8 w-16 h-32 border-2 border-white rounded-t-full"></div>
            <div className="absolute top-12 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
            <div className="absolute bottom-12 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
          </div>
        );
      case 'volleyball':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/4 left-1/4 w-20 h-20 border-3 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-16 right-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-16 left-16 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
        );
      case 'throwball':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
            <div className="absolute top-1/4 left-1/4 w-24 h-24 border-3 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-12 right-12 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-12 left-12 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/3 left-1/2 w-8 h-8 border-2 border-white rounded-full transform -translate-x-1/2"></div>
          </div>
        );
      case 'badminton':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
            <div className="absolute top-16 left-16 transform rotate-45">
              <div className="w-16 h-20 bg-white rounded-full border-4 border-white opacity-80"></div>
              <div className="w-2 h-12 bg-white mx-auto -mt-2"></div>
            </div>
            <div className="absolute bottom-20 right-16 transform -rotate-12">
              <div className="w-14 h-18 bg-white rounded-full border-4 border-white opacity-70"></div>
              <div className="w-2 h-10 bg-white mx-auto -mt-2"></div>
            </div>
            <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white rounded-full"></div>
          </div>
        );
      case 'kabaddi':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white transform -translate-y-1/2"></div>
            <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white opacity-60"></div>
            <div className="absolute bottom-1/4 left-0 right-0 h-0.5 bg-white opacity-60"></div>
            <div className="absolute top-16 left-16 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-16 right-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/3 right-1/4 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/4 w-24 h-24 border-2 border-white rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const theme = getSportTheme();

  return (
    <div className={theme.bg}>
      {getSportBackground()}
      
      <div className="relative z-10">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/30 transition-all duration-300 transform hover:scale-110 group"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Admin Panel Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-full backdrop-blur-sm border border-purple-400/30 transition-all duration-300 transform hover:scale-110 group"
              title="Admin Panel"
            >
              <Shield className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
        </div>

        <SportHeader currentSport={currentSport} onSportChange={setCurrentSport} />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Message */}
          {authState.user && (
            <div className="mb-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome back, {authState.user.username}!
                  {isAdmin && <span className="ml-2 text-yellow-300">(Admin)</span>}
                </h2>
                <p className="text-gray-200">
                  Stay updated with the latest sports action at CBIT
                </p>
              </div>
            </div>
          )}

          {/* Live Matches */}
          <MatchSection
            title="Live Matches"
            matches={liveMatches}
            sport={currentSport}
            icon={<Play className={`w-6 h-6 ${theme.iconColor}`} />}
          />

          {/* Upcoming Matches */}
          <MatchSection
            title="Upcoming Matches"
            matches={upcomingMatches}
            sport={currentSport}
            icon={<Clock className={`w-6 h-6 ${theme.iconColor}`} />}
          />

          {/* Completed Matches */}
          <MatchSection
            title="Recent Results"
            matches={completedMatches}
            sport={currentSport}
            icon={<CheckCircle className={`w-6 h-6 ${theme.iconColor}`} />}
          />

          {/* Standings Table */}
          <div className="mt-12">
            <StandingsTable standings={standings} sport={currentSport} />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Admin Panel */}
      {isAdmin && (
        <AdminPanel 
          isOpen={isAdminPanelOpen} 
          onClose={() => setIsAdminPanelOpen(false)}
          onDataUpdate={handleDataUpdate}
        />
      )}
    </div>
  );
};