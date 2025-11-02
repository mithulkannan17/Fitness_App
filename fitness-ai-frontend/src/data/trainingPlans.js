// src/data/trainingPlans.js
// Static training plan templates - will be replaced by dynamic backend plans

export const trainingPlans = [
    {
        goal: 'muscle_gain',
        name: 'Muscle Building Program',
        description: 'A comprehensive 6-day plan focusing on progressive overload and muscle hypertrophy with proper recovery.',
        duration_weeks: 8,
        difficulty_level: 'intermediate',
        schedule: [
            {
                day: 'Monday',
                focus: 'Chest & Triceps',
                category: 'Strength',
                exercises: [
                    'Bench Press: 4 sets × 8-10 reps',
                    'Incline Dumbbell Press: 3 sets × 10-12 reps',
                    'Chest Flyes: 3 sets × 12-15 reps',
                    'Close-Grip Bench Press: 3 sets × 10-12 reps',
                    'Tricep Dips: 3 sets × 12-15 reps'
                ],
                estimated_duration: 75,
                rest_day: false
            },
            {
                day: 'Tuesday',
                focus: 'Back & Biceps',
                category: 'Strength',
                exercises: [
                    'Deadlifts: 4 sets × 6-8 reps',
                    'Pull-ups: 4 sets × 8-12 reps',
                    'Barbell Rows: 3 sets × 10-12 reps',
                    'Lat Pulldowns: 3 sets × 12-15 reps',
                    'Barbell Curls: 4 sets × 10-12 reps'
                ],
                estimated_duration: 80,
                rest_day: false
            },
            {
                day: 'Wednesday',
                focus: 'Legs & Glutes',
                category: 'Strength',
                exercises: [
                    'Squats: 4 sets × 8-10 reps',
                    'Romanian Deadlifts: 3 sets × 10-12 reps',
                    'Leg Press: 3 sets × 12-15 reps',
                    'Walking Lunges: 3 sets × 12 each leg',
                    'Calf Raises: 4 sets × 15-20 reps'
                ],
                estimated_duration: 85,
                rest_day: false
            },
            {
                day: 'Thursday',
                focus: 'Shoulders & Core',
                category: 'Strength',
                exercises: [
                    'Overhead Press: 4 sets × 8-10 reps',
                    'Lateral Raises: 4 sets × 12-15 reps',
                    'Rear Delt Flyes: 3 sets × 15-20 reps',
                    'Plank: 3 sets × 60-90 seconds',
                    'Russian Twists: 3 sets × 20 each side'
                ],
                estimated_duration: 70,
                rest_day: false
            },
            {
                day: 'Friday',
                focus: 'Upper Body Power',
                category: 'Strength',
                exercises: [
                    'Push-ups: 4 sets × max reps',
                    'Dumbbell Rows: 3 sets × 10-12 reps',
                    'Shoulder Press: 3 sets × 10-12 reps',
                    'Face Pulls: 3 sets × 15-20 reps',
                    'Hammer Curls: 3 sets × 12-15 reps'
                ],
                estimated_duration: 65,
                rest_day: false
            },
            {
                day: 'Saturday',
                focus: 'Active Recovery',
                category: 'Recovery',
                exercises: [
                    'Light cardio: 20-30 minutes',
                    'Full body stretching: 15-20 minutes',
                    'Foam rolling: 10-15 minutes'
                ],
                estimated_duration: 45,
                rest_day: false
            },
            {
                day: 'Sunday',
                focus: 'Complete Rest',
                category: 'Recovery',
                exercises: [],
                estimated_duration: 0,
                rest_day: true
            }
        ],
        nutrition_focus: {
            protein_multiplier: 2.0, // grams per kg body weight
            calorie_surplus: 500,
            key_nutrients: ['Protein', 'Complex Carbohydrates', 'Healthy Fats'],
            meal_timing: 'Eat protein within 30 minutes post-workout'
        },
        tips: [
            'Progressive overload is key - increase weight, reps, or sets each week',
            'Get 7-9 hours of quality sleep for muscle recovery',
            'Stay hydrated - aim for 3+ liters of water daily',
            'Take rest days seriously - muscles grow during recovery'
        ]
    },
    {
        goal: 'fat_loss',
        name: 'Fat Loss & Conditioning Program',
        description: 'A 5-day high-intensity program combining strength training and cardio for maximum fat burning.',
        duration_weeks: 12,
        difficulty_level: 'beginner',
        schedule: [
            {
                day: 'Monday',
                focus: 'Full Body Strength + HIIT',
                category: 'Strength',
                exercises: [
                    'Squats: 3 sets × 12-15 reps',
                    'Push-ups: 3 sets × 10-15 reps',
                    'Bent-over Rows: 3 sets × 12-15 reps',
                    'Plank: 3 sets × 45-60 seconds',
                    'HIIT: 15 minutes (30s work, 30s rest)'
                ],
                estimated_duration: 55,
                rest_day: false
            },
            {
                day: 'Tuesday',
                focus: 'Cardio & Core',
                category: 'Cardio',
                exercises: [
                    'Running/Cycling: 30-40 minutes moderate intensity',
                    'Mountain Climbers: 3 sets × 30 seconds',
                    'Bicycle Crunches: 3 sets × 20 each side',
                    'Dead Bug: 3 sets × 10 each side',
                    'Side Plank: 2 sets × 30 seconds each side'
                ],
                estimated_duration: 50,
                rest_day: false
            },
            {
                day: 'Wednesday',
                focus: 'Upper Body Circuit',
                category: 'Strength',
                exercises: [
                    'Circuit: Push-ups, Pike Push-ups, Tricep Dips',
                    'Pull-ups or Assisted Pull-ups: 3 sets × 5-10 reps',
                    'Shoulder Press: 3 sets × 12-15 reps',
                    'Burpees: 3 sets × 8-12 reps',
                    'Jump Rope: 10 minutes'
                ],
                estimated_duration: 45,
                rest_day: false
            },
            {
                day: 'Thursday',
                focus: 'Lower Body + Cardio',
                category: 'Strength',
                exercises: [
                    'Lunges: 3 sets × 12 each leg',
                    'Glute Bridges: 3 sets × 15-20 reps',
                    'Wall Sit: 3 sets × 45-60 seconds',
                    'Jump Squats: 3 sets × 10-15 reps',
                    'Steady-state Cardio: 20 minutes'
                ],
                estimated_duration: 50,
                rest_day: false
            },
            {
                day: 'Friday',
                focus: 'Total Body HIIT',
                category: 'Cardio',
                exercises: [
                    'HIIT Circuit: Burpees, High Knees, Jump Squats, Push-ups',
                    '4 rounds × 45 seconds work, 15 seconds rest',
                    'Cool-down: 10 minutes light walking',
                    'Stretching: 10 minutes full body'
                ],
                estimated_duration: 35,
                rest_day: false
            },
            {
                day: 'Saturday',
                focus: 'Active Recovery',
                category: 'Recovery',
                exercises: [
                    'Long walk: 45-60 minutes',
                    'Yoga or stretching: 20-30 minutes',
                    'Foam rolling: 10 minutes'
                ],
                estimated_duration: 60,
                rest_day: false
            },
            {
                day: 'Sunday',
                focus: 'Rest',
                category: 'Recovery',
                exercises: [],
                estimated_duration: 0,
                rest_day: true
            }
        ],
        nutrition_focus: {
            protein_multiplier: 1.8, // grams per kg body weight
            calorie_deficit: 500,
            key_nutrients: ['Lean Protein', 'Fiber-rich Vegetables', 'Complex Carbohydrates'],
            meal_timing: 'Eat smaller, frequent meals to maintain metabolism'
        },
        tips: [
            'Focus on compound movements that burn more calories',
            'Maintain a moderate calorie deficit - extreme restriction can backfire',
            'Prioritize protein to preserve muscle mass during fat loss',
            'Stay consistent - small daily actions lead to big results'
        ]
    },
    {
        goal: 'endurance',
        name: 'Cardiovascular Endurance Program',
        description: 'A 10-week program designed to build cardiovascular fitness and endurance capacity.',
        duration_weeks: 10,
        difficulty_level: 'beginner',
        schedule: [
            {
                day: 'Monday',
                focus: 'Easy Run/Walk',
                category: 'Cardio',
                exercises: [
                    'Easy pace run/walk: 30-40 minutes',
                    'Focus on comfortable conversation pace',
                    'Cool-down walk: 5 minutes',
                    'Dynamic stretching: 10 minutes'
                ],
                estimated_duration: 45,
                rest_day: false
            },
            {
                day: 'Tuesday',
                focus: 'Cross Training',
                category: 'Cardio',
                exercises: [
                    'Swimming, Cycling, or Rowing: 30-45 minutes',
                    'Moderate intensity, steady pace',
                    'Core strengthening: 15 minutes',
                    'Stretching: 10 minutes'
                ],
                estimated_duration: 60,
                rest_day: false
            },
            {
                day: 'Wednesday',
                focus: 'Interval Training',
                category: 'Cardio',
                exercises: [
                    'Warm-up: 10 minutes easy pace',
                    '6 × 3 minutes moderate-hard, 2 minutes easy recovery',
                    'Cool-down: 10 minutes easy pace',
                    'Stretching: 10 minutes'
                ],
                estimated_duration: 50,
                rest_day: false
            },
            {
                day: 'Thursday',
                focus: 'Strength & Mobility',
                category: 'Strength',
                exercises: [
                    'Bodyweight squats: 3 sets × 15 reps',
                    'Push-ups: 3 sets × 10-15 reps',
                    'Single-leg glute bridges: 3 sets × 10 each',
                    'Yoga flow: 20 minutes',
                    'Foam rolling: 10 minutes'
                ],
                estimated_duration: 50,
                rest_day: false
            },
            {
                day: 'Friday',
                focus: 'Tempo Run',
                category: 'Cardio',
                exercises: [
                    'Warm-up: 10 minutes easy pace',
                    'Tempo run: 20 minutes comfortably hard pace',
                    'Cool-down: 10 minutes easy pace',
                    'Stretching: 10 minutes'
                ],
                estimated_duration: 50,
                rest_day: false
            },
            {
                day: 'Saturday',
                focus: 'Long Slow Distance',
                category: 'Cardio',
                exercises: [
                    'Long run/walk: 45-75 minutes easy pace',
                    'Focus on building endurance, not speed',
                    'Walk breaks as needed',
                    'Post-run stretching: 15 minutes'
                ],
                estimated_duration: 90,
                rest_day: false
            },
            {
                day: 'Sunday',
                focus: 'Recovery',
                category: 'Recovery',
                exercises: [
                    'Gentle walk: 20-30 minutes',
                    'Yoga or stretching: 30 minutes',
                    'Meditation or relaxation: 10 minutes'
                ],
                estimated_duration: 60,
                rest_day: false
            }
        ],
        nutrition_focus: {
            protein_multiplier: 1.4, // grams per kg body weight
            calorie_maintenance: 0,
            key_nutrients: ['Complex Carbohydrates', 'Antioxidants', 'Electrolytes'],
            meal_timing: 'Fuel before longer sessions, recover with carbs and protein after'
        },
        tips: [
            'Build mileage gradually - increase by no more than 10% per week',
            'Listen to your body and take extra rest days when needed',
            'Focus on proper running form to prevent injury',
            'Stay hydrated and fuel properly for longer sessions'
        ]
    },
    {
        goal: 'general_fitness',
        name: 'Balanced Fitness Program',
        description: 'A well-rounded 4-day program incorporating strength, cardio, and flexibility for overall health.',
        duration_weeks: 12,
        difficulty_level: 'beginner',
        schedule: [
            {
                day: 'Monday',
                focus: 'Full Body Strength',
                category: 'Strength',
                exercises: [
                    'Squats: 3 sets × 12-15 reps',
                    'Push-ups (modified as needed): 3 sets × 8-12 reps',
                    'Bent-over rows: 3 sets × 12-15 reps',
                    'Plank: 3 sets × 30-60 seconds',
                    'Glute bridges: 3 sets × 15 reps'
                ],
                estimated_duration: 45,
                rest_day: false
            },
            {
                day: 'Tuesday',
                focus: 'Cardio & Core',
                category: 'Cardio',
                exercises: [
                    'Brisk walking or light jogging: 25-35 minutes',
                    'Core circuit: planks, side planks, dead bugs',
                    '3 sets × 45 seconds each exercise',
                    'Cool-down stretching: 10 minutes'
                ],
                estimated_duration: 50,
                rest_day: false
            },
            {
                day: 'Wednesday',
                focus: 'Rest or Gentle Movement',
                category: 'Recovery',
                exercises: [
                    'Optional: gentle yoga or stretching',
                    'Light walking',
                    'Mobility work: 15-20 minutes'
                ],
                estimated_duration: 30,
                rest_day: true
            },
            {
                day: 'Thursday',
                focus: 'Upper Body Strength',
                category: 'Strength',
                exercises: [
                    'Push-ups (wall/knee/full): 3 sets × 8-12 reps',
                    'Pike push-ups: 3 sets × 6-10 reps',
                    'Tricep dips (chair/bench): 3 sets × 8-12 reps',
                    'Superman holds: 3 sets × 10-15 reps',
                    'Arm circles and stretches: 10 minutes'
                ],
                estimated_duration: 40,
                rest_day: false
            },
            {
                day: 'Friday',
                focus: 'Active Fun',
                category: 'Sport',
                exercises: [
                    'Choose an enjoyable activity:',
                    'Dancing, hiking, sports, swimming',
                    'Recreational cycling, playground activities',
                    'Focus on movement and enjoyment, not intensity'
                ],
                estimated_duration: 45,
                rest_day: false
            },
            {
                day: 'Saturday',
                focus: 'Lower Body & Flexibility',
                category: 'Strength',
                exercises: [
                    'Bodyweight squats: 3 sets × 10-15 reps',
                    'Lunges (stationary): 3 sets × 8 each leg',
                    'Calf raises: 3 sets × 15 reps',
                    'Hip flexor stretches: 2 minutes each leg',
                    'Full body stretching routine: 15 minutes'
                ],
                estimated_duration: 45,
                rest_day: false
            },
            {
                day: 'Sunday',
                focus: 'Complete Rest',
                category: 'Recovery',
                exercises: [],
                estimated_duration: 0,
                rest_day: true
            }
        ],
        nutrition_focus: {
            protein_multiplier: 1.6, // grams per kg body weight
            calorie_maintenance: 0,
            key_nutrients: ['Balanced Macronutrients', 'Fruits & Vegetables', 'Whole Grains'],
            meal_timing: 'Regular meals with balanced nutrients'
        },
        tips: [
            'Consistency is more important than intensity for general fitness',
            'Find activities you enjoy to make exercise sustainable',
            'Focus on proper form over heavy weights or high intensity',
            'Include variety to prevent boredom and work different muscle groups'
        ]
    }
];

// Helper functions for training plan integration

export const getPlanByGoal = (goal) => {
    return trainingPlans.find(plan => plan.goal === goal);
};

export const getAllGoals = () => {
    return trainingPlans.map(plan => ({
        goal: plan.goal,
        name: plan.name,
        description: plan.description,
        difficulty: plan.difficulty_level,
        duration: plan.duration_weeks
    }));
};

export const getWeeklySchedule = (goal) => {
    const plan = getPlanByGoal(goal);
    if (!plan) return null;

    return plan.schedule.map(day => ({
        ...day,
        total_weekly_duration: plan.schedule.reduce((total, d) => total + d.estimated_duration, 0)
    }));
};

export const getNutritionGuidance = (goal, weight = 70) => {
    const plan = getPlanByGoal(goal);
    if (!plan || !plan.nutrition_focus) return null;

    const { protein_multiplier, calorie_deficit, calorie_surplus } = plan.nutrition_focus;

    return {
        protein_grams: Math.round(weight * protein_multiplier),
        calorie_adjustment: calorie_deficit ? -calorie_deficit : (calorie_surplus || 0),
        guidance: plan.nutrition_focus,
        tips: plan.tips
    };
};