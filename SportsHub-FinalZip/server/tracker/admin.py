from django.contrib import admin
from .models import Team, Match, MatchStats, PlayerPerformance


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'sport', 'created_at']
    list_filter = ['sport', 'created_at']
    search_fields = ['name']


class MatchStatsInline(admin.StackedInline):
    model = MatchStats
    extra = 0


class PlayerPerformanceInline(admin.TabularInline):
    model = PlayerPerformance
    extra = 0


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['home_team', 'away_team', 'home_score', 'away_score', 'status', 'sport', 'match_date']
    list_filter = ['status', 'sport', 'match_date', 'league']
    search_fields = ['home_team__name', 'away_team__name', 'venue']
    date_hierarchy = 'match_date'
    inlines = [MatchStatsInline, PlayerPerformanceInline]


@admin.register(MatchStats)
class MatchStatsAdmin(admin.ModelAdmin):
    list_display = ['match', 'home_possession', 'away_possession']
    list_filter = ['match__sport']


@admin.register(PlayerPerformance)
class PlayerPerformanceAdmin(admin.ModelAdmin):
    list_display = ['player_name', 'team', 'match', 'rating']
    list_filter = ['team', 'match__sport']
    search_fields = ['player_name']