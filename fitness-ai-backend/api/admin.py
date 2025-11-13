from django.contrib import admin
from .models import (
    User, Profile, Activity, SetLog, Food, Injury, 
    Exercise, Workout, TrainingCategory, FitnessActivity, Achievement, 
    UserAchievement, CompetitionCategory, CompetitionType, PlanPhase, 
    PlanItem, HealthDataLog
)

# This is the important part
@admin.register(FitnessActivity)
class FitnessActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'intensity', 'difficulty_level')
    search_fields = ('name', 'category', 'target_muscles')
    list_filter = ('category', 'intensity', 'difficulty_level')

# You can also register other models to see them
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Activity)
admin.site.register(TrainingCategory)
admin.site.register(Workout)
admin.site.register(Exercise)
admin.site.register(Injury)
admin.site.register(Food)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(CompetitionCategory)
admin.site.register(CompetitionType)
admin.site.register(PlanPhase)
admin.site.register(PlanItem)
admin.site.register(HealthDataLog)