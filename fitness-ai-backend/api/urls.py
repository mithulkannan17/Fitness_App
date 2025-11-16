from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # --- Auth ---
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),

    # --- Profile ---
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # --- Activity Logging ---
    path('activities/', views.ActivityListCreateView.as_view(), name='activity-list-create'),
    path('activities/<int:pk>/', views.ActivityDetailView.as_view(), name='activity-detail'),
    path('fitness-activities/', views.FitnessActivityListView.as_view(), name='fitness-activity-list'),
    path('calendar-logs/', views.CalendarLogView.as_view(), name='calendar-logs'),

    # --- AI/ML & Planning ---
    path('fitness-plan/', views.FitnessPlanView.as_view(), name='fitness-plan'),
    path('injury-check/', views.InjuryCheckView.as_view(), name='injury-check'),
    
    # --- Nutrition ---
    path('nutrition-summary/', views.NutritionSummaryView.as_view(), name='nutrition-summary'),
    path('food-recommendations/', views.FoodRecommendationView.as_view(), name='food-recommendations'),
    path('supplement-recommendations/', views.SupplementRecommendationView.as_view(), name='supplement-recommendations'),
    path('meal-plan/', views.PersonalizedMealPlanView.as_view(), name='meal-plan'),

    # --- Training Library ---
    path('training/', views.TrainingListView.as_view(), name='training-list'),
    path('training/<int:pk>/', views.TrainingCategoryDetailView.as_view(), name='training-category-detail'),
    path('training/workout/<int:pk>/', views.WorkoutDetailView.as_view(), name='workout-detail'),

    # --- Performance & Health ---
    path('performance-dashboard/', views.PerformanceDashboardView.as_view(), name='performance-dashboard'),
    path('health-data/log/', views.LogHealthDataView.as_view(), name='health-log'),
    path('health-data/history/', views.HealthDataHistoryView.as_view(), name='health-history'),
    path('health-data/analysis/', views.HealthDataAnalysisView.as_view(), name='health-analysis'),
    
    # --- Achievements & Rewards ---
    path('achievements/progress/', views.UserProgressView.as_view(), name='user-achievements'),

    # --- Champion Space (Competitions) ---
    path('champion-space/categories/', views.CompetitionCategoryListView.as_view(), name='competition-category-list'),
    path('champion-space/categories/<int:pk>/', views.CompetitionCategoryDetailView.as_view(), name='competition-category-detail'),
    path('champion-space/competitions/<int:pk>/', views.CompetitionTypeDetailView.as_view(), name='competition-detail'),
]