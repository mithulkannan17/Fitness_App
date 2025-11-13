import json
import os

# Define the paths based on your file structure
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'api', 'datasets')

STRUCTURED_FILE = os.path.join(DATA_DIR, 'fitness_activities.json')
SIMPLE_FILE = os.path.join(DATA_DIR, 'fitness_activities_simple.json')
OUTPUT_FILE = os.path.join(DATA_DIR, 'fitness_activities_MERGED.json')

def merge_datasets():
    print("Starting dataset merge...")

    # 1. Load the structured file
    try:
        with open(STRUCTURED_FILE, 'r', encoding='utf-8') as f:
            structured_data = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Cannot find structured file at {STRUCTURED_FILE}")
        return
    except json.JSONDecodeError:
        print(f"ERROR: Could not decode JSON from {STRUCTURED_FILE}")
        return

    # 2. Load the simple file
    try:
        with open(SIMPLE_FILE, 'r', encoding='utf-8') as f:
            simple_data = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Cannot find simple file at {SIMPLE_FILE}")
        return
    except json.JSONDecodeError:
        print(f"ERROR: Could not decode JSON from {SIMPLE_FILE}")
        return

    # 3. Create a helper to find existing exercises
    existing_exercises = set()
    category_map = {} # Helper to find category objects by name

    for category in structured_data:
        category_name = category['category']
        category_map[category_name] = category
        for workout in category.get('workouts', []):
            for sub_workout in workout.get('sub_workouts', []):
                existing_exercises.add(sub_workout['name'].strip().lower())

    print(f"Found {len(existing_exercises)} existing exercises in {STRUCTURED_FILE}.")

    # 4. Create new workout groups for "orphaned" simple exercises
    # We will add these to the structured data if they are needed
    
    # Find "Strength" category
    strength_category = category_map.get('Strength')
    if strength_category:
        strength_category.setdefault('workouts', []).extend([
            {
                "name": "Core & Abs",
                "color_code": "#A1887F",
                "description": "Exercises for core strength and stability.",
                "imageUrl": "https://via.placeholder.com/300x200.png?text=Core",
                "sub_workouts": []
            },
            {
                "name": "Strength (Bodyweight)",
                "color_code": "#BCAAA4",
                "description": "Bodyweight-only strength exercises.",
                "imageUrl": "https://via.placeholder.com/300x200.png?text=Bodyweight",
                "sub_workouts": []
            }
        ])
    
    # Find "Cardio" category
    cardio_category = category_map.get('Cardio')
    if cardio_category:
        cardio_category.setdefault('workouts', []).append(
            {
                "name": "Cardio (Low Intensity)",
                "color_code": "#BBDEFB",
                "description": "Low-impact and steady-state cardio.",
                "imageUrl": "https://via.placeholder.com/300x200.png?text=Low+Impact",
                "sub_workouts": []
            }
        )
    
    # Find "Flexibility" category
    flex_category = category_map.get('Flexibility')
    if flex_category:
         # It already has "Yoga & Mobility", which is fine.
         pass

    # Create a "Sports & Misc" category for things like "Football"
    if 'Sport' not in category_map:
        sport_category = {
            "name": "Sports & Misc",
            "category": "Sport",
            "color_code": "#F5A623",
            "workouts": [
                {
                    "name": "Sports",
                    "color_code": "#FFB74D",
                    "description": "Sports and recreational activities.",
                    "imageUrl": "https://via.placeholder.com/300x200.png?text=Sports",
                    "sub_workouts": []
                }
            ]
        }
        structured_data.append(sport_category)
        category_map['Sport'] = sport_category
    
    if 'Plyometrics' not in category_map:
        plyo_category = {
            "name": "Plyometrics",
            "category": "Strength", # Or "Cardio", up to you
            "color_code": "#FF8A65",
            "workouts": [
                {
                    "name": "Plyometric Training",
                    "color_code": "#FFAB91",
                    "description": "Explosive power exercises.",
                    "imageUrl": "https.via.placeholder.com/300x200.png?text=Plyo",
                    "sub_workouts": []
                }
            ]
        }
        # Add to "Gym Workouts" category
        if strength_category:
            strength_category['workouts'].append(plyo_category['workouts'][0])
        else: # Or add as its own category if "Strength" doesn't exist
            structured_data.append(plyo_category)
            category_map['Plyometrics'] = plyo_category


    # 5. Iterate and merge simple data
    added_count = 0
    skipped_count = 0

    for item in simple_data:
        item_name = item['name'].strip()
        item_category = item['category']

        if item_name.lower() in existing_exercises:
            skipped_count += 1
            continue
        
        # This is a new exercise, let's add it
        new_exercise_entry = {
            "name": item_name,
            "target_muscles": item.get('target_muscles', ''),
            "description": item.get('description', ''),
            "intensity": item.get('intensity', 'moderate'),
            "difficulty_level": item.get('difficulty_level', 3)
        }
        
        # Find the right place to put it
        target_category_obj = category_map.get(item_category)
        
        if not target_category_obj:
            print(f"Warning: No category found for '{item_category}'. Skipping '{item_name}'.")
            continue

        # --- Logic to place the exercise ---
        workout_target = None
        if item_category == 'Strength':
            if 'core' in item_name.lower() or 'abs' in item_name.lower() or 'plank' in item_name.lower() or 'crunch' in item_name.lower() or 'twist' in item_name.lower():
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Core & Abs')
            elif item.get('equipment_needed') == 'None' or 'bodyweight' in item_name.lower():
                 workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Strength (Bodyweight)')
            elif 'sled' in item_name.lower() or 'kettlebell' in item_name.lower() or 'farmer' in item_name.lower():
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Full Body')
            elif 'chest' in item_name.lower() or 'incline' in item_name.lower() or 'pushdown' in item_name.lower():
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Chest')
            elif 'back' in item_name.lower() or 'row' in item_name.lower() or 'pull' in item_name.lower():
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Back')
            elif 'leg' in item_name.lower() or 'squat' in item_name.lower() or 'lunge' in item_name.lower() or 'glute' in item_name.lower() or 'calf' in item_name.lower() or 'thrust' in item_name.lower():
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Legs')
            elif 'shoulder' in item_name.lower() or 'overhead' in item_name.lower() or 'lateral' in item_name.lower():
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Shoulders')
            else:
                workout_target = target_category_obj['workouts'][0] # Add to first workout as default
        
        elif item_category == 'Cardio':
            if item.get('intensity') == 'low':
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Cardio (Low Intensity)')
            elif item.get('intensity') == 'moderate':
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Moderate Intensity Cardio')
            elif item.get('intensity') == 'high':
                workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'High Intensity Cardio')
            else:
                workout_target = target_category_obj['workouts'][0]
        
        elif item_category == 'Flexibility':
            workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Yoga & Mobility')
        
        elif item_category == 'Sport':
            workout_target = next(w for w in target_category_obj['workouts'] if w['name'] == 'Sports')
            
        elif item_category == 'Plyometrics':
            plyo_cat = category_map.get('Plyometrics')
            if not plyo_cat: # Handle if base Strength category wasn't found
                plyo_cat = next(c for c in structured_data if c['category'] == 'Strength')
            workout_target = next(w for w in plyo_cat['workouts'] if w['name'] == 'Plyometric Training')
            
        else:
             workout_target = target_category_obj['workouts'][0]

        
        workout_target['sub_workouts'].append(new_exercise_entry)
        existing_exercises.add(item_name.lower()) # Add to set to prevent duplicates from simple file
        added_count += 1

    print(f"Added {added_count} new exercises. Skipped {skipped_count} duplicates.")

    # 6. Save the new merged file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, indent=4)

    print(f"Successfully merged datasets! New file saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    merge_datasets()