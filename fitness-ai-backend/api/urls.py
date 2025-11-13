
from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    ActivityListCreateView,
    FitnessPlanView,
    InjuryCheckView,
    SupplementRecommendationView,
    FoodRecommendationView,
    TrainingListView,
    TrainingCategoryDetailView,
    NutritionSummaryView,
    PersonalizedMealPlanView,
    PerformanceDashboardView,
    CalendarLogView,
    FitnessActivityListView,
    AchievementListView,
    UserProgressView,
    CompetitionCategoryListView, 
    CompetitionCategoryDetailView, 
    CompetitionTypeDetailView,
    ActivityDetailView,
    LogHealthDataView,
    HealthDataHistoryView,
    HealthDataAnalysisView,
    WorkoutDetailView,
    
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # --- Authentication ---
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
 
    # --- User Profile ---
    path('profile/', ProfileView.as_view(), name='profile'), # <-- CORRECTED THE TYPO HERE
    
    # --- Activity & Logging ---
    path('activities/', ActivityListCreateView.as_view(), name='activity-list-create'),
    path('activities/<int:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
    path('calendar-logs/', CalendarLogView.as_view(), name='calendar-logs'),

    # --- AI Coach & Planning ---
    path('fitness-plan/', FitnessPlanView.as_view(), name='fitness-plan'),
    path('meal-plan/', PersonalizedMealPlanView.as_view(), name='meal-plan'),
    
    # --- Nutrition ---
    path('nutrition-summary/', NutritionSummaryView.as_view(), name='nutrition-summary'),
    path('food-recommendations/', FoodRecommendationView.as_view(), name='food-recommendations'),
    path('supplement-recommendations/', SupplementRecommendationView.as_view(), name='supplement-recommendations'),

    # --- Training Library ---
    path('training/', TrainingListView.as_view(), name='training-list'),
    path('training/<int:pk>/', TrainingCategoryDetailView.as_view(), name='training-category-detail'),
    path('training/workout/<int:pk>/', WorkoutDetailView.as_view(), name='workout-detail'),
    
    # --- Data for Frontend Dropdowns ---
    path('fitness-activities/', FitnessActivityListView.as_view(), name='fitness-activity-list'),

    # --- Analytics & Health ---
    path('performance-dashboard/', PerformanceDashboardView.as_view(), name='performance-dashboard'),
    path('injury-check/', InjuryCheckView.as_view(), name='injury-check'),

    # Achievement Endpoints # <-- CORRECTED THIS LINE (ADDED #)
    path('achievements/', AchievementListView.as_view(), name='achievement-list'),
    path('achievements/progress/', UserProgressView.as_view(), name='user-achievement-progress'),

    path('champion-space/categories/', CompetitionCategoryListView.as_view(), name='competition-category-list'),
    path('champion-space/categories/<int:pk>/', CompetitionCategoryDetailView.as_view(), name='competition-category-detail'),
    path('champion-space/competitions/<int:pk>/', CompetitionTypeDetailView.as_view(), name='competition-type-detail'),

    # Health Data & IoT ---
    path('health-data/log/', LogHealthDataView.as_view(), name='health-data-log'),
    path('health-data/history/', HealthDataHistoryView.as_view(), name='health-data-history'),
    path('health-data/analysis/', HealthDataAnalysisView.as_view(), name='health-data-analysis'),
]