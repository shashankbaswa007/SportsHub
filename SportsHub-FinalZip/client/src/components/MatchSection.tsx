import React, { useState } from 'react';
import { Match, Sport } from '../types';
import { MatchCard } from './MatchCard';
import { MatchAnalysisModal } from './MatchAnalysisModal';

interface MatchSectionProps {
  title: string;
  matches: Match[];
  sport: Sport;
  icon: React.ReactNode;
}

export const MatchSection: React.FC<MatchSectionProps> = ({ title, matches, sport, icon }) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (matches.length === 0) {
    return null;
  }

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const getSportTheme = () => {
    switch (sport) {
      case 'football': return { sectionBg: 'bg-green-100', badgeColor: 'bg-green-100 text-green-800' };
      case 'tabletennis': return { sectionBg: 'bg-blue-100', badgeColor: 'bg-blue-100 text-blue-800' };
      case 'basketball': return { sectionBg: 'bg-orange-100', badgeColor: 'bg-orange-100 text-orange-800' };
      case 'volleyball': return { sectionBg: 'bg-purple-100', badgeColor: 'bg-purple-100 text-purple-800' };
      case 'throwball': return { sectionBg: 'bg-red-100', badgeColor: 'bg-red-100 text-red-800' };
      case 'badminton': return { sectionBg: 'bg-yellow-100', badgeColor: 'bg-yellow-100 text-yellow-800' };
      case 'kabaddi': return { sectionBg: 'bg-teal-100', badgeColor: 'bg-teal-100 text-teal-800' };
      default: return { sectionBg: 'bg-gray-100', badgeColor: 'bg-gray-100 text-gray-800' };
    }
  };

  const theme = getSportTheme();

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-lg ${theme.sectionBg}`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme.badgeColor}`}>
          {matches.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            sport={sport} 
            onClick={() => handleMatchClick(match)}
          />
        ))}
      </div>

      {selectedMatch && (
        <MatchAnalysisModal
          match={selectedMatch}
          sport={sport}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};