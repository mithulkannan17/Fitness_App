# serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import (
    User, Profile, Activity, SetLog, Food, Injury, 
    Exercise, Workout, TrainingCategory, FitnessActivity, Achievement, UserAchievement, CompetitionCategory, CompetitionType, PlanPhase, PlanItem, HealthDataLog
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        # Remove password_confirm as it's not needed for user creation
        validated_data.pop('password_confirm', None)
        user = User.objects.create_user(**validated_data)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    # Add read-only fields for calculated values
    bmi = serializers.SerializerMethodField(read_only=True)
    bmr = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)
    
    GENDER_MAP = {
        'Male': 'M',
        'Female': 'F',
        'Other': 'O'
    }

    REVERSE_GENDER_MAP = {v: k for k, v in GENDER_MAP.items()}
    class Meta:
        model = Profile
        fields = (
            'first_name', 'last_name', 'gender', 'age', 'weight', 
            'height', 'goal', 'activity_level', 'diet_preference', 'experience_level', 'bmi', 'bmr', 'full_name', 'reward_points', 'rank'
        )
        
    def validate_experience_level(self, value):
        valid_levels = ['beginner', 'intermediate', 'advanced']
        if value and value not in valid_levels:
            raise serializers.ValidationError(f"Experience level must be one of: {', '.join(valid_levels)}")
        return value
        
    def validate_diet_preference(self, value):
        valid_diets = ['veg', 'non-veg', 'both']
        if value and value not in valid_diets:
            raise serializers.ValidationError(f"Diet preference must be one of: {', '.join(valid_diets)}")
        return value    
    
    def get_bmi(self, obj):
        """Calculate BMI if height and weight are available"""
        return obj.bmi

    def get_bmr(self, obj):
        """Calculate BMR using the model method"""
        return obj.calculate_bmr()

    def get_full_name(self, obj):
        """Get full name using the model property"""
        return obj.full_name
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data['gender']:
            data['gender'] = self.REVERSE_GENDER_MAP.get(data['gender'], data['gender'])
        return data

    def to_internal_value(self, data):
        if 'gender' in data and data['gender'] in self.GENDER_MAP:
            data['gender'] = self.GENDER_MAP[data['gender']]
        return super().to_internal_value(data)

    def validate_age(self, value):
        if value is not None and (value < 13 or value > 120):
            raise serializers.ValidationError("Age must be between 13 and 120.")
        return value

    def validate_weight(self, value):
        if value is not None and (value < 20 or value > 500):
            raise serializers.ValidationError("Weight must be between 20 and 500 kg.")
        return value

    def validate_height(self, value):
        if value is not None and (value < 100 or value > 250):
            raise serializers.ValidationError("Height must be between 100 and 250 cm.")
        return value

    def validate_goal(self, value):
        valid_goals = ['muscle_gain', 'fat_loss', 'maintenance', 'endurance']
        if value and value not in valid_goals:
            raise serializers.ValidationError(f"Goal must be one of: {', '.join(valid_goals)}")
        return value

    def validate_activity_level(self, value):
        valid_levels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']
        if value and value not in valid_levels:
            raise serializers.ValidationError(f"Activity level must be one of: {', '.join(valid_levels)}")
        return value


class SetLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetLog
        fields = ['exercise_name', 'weight_kg', 'reps', 'distance_km', 'duration_minutes', 'rest_seconds']


    def validate_weight_kg(self, value):
        if value is not None and (value < 0 or value > 1000):
            raise serializers.ValidationError("Weight must be between 0 and 1000 kg.")
        return value

    def validate_reps(self, value):
        if value is not None and (value < 0 or value > 1000):
            raise serializers.ValidationError("Reps must be between 0 and 1000.")
        return value

    def validate_distance_km(self, value):
        if value is not None and (value < 0 or value > 1000):
            raise serializers.ValidationError("Distance must be between 0 and 1000 km.")
        return value

    def validate_duration_minutes(self, value):
        if value is not None and (value < 0 or value > 1440):
            raise serializers.ValidationError("Duration must be between 0 and 1440 minutes.")
        return value

    def validate_rest_seconds(self, value):
        if value is not None and (value < 0 or value > 3600):
            raise serializers.ValidationError("Rest time must be between 0 and 3600 seconds.")
        return value


class ActivitySerializer(serializers.ModelSerializer):
    # This line allows you to include a list of sets when creating an activity.
    sets = SetLogSerializer(many=True) 
    
    fitness_activity_id = serializers.PrimaryKeyRelatedField(
        queryset=FitnessActivity.objects.all(), source='fitness_activity', write_only=True, required=False, allow_null=True
    )
    category = serializers.CharField(source='fitness_activity.category', read_only=True)
    
    class Meta:
        model = Activity
        fields = ('id', 'name', 'date', 'duration', 'notes', 'fitness_activity_id', 'category', 'sets')

    def create(self, validated_data):
        """
        Handles the creation of the Activity and its associated, nested SetLog objects.
        """
        sets_data = validated_data.pop('sets')
        activity = Activity.objects.create(**validated_data)
        for set_data in sets_data:
            SetLog.objects.create(activity=activity, **set_data)
        return activity

    def update(self, instance, validated_data):
        """
        Handles updating the Activity and replacing its SetLog objects.
        """
        # Pop the nested sets data
        sets_data = validated_data.pop('sets', None)

        # Update the main activity instance
        instance.name = validated_data.get('name', instance.name)
        instance.date = validated_data.get('date', instance.date)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.fitness_activity = validated_data.get('fitness_activity', instance.fitness_activity)
        instance.save()

        # If sets data is provided, delete old sets and create new ones
        if sets_data is not None:
            # Delete all existing sets for this activity
            instance.sets.all().delete()
            # Create new sets from the provided data
            for set_data in sets_data:
                SetLog.objects.create(activity=instance, **set_data)

        return instance

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Food name must be at least 2 characters long.")
        return value.strip()

    def validate_type(self, value):
        valid_types = ['veg', 'non-veg', 'vegan']
        if value and value not in valid_types:
            raise serializers.ValidationError(f"Food type must be one of: {', '.join(valid_types)}")
        return value

    def validate_calories_per_100g(self, value):
        if value is not None and (value < 0 or value > 1000):
            raise serializers.ValidationError("Calories per 100g must be between 0 and 1000.")
        return value

    def validate_protein_per_100g(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Protein per 100g must be between 0 and 100.")
        return value

    def validate_carbs_per_100g(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Carbs per 100g must be between 0 and 100.")
        return value

    def validate_fat_per_100g(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Fat per 100g must be between 0 and 100.")
        return value


class InjurySerializer(serializers.ModelSerializer):
    class Meta:
        model = Injury
        fields = '__all__'

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Injury name must be at least 2 characters long.")
        return value.strip()

    def validate_severity(self, value):
        if value:
            valid_severities = ['mild', 'moderate', 'severe']
            if value.lower() not in valid_severities:
                raise serializers.ValidationError(f"Severity must be one of: {', '.join(valid_severities)}")
        return value

    def validate_recovery_time_days(self, value):
        if value is not None and (value < 0 or value > 3650):  # Max ~10 years
            raise serializers.ValidationError("Recovery time must be between 0 and 3650 days.")
        return value


class ExerciseSerializer(serializers.ModelSerializer):
    color_code = serializers.CharField(source='workout.color_code', read_only=True)
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'target_muscles', 'difficulty_level',
            'sets_recommended', 'reps_recommended', 'rest_between_sets',
            'instructions', 'safety_tips', 'color_code'
        ]

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Exercise name must be at least 2 characters long.")
        return value.strip()

    def validate_difficulty_level(self, value):
        valid_levels = ['beginner', 'intermediate', 'advanced', 'expert']
        if value and value not in valid_levels:
            raise serializers.ValidationError(f"Difficulty level must be one of: {', '.join(valid_levels)}")
        return value


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    exercise_count = serializers.SerializerMethodField(read_only=True)
    category_name = serializers.CharField(source='training_category.name', read_only=True)
    parent_color_code = serializers.CharField(source='training_category.color_code', read_only=True)

    class Meta:
        model = Workout
        fields = [
            'id', 'name', 'description', 'exercises', 'exercise_count', 
            'estimated_duration', 'difficulty_level', 'category_name', 'color_code', 'parent_color_code', 'imageUrl'
        ]

    def get_exercise_count(self, obj):
        """Return the number of exercises in this workout"""
        return obj.exercises.count() if hasattr(obj, 'exercises') else 0

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Workout name must be at least 2 characters long.")
        return value.strip()

    def validate_difficulty_level(self, value):
        if value is not None and (value < 1 or value > 10):
            raise serializers.ValidationError("Difficulty level must be between 1 and 10.")
        return value

    def validate_estimated_duration(self, value):
        if value is not None and (value < 1 or value > 480):
            raise serializers.ValidationError("Estimated duration must be between 1 and 480 minutes.")
        return value


class TrainingCategorySerializer(serializers.ModelSerializer):
    workouts = WorkoutSerializer(many=True, read_only=True)
    workout_count = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = TrainingCategory
        fields = ['id', 'name', 'category_type', 'description', 'workouts', 'workout_count', 'color_code']

    def get_workout_count(self, obj):
        """Return the number of workouts in this category"""
        return obj.workouts.count() if hasattr(obj, 'workouts') else 0

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long.")
        return value.strip()

    def validate_category_type(self, value):
        if value:
            valid_types = ['Strength', 'Cardio', 'Flexibility', 'Sport', 'Recovery']
            if value not in valid_types:
                raise serializers.ValidationError(f"Category type must be one of: {', '.join(valid_types)}")
        return value


class FitnessActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = FitnessActivity
        fields = [
            'id', 'name', 'category', 'intensity', 'description', 
            'target_muscles', 'calories_per_hour', 'difficulty_level', 'equipment_needed'
        ]

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Activity name must be at least 2 characters long.")
        return value.strip()

    def validate_calories_per_hour(self, value):
        if value is not None and (value < 50 or value > 2000):
            raise serializers.ValidationError("Calories per hour must be between 50 and 2000.")
        return value

    def validate_category(self, value):
        if value:
            valid_categories = ['Strength', 'Cardio', 'Flexibility', 'Sport', 'Recovery']
            if value not in valid_categories:
                raise serializers.ValidationError(f"Category must be one of: {', '.join(valid_categories)}")
        return value

    def validate_intensity(self, value):
        if value:
            valid_intensities = ['low', 'moderate', 'high', 'very_high']
            if value not in valid_intensities:
                raise serializers.ValidationError(f"Intensity must be one of: {', '.join(valid_intensities)}")
        return value

    def validate_difficulty_level(self, value):
        if value is not None and (value < 1 or value > 10):
            raise serializers.ValidationError("Difficulty level must be between 1 and 10.")
        return value
    

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ('id', 'name', 'description', 'category', 'metric', 'target_value', 'points_reward')

class UserAchievementSerializer(serializers.ModelSerializer):
    # Pull details from the related Achievement model to provide full context
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    description = serializers.CharField(source='achievement.description', read_only=True)
    metric = serializers.CharField(source='achievement.metric', read_only=True)
    target_value = serializers.FloatField(source='achievement.target_value', read_only=True)
    points_reward = serializers.IntegerField(source='achievement.points_reward', read_only=True)
    category = serializers.CharField(source='achievement.category', read_only=True)

    class Meta:
        model = UserAchievement
        fields = (
            'id', 'achievement_name', 'description', 'category', 'metric',
            'target_value', 'progress_value', 'is_unlocked', 'unlocked_at', 'points_reward'
        )

class PlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanItem
        fields = ['item_type', 'title', 'description', 'amount_suggestion', 'order']

class PlanPhaseSerializer(serializers.ModelSerializer):
    plan_items = PlanItemSerializer(many=True, read_only=True)

    class Meta:
        model = PlanPhase
        fields = ['title', 'description', 'order', 'plan_items']

class CompetitionTypeDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for a single competition, including its full plan.
    """
    plan_phases = PlanPhaseSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = CompetitionType
        fields = ['id', 'name', 'description', 'category_name', 'plan_phases']

class CompetitionTypeListSerializer(serializers.ModelSerializer):
    """
    A simple serializer for listing competition types within a category.
    """
    class Meta:
        model = CompetitionType
        fields = ['id', 'name', 'description']

class CompetitionTypeDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for a single competition, including its full plan.
    """
    plan_phases = PlanPhaseSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = CompetitionType
        # Add 'category' to this list
        fields = ['id', 'name', 'description', 'category_name', 'plan_phases', 'category']

class CompetitionCategoryListSerializer(serializers.ModelSerializer):
    """
    A simple serializer for the top-level list of all categories.
    """
    class Meta:
        model = CompetitionCategory
        fields = ['id', 'name', 'description', 'color_code']

class HealthDataLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthDataLog
        fields = [
            'id', 'timestamp', 'systolic_bp', 'diastolic_bp',
            'spo2', 'stress_level', 'steps_today'
        ]

#-------------------------------------------------------------------------------
# Serializers for the Champion Space
#-------------------------------------------------------------------------------

class PlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanItem
        fields = ['item_type', 'title', 'description', 'amount_suggestion', 'order']

class PlanPhaseSerializer(serializers.ModelSerializer):
    plan_items = PlanItemSerializer(many=True, read_only=True)

    class Meta:
        model = PlanPhase
        fields = ['title', 'description', 'order', 'plan_items']

class CompetitionTypeDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for a single competition, including its full plan.
    """
    plan_phases = PlanPhaseSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    # The 'category' field is the ID of the parent category, for the "Back" link
    category = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CompetitionType
        fields = ['id', 'name', 'description', 'category_name', 'plan_phases', 'category']

class CompetitionTypeListSerializer(serializers.ModelSerializer):
    """
    A simple serializer for listing competition types within a category.
    """
    class Meta:
        model = CompetitionType
        fields = ['id', 'name', 'description']

class CompetitionCategoryDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for a single category that includes a list of its competitions.
    """
    competition_types = CompetitionTypeListSerializer(many=True, read_only=True)
    
    class Meta:
        model = CompetitionCategory
        fields = ['id', 'name', 'description', 'color_code', 'competition_types']

class CompetitionCategoryListSerializer(serializers.ModelSerializer):
    """
    A simple serializer for the top-level list of all categories.
    """
    class Meta:
        model = CompetitionCategory
        fields = ['id', 'name', 'description', 'color_code']