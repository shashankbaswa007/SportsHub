from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from tracker.models import Team, Match, MatchStats, PlayerPerformance


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create Football Teams
        football_teams = [
            'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 
            'Tottenham', 'Manchester United', 'Newcastle', 'Brighton'
        ]
        
        for team_name in football_teams:
            team, created = Team.objects.get_or_create(
                name=team_name,
                sport='football'
            )
            if created:
                self.stdout.write(f'Created football team: {team_name}')
        
        # Create Table Tennis Players
        tabletennis_players = [
            'Zhang Wei', 'Ma Long', 'Fan Zhendong', 'Xu Xin',
            'Lin Gaoyuan', 'Wang Chuqin', 'Liang Jingkun', 'Liu Dingshuo'
        ]
        
        for player_name in tabletennis_players:
            team, created = Team.objects.get_or_create(
                name=player_name,
                sport='tabletennis'
            )
            if created:
                self.stdout.write(f'Created table tennis player: {player_name}')
        
        # Create Football Matches
        football_teams_objs = Team.objects.filter(sport='football')
        self.create_football_matches(football_teams_objs)
        
        # Create Table Tennis Matches
        tabletennis_teams_objs = Team.objects.filter(sport='tabletennis')
        self.create_tabletennis_matches(tabletennis_teams_objs)
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data'))

    def create_football_matches(self, teams):
        matches_data = [
            {
                'home': 'Manchester City', 'away': 'Liverpool', 'home_score': 2, 'away_score': 1,
                'status': 'completed', 'date': timezone.now() - timedelta(days=2),
                'venue': 'Etihad Stadium', 'league': 'Premier League'
            },
            {
                'home': 'Arsenal', 'away': 'Chelsea', 'home_score': 3, 'away_score': 1,
                'status': 'completed', 'date': timezone.now() - timedelta(days=1),
                'venue': 'Emirates Stadium', 'league': 'Premier League'
            },
            {
                'home': 'Tottenham', 'away': 'Manchester United', 'home_score': 1, 'away_score': 3,
                'status': 'completed', 'date': timezone.now() - timedelta(days=3),
                'venue': 'Tottenham Hotspur Stadium', 'league': 'Premier League'
            },
            {
                'home': 'Newcastle', 'away': 'Brighton', 'home_score': 2, 'away_score': 2,
                'status': 'completed', 'date': timezone.now() - timedelta(days=2),
                'venue': 'St. James\' Park', 'league': 'Premier League'
            },
            {
                'home': 'Manchester United', 'away': 'Arsenal', 'home_score': 1, 'away_score': 1,
                'status': 'live', 'date': timezone.now(),
                'venue': 'Old Trafford', 'league': 'Premier League'
            },
            {
                'home': 'Liverpool', 'away': 'Chelsea', 'home_score': None, 'away_score': None,
                'status': 'upcoming', 'date': timezone.now() + timedelta(days=1),
                'venue': 'Anfield', 'league': 'Premier League'
            }
        ]
        
        for match_data in matches_data:
            home_team = teams.get(name=match_data['home'])
            away_team = teams.get(name=match_data['away'])
            
            match, created = Match.objects.get_or_create(
                home_team=home_team,
                away_team=away_team,
                match_date=match_data['date'],
                defaults={
                    'home_score': match_data['home_score'],
                    'away_score': match_data['away_score'],
                    'status': match_data['status'],
                    'sport': 'football',
                    'venue': match_data['venue'],
                    'league': match_data['league']
                }
            )
            
            if created and match_data['status'] in ['completed', 'live']:
                # Create match stats
                stats = MatchStats.objects.create(
                    match=match,
                    home_possession=58 if match_data['home'] == 'Manchester City' else 45,
                    away_possession=42 if match_data['away'] == 'Liverpool' else 55,
                    home_shots=14, away_shots=11,
                    home_shots_on_target=6, away_shots_on_target=4,
                    home_corners=7, away_corners=5,
                    home_fouls=12, away_fouls=15,
                    home_yellow_cards=2, away_yellow_cards=3,
                    home_red_cards=0, away_red_cards=0
                )
                
                # Create player performances
                if match_data['home'] == 'Manchester City':
                    PlayerPerformance.objects.create(
                        match=match, player_name='Erling Haaland', team=home_team,
                        position='Forward', rating=9.2, goals=2, assists=0
                    )
                    PlayerPerformance.objects.create(
                        match=match, player_name='Kevin De Bruyne', team=home_team,
                        position='Midfielder', rating=8.5, goals=0, assists=1
                    )
                
                self.stdout.write(f'Created football match: {match}')

    def create_tabletennis_matches(self, teams):
        matches_data = [
            {
                'home': 'Zhang Wei', 'away': 'Ma Long', 'home_score': 2, 'away_score': 3,
                'status': 'completed', 'date': timezone.now() - timedelta(days=2),
                'venue': 'Olympic Sports Center', 'league': 'World Championship'
            },
            {
                'home': 'Fan Zhendong', 'away': 'Xu Xin', 'home_score': 3, 'away_score': 1,
                'status': 'completed', 'date': timezone.now() - timedelta(days=1),
                'venue': 'National Stadium', 'league': 'World Championship'
            },
            {
                'home': 'Lin Gaoyuan', 'away': 'Wang Chuqin', 'home_score': 4, 'away_score': 1,
                'status': 'completed', 'date': timezone.now() - timedelta(days=3),
                'venue': 'Sports Complex', 'league': 'World Championship'
            },
            {
                'home': 'Ma Long', 'away': 'Fan Zhendong', 'home_score': 2, 'away_score': 2,
                'status': 'live', 'date': timezone.now(),
                'venue': 'Championship Arena', 'league': 'World Championship'
            },
            {
                'home': 'Xu Xin', 'away': 'Zhang Wei', 'home_score': None, 'away_score': None,
                'status': 'upcoming', 'date': timezone.now() + timedelta(days=1),
                'venue': 'Olympic Sports Center', 'league': 'World Championship'
            }
        ]
        
        for match_data in matches_data:
            home_team = teams.get(name=match_data['home'])
            away_team = teams.get(name=match_data['away'])
            
            match, created = Match.objects.get_or_create(
                home_team=home_team,
                away_team=away_team,
                match_date=match_data['date'],
                defaults={
                    'home_score': match_data['home_score'],
                    'away_score': match_data['away_score'],
                    'status': match_data['status'],
                    'sport': 'tabletennis',
                    'venue': match_data['venue'],
                    'league': match_data['league']
                }
            )
            
            if created and match_data['status'] in ['completed', 'live']:
                # Create match stats
                stats = MatchStats.objects.create(
                    match=match,
                    home_aces=8, away_aces=12,
                    home_winners=15, away_winners=18,
                    home_unforced_errors=12, away_unforced_errors=8,
                    home_break_points=4, away_break_points=6
                )
                
                # Create player performances
                PlayerPerformance.objects.create(
                    match=match, player_name=match_data['home'], team=home_team,
                    rating=8.2, points_won=45, aces=8, winners=15
                )
                PlayerPerformance.objects.create(
                    match=match, player_name=match_data['away'], team=away_team,
                    rating=9.1, points_won=52, aces=12, winners=18
                )
                
                self.stdout.write(f'Created table tennis match: {match}')