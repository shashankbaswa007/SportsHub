from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    sport = models.CharField(max_length=20, choices=[('football', 'Football'), ('tabletennis', 'Table Tennis')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.sport})"

    class Meta:
        ordering = ['name']


class Match(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('live', 'Live'),
        ('completed', 'Completed'),
    ]
    
    SPORT_CHOICES = [
        ('football', 'Football'),
        ('tabletennis', 'Table Tennis'),
    ]

    home_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    away_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    home_score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    sport = models.CharField(max_length=20, choices=SPORT_CHOICES)
    match_date = models.DateTimeField()
    venue = models.CharField(max_length=200, blank=True)
    league = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - {self.match_date.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-match_date']


class MatchStats(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name='stats')
    
    # Football stats
    home_possession = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    away_possession = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    home_shots = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_shots = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_shots_on_target = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_shots_on_target = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_corners = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_corners = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_fouls = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_fouls = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_yellow_cards = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_yellow_cards = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_red_cards = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_red_cards = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Table Tennis stats
    home_aces = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_aces = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_winners = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_winners = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_unforced_errors = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_unforced_errors = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    home_break_points = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_break_points = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"Stats for {self.match}"


class PlayerPerformance(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='player_performances')
    player_name = models.CharField(max_length=100)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    position = models.CharField(max_length=50, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(0), MaxValueValidator(10)])
    
    # Football stats
    goals = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    assists = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Table Tennis stats
    points_won = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    aces = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    winners = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.player_name} - {self.match}"

    class Meta:
        ordering = ['-rating']