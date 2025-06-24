from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.db.models import Q, Count, Sum, Case, When, IntegerField
from .models import Match, Team, MatchStats, PlayerPerformance
from datetime import datetime


def index(request):
    """Default view redirects to football"""
    return sport_view(request, 'football')


def sport_view(request, sport='football'):
    """Main view for displaying matches and standings for a specific sport"""
    
    # Get all matches for the sport
    matches = Match.objects.filter(sport=sport).select_related('home_team', 'away_team')
    
    # Separate matches by status
    live_matches = matches.filter(status='live')
    upcoming_matches = matches.filter(status='upcoming')
    completed_matches = matches.filter(status='completed')
    
    # Calculate standings
    standings = calculate_standings(sport)
    
    context = {
        'sport': sport,
        'live_matches': live_matches,
        'upcoming_matches': upcoming_matches,
        'completed_matches': completed_matches,
        'standings': standings,
    }
    
    return render(request, 'tracker/index.html', context)


def match_analysis(request, match_id):
    """View for detailed match analysis"""
    match = get_object_or_404(Match, id=match_id)
    
    # Get match stats
    try:
        stats = match.stats
    except MatchStats.DoesNotExist:
        stats = None
    
    # Get player performances
    home_performers = match.player_performances.filter(team=match.home_team).order_by('-rating')
    away_performers = match.player_performances.filter(team=match.away_team).order_by('-rating')
    
    context = {
        'match': match,
        'stats': stats,
        'home_performers': home_performers,
        'away_performers': away_performers,
    }
    
    return render(request, 'tracker/match_analysis.html', context)


def match_stats_api(request, match_id):
    """API endpoint for match statistics (for charts)"""
    match = get_object_or_404(Match, id=match_id)
    
    try:
        stats = match.stats
        
        if match.sport == 'football':
            stats_data = [
                {'stat': 'Possession', 'home': stats.home_possession or 0, 'away': stats.away_possession or 0},
                {'stat': 'Shots', 'home': stats.home_shots or 0, 'away': stats.away_shots or 0},
                {'stat': 'On Target', 'home': stats.home_shots_on_target or 0, 'away': stats.away_shots_on_target or 0},
                {'stat': 'Corners', 'home': stats.home_corners or 0, 'away': stats.away_corners or 0},
                {'stat': 'Fouls', 'home': stats.home_fouls or 0, 'away': stats.away_fouls or 0},
                {'stat': 'Yellow Cards', 'home': stats.home_yellow_cards or 0, 'away': stats.away_yellow_cards or 0}
            ]
            
            radar_data = [
                {'stat': 'Possession', 'home': stats.home_possession or 0, 'away': stats.away_possession or 0, 'fullMark': 100},
                {'stat': 'Shots', 'home': (stats.home_shots or 0) * 5, 'away': (stats.away_shots or 0) * 5, 'fullMark': 100},
                {'stat': 'Accuracy', 'home': ((stats.home_shots_on_target or 0) / max(stats.home_shots or 1, 1)) * 100, 'away': ((stats.away_shots_on_target or 0) / max(stats.away_shots or 1, 1)) * 100, 'fullMark': 100},
                {'stat': 'Corners', 'home': (stats.home_corners or 0) * 10, 'away': (stats.away_corners or 0) * 10, 'fullMark': 100},
                {'stat': 'Discipline', 'home': max(0, 100 - (stats.home_fouls or 0) * 5), 'away': max(0, 100 - (stats.away_fouls or 0) * 5), 'fullMark': 100}
            ]
        else:
            stats_data = [
                {'stat': 'Aces', 'home': stats.home_aces or 0, 'away': stats.away_aces or 0},
                {'stat': 'Winners', 'home': stats.home_winners or 0, 'away': stats.away_winners or 0},
                {'stat': 'Errors', 'home': stats.home_unforced_errors or 0, 'away': stats.away_unforced_errors or 0},
                {'stat': 'Break Points', 'home': stats.home_break_points or 0, 'away': stats.away_break_points or 0}
            ]
            
            radar_data = [
                {'stat': 'Aces', 'home': (stats.home_aces or 0) * 5, 'away': (stats.away_aces or 0) * 5, 'fullMark': 100},
                {'stat': 'Winners', 'home': (stats.home_winners or 0) * 3, 'away': (stats.away_winners or 0) * 3, 'fullMark': 100},
                {'stat': 'Consistency', 'home': max(0, 100 - (stats.home_unforced_errors or 0) * 4), 'away': max(0, 100 - (stats.away_unforced_errors or 0) * 4), 'fullMark': 100},
                {'stat': 'Break Points', 'home': (stats.home_break_points or 0) * 10, 'away': (stats.away_break_points or 0) * 10, 'fullMark': 100}
            ]
        
        return JsonResponse({
            'stats_data': stats_data,
            'radar_data': radar_data,
            'home_team': match.home_team.name,
            'away_team': match.away_team.name
        })
        
    except MatchStats.DoesNotExist:
        return JsonResponse({'error': 'No stats available'}, status=404)


def calculate_standings(sport):
    """Calculate league standings based on completed matches"""
    teams = Team.objects.filter(sport=sport)
    standings = []
    
    for team in teams:
        # Get completed matches for this team
        home_matches = Match.objects.filter(
            home_team=team, 
            status='completed',
            home_score__isnull=False,
            away_score__isnull=False
        )
        away_matches = Match.objects.filter(
            away_team=team, 
            status='completed',
            home_score__isnull=False,
            away_score__isnull=False
        )
        
        played = home_matches.count() + away_matches.count()
        won = 0
        drawn = 0
        lost = 0
        goals_for = 0
        goals_against = 0
        points = 0
        
        # Process home matches
        for match in home_matches:
            goals_for += match.home_score
            goals_against += match.away_score
            
            if match.home_score > match.away_score:
                won += 1
                points += 3 if sport == 'football' else 2
            elif match.home_score < match.away_score:
                lost += 1
            else:
                drawn += 1
                points += 1 if sport == 'football' else 0
        
        # Process away matches
        for match in away_matches:
            goals_for += match.away_score
            goals_against += match.home_score
            
            if match.away_score > match.home_score:
                won += 1
                points += 3 if sport == 'football' else 2
            elif match.away_score < match.home_score:
                lost += 1
            else:
                drawn += 1
                points += 1 if sport == 'football' else 0
        
        goal_difference = goals_for - goals_against
        
        standings.append({
            'team': team.name,
            'played': played,
            'won': won,
            'drawn': drawn if sport == 'football' else None,
            'lost': lost,
            'goals_for': goals_for if sport == 'football' else None,
            'goals_against': goals_against if sport == 'football' else None,
            'goal_difference': goal_difference if sport == 'football' else None,
            'points': points
        })
    
    # Sort standings by points, then goal difference (for football), then goals for
    if sport == 'football':
        standings.sort(key=lambda x: (-x['points'], -x['goal_difference'], -x['goals_for']))
    else:
        standings.sort(key=lambda x: (-x['points'], -x['won']))
    
    # Add position
    for i, standing in enumerate(standings):
        standing['position'] = i + 1
    
    return standings