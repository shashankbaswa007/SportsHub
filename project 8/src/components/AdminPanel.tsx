import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sport, Match } from '../types';
import { 
  footballMatches, 
  tableTennisMatches, 
  basketballMatches, 
  volleyballMatches, 
  throwballMatches, 
  badmintonMatches, 
  kabaddiMatches,
  footballTopPerformers,
  tableTennisTopPerformers,
  basketballTopPerformers,
  volleyballTopPerformers,
  throwballTopPerformers,
  badmintonTopPerformers,
  kabaddiTopPerformers
} from '../data/mockData';
import { X, Settings, Save, Plus, Trash2, Users, BarChart3, Filter } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onDataUpdate }) => {
  const { authState } = useAuth();
  const [selectedSport, setSelectedSport] = useState<Sport>('football');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingStats, setEditingStats] = useState(false);
  const [editingPlayers, setEditingPlayers] = useState(false);

  // Check if user is admin
  const isAdmin = authState.user?.username === '160123771030';

  useEffect(() => {
    if (isOpen) {
      loadMatches();
    }
  }, [selectedSport, isOpen]);

  const loadMatches = () => {
    let sportMatches: Match[] = [];
    switch (selectedSport) {
      case 'football': sportMatches = [...footballMatches]; break;
      case 'tabletennis': sportMatches = [...tableTennisMatches]; break;
      case 'basketball': sportMatches = [...basketballMatches]; break;
      case 'volleyball': sportMatches = [...volleyballMatches]; break;
      case 'throwball': sportMatches = [...throwballMatches]; break;
      case 'badminton': sportMatches = [...badmintonMatches]; break;
      case 'kabaddi': sportMatches = [...kabaddiMatches]; break;
    }
    setMatches(sportMatches);
    setSelectedMatch(null);
  };

  const updateMatchData = (updatedMatch: Match) => {
    // Update the match in the appropriate array
    switch (selectedSport) {
      case 'football':
        const footballIndex = footballMatches.findIndex(m => m.id === updatedMatch.id);
        if (footballIndex !== -1) footballMatches[footballIndex] = updatedMatch;
        break;
      case 'tabletennis':
        const tableTennisIndex = tableTennisMatches.findIndex(m => m.id === updatedMatch.id);
        if (tableTennisIndex !== -1) tableTennisMatches[tableTennisIndex] = updatedMatch;
        break;
      case 'basketball':
        const basketballIndex = basketballMatches.findIndex(m => m.id === updatedMatch.id);
        if (basketballIndex !== -1) basketballMatches[basketballIndex] = updatedMatch;
        break;
      case 'volleyball':
        const volleyballIndex = volleyballMatches.findIndex(m => m.id === updatedMatch.id);
        if (volleyballIndex !== -1) volleyballMatches[volleyballIndex] = updatedMatch;
        break;
      case 'throwball':
        const throwballIndex = throwballMatches.findIndex(m => m.id === updatedMatch.id);
        if (throwballIndex !== -1) throwballMatches[throwballIndex] = updatedMatch;
        break;
      case 'badminton':
        const badmintonIndex = badmintonMatches.findIndex(m => m.id === updatedMatch.id);
        if (badmintonIndex !== -1) badmintonMatches[badmintonIndex] = updatedMatch;
        break;
      case 'kabaddi':
        const kabaddiIndex = kabaddiMatches.findIndex(m => m.id === updatedMatch.id);
        if (kabaddiIndex !== -1) kabaddiMatches[kabaddiIndex] = updatedMatch;
        break;
    }
    
    // Update local state
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    setSelectedMatch(updatedMatch);
    
    // Notify parent component to refresh data
    onDataUpdate();
  };

  const getSportTheme = () => {
    switch (selectedSport) {
      case 'football': return { bg: 'from-green-600 to-emerald-600', text: 'text-green-600' };
      case 'tabletennis': return { bg: 'from-blue-600 to-indigo-600', text: 'text-blue-600' };
      case 'basketball': return { bg: 'from-orange-600 to-amber-600', text: 'text-orange-600' };
      case 'volleyball': return { bg: 'from-purple-600 to-violet-600', text: 'text-purple-600' };
      case 'throwball': return { bg: 'from-red-600 to-rose-600', text: 'text-red-600' };
      case 'badminton': return { bg: 'from-yellow-600 to-amber-600', text: 'text-yellow-600' };
      case 'kabaddi': return { bg: 'from-teal-600 to-cyan-600', text: 'text-teal-600' };
      default: return { bg: 'from-gray-600 to-slate-600', text: 'text-gray-600' };
    }
  };

  if (!isOpen || !isAdmin) return null;

  const theme = getSportTheme();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-gray-50 to-indigo-50/30 rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.bg} text-white p-8 rounded-t-3xl relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-8 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Admin Panel</h2>
                <p className="text-indigo-100 font-medium">Manage match statistics and player performances</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Sport Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-4 mb-4">
              <Filter className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Sport Selection</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {(['football', 'tabletennis', 'basketball', 'volleyball', 'throwball', 'badminton', 'kabaddi'] as Sport[]).map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                    selectedSport === sport
                      ? `bg-gradient-to-r ${getSportTheme().bg} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Match Selection */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-4 mb-6">
              <BarChart3 className={`w-6 h-6 ${theme.text}`} />
              <h3 className="text-xl font-bold text-gray-800">Select Match to Edit</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedMatch?.id === match.id
                      ? `border-current ${theme.text} bg-gradient-to-r from-blue-50 to-indigo-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-gray-800 mb-2">
                    {match.homeTeam} vs {match.awayTeam}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {match.date} • {match.status}
                  </div>
                  {match.homeScore !== undefined && match.awayScore !== undefined && (
                    <div className={`text-lg font-bold ${theme.text}`}>
                      {match.homeScore} - {match.awayScore}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Match Editor */}
          {selectedMatch && (
            <div className="space-y-6">
              {/* Basic Match Info */}
              <MatchInfoEditor 
                match={selectedMatch} 
                sport={selectedSport}
                onUpdate={updateMatchData}
                theme={theme}
              />

              {/* Match Statistics */}
              <MatchStatsEditor 
                match={selectedMatch} 
                sport={selectedSport}
                onUpdate={updateMatchData}
                theme={theme}
              />

              {/* Player Performances */}
              <PlayerPerformanceEditor 
                match={selectedMatch} 
                sport={selectedSport}
                onUpdate={updateMatchData}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Match Info Editor Component
const MatchInfoEditor: React.FC<{
  match: Match;
  sport: Sport;
  onUpdate: (match: Match) => void;
  theme: any;
}> = ({ match, sport, onUpdate, theme }) => {
  const [editedMatch, setEditedMatch] = useState(match);

  const handleSave = () => {
    onUpdate(editedMatch);
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <BarChart3 className={`w-6 h-6 ${theme.text}`} />
          <h3 className="text-xl font-bold text-gray-800">Match Information</h3>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 bg-gradient-to-r ${theme.bg} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2`}
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Home Score</label>
          <input
            type="number"
            value={editedMatch.homeScore || ''}
            onChange={(e) => setEditedMatch({
              ...editedMatch,
              homeScore: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Home Score"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Away Score</label>
          <input
            type="number"
            value={editedMatch.awayScore || ''}
            onChange={(e) => setEditedMatch({
              ...editedMatch,
              awayScore: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Away Score"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <select
            value={editedMatch.status}
            onChange={(e) => setEditedMatch({
              ...editedMatch,
              status: e.target.value as 'live' | 'upcoming' | 'completed'
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Venue</label>
          <input
            type="text"
            value={editedMatch.venue || ''}
            onChange={(e) => setEditedMatch({
              ...editedMatch,
              venue: e.target.value
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Venue"
          />
        </div>
      </div>
    </div>
  );
};

// Match Stats Editor Component
const MatchStatsEditor: React.FC<{
  match: Match;
  sport: Sport;
  onUpdate: (match: Match) => void;
  theme: any;
}> = ({ match, sport, onUpdate, theme }) => {
  const [editedMatch, setEditedMatch] = useState(match);

  const handleSave = () => {
    onUpdate(editedMatch);
  };

  const getStatsFields = () => {
    switch (sport) {
      case 'football':
        return [
          { key: 'possession', label: 'Possession %', max: 100 },
          { key: 'shots', label: 'Shots' },
          { key: 'shotsOnTarget', label: 'Shots on Target' },
          { key: 'corners', label: 'Corners' },
          { key: 'fouls', label: 'Fouls' },
          { key: 'yellowCards', label: 'Yellow Cards' },
          { key: 'redCards', label: 'Red Cards' }
        ];
      case 'tabletennis':
        return [
          { key: 'aces', label: 'Aces' },
          { key: 'winners', label: 'Winners' },
          { key: 'unforced_errors', label: 'Unforced Errors' },
          { key: 'break_points', label: 'Break Points' }
        ];
      case 'basketball':
        return [
          { key: 'field_goals', label: 'Field Goals' },
          { key: 'three_pointers', label: '3-Pointers' },
          { key: 'free_throws', label: 'Free Throws' },
          { key: 'rebounds', label: 'Rebounds' },
          { key: 'assists', label: 'Assists' },
          { key: 'steals', label: 'Steals' },
          { key: 'blocks', label: 'Blocks' }
        ];
      case 'volleyball':
        return [
          { key: 'kills', label: 'Kills' },
          { key: 'attacks', label: 'Attacks' },
          { key: 'serves', label: 'Serves' },
          { key: 'digs', label: 'Digs' },
          { key: 'blocks_volleyball', label: 'Blocks' }
        ];
      case 'throwball':
        return [
          { key: 'catches', label: 'Catches' },
          { key: 'throws', label: 'Throws' },
          { key: 'successful_throws', label: 'Successful Throws' },
          { key: 'interceptions', label: 'Interceptions' }
        ];
      case 'badminton':
        return [
          { key: 'smashes', label: 'Smashes' },
          { key: 'clears', label: 'Clears' },
          { key: 'drops', label: 'Drops' },
          { key: 'net_shots', label: 'Net Shots' }
        ];
      case 'kabaddi':
        return [
          { key: 'raid_points', label: 'Raid Points' },
          { key: 'tackle_points', label: 'Tackle Points' },
          { key: 'bonus_points', label: 'Bonus Points' },
          { key: 'all_outs', label: 'All Outs' }
        ];
      default:
        return [];
    }
  };

  const updateStats = (team: 'home' | 'away', field: string, value: number) => {
    const statsKey = team === 'home' ? 'homeStats' : 'awayStats';
    setEditedMatch({
      ...editedMatch,
      [statsKey]: {
        ...editedMatch[statsKey],
        [field]: value
      }
    });
  };

  const statsFields = getStatsFields();

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <BarChart3 className={`w-6 h-6 ${theme.text}`} />
          <h3 className="text-xl font-bold text-gray-800">Match Statistics</h3>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 bg-gradient-to-r ${theme.bg} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2`}
        >
          <Save className="w-5 h-5" />
          <span>Save Stats</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Home Team Stats */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-gray-800">{match.homeTeam} Stats</h4>
          <div className="space-y-4">
            {statsFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                <input
                  type="number"
                  value={editedMatch.homeStats?.[field.key as keyof typeof editedMatch.homeStats] || ''}
                  onChange={(e) => updateStats('home', field.key, parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={field.label}
                  max={field.max}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Away Team Stats */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-gray-800">{match.awayTeam} Stats</h4>
          <div className="space-y-4">
            {statsFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                <input
                  type="number"
                  value={editedMatch.awayStats?.[field.key as keyof typeof editedMatch.awayStats] || ''}
                  onChange={(e) => updateStats('away', field.key, parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={field.label}
                  max={field.max}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Player Performance Editor Component
const PlayerPerformanceEditor: React.FC<{
  match: Match;
  sport: Sport;
  onUpdate: (match: Match) => void;
  theme: any;
}> = ({ match, sport, onUpdate, theme }) => {
  const [homePerformers, setHomePerformers] = useState(() => {
    const performers = getTopPerformers(sport, match.id);
    return performers?.home || [];
  });
  
  const [awayPerformers, setAwayPerformers] = useState(() => {
    const performers = getTopPerformers(sport, match.id);
    return performers?.away || [];
  });

  function getTopPerformers(sport: Sport, matchId: string) {
    switch (sport) {
      case 'football': return footballTopPerformers[matchId];
      case 'tabletennis': return tableTennisTopPerformers[matchId];
      case 'basketball': return basketballTopPerformers[matchId];
      case 'volleyball': return volleyballTopPerformers[matchId];
      case 'throwball': return throwballTopPerformers[matchId];
      case 'badminton': return badmintonTopPerformers[matchId];
      case 'kabaddi': return kabaddiTopPerformers[matchId];
      default: return null;
    }
  }

  const handleSave = () => {
    // Update the top performers data
    const performersData = { home: homePerformers, away: awayPerformers };
    
    switch (sport) {
      case 'football': footballTopPerformers[match.id] = performersData; break;
      case 'tabletennis': tableTennisTopPerformers[match.id] = performersData; break;
      case 'basketball': basketballTopPerformers[match.id] = performersData; break;
      case 'volleyball': volleyballTopPerformers[match.id] = performersData; break;
      case 'throwball': throwballTopPerformers[match.id] = performersData; break;
      case 'badminton': badmintonTopPerformers[match.id] = performersData; break;
      case 'kabaddi': kabaddiTopPerformers[match.id] = performersData; break;
    }
    
    onUpdate(match);
  };

  const addPlayer = (team: 'home' | 'away') => {
    const newPlayer = {
      name: '',
      position: '',
      rating: 7.0,
      goals: 0,
      assists: 0,
      points_won: 0,
      aces: 0,
      winners: 0,
      points: 0,
      rebounds: 0,
      assists_basketball: 0,
      kills: 0,
      digs: 0,
      blocks_volleyball: 0,
      catches: 0,
      successful_throws: 0,
      smashes: 0,
      raid_points: 0,
      tackle_points: 0
    };

    if (team === 'home') {
      setHomePerformers([...homePerformers, newPlayer]);
    } else {
      setAwayPerformers([...awayPerformers, newPlayer]);
    }
  };

  const removePlayer = (team: 'home' | 'away', index: number) => {
    if (team === 'home') {
      setHomePerformers(homePerformers.filter((_, i) => i !== index));
    } else {
      setAwayPerformers(awayPerformers.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (team: 'home' | 'away', index: number, field: string, value: any) => {
    if (team === 'home') {
      const updated = [...homePerformers];
      updated[index] = { ...updated[index], [field]: value };
      setHomePerformers(updated);
    } else {
      const updated = [...awayPerformers];
      updated[index] = { ...updated[index], [field]: value };
      setAwayPerformers(updated);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Users className={`w-6 h-6 ${theme.text}`} />
          <h3 className="text-xl font-bold text-gray-800">Player Performances</h3>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 bg-gradient-to-r ${theme.bg} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2`}
        >
          <Save className="w-5 h-5" />
          <span>Save Players</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Home Team Players */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg text-gray-800">{match.homeTeam} Players</h4>
            <button
              onClick={() => addPlayer('home')}
              className={`px-4 py-2 bg-gradient-to-r ${theme.bg} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Player</span>
            </button>
          </div>
          <div className="space-y-4">
            {homePerformers.map((player, index) => (
              <PlayerEditor
                key={index}
                player={player}
                sport={sport}
                onUpdate={(field, value) => updatePlayer('home', index, field, value)}
                onRemove={() => removePlayer('home', index)}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Away Team Players */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg text-gray-800">{match.awayTeam} Players</h4>
            <button
              onClick={() => addPlayer('away')}
              className={`px-4 py-2 bg-gradient-to-r ${theme.bg} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Player</span>
            </button>
          </div>
          <div className="space-y-4">
            {awayPerformers.map((player, index) => (
              <PlayerEditor
                key={index}
                player={player}
                sport={sport}
                onUpdate={(field, value) => updatePlayer('away', index, field, value)}
                onRemove={() => removePlayer('away', index)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Player Editor Component
const PlayerEditor: React.FC<{
  player: any;
  sport: Sport;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  theme: any;
}> = ({ player, sport, onUpdate, onRemove, theme }) => {
  const getPlayerFields = () => {
    switch (sport) {
      case 'football':
        return [
          { key: 'goals', label: 'Goals', type: 'number' },
          { key: 'assists', label: 'Assists', type: 'number' }
        ];
      case 'tabletennis':
        return [
          { key: 'points_won', label: 'Points Won', type: 'number' },
          { key: 'aces', label: 'Aces', type: 'number' },
          { key: 'winners', label: 'Winners', type: 'number' }
        ];
      case 'basketball':
        return [
          { key: 'points', label: 'Points', type: 'number' },
          { key: 'rebounds', label: 'Rebounds', type: 'number' },
          { key: 'assists_basketball', label: 'Assists', type: 'number' }
        ];
      case 'volleyball':
        return [
          { key: 'kills', label: 'Kills', type: 'number' },
          { key: 'digs', label: 'Digs', type: 'number' },
          { key: 'blocks_volleyball', label: 'Blocks', type: 'number' }
        ];
      case 'throwball':
        return [
          { key: 'catches', label: 'Catches', type: 'number' },
          { key: 'successful_throws', label: 'Successful Throws', type: 'number' }
        ];
      case 'badminton':
        return [
          { key: 'smashes', label: 'Smashes', type: 'number' }
        ];
      case 'kabaddi':
        return [
          { key: 'raid_points', label: 'Raid Points', type: 'number' },
          { key: 'tackle_points', label: 'Tackle Points', type: 'number' }
        ];
      default:
        return [];
    }
  };

  const playerFields = getPlayerFields();

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-semibold text-gray-800">Player Details</h5>
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={player.name || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Player Name"
          />
        </div>

        {sport !== 'tabletennis' && sport !== 'badminton' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={player.position || ''}
              onChange={(e) => onUpdate('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Position"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={player.rating || ''}
            onChange={(e) => onUpdate('rating', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rating"
          />
        </div>

        {playerFields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <input
              type={field.type}
              value={player[field.key] || ''}
              onChange={(e) => onUpdate(field.key, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
};