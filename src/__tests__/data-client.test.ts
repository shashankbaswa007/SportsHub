import { calculatePointsTable, recalculateMatchScores, getDefaultScoreDetails } from '@/lib/data-client';
import { getDoc, getDocs, updateDoc, writeBatch, collection, query, where, documentId, doc } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(),
  })),
  query: jest.fn(),
  where: jest.fn(),
  documentId: jest.fn(),
  addDoc: jest.fn(),
}));

describe('Data Client - Scoring Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultScoreDetails', () => {
    it('returns empty object for Football/Basketball', () => {
      expect(getDefaultScoreDetails('Football')).toEqual({});
      expect(getDefaultScoreDetails('Basketball')).toEqual({});
    });

    it('returns dual innings structure for Cricket', () => {
      expect(getDefaultScoreDetails('Cricket')).toEqual({
        teamA: { runs: 0, wickets: 0, overs: 0 },
        teamB: { runs: 0, wickets: 0, overs: 0 }
      });
    });

    it('returns set structures for Badminton/Volleyball', () => {
      const badmintonSets = getDefaultScoreDetails('Badminton (Singles)');
      expect(Array.isArray(badmintonSets)).toBe(true);
      expect(badmintonSets).toHaveLength(3);
      expect((badmintonSets as any)[0]).toEqual({ set: 1, teamAScore: 0, teamBScore: 0 });
    });
  });

  describe('calculatePointsTable', () => {
    it('calculates points correctly for wins, losses, and draws', async () => {
      const mockMatches = [
        { id: 'm1', teamAId: 't1', teamBId: 't2', teamAScore: 2, teamBScore: 1, status: 'COMPLETED' }, // t1 wins
        { id: 'm2', teamAId: 't2', teamBId: 't3', teamAScore: 1, teamBScore: 1, status: 'COMPLETED' }, // draw
        { id: 'm3', teamAId: 't3', teamBId: 't1', teamAScore: 0, teamBScore: 3, status: 'COMPLETED' }, // t1 wins
      ];
      const mockTeams = [
        { id: 't1', name: 'Team Alpha' },
        { id: 't2', name: 'Team Beta' },
        { id: 't3', name: 'Team Gamma' },
      ];

      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ docs: mockMatches.map(m => ({ id: m.id, data: () => m })) })
        .mockResolvedValueOnce({ docs: mockTeams.map(t => ({ id: t.id, data: () => t })) });

      const table = await calculatePointsTable({} as any, 'Football');

      expect(table).toHaveLength(3);
      
      // Team 1 should have 2 wins, 0 draws, 4 points
      const team1 = table.find(t => t.teamId === 't1');
      expect(team1?.played).toBe(2);
      expect(team1?.won).toBe(2);
      expect(team1?.points).toBe(4);
      expect(team1?.rank).toBe(1);

      // Team 2 should have 0 wins, 1 loss, 1 draw, 1 point
      const team2 = table.find(t => t.teamId === 't2');
      expect(team2?.points).toBe(1);

      // Team 3 should have 0 wins, 1 loss, 1 draw, 1 point
      const team3 = table.find(t => t.teamId === 't3');
      expect(team3?.points).toBe(1);
    });

    it('returns empty array if no matches found', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
      const table = await calculatePointsTable({} as any, 'Football');
      expect(table).toEqual([]);
    });
  });

  describe('recalculateMatchScores', () => {
    it('calculates Football score correctly from player Goals', async () => {
      const mockMatch = { id: 'm1', sport: 'Football', teamAId: 't1', teamBId: 't2', scoreDetails: {} };
      const teamAPlayers = [
        { id: 'p1', stats: { 'Goals': 2 } },
        { id: 'p2', stats: { 'Goals': 1 } },
      ];
      const teamBPlayers = [
        { id: 'p3', stats: { 'Goals': 0 } },
      ];

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'm1',
        data: () => mockMatch
      });

      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ docs: teamAPlayers.map(p => ({ id: p.id, data: () => p })) })
        .mockResolvedValueOnce({ docs: teamBPlayers.map(p => ({ id: p.id, data: () => p })) });

      await recalculateMatchScores({} as any, 'm1');

      expect(updateDoc).toHaveBeenCalledWith(
        undefined, // doc() returns undefined because it's mocked trivially
        expect.objectContaining({
          teamAScore: 3,
          teamBScore: 0,
        })
      );
    });

    it('calculates Cricket dual innings scores correctly', async () => {
      const mockMatch = { id: 'm1', sport: 'Cricket', teamAId: 't1', teamBId: 't2', scoreDetails: {} };
      
      // Team A Players: 150 Runs, 2 Wickets Taken, 120 Balls Bowled (20.0 overs)
      const teamAPlayers = [
        { id: 'p1', stats: { 'Runs': 100, 'Wickets': 1, 'Balls Bowled': 60 } },
        { id: 'p2', stats: { 'Runs': 50, 'Wickets': 1, 'Balls Bowled': 60 } },
      ];
      
      // Team B Players: 145 Runs, 5 Wickets Taken, 120 Balls Bowled (20.0 overs)
      const teamBPlayers = [
        { id: 'p3', stats: { 'Runs': 80, 'Wickets': 3, 'Balls Bowled': 60 } },
        { id: 'p4', stats: { 'Runs': 65, 'Wickets': 2, 'Balls Bowled': 60 } },
      ];

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'm1',
        data: () => mockMatch
      });

      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ docs: teamAPlayers.map(p => ({ id: p.id, data: () => p })) })
        .mockResolvedValueOnce({ docs: teamBPlayers.map(p => ({ id: p.id, data: () => p })) });

      await recalculateMatchScores({} as any, 'm1');

      expect(updateDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          teamAScore: 150,
          teamBScore: 145,
          scoreDetails: {
            teamA: { runs: 150, wickets: 5, overs: 20 },
            teamB: { runs: 145, wickets: 2, overs: 20 }
          }
        })
      );
    });
  });
});
