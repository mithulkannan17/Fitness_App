import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Food, Injury, TrainingCategory, Workout, Exercise, FitnessActivity, Achievement, CompetitionCategory, CompetitionType, PlanPhase, PlanItem


class Command(BaseCommand):
    help = 'Uploads data from JSON files to the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before uploading',
        )
        parser.add_argument(
            '--data-type',
            type=str,
            choices=['all', 'food', 'injury', 'training', 'fitness', 'achievements', 'competition'],
            default='all',
            help='Specify which data to upload',
        )

    def handle(self, *args, **options):
        data_dir = settings.BASE_DIR / 'api' / 'datasets'
        
        if not data_dir.exists():
            self.stdout.write(
                self.style.ERROR(f'Data directory not found: {data_dir}')
            )
            return

        clear_data = options['clear']
        data_type = options['data_type']

        try:
            if data_type in ['all', 'food']:
                self.upload_food_data(data_dir, clear_data)
            
            if data_type in ['all', 'injury']:
                self.upload_injury_data(data_dir, clear_data)
            
            if data_type in ['all', 'training']:
                self.upload_training_data(data_dir, clear_data)
            
            if data_type in ['all', 'fitness']:
                self.upload_fitness_activities(data_dir, clear_data)

            if data_type in ['all', 'achievements']:
                self.upload_achievements_data(data_dir, clear_data)

            if data_type in ['all', 'competition']:
                self.upload_competition_plans(data_dir, clear_data)

            self.stdout.write(
                self.style.SUCCESS('Data upload completed successfully!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error during data upload: {str(e)}')
            )

    def upload_food_data(self, data_dir, clear_data=False):
        """Upload food data from JSON file"""
        self.stdout.write('Uploading food data...')
        
        if clear_data:
            Food.objects.all().delete()
            self.stdout.write('Cleared existing food data.')

        food_file = data_dir / 'foods.json'
        if not food_file.exists():
            self.stdout.write(
                self.style.WARNING(f'Food data file not found: {food_file}')
            )
            return

        with open(food_file, 'r', encoding='utf-8') as f:
            foods_data = json.load(f)
            
            created_count = 0
            for food_data in foods_data:
                food, created = Food.objects.get_or_create(
                    name=food_data['name'],
                    defaults={
                        'type': food_data.get('type', 'veg'),
                        'calories_per_100g': food_data.get('calories_per_100g', 0),
                        'protein_per_100g': food_data.get('protein_per_100g', 0.0),
                        'carbs_per_100g': food_data.get('carbs_per_100g', 0.0),
                        'fat_per_100g': food_data.get('fat_per_100g', 0.0),
                        'fiber_per_100g': food_data.get('fiber_per_100g', 0.0),
                        'serving_size': food_data.get('serving_size', '100g'),
                        'is_active': food_data.get('is_active', True)
                    }
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Food data uploaded successfully. Created: {created_count} items.')
        )

    def upload_injury_data(self, data_dir, clear_data=False):
        """Upload injury data from JSON file"""
        self.stdout.write('Uploading injury data...')
        
        if clear_data:
            Injury.objects.all().delete()
            self.stdout.write('Cleared existing injury data.')

        injury_file = data_dir / 'injuries.json'
        if not injury_file.exists():
            self.stdout.write(
                self.style.WARNING(f'Injury data file not found: {injury_file}')
            )
            return

        with open(injury_file, 'r', encoding='utf-8') as f:
            injuries_data = json.load(f)
            
            created_count = 0
            for injury_data in injuries_data:
                injury, created = Injury.objects.get_or_create(
                    name=injury_data['name'],
                    defaults={
                        'affected_part': injury_data.get('affected_part', ''),
                        'symptoms': injury_data.get('symptoms', ''),
                        'first_aid': injury_data.get('first_aid', ''),
                        'treatment_type': injury_data.get('treatment_type', ''),
                        'severity': injury_data.get('severity', 'mild'),
                        'recovery_time_days': injury_data.get('recovery_time_days'),
                        'is_active': injury_data.get('is_active', True)
                    }
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Injury data uploaded successfully. Created: {created_count} items.')
        )

    def upload_training_data(self, data_dir, clear_data=False):
        """Upload training data from JSON file"""
        self.stdout.write('Uploading training data...')
        
        if clear_data:
            TrainingCategory.objects.all().delete()
            self.stdout.write('Cleared existing training data.')

        training_file = data_dir / 'fitness_activities.json'
        if not training_file.exists():
            self.stdout.write(
                self.style.WARNING(f'Training data file not found: {training_file}')
            )
            return

        with open(training_file, 'r', encoding='utf-8') as f:
            training_data = json.load(f)
            
            categories_created = 0
            workouts_created = 0
            exercises_created = 0
            
            for category_data in training_data:
                category, category_created = TrainingCategory.objects.get_or_create(
                    name=category_data['name'],
                    defaults={
                        'category_type': category_data.get('category', 'Strength'),
                        'description': category_data.get('description', ''),
                        'color_code': category_data.get('color_code', '#4A90E2'),
                        'is_active': category_data.get('is_active', True)
                    }
                )
                if category_created:
                    categories_created += 1
                
                for workout_data in category_data.get('workouts', []):
                    workout, workout_created = Workout.objects.get_or_create(
                        training_category=category,
                        name=workout_data['name'],
                        defaults={
                            'description': workout_data.get('description', ''),
                            'estimated_duration': workout_data.get('estimated_duration'),
                            'difficulty_level': workout_data.get('difficulty_level', 1),
                            'color_code': workout_data.get('color_code', '#7ED321'),
                            'is_active': workout_data.get('is_active', True)
                        }
                    )
                    if workout_created:
                        workouts_created += 1
                    
                    for exercise_data in workout_data.get('sub_workouts', []):
                        exercise, exercise_created = Exercise.objects.get_or_create(
                            workout=workout,
                            name=exercise_data['name'],
                            defaults={
                                'description': exercise_data.get('description', ''),
                                'target_muscles': exercise_data.get('target_muscles', ''),
                                'difficulty_level': exercise_data.get('difficulty_level', 'beginner'),
                                'sets_recommended': exercise_data.get('sets_recommended'),
                                'reps_recommended': exercise_data.get('reps_recommended', ''),
                                'rest_between_sets': exercise_data.get('rest_between_sets'),
                                'instructions': exercise_data.get('instructions', ''),
                                'safety_tips': exercise_data.get('safety_tips', ''),
                                'is_active': exercise_data.get('is_active', True)
                            }
                        )
                        if exercise_created:
                            exercises_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Training data uploaded successfully. '
                f'Categories: {categories_created}, Workouts: {workouts_created}, Exercises: {exercises_created}'
            )
        )

    def upload_fitness_activities(self, data_dir, clear_data=False):
        """Upload fitness activities data"""
        self.stdout.write('Uploading fitness activities data...')
        
        if clear_data:
            FitnessActivity.objects.all().delete()
            self.stdout.write('Cleared existing fitness activities data.')

        fitness_file = data_dir / 'fitness_activities_simple.json'
        if not fitness_file.exists():
            self.stdout.write(
                self.style.WARNING(f'Fitness activities file not found: {fitness_file}')
            )
            return

        with open(fitness_file, 'r', encoding='utf-8') as f:
            fitness_data = json.load(f)
            
            created_count = 0
            for activity_data in fitness_data:
                activity, created = FitnessActivity.objects.get_or_create(
                    name=activity_data['name'],
                    defaults={
                        'category': activity_data.get('category', 'Strength'),
                        'intensity': activity_data.get('intensity', 'moderate'),
                        'description': activity_data.get('description', ''),
                        'target_muscles': activity_data.get('target_muscles', ''),
                        'calories_per_hour': activity_data.get('calories_per_hour'),
                        'difficulty_level': activity_data.get('difficulty_level', 5),
                        'equipment_needed': activity_data.get('equipment_needed', ''),
                        'is_active': activity_data.get('is_active', True)
                    }
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Fitness activities uploaded successfully. Created: {created_count} items.')
        )

    def create_sample_data(self):
        """Create sample data if JSON files don't exist"""
        self.stdout.write('Creating sample data...')
        
        # Sample Food Data
        sample_foods = [
            {
                'name': 'Chicken Breast',
                'type': 'non-veg',
                'calories_per_100g': 165,
                'protein_per_100g': 31.0,
                'carbs_per_100g': 0.0,
                'fat_per_100g': 3.6,
                'serving_size': '100g'
            },
            {
                'name': 'Brown Rice',
                'type': 'veg',
                'calories_per_100g': 111,
                'protein_per_100g': 2.6,
                'carbs_per_100g': 22.0,
                'fat_per_100g': 0.9,
                'serving_size': '100g cooked'
            },
            {
                'name': 'Greek Yogurt',
                'type': 'veg',
                'calories_per_100g': 59,
                'protein_per_100g': 10.0,
                'carbs_per_100g': 3.6,
                'fat_per_100g': 0.4,
                'serving_size': '100g'
            }
        ]
        
        for food_data in sample_foods:
            Food.objects.get_or_create(
                name=food_data['name'],
                defaults=food_data
            )

        # Sample Injury Data
        sample_injuries = [
            {
                'name': 'Lower Back Strain',
                'affected_part': 'Lower Back',
                'symptoms': 'Pain, stiffness, muscle spasms',
                'first_aid': 'Rest, ice application, gentle stretching',
                'treatment_type': 'Conservative',
                'severity': 'mild'
            },
            {
                'name': 'Ankle Sprain',
                'affected_part': 'Ankle',
                'symptoms': 'Pain, swelling, difficulty walking',
                'first_aid': 'RICE method (Rest, Ice, Compression, Elevation)',
                'treatment_type': 'Conservative',
                'severity': 'moderate'
            }
        ]
        
        for injury_data in sample_injuries:
            Injury.objects.get_or_create(
                name=injury_data['name'],
                defaults=injury_data
            )

        # Sample Fitness Activities
        sample_activities = [
            {
                'name': 'Push-ups',
                'category': 'Strength',
                'intensity': 'moderate',
                'description': 'Basic bodyweight exercise for upper body strength',
                'target_muscles': 'Chest, shoulders, triceps',
                'calories_per_hour': 300,
                'difficulty_level': 3
            },
            {
                'name': 'Running',
                'category': 'Cardio',
                'intensity': 'high',
                'description': 'Cardiovascular exercise for endurance',
                'target_muscles': 'Legs, core, cardiovascular system',
                'calories_per_hour': 600,
                'difficulty_level': 5
            }
        ]
        
        for activity_data in sample_activities:
            FitnessActivity.objects.get_or_create(
                name=activity_data['name'],
                defaults=activity_data
            )

        self.stdout.write(
            self.style.SUCCESS('Sample data created successfully!')
        )

    def upload_achievements_data(self, data_dir, clear_data=False):
        """Upload achievements data from JSON file"""
        self.stdout.write('Uploading achievements data...')
        
        if clear_data:
            Achievement.objects.all().delete()
            self.stdout.write('Cleared existing achievements data.')

        achievements_file = data_dir / 'achievements.json'
        if not achievements_file.exists():
            self.stdout.write(
                self.style.WARNING(f'Achievements data file not found: {achievements_file}')
            )
            return

        with open(achievements_file, 'r', encoding='utf-8') as f:
            achievements_data = json.load(f)
            
            created_count = 0
            for data in achievements_data:
                obj, created = Achievement.objects.get_or_create(
                    name=data['name'],
                    defaults=data
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Achievements data uploaded successfully. Created: {created_count} items.')
        )

    def upload_competition_plans(self, data_dir, clear_data=False):
        """Uploads competition plan data from JSON file"""
        self.stdout.write('Uploading competition plan data...')

        if clear_data:
            CompetitionCategory.objects.all().delete()
            self.stdout.write('Cleared existing competition plan data.')

        plan_file = data_dir / 'competition_plans.json'
        if not plan_file.exists():
            self.stdout.write(self.style.WARNING(f'Competition plan file not found: {plan_file}'))
            return

        with open(plan_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

            for cat_data in data.get('categories', []):
                category, _ = CompetitionCategory.objects.get_or_create(
                    name=cat_data['name'],
                    defaults={
                        'description': cat_data.get('description', ''),
                        'color_code': cat_data.get('color_code', '#FFFFFF')
                    }
                )

                for comp_data in cat_data.get('competitions', []):
                    competition, _ = CompetitionType.objects.get_or_create(
                        name=comp_data['name'],
                        category=category,
                        defaults={'description': comp_data.get('description', '')}
                    )

                    for phase_data in comp_data.get('plan', []):
                        phase, _ = PlanPhase.objects.get_or_create(
                            competition_type=competition,
                            title=phase_data['title'],
                            defaults={
                                'description': phase_data.get('description', ''),
                                'order': phase_data.get('order', 0)
                            }
                        )

                        for item_data in phase_data.get('items', []):
                            PlanItem.objects.get_or_create(
                                phase=phase,
                                title=item_data['title'],
                                defaults={
                                    'item_type': item_data.get('type', 'Nutrition'),
                                    'description': item_data.get('description', ''),
                                    'amount_suggestion': item_data.get('amount_suggestion', ''),
                                    'order': item_data.get('order', 0)
                                }
                            )
        
        self.stdout.write(self.style.SUCCESS('Competition plan data uploaded successfully.'))