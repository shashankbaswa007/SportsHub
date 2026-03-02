/**
 * Seed script to populate Firestore with realistic demo data for CBIT SportsHub.
 *
 * Creates teams, players (with stats), and matches across all 10 sports
 * with a mix of LIVE, UPCOMING, and COMPLETED statuses.
 *
 * Uses Firestore REST API with Firebase CLI credentials (no service account needed).
 *
 * Run:  node --env-file=.env.local scripts/seed-demo-data.mjs
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ─── Auth: Exchange Firebase CLI refresh token for access token ───

const cliConfigPath = join(homedir(), '.config', 'configstore', 'firebase-tools.json');
const cliConfig = JSON.parse(readFileSync(cliConfigPath, 'utf8'));
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: cliConfig.tokens.client_id || '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: cliConfig.tokens.client_secret || 'j9iVZfS8kkCEFUPaAeJV0sAi',
      refresh_token: cliConfig.tokens.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ─── Firestore REST helpers ───────────────────────────────

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

async function batchWrite(accessToken, writes) {
  // Firestore REST batchWrite limit is 500 operations
  const BATCH_SIZE = 400;
  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const chunk = writes.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${BASE_URL}:batchWrite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ writes: chunk }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`batchWrite failed: ${res.status} ${errText}`);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────

function futureDate(hoursFromNow) {
  return new Date(Date.now() + hoursFromNow * 3600_000).toISOString();
}

function pastDate(hoursAgo) {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatFields(sport) {
  switch (sport) {
    case 'Football': return { Goals: 0, Assists: 0, 'Yellow Cards': 0, 'Red Cards': 0 };
    case 'Basketball': return { Points: 0, Rebounds: 0, Assists: 0 };
    case 'Cricket': return { Runs: 0, Fours: 0, Sixes: 0, Wickets: 0, 'Overs Bowled': 0, 'Balls Bowled': 0 };
    case 'Volleyball': return { Points: 0, Aces: 0, Blocks: 0 };
    case 'Throwball': return { Points: 0, Catches: 0 };
    case 'Badminton (Singles)':
    case 'Badminton (Doubles)': return { Points: 0, Smashes: 0 };
    case 'Table Tennis (Singles)':
    case 'Table Tennis (Doubles)': return { Points: 0, Aces: 0 };
    case 'Kabaddi': return { 'Raid Points': 0, 'Tackle Points': 0, 'Total Points': 0 };
    default: return {};
  }
}

function getDefaultScoreDetails(sport) {
  switch (sport) {
    case 'Football':
    case 'Basketball':
    case 'Kabaddi': return {};
    case 'Cricket': return { runs: 0, wickets: 0, overs: 0 };
    case 'Volleyball':
    case 'Throwball': return Array.from({ length: 3 }, (_, i) => ({ set: i + 1, teamAScore: 0, teamBScore: 0 }));
    case 'Badminton (Singles)':
    case 'Badminton (Doubles)': return Array.from({ length: 3 }, (_, i) => ({ set: i + 1, teamAScore: 0, teamBScore: 0 }));
    case 'Table Tennis (Singles)':
    case 'Table Tennis (Doubles)': return Array.from({ length: 5 }, (_, i) => ({ set: i + 1, teamAScore: 0, teamBScore: 0 }));
    default: return {};
  }
}

// Generate random populated stats for completed/live matches
function randomStats(sport) {
  switch (sport) {
    case 'Football': return { Goals: rand(0, 3), Assists: rand(0, 2), 'Yellow Cards': rand(0, 1), 'Red Cards': 0 };
    case 'Basketball': return { Points: rand(2, 18), Rebounds: rand(1, 8), Assists: rand(0, 6) };
    case 'Cricket': return { Runs: rand(0, 60), Fours: rand(0, 6), Sixes: rand(0, 3), Wickets: rand(0, 2), 'Overs Bowled': rand(0, 4), 'Balls Bowled': rand(0, 24) };
    case 'Volleyball': return { Points: rand(1, 10), Aces: rand(0, 4), Blocks: rand(0, 3) };
    case 'Throwball': return { Points: rand(1, 8), Catches: rand(0, 5) };
    case 'Badminton (Singles)':
    case 'Badminton (Doubles)': return { Points: rand(5, 21), Smashes: rand(2, 10) };
    case 'Table Tennis (Singles)':
    case 'Table Tennis (Doubles)': return { Points: rand(3, 11), Aces: rand(0, 5) };
    case 'Kabaddi': {
      const raid = rand(3, 15);
      const tackle = rand(2, 10);
      return { 'Raid Points': raid, 'Tackle Points': tackle, 'Total Points': raid + tackle };
    }
    default: return {};
  }
}

function filledScoreDetails(sport, teamAScore, teamBScore) {
  switch (sport) {
    case 'Cricket':
      return { runs: teamAScore, wickets: rand(3, 10), overs: 20 };
    case 'Volleyball':
    case 'Throwball': {
      // Generate set scores where winner takes best of 3
      const sets = [];
      let aWins = 0, bWins = 0;
      for (let i = 1; i <= 3; i++) {
        if (aWins >= 2 || bWins >= 2) {
          sets.push({ set: i, teamAScore: 0, teamBScore: 0 });
        } else {
          const aWin = (aWins < teamAScore && (bWins >= teamBScore || Math.random() > 0.5));
          if (aWin) {
            sets.push({ set: i, teamAScore: 25, teamBScore: rand(15, 23) });
            aWins++;
          } else {
            sets.push({ set: i, teamAScore: rand(15, 23), teamBScore: 25 });
            bWins++;
          }
        }
      }
      return sets;
    }
    case 'Badminton (Singles)':
    case 'Badminton (Doubles)': {
      const sets = [];
      let aW = 0, bW = 0;
      for (let i = 1; i <= 3; i++) {
        if (aW >= 2 || bW >= 2) {
          sets.push({ set: i, teamAScore: 0, teamBScore: 0 });
        } else {
          const aWin = (aW < teamAScore && (bW >= teamBScore || Math.random() > 0.5));
          if (aWin) {
            sets.push({ set: i, teamAScore: 21, teamBScore: rand(12, 19) });
            aW++;
          } else {
            sets.push({ set: i, teamAScore: rand(12, 19), teamBScore: 21 });
            bW++;
          }
        }
      }
      return sets;
    }
    case 'Table Tennis (Singles)':
    case 'Table Tennis (Doubles)': {
      const sets = [];
      let aW = 0, bW = 0;
      for (let i = 1; i <= 5; i++) {
        if (aW >= 3 || bW >= 3) {
          sets.push({ set: i, teamAScore: 0, teamBScore: 0 });
        } else {
          const aWin = (aW < teamAScore && (bW >= teamBScore || Math.random() > 0.5));
          if (aWin) {
            sets.push({ set: i, teamAScore: 11, teamBScore: rand(5, 9) });
            aW++;
          } else {
            sets.push({ set: i, teamAScore: rand(5, 9), teamBScore: 11 });
            bW++;
          }
        }
      }
      return sets;
    }
    default:
      return {};
  }
}

// ─── Data Definitions ─────────────────────────────────────

const VENUES = {
  'Football': 'Main Football Ground',
  'Basketball': 'Indoor Basketball Court',
  'Volleyball': 'Volleyball Court',
  'Cricket': 'Cricket Ground',
  'Throwball': 'Indoor Stadium',
  'Badminton (Singles)': 'Badminton Court 1',
  'Badminton (Doubles)': 'Badminton Court 2',
  'Table Tennis (Singles)': 'Table Tennis Hall',
  'Table Tennis (Doubles)': 'Table Tennis Hall',
  'Kabaddi': 'Kabaddi Arena',
};

// Departments / branches participating
const DEPARTMENTS = [
  'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI-ML', 'DS'
];

// Common Indian first names for realistic player names
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan',
  'Rohan', 'Kartik', 'Pranav', 'Dhruv', 'Harsha', 'Nikhil', 'Rahul', 'Varun',
  'Kiran', 'Tejas', 'Akash', 'Ankit', 'Shreyas', 'Manish', 'Ravi', 'Suresh',
  'Priya', 'Sneha', 'Ananya', 'Kavya', 'Neha', 'Pooja', 'Shruti', 'Divya',
  'Meera', 'Tanvi', 'Lakshmi', 'Swathi', 'Bhavana', 'Chaitra', 'Deepika', 'Gayatri',
  'Hemant', 'Jagdish', 'Kunal', 'Lokesh', 'Mohan', 'Naveen', 'Omkar', 'Pavan',
  'Rajesh', 'Sandeep', 'Tarun', 'Uday', 'Venkat', 'Wasim', 'Yash', 'Zain',
];

const LAST_NAMES = [
  'Sharma', 'Reddy', 'Kumar', 'Singh', 'Patel', 'Rao', 'Gupta', 'Joshi',
  'Iyer', 'Nair', 'Mishra', 'Verma', 'Das', 'Malik', 'Shah', 'Bhat',
  'Naidu', 'Choudhary', 'Agarwal', 'Pandey', 'Deshmukh', 'Patil', 'Kulkarni', 'Hegde',
];

function randomName() {
  return `${FIRST_NAMES[rand(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[rand(0, LAST_NAMES.length - 1)]}`;
}

// Number of players per team by sport
function playersPerTeam(sport) {
  switch (sport) {
    case 'Football': return 11;
    case 'Basketball': return 5;
    case 'Volleyball': return 6;
    case 'Cricket': return 11;
    case 'Throwball': return 7;
    case 'Kabaddi': return 7;
    case 'Badminton (Singles)':
    case 'Table Tennis (Singles)': return 1;
    case 'Badminton (Doubles)':
    case 'Table Tennis (Doubles)': return 2;
    default: return 5;
  }
}

// ─── Build the seed data ──────────────────────────────────

const teams = [];   // { id, name, sport, logoUrl }
const players = []; // { id, name, teamId, sport, stats }
const matches = []; // full match objects

let teamIdCounter = 1;
let playerIdCounter = 1;
let matchIdCounter = 1;

function makeTeamId() { return `demo_team_${teamIdCounter++}`; }
function makePlayerId() { return `demo_player_${playerIdCounter++}`; }
function makeMatchId() { return `demo_match_${matchIdCounter++}`; }

// For each sport, create 4 department-based teams
const SPORTS_TO_SEED = [
  'Football',
  'Basketball',
  'Volleyball',
  'Cricket',
  'Throwball',
  'Kabaddi',
  'Badminton (Singles)',
  'Badminton (Doubles)',
  'Table Tennis (Singles)',
  'Table Tennis (Doubles)',
];

const sportTeamMap = {}; // sport -> [{ id, name }]

for (const sport of SPORTS_TO_SEED) {
  const isSinglesOrDoubles = sport.includes('Singles') || sport.includes('Doubles');
  const numTeams = isSinglesOrDoubles ? 4 : 4;

  // Pick 4 random dept indices (no repeats)
  const shuffled = [...DEPARTMENTS].sort(() => Math.random() - 0.5);
  const selectedDepts = shuffled.slice(0, numTeams);

  sportTeamMap[sport] = [];

  for (const dept of selectedDepts) {
    const teamId = makeTeamId();
    const teamName = isSinglesOrDoubles
      ? `${dept} ${sport.split(' ')[0]}`
      : `${dept} ${sport}`;

    teams.push({ id: teamId, name: teamName, sport, logoUrl: '' });
    sportTeamMap[sport].push({ id: teamId, name: teamName });

    // Create players
    const count = playersPerTeam(sport);
    for (let p = 0; p < count; p++) {
      players.push({
        id: makePlayerId(),
        name: randomName(),
        teamId,
        sport,
        stats: getStatFields(sport),
      });
    }
  }
}

// ─── Generate Matches ─────────────────────────────────────

// For each sport: 2 completed, 1 live, 1 upcoming
for (const sport of SPORTS_TO_SEED) {
  const sportTeams = sportTeamMap[sport];
  if (sportTeams.length < 2) continue;

  // Completed Match 1 (Group Stage — played 48 hours ago)
  {
    const tA = sportTeams[0];
    const tB = sportTeams[1];
    const matchId = makeMatchId();

    let teamAScore, teamBScore, scoreDetails;

    if (sport === 'Football') {
      teamAScore = rand(1, 4); teamBScore = rand(0, 3);
      scoreDetails = {};
    } else if (sport === 'Basketball') {
      teamAScore = rand(55, 85); teamBScore = rand(50, 80);
      scoreDetails = {};
    } else if (sport === 'Cricket') {
      teamAScore = rand(120, 200); teamBScore = rand(100, 190);
      scoreDetails = { runs: teamAScore, wickets: rand(4, 10), overs: 20 };
    } else if (sport === 'Kabaddi') {
      teamAScore = rand(25, 45); teamBScore = rand(20, 40);
      scoreDetails = {};
    } else if (sport.includes('Volleyball') || sport.includes('Throwball')) {
      teamAScore = 2; teamBScore = 1;
      scoreDetails = filledScoreDetails(sport, teamAScore, teamBScore);
    } else if (sport.includes('Badminton')) {
      teamAScore = 2; teamBScore = 0;
      scoreDetails = filledScoreDetails(sport, teamAScore, teamBScore);
    } else if (sport.includes('Table Tennis')) {
      teamAScore = 3; teamBScore = 1;
      scoreDetails = filledScoreDetails(sport, teamAScore, teamBScore);
    } else {
      teamAScore = rand(2, 5); teamBScore = rand(0, 3);
      scoreDetails = {};
    }

    matches.push({
      id: matchId, sport, teamAId: tA.id, teamBId: tB.id,
      teamAScore, teamBScore, scoreDetails,
      status: 'COMPLETED',
      startTime: pastDate(48),
      details: `${tA.name} vs ${tB.name}`,
      venue: VENUES[sport] || 'Indoor Stadium',
    });

    // Populate player stats for completed matches
    populatePlayerStats(tA.id, tB.id, sport);
  }

  // Completed Match 2 (Semi Final — played 24 hours ago)
  {
    const tA = sportTeams[2];
    const tB = sportTeams[3];
    const matchId = makeMatchId();

    let teamAScore, teamBScore, scoreDetails;

    if (sport === 'Football') {
      teamAScore = rand(0, 2); teamBScore = rand(1, 3);
      scoreDetails = {};
    } else if (sport === 'Basketball') {
      teamAScore = rand(60, 90); teamBScore = rand(55, 88);
      scoreDetails = {};
    } else if (sport === 'Cricket') {
      teamAScore = rand(130, 210); teamBScore = rand(110, 200);
      scoreDetails = { runs: teamBScore, wickets: rand(3, 8), overs: 20 };
    } else if (sport === 'Kabaddi') {
      teamAScore = rand(20, 50); teamBScore = rand(25, 48);
      scoreDetails = {};
    } else if (sport.includes('Volleyball') || sport.includes('Throwball')) {
      teamAScore = 1; teamBScore = 2;
      scoreDetails = filledScoreDetails(sport, teamAScore, teamBScore);
    } else if (sport.includes('Badminton')) {
      teamAScore = 1; teamBScore = 2;
      scoreDetails = filledScoreDetails(sport, teamAScore, teamBScore);
    } else if (sport.includes('Table Tennis')) {
      teamAScore = 2; teamBScore = 3;
      scoreDetails = filledScoreDetails(sport, teamAScore, teamBScore);
    } else {
      teamAScore = rand(1, 3); teamBScore = rand(2, 5);
      scoreDetails = {};
    }

    matches.push({
      id: matchId, sport, teamAId: tA.id, teamBId: tB.id,
      teamAScore, teamBScore, scoreDetails,
      status: 'COMPLETED',
      startTime: pastDate(24),
      details: `${tA.name} vs ${tB.name}`,
      venue: VENUES[sport] || 'Indoor Stadium',
    });

    populatePlayerStats(tA.id, tB.id, sport);
  }

  // LIVE Match (Final — happening now)
  {
    const tA = sportTeams[0];
    const tB = sportTeams[3];
    const matchId = makeMatchId();

    let teamAScore, teamBScore, scoreDetails;

    if (sport === 'Football') {
      teamAScore = rand(1, 2); teamBScore = rand(0, 2);
      scoreDetails = {};
    } else if (sport === 'Basketball') {
      teamAScore = rand(40, 65); teamBScore = rand(38, 60);
      scoreDetails = {};
    } else if (sport === 'Cricket') {
      teamAScore = rand(80, 150); teamBScore = rand(60, 130);
      scoreDetails = { runs: teamAScore, wickets: rand(2, 6), overs: rand(10, 18) };
    } else if (sport === 'Kabaddi') {
      teamAScore = rand(15, 35); teamBScore = rand(12, 30);
      scoreDetails = {};
    } else if (sport.includes('Volleyball') || sport.includes('Throwball')) {
      teamAScore = 1; teamBScore = 1;
      scoreDetails = [
        { set: 1, teamAScore: 25, teamBScore: rand(18, 23) },
        { set: 2, teamAScore: rand(17, 22), teamBScore: 25 },
        { set: 3, teamAScore: rand(8, 15), teamBScore: rand(8, 15) },
      ];
    } else if (sport.includes('Badminton')) {
      teamAScore = 1; teamBScore = 0;
      scoreDetails = [
        { set: 1, teamAScore: 21, teamBScore: rand(14, 19) },
        { set: 2, teamAScore: rand(10, 16), teamBScore: rand(10, 16) },
        { set: 3, teamAScore: 0, teamBScore: 0 },
      ];
    } else if (sport.includes('Table Tennis')) {
      teamAScore = 2; teamBScore = 1;
      scoreDetails = [
        { set: 1, teamAScore: 11, teamBScore: rand(6, 9) },
        { set: 2, teamAScore: rand(7, 9), teamBScore: 11 },
        { set: 3, teamAScore: 11, teamBScore: rand(5, 9) },
        { set: 4, teamAScore: rand(5, 8), teamBScore: rand(5, 8) },
        { set: 5, teamAScore: 0, teamBScore: 0 },
      ];
    } else {
      teamAScore = rand(1, 3); teamBScore = rand(1, 3);
      scoreDetails = {};
    }

    matches.push({
      id: matchId, sport, teamAId: tA.id, teamBId: tB.id,
      teamAScore, teamBScore, scoreDetails,
      status: 'LIVE',
      startTime: pastDate(1),
      details: `${tA.name} vs ${tB.name}`,
      venue: VENUES[sport] || 'Indoor Stadium',
    });

    populatePlayerStats(tA.id, tB.id, sport);
  }

  // UPCOMING Match (Quarter Final — tomorrow)
  {
    const tA = sportTeams[1];
    const tB = sportTeams[2];
    const matchId = makeMatchId();

    matches.push({
      id: matchId, sport, teamAId: tA.id, teamBId: tB.id,
      teamAScore: 0, teamBScore: 0,
      scoreDetails: getDefaultScoreDetails(sport),
      status: 'UPCOMING',
      startTime: futureDate(rand(4, 48)),
      details: `${tA.name} vs ${tB.name}`,
      venue: VENUES[sport] || 'Indoor Stadium',
    });
  }

  // UPCOMING Match 2 (another fixture)
  if (sportTeams.length >= 4) {
    const tA = sportTeams[0];
    const tB = sportTeams[2];
    const matchId = makeMatchId();

    matches.push({
      id: matchId, sport, teamAId: tA.id, teamBId: tB.id,
      teamAScore: 0, teamBScore: 0,
      scoreDetails: getDefaultScoreDetails(sport),
      status: 'UPCOMING',
      startTime: futureDate(rand(50, 96)),
      details: `${tA.name} vs ${tB.name}`,
      venue: VENUES[sport] || 'Indoor Stadium',
    });
  }
}

function populatePlayerStats(teamAId, teamBId, sport) {
  for (const p of players) {
    if ((p.teamId === teamAId || p.teamId === teamBId) && p.sport === sport) {
      // Only populate if stats are still zeroed out
      const allZero = Object.values(p.stats).every(v => v === 0);
      if (allZero) {
        p.stats = randomStats(sport);
      }
    }
  }
}

// ─── Write to Firestore ───────────────────────────────────

async function seedAll() {
  console.log('🏟️  CBIT SportsHub Demo Data Seeder');
  console.log('─'.repeat(45));
  console.log(`   Teams:   ${teams.length}`);
  console.log(`   Players: ${players.length}`);
  console.log(`   Matches: ${matches.length}`);
  console.log('─'.repeat(45));

  console.log('\n🔑 Authenticating via Firebase CLI credentials...');
  const accessToken = await getAccessToken();
  console.log('   ✓ Authenticated');

  // 1. Write teams
  console.log('\n📋 Writing teams...');
  const teamWrites = teams.map(team => ({
    update: {
      name: `projects/${projectId}/databases/(default)/documents/teams/${team.id}`,
      ...toFirestoreDoc({ name: team.name, sport: team.sport, logoUrl: team.logoUrl }),
    },
  }));
  await batchWrite(accessToken, teamWrites);
  console.log(`   ✓ ${teams.length} teams written`);

  // 2. Write players
  console.log('\n👤 Writing players...');
  const playerWrites = players.map(player => ({
    update: {
      name: `projects/${projectId}/databases/(default)/documents/players/${player.id}`,
      ...toFirestoreDoc({ name: player.name, teamId: player.teamId, sport: player.sport, stats: player.stats }),
    },
  }));
  await batchWrite(accessToken, playerWrites);
  console.log(`   ✓ ${players.length} players written`);

  // 3. Write matches
  console.log('\n⚽ Writing matches...');
  const now = new Date().toISOString();
  const matchWrites = matches.map(match => ({
    update: {
      name: `projects/${projectId}/databases/(default)/documents/matches/${match.id}`,
      ...toFirestoreDoc({
        sport: match.sport,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        teamAScore: match.teamAScore,
        teamBScore: match.teamBScore,
        scoreDetails: match.scoreDetails,
        status: match.status,
        startTime: match.startTime,
        details: match.details,
        venue: match.venue,
        createdAt: now,
        lastUpdated: now,
      }),
    },
  }));
  await batchWrite(accessToken, matchWrites);
  console.log(`   ✓ ${matches.length} matches written`);

  // Summary
  console.log('\n' + '─'.repeat(45));
  console.log('✅ Demo data seeded successfully!\n');

  const liveCount = matches.filter(m => m.status === 'LIVE').length;
  const upcomingCount = matches.filter(m => m.status === 'UPCOMING').length;
  const completedCount = matches.filter(m => m.status === 'COMPLETED').length;

  console.log(`   🔴 LIVE matches:      ${liveCount}`);
  console.log(`   🔵 UPCOMING matches:  ${upcomingCount}`);
  console.log(`   🟢 COMPLETED matches: ${completedCount}`);
  console.log(`   🏆 Sports covered:    ${SPORTS_TO_SEED.length}`);
  console.log(`   👥 Teams created:     ${teams.length}`);
  console.log(`   🏃 Players created:   ${players.length}`);
  console.log('\nOpen your app to see the data!');

  process.exit(0);
}

seedAll().catch((err) => {
  console.error('❌ Failed to seed demo data:', err);
  process.exit(1);
});
