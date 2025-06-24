from django.urls import path
from . import views

app_name = 'tracker'

urlpatterns = [
    path('', views.index, name='index'),
    path('sport/<str:sport>/', views.sport_view, name='sport_view'),
    path('match/<int:match_id>/analysis/', views.match_analysis, name='match_analysis'),
    path('api/match/<int:match_id>/stats/', views.match_stats_api, name='match_stats_api'),
]