import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import (
    Food, Injury, TrainingCategory, Workout, Exercise,
    FitnessActivity, Achievement, CompetitionCategory,
    CompetitionType, PlanPhase, PlanItem
)

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
            choices=['all', 'food', 'injury', 'training', 'achievements', 'competition'],
            default='all',
            help='Specify which data to upload',
        )

    def handle(self, *args, **options):
        data_dir = settings.BASE_DIR / 'api' / 'datasets'
        
        if not data_dir.exists():
            self.stdout.write(self.style.ERROR(f'Data directory not found: {data_dir}'))
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

            if data_type in ['all', 'achievements']:
                self.upload_achievements_data(data_dir, clear_data)

            if data_type in ['all', 'competition']:
                self.upload_competition_plans(data_dir, clear_data)

            self.stdout.write(self.style.SUCCESS('Data upload completed successfully!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during data upload: {str(e)}'))


    def upload_food_data(self, data_dir, clear_data=False):
        self.stdout.write('Uploading food data...')
        if clear_data:
            Food.objects.all().delete()
            self.stdout.write('Cleared existing food data.')

        food_file = data_dir / 'foods.json'
        if not food_file.exists():
            self.stdout.write(self.style.WARNING(f'Food data file not found: {food_file}'))
            return

        with open(food_file, 'r', encoding='utf-8') as f:
            foods_data = json.load(f)
            unique_foods = {food['name'].strip().lower(): food for food in foods_data}.values()
            created_count = 0
            for food_data in unique_foods:
                _, created = Food.objects.get_or_create(
                    name=food_data['name'].strip(),
                    defaults={
                        'type': food_data.get('type', 'veg'),
                        'calories_per_100g': food_data.get('calories_per_100g', 0),
                        'protein_per_100g': food_data.get('protein_per_100g', 0.0),
                        'carbs_per_100g': food_data.get('carbs_per_100g', 0.0),
                        'fat_per_100g': food_data.get('fat_per_100g', 0.0),
                        'fiber_per_100g': food_data.get('fiber_per_100g', 0.0),
                        'serving_size': food_data.get('serving_size', '100g'),
                    }
                )
                if created: created_count += 1
        self.stdout.write(self.style.SUCCESS(f'Food data uploaded. Created: {created_count} items.'))


    def upload_injury_data(self, data_dir, clear_data=False):
        self.stdout.write('Uploading injury data...')
        if clear_data:
            Injury.objects.all().delete()
            self.stdout.write('Cleared existing injury data.')

        injury_file = data_dir / 'injuries.json'
        if not injury_file.exists():
            self.stdout.write(self.style.WARNING(f'Injury data file not found: {injury_file}'))
            return

        with open(injury_file, 'r', encoding='utf-8') as f:
            injuries_data = json.load(f)
            unique_injuries = {}
            for injury in injuries_data:
                key = (
                    injury['name'].strip().lower(),
                    injury['affected_part'].strip().lower(),
                    injury['severity']
                )
                if key not in unique_injuries:
                    unique_injuries[key] = injury
            
            created_count = 0
            for injury_data in unique_injuries.values():
                _, created = Injury.objects.get_or_create(
                    name=injury_data['name'].strip(),
                    affected_part=injury_data['affected_part'].strip(),
                    severity=injury_data.get('severity', 'mild'),
                    defaults={
                        'symptoms': injury_data.get('symptoms', ''),
                        'first_aid': injury_data.get('first_aid', ''),
                        'treatment_type': injury_data.get('treatment_type', ''),
                        'recovery_time_days': injury_data.get('recovery_time_days'),
                    }
                )
                if created: created_count += 1
        self.stdout.write(self.style.SUCCESS(f'Injury data uploaded. Created: {created_count} items.'))


    def upload_training_data(self, data_dir, clear_data=False):
        self.stdout.write('Uploading training data from MERGED file...')
        
        if clear_data:
            TrainingCategory.objects.all().delete()
            FitnessActivity.objects.all().delete()
            self.stdout.write('Cleared existing training and fitness activity data.')

        training_file = data_dir / 'fitness_activities_MERGED.json'
        if not training_file.exists():
            self.stdout.write(self.style.ERROR(f'MERGED file not found: {training_file}'))
            self.stdout.write(self.style.ERROR('Please run the merge_datasets.py script first.'))
            return

        with open(training_file, 'r', encoding='utf-8') as f:
            training_data = json.load(f)
            
            categories_created = 0
            workouts_created = 0
            exercises_created = 0
            activities_synced = 0
            
            all_synced_names = set()

            for category_data in training_data:
                category, category_created = TrainingCategory.objects.get_or_create(
                    name=category_data['name'].strip(),
                    defaults={
                        'category_type': category_data.get('category', 'Strength'),
                        'description': category_data.get('description', ''),
                        'color_code': category_data.get('color_code', '#4A90E2'),
                    }
                )
                if category_created: categories_created += 1
                
                for workout_data in category_data.get('workouts', []):
                    workout, workout_created = Workout.objects.get_or_create(
                        training_category=category,
                        name=workout_data['name'].strip(),
                        defaults={
                            'description': workout_data.get('description', ''),
                            'estimated_duration': workout_data.get('estimated_duration'),
                            'difficulty_level': workout_data.get('difficulty_level', 1),
                            'color_code': workout_data.get('color_code', '#7ED321'),
                            'imageUrl': workout_data.get('imageUrl'),
                        }
                    )
                    if workout_created: workouts_created += 1
                    
                    for exercise_data in workout_data.get('sub_workouts', []):
                        exercise_name = exercise_data['name'].strip()
                        normalized_name = exercise_name.lower()

                        exercise, exercise_created = Exercise.objects.get_or_create(
                            workout=workout,
                            name=exercise_name,
                            defaults={
                                'description': exercise_data.get('description', ''),
                                'target_muscles': exercise_data.get('target_muscles', ''),
                                'difficulty_level': exercise_data.get('difficulty_level', 'beginner'),
                                'sets_recommended': exercise_data.get('sets_recommended'),
                                'reps_recommended': exercise_data.get('reps_recommended', ''),
                                'rest_between_sets': exercise_data.get('rest_between_sets'),
                                'instructions': exercise_data.get('instructions', ''),
                                'safety_tips': exercise_data.get('safety_tips', ''),
                            }
                        )
                        if exercise_created: exercises_created += 1

                        # --- Improved Sync Logic (Prevents Missing Activities) ---
                        if normalized_name not in all_synced_names:
                            FitnessActivity.objects.get_or_create(
                                name=exercise_name,
                                defaults={
                                    'category': category_data.get('category', 'Strength'),
                                    'intensity': exercise_data.get('intensity', 'moderate'),
                                    'description': exercise_data.get('description', ''),
                                    'target_muscles': exercise_data.get('target_muscles', ''),
                                    'difficulty_level': exercise_data.get('difficulty_level', 3),
                                    'calories_per_hour': 350,
                                }
                            )
                            all_synced_names.add(normalized_name)
                            activities_synced += 1

        self.stdout.write(self.style.SUCCESS(
            f'Training data uploaded. Categories: {categories_created}, '
            f'Workouts: {workouts_created}, Exercises: {exercises_created}.'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Synced {activities_synced} items to FitnessActivity library.'
        ))


    def upload_achievements_data(self, data_dir, clear_data=False):
        self.stdout.write('Uploading achievements data...')
        if clear_data:
            Achievement.objects.all().delete()
            self.stdout.write('Cleared existing achievements data.')
        
        file = data_dir / 'achievements.json'
        if not file.exists():
            self.stdout.write(self.style.WARNING(f'File not found: {file}'))
            return
        
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            created_count = 0
            for item in data:
                _, created = Achievement.objects.get_or_create(
                    name=item['name'].strip(),
                    defaults=item
                )
                if created: created_count += 1
        self.stdout.write(self.style.SUCCESS(f'Achievements data uploaded. Created: {created_count} items.'))


    def upload_competition_plans(self, data_dir, clear_data=False):
        self.stdout.write('Uploading competition plan data...')
        if clear_data:
            CompetitionCategory.objects.all().delete()
            self.stdout.write('Cleared existing competition plan data.')

        file = data_dir / 'competition_plans.json'
        if not file.exists():
            self.stdout.write(self.style.WARNING(f'File not found: {file}'))
            return

        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for cat_data in data.get('categories', []):
                category, _ = CompetitionCategory.objects.get_or_create(
                    name=cat_data['name'].strip(),
                    defaults={
                        'description': cat_data.get('description', ''),
                        'color_code': cat_data.get('color_code', '#FFFFFF')
                    }
                )
                for comp_data in cat_data.get('competitions', []):
                    competition, _ = CompetitionType.objects.get_or_create(
                        name=comp_data['name'].strip(),
                        category=category,
                        defaults={'description': comp_data.get('description', '')}
                    )
                    for phase_data in comp_data.get('plan', []):
                        phase, _ = PlanPhase.objects.get_or_create(
                            competition_type=competition,
                            title=phase_data['title'].strip(),
                            defaults={
                                'description': phase_data.get('description', ''),
                                'order': phase_data.get('order', 0)
                            }
                        )
                        for item_data in phase_data.get('items', []):
                            PlanItem.objects.get_or_create(
                                phase=phase,
                                title=item_data['title'].strip(),
                                defaults={
                                    'item_type': item_data.get('type', 'Nutrition'),
                                    'description': item_data.get('description', ''),
                                    'amount_suggestion': item_data.get('amount_suggestion', ''),
                                    'order': item_data.get('order', 0)
                                }
                            )
        self.stdout.write(self.style.SUCCESS('Competition plan data uploaded successfully.'))
