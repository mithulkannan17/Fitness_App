from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

#-------------------------------------------------------------------------------

class Profile(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    GOAL_CHOICES = [
        ('muscle_gain', 'Muscle Gain'),
        ('fat_loss', 'Fat Loss'),
        ('maintenance', 'Maintenance'),
        ('endurance', 'Endurance'),
    ]
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary (little/no exercise)'),
        ('lightly_active', 'Lightly Active (light exercise/sports 1-3 days/week)'),
        ('moderately_active', 'Moderately Active (moderate exercise/sports 3-5 days/week)'),
        ('very_active', 'Very Active (hard exercise/sports 6-7 days a week)'),
        ('extra_active', 'Extra Active (very hard exercise/sports & physical job)'),
    ]
    DIET_CHOICES = [
        ('veg', 'Vegetarian'),
        ('non-veg', 'Non-Vegetarian'),
        ('both', 'Both'),
    ]
    EXPERIENCE_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(13), MaxValueValidator(120)])
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg", validators=[MinValueValidator(20.0), MaxValueValidator(500.0)])
    height = models.FloatField(null=True, blank=True, help_text="Height in cm", validators=[MinValueValidator(100.0), MaxValueValidator(250.0)])
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='muscle_gain')
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, default='moderately_active')
    diet_preference = models.CharField(max_length=10, choices=DIET_CHOICES, default='both')
    experience_level = models.CharField(max_length=15, choices=EXPERIENCE_CHOICES, default='intermediate')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    reward_points = models.PositiveIntegerField(default=0, help_text="Total points earned from achievements")

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.user.username

    @property
    def bmi(self):
        if self.height and self.weight:
            return round(self.weight / ((self.height / 100) ** 2), 2)
        return None

    @property
    def full_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.user.username
    
    @property
    def rank(self):
        """Determines user rank based on reward points."""
        points = self.reward_points
        if points >= 1000:
            return 'Platinum'
        elif points >= 500:
            return 'Gold'
        elif points >= 200:
            return 'Silver'
        elif points >= 50:
            return 'Bronze'
        else:
            return 'Novice'

    def calculate_bmr(self):
        if not all([self.weight, self.height, self.age]):
            return None
        if self.gender == 'M':
            return 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        elif self.gender == 'F':
            return 10 * self.weight + 6.25 * self.height - 5 * self.age - 161
        else:
            return 10 * self.weight + 6.25 * self.height - 5 * self.age - 78

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        
    
#-------------------------------------------------------------------------------

# DEFINED HERE so it can be used by the Activity model below
class FitnessActivity(models.Model):
    CATEGORY_CHOICES = [
        ('Strength', 'Strength Training'),
        ('Cardio', 'Cardiovascular'),
        ('Flexibility', 'Flexibility & Mobility'),
        ('Sport', 'Sports'),
        ('Recovery', 'Recovery & Rehabilitation'),
    ]
    INTENSITY_CHOICES = [('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High'), ('very_high', 'Very High')]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    intensity = models.CharField(max_length=10, choices=INTENSITY_CHOICES)
    description = models.TextField()
    target_muscles = models.TextField()
    calories_per_hour = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(50), MaxValueValidator(2000)])
    difficulty_level = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(10)])
    equipment_needed = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Fitness Activity"
        verbose_name_plural = "Fitness Activities"
        ordering = ['category', 'name']

#-------------------------------------------------------------------------------

# CORRECTED: Single definition of Activity, placed after FitnessActivity
class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    fitness_activity = models.ForeignKey(FitnessActivity, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    name = models.CharField(max_length=100)
    date = models.DateField()
    timestamp = models.DateTimeField(default=timezone.now)
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in minutes", validators=[MaxValueValidator(1440)])
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'{self.name} on {self.date} by {self.user.username}'

    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"
        ordering = ['-date', '-timestamp']

#-------------------------------------------------------------------------------

class SetLog(models.Model):
    activity = models.ForeignKey(Activity, related_name='sets', on_delete=models.CASCADE)
    exercise_name = models.CharField(max_length=100)
    weight_kg = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0.0), MaxValueValidator(1000.0)])
    reps = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(1000)])
    distance_km = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0.0), MaxValueValidator(1000.0)])
    duration_minutes = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(1440)])
    rest_seconds = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(3600)])
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Set for {self.exercise_name} - Activity: {self.activity.name}'

    class Meta:
        verbose_name = "Set Log"
        verbose_name_plural = "Set Logs"
        ordering = ['created_at']

#-------------------------------------------------------------------------------

class Food(models.Model):
    FOOD_TYPE_CHOICES = [('veg', 'Vegetarian'), ('non-veg', 'Non-Vegetarian'), ('vegan', 'Vegan')]

    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=10, choices=FOOD_TYPE_CHOICES)
    calories_per_100g = models.PositiveIntegerField(validators=[MaxValueValidator(1000)])
    protein_per_100g = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    carbs_per_100g = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    fat_per_100g = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    fiber_per_100g = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    serving_size = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Food Item"
        verbose_name_plural = "Food Items"
        ordering = ['name']

#-------------------------------------------------------------------------------

class Injury(models.Model):
    SEVERITY_CHOICES = [('mild', 'Mild'), ('moderate', 'Moderate'), ('severe', 'Severe')]

    name = models.CharField(max_length=100, unique=True)
    affected_part = models.CharField(max_length=100)
    symptoms = models.TextField()
    first_aid = models.TextField()
    treatment_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='mild')
    recovery_time_days = models.PositiveIntegerField(null=True, blank=True, help_text="Estimated recovery time in days")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Injury"
        verbose_name_plural = "Injuries"
        ordering = ['name']

#-------------------------------------------------------------------------------

class TrainingCategory(models.Model):
    CATEGORY_TYPE_CHOICES = [
        ('Strength', 'Strength Training'),
        ('Cardio', 'Cardiovascular'),
        ('Flexibility', 'Flexibility & Mobility'),
        ('Sport', 'Sports'),
        ('Recovery', 'Recovery & Rehabilitation'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    color_code = models.CharField(max_length=7, default='#4A90E2', help_text="Hex color for this category")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Training Category"
        verbose_name_plural = "Training Categories"
        ordering = ['category_type', 'name']

#-------------------------------------------------------------------------------

class Workout(models.Model):
    training_category = models.ForeignKey(TrainingCategory, related_name='workouts', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    estimated_duration = models.PositiveIntegerField(null=True, blank=True, help_text="Estimated duration in minutes", validators=[MaxValueValidator(480)])
    difficulty_level = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(10)])
    color_code = models.CharField(max_length=7, default='#7ED321', help_text="Hex color for this workout")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.training_category.name})"

    class Meta:
        verbose_name = "Workout"
        verbose_name_plural = "Workouts"
        ordering = ['training_category', 'name']

#-------------------------------------------------------------------------------

class Exercise(models.Model):
    DIFFICULTY_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced'), ('expert', 'Expert')]

    workout = models.ForeignKey(Workout, related_name='exercises', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    target_muscles = models.CharField(max_length=200)
    difficulty_level = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, default='beginner')
    sets_recommended = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(20)])
    reps_recommended = models.CharField(max_length=50, blank=True, help_text="e.g., '8-12', '30 seconds', 'to failure'")
    rest_between_sets = models.PositiveIntegerField(null=True, blank=True, help_text="Rest time in seconds", validators=[MaxValueValidator(600)])
    instructions = models.TextField(blank=True)
    safety_tips = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.workout.name})"

    class Meta:
        verbose_name = "Exercise"
        verbose_name_plural = "Exercises"
        ordering = ['workout', 'name']


class Achievement(models.Model):
    """Defines a challenge or award that a user can earn."""
    METRIC_CHOICES = [
        ('volume', 'Total Volume (kg)'),
        ('duration', 'Total Duration (minutes)'),
        ('frequency', 'Workout Frequency (count)'),
    ]
    CATEGORY_CHOICES = FitnessActivity.CATEGORY_CHOICES

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, help_text="The category of activity this achievement applies to.")
    metric = models.CharField(max_length=20, choices=METRIC_CHOICES, help_text="The metric to track for this achievement.")
    target_value = models.FloatField(help_text="The target value the user must reach.")
    points_reward = models.PositiveIntegerField(help_text="Points awarded upon completion.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Achievement"
        verbose_name_plural = "Achievements"
        ordering = ['category', 'target_value']

#-------------------------------------------------------------------------------

class UserAchievement(models.Model):
    """Tracks a user's progress towards an achievement."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_progress')
    progress_value = models.FloatField(default=0, help_text="The user's current progress towards the target.")
    is_unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'achievement') # A user can only have one entry per achievement

    def __str__(self):
        status = "Unlocked" if self.is_unlocked else f"{self.progress_value:.0f}/{self.achievement.target_value:.0f}"
        return f'{self.user.username} - {self.achievement.name} ({status})'
    
class CompetitionCategory(models.Model):
    """A top-level category for competition plans, e.g., 'Gym', 'Sports'."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color_code = models.CharField(max_length=7, default='#FFFFFF', help_text="Hex color code for the category, e.g., #4A90E2")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Competition Category"
        verbose_name_plural = "Competition Categories"
        ordering = ['name']


class CompetitionType(models.Model):
    """A specific type of competition within a category, e.g., 'Powerlifting'."""
    category = models.ForeignKey(CompetitionCategory, on_delete=models.CASCADE, related_name='competition_types')
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

    class Meta:
        verbose_name = "Competition Type"
        verbose_name_plural = "Competition Types"
        ordering = ['category', 'name']


class PlanPhase(models.Model):
    """A specific phase of the plan, e.g., 'The Day Before', 'Competition Day'."""
    competition_type = models.ForeignKey(CompetitionType, on_delete=models.CASCADE, related_name='plan_phases')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, help_text="A summary of the goals for this phase.")
    order = models.PositiveIntegerField(default=0, help_text="The display order of the phase (e.g., 1 for Day Before, 2 for Competition Day).")

    def __str__(self):
        return f"{self.competition_type.name} - {self.title}"

    class Meta:
        verbose_name = "Plan Phase"
        verbose_name_plural = "Plan Phases"
        ordering = ['competition_type', 'order']


class PlanItem(models.Model):
    """A single piece of advice within a plan phase (e.g., a food to eat, an exercise to do)."""
    ITEM_TYPE_CHOICES = [
        ('Nutrition', 'Nutrition'),
        ('Hydration', 'Hydration'),
        ('Workout', 'Workout / Exercise'),
        ('Recovery', 'Recovery / Rest'),
        ('Mindset', 'Mindset / Mental Prep'),
        ('Warning', 'What to Avoid'),
    ]
    phase = models.ForeignKey(PlanPhase, on_delete=models.CASCADE, related_name='plan_items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="The detailed advice or instruction.")
    amount_suggestion = models.CharField(max_length=100, blank=True, help_text="Optional: Suggested amounts, e.g., '3 liters' or '20g protein'.")
    order = models.PositiveIntegerField(default=0, help_text="The display order of this item within the phase.")

    def __str__(self):
        return f"{self.phase.title} - {self.title}"

    class Meta:
        verbose_name = "Plan Item"
        verbose_name_plural = "Plan Items"
        ordering = ['phase', 'order']

#-------------------------------------------------------------------------------

class HealthDataLog(models.Model):
    """
    Stores a single snapshot of health data from a sensor or manual entry.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_logs')
    timestamp = models.DateTimeField(default=timezone.now)
    systolic_bp = models.PositiveIntegerField(null=True, blank=True, help_text="Systolic Blood Pressure (upper value)")
    diastolic_bp = models.PositiveIntegerField(null=True, blank=True, help_text="Diastolic Blood Pressure (lower value)")
    spo2 = models.FloatField(null=True, blank=True, help_text="Blood Oxygen Saturation (%)")
    stress_level = models.PositiveIntegerField(null=True, blank=True, help_text="A score representing stress, e.g., 1-100")
    steps_today = models.PositiveIntegerField(null=True, blank=True, help_text="Cumulative steps for the day of the reading")

    class Meta:
        verbose_name = "Health Data Log"
        verbose_name_plural = "Health Data Logs"
        ordering = ['-timestamp']