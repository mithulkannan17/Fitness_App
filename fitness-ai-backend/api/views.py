import random
import logging
import numpy as np
import datetime
import pandas as pd

from django.db.models import Q, Sum, F, Count, Avg, Max
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Sum, Count, Max, F
from django.db.models.functions import TruncWeek, TruncHour
from sklearn.linear_model import LinearRegression
from collections import defaultdict
from sklearn.ensemble import IsolationForest


from .models import (
    User, Profile, Activity, SetLog, Food, Injury, 
    Exercise, Workout, TrainingCategory, FitnessActivity, Achievement, UserAchievement, CompetitionCategory, CompetitionType, HealthDataLog
)
from .serializers import (
    UserSerializer, ProfileSerializer, ActivitySerializer, SetLogSerializer,
    FoodSerializer, InjurySerializer, ExerciseSerializer, WorkoutSerializer,
    TrainingCategorySerializer, FitnessActivitySerializer, AchievementSerializer, UserAchievementSerializer, CompetitionCategoryListSerializer, CompetitionCategoryDetailSerializer, CompetitionTypeDetailSerializer,
    HealthDataLogSerializer
)

# Set up logging
logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating user profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        if created:
            logger.info(f"New profile created for user: {self.request.user.username}")
        return profile

    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"Profile updated for user: {request.user.username}")
            return response
        except Exception as e:
            logger.error(f"Error updating profile for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Profile update failed. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ActivityListCreateView(generics.ListCreateAPIView):
    """
    API view for listing and creating user activities
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        try:
            activity = serializer.save(user=self.request.user)
            logger.info(f"New activity created: {activity.name} for user: {self.request.user.username}")
        except Exception as e:
            logger.error(f"Error creating activity for user {self.request.user.username}: {str(e)}")
            raise


class FitnessPlanView(APIView):
    """
    API view for generating personalized fitness plans based on user profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = Profile.objects.get(user=request.user)
            goal = profile.goal
            experience = profile.experience_level

            difficulty_map = {
                'beginner': (1, 4),      # Difficulty levels 1 to 4
                'intermediate': (3, 7),  # Difficulty levels 3 to 7
                'advanced': (6, 10),     # Difficulty levels 6 to 10
            }
            min_diff, max_diff = difficulty_map.get(experience, (1, 10)) # Default to all if not found

            # Define plan structure based on goal
            if goal == 'muscle_gain':
                plan_structure = {'Strength': 4, 'Cardio': 1, 'Sport': 1}
            elif goal == 'fat_loss':
                plan_structure = {'Strength': 3, 'Cardio': 3, 'Flexibility': 1}
            elif goal == 'endurance':
                plan_structure = {'Cardio': 4, 'Strength': 2, 'Flexibility': 1}
            else:  # maintenance
                plan_structure = {'Strength': 3, 'Cardio': 2, 'Sport': 1, 'Flexibility': 1}

            generated_plan = []
            for category, count in plan_structure.items():
                activities = list(FitnessActivity.objects.filter(
                    category=category,
                    difficulty_level__gte=min_diff,
                    difficulty_level__lte=max_diff,
                    is_active=True
                ))
                if len(activities) >= count:
                    selected_activities = random.sample(activities, count)
                    generated_plan.extend(selected_activities)
                elif activities:
                    generated_plan.extend(activities)

            if not generated_plan:
                return Response({
                    'message': 'No fitness activities available for your goal and experience level.',
                    'plan': []
                })

            serializer = FitnessActivitySerializer(generated_plan, many=True)
            logger.info(f"Fitness plan for '{experience}' user generated: {request.user.username}")
            return Response({
                'goal': goal,
                'experience_level': experience,
                'plan': serializer.data,
                'total_activities': len(serializer.data)
            })

        except Profile.DoesNotExist:
            return Response({'error': 'User profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating fitness plan for {request.user.username}: {str(e)}")
            return Response({'error': 'Failed to generate fitness plan.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InjuryCheckView(APIView):
    """
    API view for injury diagnosis using TF-IDF and Cosine Similarity
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            symptoms = request.data.get('symptoms', [])
            body_part = request.data.get('body_part', '').strip()

            if not body_part:
                return Response(
                    {'error': 'A body_part is required.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not symptoms or not isinstance(symptoms, list) or not any(s.strip() for s in symptoms):
                 return Response(
                    {'error': 'Please provide at least one symptom.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find injuries related to the body part
            possible_injuries = Injury.objects.filter(
                affected_part__icontains=body_part,
                is_active=True
            ).exclude(symptoms__isnull=True).exclude(symptoms__exact='')

            if not possible_injuries.exists():
                return Response({
                    'message': f"No injuries found for '{body_part}' in our database.",
                    'possible_injuries': [],
                    'recommendations': [
                        'Consult with a healthcare professional for an accurate diagnosis.',
                        'Apply the RICE method (Rest, Ice, Compression, Elevation) if appropriate for minor strains.'
                    ]
                })

            # Prepare the text data for the ML model
            user_symptoms_text = ' '.join(symptoms)
            db_injuries = list(possible_injuries)
            
            # Corpus: a collection of text documents. First is the user's, rest are from DB.
            corpus = [user_symptoms_text] + [injury.symptoms for injury in db_injuries]
            
            # Vectorize the text using TF-IDF
            # This converts words into a matrix of numbers representing their importance.
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)

            # Calculate cosine similarity between user's symptoms (first item) and all DB injuries
            # This gives a score from 0 (not similar) to 1 (identical).
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
            
            # Get the similarity scores as a simple list
            sim_scores = list(cosine_sim[0])

            # Pair each injury with its similarity score
            injury_scores = []
            for i, injury in enumerate(db_injuries):
                # We only consider injuries with a similarity score > 0.1 to avoid irrelevant results
                if sim_scores[i] > 0.1: 
                    injury_scores.append((injury, sim_scores[i]))

            # Sort the injuries based on the similarity scores in descending order
            sorted_injuries = sorted(injury_scores, key=lambda x: x[1], reverse=True)

            # Format the results for the API response
            matched_injuries = []
            for injury, score in sorted_injuries:
                matched_injuries.append({
                    'name': injury.name,
                    'severity': injury.severity,
                    'symptoms': injury.symptoms, # Show the full symptoms from the DB
                    'first_aid': injury.first_aid,
                    'treatment_type': injury.treatment_type,
                    'recovery_time_days': injury.recovery_time_days or 'N/A',
                    'similarity_score': round(score * 100, 2), # Convert to a percentage-like score
                })
            
            # Limit to top 5 results
            matched_injuries = matched_injuries[:5]

            response_data = {
                'body_part': body_part,
                'symptoms_checked': symptoms,
                'possible_injuries': matched_injuries,
                'total_matches': len(matched_injuries),
                'recommendations': [
                    'Rest the affected area and avoid strenuous activity.',
                    'Apply ice packs for 15-20 minutes every 2-3 hours to reduce swelling.',
                    'For persistent or severe pain, consult a medical professional.'
                ],
                'disclaimer': 'This AI-based check is for informational purposes only and is not a substitute for a professional medical diagnosis. Please consult a healthcare provider.'
            }

            if matched_injuries:
                response_data['message'] = f"Found {len(matched_injuries)} possible injury matches for your symptoms."
            else:
                response_data['message'] = f"Could not find a strong match for your symptoms. Here are general recommendations:"


            logger.info(f"ML Injury check performed for user: {request.user.username}, body_part: {body_part}")
            return Response(response_data)

        except ImportError:
            logger.error("Scikit-learn is not installed. InjuryCheckView requires it.")
            return Response(
                {'error': 'A required library is missing on the server. Please contact support.'}, 
                status=500
            )
        except Exception as e:
            logger.error(f"Error in ML injury check for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Injury check failed due to an internal error. Please try again.'}, 
                status=500
            )


class SupplementRecommendationView(APIView):
    """
    API view for generating supplement recommendations based on user profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = Profile.objects.get(user=request.user)
            recommendations = []

            # Protein recommendations
            if profile.weight and profile.goal in ['muscle_gain', 'fat_loss']:
                if profile.goal == 'muscle_gain':
                    protein_multiplier = 2.0  # Higher for muscle gain
                else:
                    protein_multiplier = 1.6  # Standard for fat loss
                
                protein_dosage = round(profile.weight * protein_multiplier, 0)
                recommendations.append({
                    "name": "Whey Protein",
                    "dosage": f"{protein_dosage}g daily",
                    "timing": "Post-workout and between meals",
                    "details": "Mix one scoop with 250ml of water or milk. Best taken within 30 minutes post-workout.",
                    "purpose": "Muscle recovery and growth"
                })

            # Creatine for muscle gain
            if profile.goal == 'muscle_gain':
                recommendations.append({
                    "name": "Creatine Monohydrate",
                    "dosage": "5g daily",
                    "timing": "Any time of day",
                    "details": "Mix 5g with water or juice. Stay well hydrated (3+ liters water daily).",
                    "purpose": "Increased strength and muscle volume"
                })

            # Fat burner for fat loss
            if profile.goal == 'fat_loss':
                recommendations.append({
                    "name": "Green Tea Extract",
                    "dosage": "400-500mg daily",
                    "timing": "Before meals",
                    "details": "Take with meals to avoid stomach irritation. Contains natural caffeine.",
                    "purpose": "Metabolism boost and fat oxidation"
                })

            # Universal recommendations
            recommendations.append({
                "name": "Multivitamin",
                "dosage": "1 tablet daily",
                "timing": "With breakfast",
                "details": "Take with your first meal to improve absorption.",
                "purpose": "Overall health and nutrient insurance"
            })

            if profile.goal in ['endurance', 'very_active', 'extra_active']:
                recommendations.append({
                    "name": "Omega-3 Fish Oil",
                    "dosage": "1000mg daily",
                    "timing": "With meals",
                    "details": "Helps reduce inflammation and supports recovery.",
                    "purpose": "Anti-inflammatory and joint health"
                })

            logger.info(f"Supplement recommendations generated for user: {request.user.username}")
            return Response({
                'goal': profile.goal,
                'recommendations': recommendations,
                'total_supplements': len(recommendations),
                'disclaimer': 'Consult with a healthcare provider before starting any supplement regimen.'
            })

        except Profile.DoesNotExist:
            return Response(
                {'error': 'User profile not found. Please complete your profile first.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating supplement recommendations for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Failed to generate supplement recommendations. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FoodRecommendationView(generics.ListAPIView):
    """
    API view for food recommendations with filtering
    """
    serializer_class = FoodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Food.objects.filter(is_active=True)
        food_type = self.request.query_params.get('type')
        search = self.request.query_params.get('search')
        min_protein = self.request.query_params.get('min_protein')
        max_calories = self.request.query_params.get('max_calories')

        # Filter by food type
        if food_type in ['veg', 'non-veg', 'vegan']:
            queryset = queryset.filter(type=food_type)

        # Search in food names
        if search:
            queryset = queryset.filter(name__icontains=search.strip())

        # Filter by minimum protein
        if min_protein:
            try:
                min_protein_val = float(min_protein)
                queryset = queryset.filter(protein_per_100g__gte=min_protein_val)
            except ValueError:
                pass

        # Filter by maximum calories
        if max_calories:
            try:
                max_calories_val = int(max_calories)
                queryset = queryset.filter(calories_per_100g__lte=max_calories_val)
            except ValueError:
                pass

        return queryset.order_by('name')

    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            logger.info(f"Food recommendations requested by user: {request.user.username}")
            return response
        except Exception as e:
            logger.error(f"Error fetching food recommendations for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Failed to fetch food recommendations. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrainingListView(generics.ListAPIView):
    """
    API view for listing training categories with their workouts and exercises
    """
    queryset = TrainingCategory.objects.filter(is_active=True)
    serializer_class = TrainingCategorySerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            logger.info(f"Training categories requested by user: {request.user.username}")
            return response
        except Exception as e:
            logger.error(f"Error fetching training categories for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Failed to fetch training categories. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# api/views.py

class NutritionSummaryView(APIView):
    """
    API view for generating nutrition summary based on user profile.
    UPDATED to use a consistent, direct multiplier for protein calculation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = Profile.objects.get(user=request.user)

            if not all([profile.weight, profile.height, profile.age, profile.gender]):
                return Response({
                    'error': 'Profile is incomplete. Please provide weight, height, age, and gender.'
                }, status=status.HTTP_400_BAD_REQUEST)

            bmr = profile.calculate_bmr()
            if bmr is None:
                 return Response({'error': 'Unable to calculate BMR.'}, status=status.HTTP_400_BAD_REQUEST)

            activity_multipliers = {
                'sedentary': 1.2, 'lightly_active': 1.375, 'moderately_active': 1.55,
                'very_active': 1.725, 'extra_active': 1.9
            }
            maintenance_calories = bmr * activity_multipliers.get(profile.activity_level, 1.55)

            if profile.goal == 'fat_loss':
                target_calories = maintenance_calories - 500
            elif profile.goal == 'muscle_gain':
                target_calories = maintenance_calories + 300
            else:
                target_calories = maintenance_calories
            
            # --- UNIFIED PROTEIN LOGIC ---
            # This is the corrected calculation based on goal and experience level.
            if profile.goal == 'muscle_gain':
                multipliers = {'beginner': 1.8, 'intermediate': 2.0, 'advanced': 2.2}
            else: # fat_loss, maintenance, etc.
                multipliers = {'beginner': 1.6, 'intermediate': 1.8, 'advanced': 2.0}
            
            protein_multiplier = multipliers.get(profile.experience_level, 1.8)
            protein_grams = round(profile.weight * protein_multiplier)
            # --- END OF CORRECTED LOGIC ---

            # Calculate remaining calories for carbs and fat
            protein_calories = protein_grams * 4
            remaining_calories = target_calories - protein_calories
            
            # Distribute remaining calories (e.g., 50% carbs, 50% fat, can be adjusted)
            carbs_grams = max(0, round((remaining_calories * 0.5) / 4))
            fat_grams = max(0, round((remaining_calories * 0.5) / 9))

            water_intake_ml = round((profile.weight * 35) + 500)

            summary = {
                'user_info': {
                    'goal': profile.get_goal_display(),
                    'activity_level': profile.get_activity_level_display(),
                    'bmi': profile.bmi,
                    'bmr': round(bmr)
                },
                'calories': {
                    'maintenance': round(maintenance_calories),
                    'target': round(target_calories),
                },
                'macros': {
                    'protein_grams': protein_grams,
                    'carbs_grams': carbs_grams,
                    'fat_grams': fat_grams,
                },
                'hydration': {
                    'daily_water_ml': water_intake_ml,
                    'daily_water_liters': round(water_intake_ml / 1000, 2)
                },
                'tips': self._get_nutrition_tips(profile.goal)
            }

            logger.info(f"Nutrition summary generated for user: {request.user.username}")
            return Response(summary)

        except Profile.DoesNotExist:
            return Response({'error': 'User profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in nutrition summary for {request.user.username}: {str(e)}")
            return Response({'error': 'Failed to generate nutrition summary.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_nutrition_tips(self, goal):
        if goal == 'muscle_gain':
            return ['Focus on lean proteins.', 'Include complex carbs.', 'Don\'t forget healthy fats.']
        elif goal == 'fat_loss':
            return ['Prioritize protein to maintain muscle.', 'Choose high-fiber foods.', 'Limit processed foods and sugars.']
        else:
            return ['Eat a variety of whole foods.', 'Include fruits and vegetables.', 'Stay consistent.']
        
class PersonalizedMealPlanView(APIView):
    """
    API view for generating a personalized meal plan with protein distribution.
    Can generate a full-day plan or provide multiple suggestions for a specific meal
    if a 'meal' query parameter is provided (e.g., ?meal=Lunch).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = Profile.objects.get(user=request.user)
            if not all([profile.weight, profile.height, profile.age, profile.gender]):
                return Response({
                    'error': 'Profile is incomplete. Please provide weight, height, age, and gender to generate a meal plan.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- Step 1: Calculate Total Daily Protein Needs ---
            if profile.goal == 'muscle_gain':
                multipliers = {'beginner': 1.8, 'intermediate': 2.0, 'advanced': 2.2}
            else: # fat_loss, maintenance, etc.
                multipliers = {'beginner': 1.6, 'intermediate': 1.8, 'advanced': 2.0}
            
            protein_multiplier = multipliers.get(profile.experience_level, 1.8) # Default to 1.8
            total_protein_target = round(profile.weight * protein_multiplier)

            # --- Step 2: Define Protein Distribution Across Meals ---
            if profile.goal == 'muscle_gain':
                distribution = {
                    "Breakfast": 0.25, "Lunch": 0.30, "Post-Workout": 0.20, "Dinner": 0.25,
                }
            else:
                distribution = {
                    "Breakfast": 0.30, "Lunch": 0.35, "Snack": 0.10, "Dinner": 0.25,
                }
            
            # --- NEW: Check for a specific meal request ---
            meal_to_expand = request.query_params.get('meal')

            # Determine user's diet preference
            user_diet = profile.diet_preference
            allowed_food_types = ['veg', 'non-veg'] if user_diet == 'both' else [user_diet]

            # --- Logic for getting multiple suggestions for ONE meal ---
            if meal_to_expand and meal_to_expand in distribution:
                meal_protein_target = round(total_protein_target * distribution[meal_to_expand])
                suggestions = self._get_food_suggestions(meal_to_expand, meal_protein_target, allowed_food_types, count=5) # Get top 5
                
                logger.info(f"Expanded meal suggestions for '{meal_to_expand}' requested by user: {request.user.username}")
                return Response({
                    "meal": meal_to_expand,
                    "target_protein_g": meal_protein_target,
                    "suggestions": suggestions
                })

            # --- Original logic for generating the FULL daily plan ---
            meal_plan = []
            for meal, percentage in distribution.items():
                meal_protein_target = round(total_protein_target * percentage)
                # Get just the single best suggestion for the daily plan overview
                suggestions = self._get_food_suggestions(meal, meal_protein_target, allowed_food_types, count=1)
                
                meal_plan.append({
                    "meal": meal,
                    "target_protein_g": meal_protein_target,
                    "suggestions": suggestions
                })

            response_data = {
                "user_goal": profile.goal,
                "daily_protein_target_g": total_protein_target,
                "meal_plan": meal_plan,
                "disclaimer": "This is a sample plan. Click on a meal to see more options. Consult a nutritionist for a complete dietary plan."
            }
            
            logger.info(f"Full meal plan generated for user: {request.user.username}")
            return Response(response_data)

        except Profile.DoesNotExist:
            return Response({'error': 'User profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating meal plan for user {request.user.username}: {str(e)}")
            return Response({'error': 'Failed to generate meal plan.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_food_suggestions(self, meal_name, protein_target, diet_preference, count=1):
        """
        Helper method to find food suggestions.
        'count' parameter determines how many suggestions to return.
        """
        meal_keywords = {
            'Breakfast': ['Oats', 'Eggs', 'Greek Yogurt'],
            'Lunch': ['Chicken Breast', 'Salmon', 'Tofu', 'Quinoa'],
            'Dinner': ['Chicken Breast', 'Salmon', 'Tofu'],
            'Post-Workout': ['Whey Protein', 'Greek Yogurt'],
            'Snack': ['Almonds', 'Greek Yogurt', 'Eggs']
        }
        
        if meal_name in ['Lunch', 'Dinner'] and count > 1:
            # For Lunch/Dinner, find any food with a solid protein content (>15g per 100g).
            # This discovers more options from your dataset.
            food_options = Food.objects.filter(
                protein_per_100g__gte=15, 
                type__in=diet_preference, 
                is_active=True
            ).order_by('-protein_per_100g')
        else:
            # For Breakfast/Snacks or the single-item daily plan, the keyword approach is still effective.
            keywords = meal_keywords.get(meal_name, ['Chicken Breast', 'Tofu', 'Salmon'])
            query = Q()
            for keyword in keywords:
                query |= Q(name__icontains=keyword)
            food_options = Food.objects.filter(query, type__in=diet_preference, is_active=True).order_by('-protein_per_100g')
        # --- END OF MODIFIED LOGIC ---

        if not food_options.exists():
            return [{"food": "No specific suggestion found", "notes": f"Find a food with ~{protein_target}g of protein."}]
        
        # --- MODIFIED: Return multiple suggestions ---
        suggestions = []
        # Take up to 'count' food options
        for food in food_options[:count]:
            if food.protein_per_100g > 0:
                serving_size_g = round((protein_target / food.protein_per_100g) * 100)
                calories = round(food.calories_per_100g * (serving_size_g / 100))
                
                suggestions.append({
                    "food": food.name,
                    "serving_size_g": serving_size_g,
                    "protein_g": protein_target,
                    "calories_approx": calories,
                    "type": food.type
                })
        return suggestions
    

class PerformanceDashboardView(APIView):
    """
    API view to provide analytics on a user's performance data,
    including regression-based predictions for strength trends.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        start_date = timezone.now() - timedelta(days=90)
        activities = Activity.objects.filter(
            user=user, date__gte=start_date
        ).prefetch_related('sets')

        if not activities.exists():
            return Response({
                "message": "No activity logged in the last 90 days. Start a workout to see your stats!",
                "summary_stats": {}, 
                "weekly_frequency": [], 
                "volume_over_time": [], 
                "exercise_progress": [],
                "activity_breakdown": [] # UPDATED: Include empty key
            })
            
        summary_stats = self._get_summary_stats(activities)
        weekly_frequency = self._get_weekly_frequency(activities)
        volume_over_time = self._get_volume_over_time(activities)
        exercise_progress = self._get_exercise_progress_with_prediction(activities)
        # NEW: Get the activity breakdown data
        activity_breakdown = self._get_activity_breakdown(activities)

        response_data = {
            "summary_stats": summary_stats,
            "weekly_frequency": weekly_frequency,
            "volume_over_time": volume_over_time,
            "exercise_progress": exercise_progress,
            "activity_breakdown": activity_breakdown, # NEW: Add to response
        }
        
        return Response(response_data)

    def _get_summary_stats(self, activities):
        # This method is correct and remains the same
        last_30_days_start = timezone.now() - timedelta(days=30)
        activities_30d = activities.filter(date__gte=last_30_days_start)
        total_volume = SetLog.objects.filter(
            activity__in=activities_30d, weight_kg__isnull=False, reps__isnull=False
        ).aggregate(total=Sum(F('weight_kg') * F('reps')))['total'] or 0
        most_frequent = activities_30d.values('name').annotate(
            count=Count('id')
        ).order_by('-count').first()
        return {
            "total_workouts_last_30d": activities_30d.count(),
            "total_volume_last_30d": round(total_volume, 2),
            "most_frequent_activity": most_frequent['name'] if most_frequent else "N/A"
        }

    def _get_weekly_frequency(self, activities):
        # This method is correct and remains the same
        frequency_data = activities.annotate(
            week=TruncWeek('date')
        ).values('week').annotate(count=Count('id')).order_by('week')
        return [
            {"week": item['week'].strftime("%Y-%W"), "workouts": item['count']}
            for item in frequency_data
        ]

    def _get_volume_over_time(self, activities):
        # This method is correct and remains the same
        daily_volumes = {}
        strength_activities = activities.filter(sets__weight_kg__isnull=False, sets__reps__isnull=False).distinct()
        for activity in strength_activities:
            daily_volume = activity.sets.aggregate(total=Sum(F('weight_kg') * F('reps')))['total'] or 0
            date_str = activity.date.isoformat()
            if date_str in daily_volumes:
                daily_volumes[date_str] += daily_volume
            else:
                daily_volumes[date_str] = daily_volume
        sorted_volumes = sorted(daily_volumes.items())
        return [{"date": date, "total_volume": round(volume, 2)} for date, volume in sorted_volumes]

    def _get_exercise_progress_with_prediction(self, activities):
        # This method is correct and remains the same
        all_sets = SetLog.objects.filter(activity__in=activities, weight_kg__isnull=False)
        top_exercises = all_sets.values('exercise_name').annotate(count=Count('id')).order_by('-count')[:3]
        progress_data = []
        for item in top_exercises:
            exercise_name = item['exercise_name']
            daily_max_weight = all_sets.filter(exercise_name=exercise_name).values('activity__date').annotate(
                max_weight=Max('weight_kg')
            ).order_by('activity__date')
            
            if len(daily_max_weight) >= 3:
                dates = [entry['activity__date'] for entry in daily_max_weight]
                weights = [entry['max_weight'] for entry in daily_max_weight]
                first_day = dates[0]
                days_since_start = np.array([(d - first_day).days for d in dates]).reshape(-1, 1)
                model = LinearRegression()
                model.fit(days_since_start, weights)
                last_day_num = (dates[-1] - first_day).days
                pred_in_7_days = model.predict(np.array([[last_day_num + 7]]))[0]
                pred_in_30_days = model.predict(np.array([[last_day_num + 30]]))[0]
                slope = model.coef_[0]
                if slope > 0.1: trend = "Improving"
                elif slope < -0.1: trend = "Declining"
                else: trend = "Stagnant"
                prediction = {
                    "next_week_weight": round(pred_in_7_days, 1),
                    "next_month_weight": round(pred_in_30_days, 1),
                    "trend": trend
                }
            else:
                prediction = { "message": "Not enough data to predict a trend." }

            progress_data.append({
                "exercise_name": exercise_name,
                "progress": [{"date": entry['activity__date'].isoformat(), "max_weight": entry['max_weight']} for entry in daily_max_weight],
                "prediction": prediction
            })
        return progress_data
    
    # --- NEW: Helper method for the doughnut chart ---
    def _get_activity_breakdown(self, activities):
        """Calculates the count of activities per category for the doughnut chart."""
        last_30_days_start = timezone.now() - timedelta(days=30)
        activities_30d = activities.filter(date__gte=last_30_days_start)

        breakdown = activities_30d.values(
            'fitness_activity__category' # Group by the category of the linked FitnessActivity
        ).annotate(
            count=Count('id')
        ).order_by('-count')

        # Filter out null categories if any activities are not linked
        return [
            {"category": item['fitness_activity__category'], "count": item['count']}
            for item in breakdown if item['fitness_activity__category']
        ]
    
class CalendarLogView(APIView):
    """
    Provides a summary of logged activities for a given month and year,
    structured for a calendar view with color-coding by category.
    """
    permission_classes = [IsAuthenticated]

    CATEGORY_COLORS = {
        'Strength': '#4A90E2', 'Cardio': '#D0021B', 'Flexibility': '#7ED321',
        'Sport': '#F5A623', 'Recovery': '#BD10E0', 'Other': '#9B9B9B'
    }

    def get(self, request, *args, **kwargs):
        try:
            year = int(request.query_params.get('year', datetime.date.today().year))
            month = int(request.query_params.get('month', datetime.date.today().month))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid year or month format.'}, status=400)

        activities = Activity.objects.filter(
            user=request.user,
            date__year=year,
            date__month=month
        ).prefetch_related('sets').order_by('timestamp') # Order by time

        # UPDATED: Serialize the full activity data and group it by day
        serialized_data = ActivitySerializer(activities, many=True).data
        logs_by_day = defaultdict(list)
        for activity_data in serialized_data:
            date_str = activity_data['date']
            logs_by_day[date_str].append(activity_data)

        return Response({
            "year": year,
            "month": month,
            "logs": logs_by_day,
            "category_colors": self.CATEGORY_COLORS
        })
    
class TrainingCategoryDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving a single training category with its workouts and exercises.
    """
    queryset = TrainingCategory.objects.filter(is_active=True)
    serializer_class = TrainingCategorySerializer
    permission_classes = [IsAuthenticated]

class FitnessActivityListView(generics.ListAPIView):
    """
    API view for listing all available fitness activities for dropdowns.
    """
    queryset = FitnessActivity.objects.filter(is_active=True).order_by('name')
    serializer_class = FitnessActivitySerializer
    permission_classes = [IsAuthenticated]


class AchievementListView(generics.ListAPIView):
    """
    API view to list all active, available achievements.
    """
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

class UserProgressView(APIView):
    """
    API view to check, update, and return the user's progress on all active achievements.
    When a GET request is made, it calculates progress for the current month.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        profile = user.profile
        today = date.today()
        start_of_month = today.replace(day=1)

        active_achievements = Achievement.objects.filter(is_active=True)
        user_achievements_status = []

        for achievement in active_achievements:
            user_achievement, created = UserAchievement.objects.get_or_create(
                user=user,
                achievement=achievement
            )
            
            # Skip recalculation for achievements already unlocked this month (or ever)
            # A more advanced system could reset monthly challenges, but for now, we'll keep it simple.
            if user_achievement.is_unlocked:
                user_achievements_status.append(user_achievement)
                continue

            # --- Calculate current progress based on the achievement's metric for the current month ---
            current_progress = 0
            user_activities = Activity.objects.filter(
                user=user, 
                date__gte=start_of_month,
                fitness_activity__category=achievement.category
            )

            if achievement.metric == 'volume':
                volume_data = SetLog.objects.filter(
                    activity__in=user_activities, weight_kg__isnull=False, reps__isnull=False
                ).aggregate(total_volume=Sum(F('weight_kg') * F('reps')))
                current_progress = volume_data.get('total_volume') or 0

            elif achievement.metric == 'duration':
                duration_data = user_activities.aggregate(total_duration=Sum('duration'))
                current_progress = duration_data.get('total_duration') or 0

            elif achievement.metric == 'frequency':
                current_progress = user_activities.count()

            # Update the user's progress value
            user_achievement.progress_value = round(current_progress, 2)

            # --- Check for unlock condition ---
            if current_progress >= achievement.target_value:
                user_achievement.is_unlocked = True
                user_achievement.unlocked_at = timezone.now()
                
                # Award points to the user's profile and save
                profile.reward_points += achievement.points_reward
                profile.save()
            
            user_achievement.save()
            user_achievements_status.append(user_achievement)

        serializer = UserAchievementSerializer(user_achievements_status, many=True)
        return Response(serializer.data)


class CompetitionCategoryListView(generics.ListAPIView):
    """
    API endpoint to list all main competition categories (Gym, Sports, etc.).
    """
    queryset = CompetitionCategory.objects.all()
    serializer_class = CompetitionCategoryListSerializer
    permission_classes = [IsAuthenticated]

class CompetitionCategoryDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a single category and the list of competitions within it.
    """
    queryset = CompetitionCategory.objects.all()
    serializer_class = CompetitionCategoryDetailSerializer
    permission_classes = [IsAuthenticated]

class CompetitionTypeDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve the full, detailed pre-competition plan for a specific competition.
    """
    queryset = CompetitionType.objects.all()
    serializer_class = CompetitionTypeDetailSerializer
    permission_classes = [IsAuthenticated]

class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for retrieving, updating, and deleting a single user activity.
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This ensures that users can only access and modify their own activities.
        """
        return Activity.objects.filter(user=self.request.user)
    
class LogHealthDataView(generics.CreateAPIView):
    """
    API endpoint for an IoT device (like Arduino) to POST new health data.
    """
    serializer_class = HealthDataLogSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically associate the new log with the currently logged-in user
        serializer.save(user=self.request.user)

class HealthDataHistoryView(APIView):
    """
    API endpoint for the frontend to GET historical health data for graphs.
    This view aggregates the data into hourly averages for clearer trends.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        queryset = HealthDataLog.objects.filter(user=user)

        # Handle date filtering
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__date__lte=end_date)
        
        # --- THIS IS THE NEW AGGREGATION LOGIC ---
        hourly_data = queryset.annotate(
            hour=TruncHour('timestamp')  # Group by the hour
        ).values(
            'hour'  # Group by this field
        ).annotate(
            # Calculate the average for each metric in that hour
            avg_systolic=Avg('systolic_bp'),
            avg_diastolic=Avg('diastolic_bp'),
            avg_spo2=Avg('spo2'),
            avg_stress=Avg('stress_level'),
            # For steps, the max value in that hour is the most accurate
            max_steps=Max('steps_today')
        ).order_by('hour') # Order the results by time

        # The frontend expects specific key names, so we rename them for consistency
        # We also rename 'hour' to 'timestamp' for the chart
        formatted_data = [
            {
                'timestamp': item['hour'],
                'systolic_bp': item['avg_systolic'],
                'diastolic_bp': item['avg_diastolic'],
                'spo2': item['avg_spo2'],
                'stress_level': item['avg_stress'],
                'steps_today': item['max_steps'],
            }
            for item in hourly_data
        ]
        
        return Response(formatted_data)

class HealthDataAnalysisView(APIView):
    """
    API endpoint to run an ML model and rule-based checks on health data 
    to find anomalies, measure risks, and generate alerts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)
        logs = HealthDataLog.objects.filter(user=user, timestamp__gte=thirty_days_ago).order_by('timestamp')

        if logs.count() < 5:
            return Response({"message": "Not enough data for analysis. At least 5 readings are required.", "alerts": []})

        alerts = []
        latest_log = logs.first()

        # Rule: High Blood Pressure
        if latest_log.systolic_bp and latest_log.systolic_bp >= 140 or latest_log.diastolic_bp and latest_log.diastolic_bp >= 90:
            alerts.append({
                "level": "High Risk", "title": "High Blood Pressure Detected",
                "message": f"Your recent reading of {latest_log.systolic_bp}/{latest_log.diastolic_bp} mmHg is high. Please rest and re-measure. If it remains elevated, consult a healthcare professional.",
                "timestamp": latest_log.timestamp
            })

        # Rule: Low Blood Oxygen
        if latest_log.spo2 and latest_log.spo2 < 94:
            alerts.append({
                "level": "Warning", "title": "Low Blood Oxygen Reading",
                "message": f"Your blood oxygen level of {latest_log.spo2}% is lower than normal. Ensure the sensor is placed correctly and re-measure. If it stays low, seek medical advice.",
                "timestamp": latest_log.timestamp
            })
        
        # --- NEW: Rule for rapid changes in the last hour ---
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_logs = logs.filter(timestamp__gte=one_hour_ago).order_by('timestamp')
        
        # Check for rapid stress increase if we have at least 2 readings in the last hour
        if recent_logs.count() >= 2:
            first_stress = recent_logs.first().stress_level
            last_stress = recent_logs.last().stress_level
            if first_stress is not None and last_stress is not None and (last_stress - first_stress) > 20:
                 alerts.append({
                    "level": "Warning",
                    "title": "Rapid Stress Increase Detected",
                    "message": f"Your stress level appears to have increased significantly in the last hour (from {first_stress} to {last_stress}). Consider taking a short break or practicing a relaxation technique.",
                    "timestamp": recent_logs.last().timestamp
                })

        # --- 2. ML-Based Anomaly Detection ---
        data = pd.DataFrame(list(logs.values('timestamp', 'systolic_bp', 'diastolic_bp', 'spo2', 'stress_level')))
        data.dropna(inplace=True)

        if len(data) >= 5:
            features = ['systolic_bp', 'diastolic_bp', 'spo2', 'stress_level']
            model = IsolationForest(contamination='auto', random_state=42)
            predictions = model.fit_predict(data[features])
            data['is_anomaly'] = predictions
            
            anomalies = data[data['is_anomaly'] == -1]
            for _, row in anomalies.iterrows():
                if not any(a['timestamp'] == row['timestamp'] for a in alerts):
                    alerts.append({
                        "level": "Info", "title": "Unusual Pattern Detected",
                        "message": "A recent health reading was flagged as unusual compared to your normal patterns. Review this reading with your health provider if you feel unwell.",
                        "timestamp": row['timestamp']
                    })

        return Response({
            "analysis_period_days": 30,
            "total_readings": logs.count(),
            "alerts": alerts
        })
    
class WorkoutDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving a single workout with its exercises.
    """
    queryset = Workout.objects.filter(is_active=True)
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]