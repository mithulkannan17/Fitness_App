import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaPlusCircle } from 'react-icons/fa';
import { trainingAPI, fitnessActivitiesAPI, handleAPIError } from '../services/api';
import LogExerciseModal from './training/LogExerciseModal';

const ExerciseCard = ({ exercise, onLogClick }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-4"></div>
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{exercise.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Target: {exercise.target_muscles}</p>
            </div>
        </div>
        <button onClick={onLogClick} className="text-sm font-bold text-indigo-600 hover:underline">Log</button>
    </div>
);

const WorkoutDetailPage = () => {
    const { workoutId } = useParams();
    const navigate = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [fitnessActivities, setFitnessActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        const fetchWorkoutData = async () => {
            try {
                setLoading(true);
                const [workoutResponse, activitiesResponse] = await Promise.all([
                    trainingAPI.getWorkoutDetail(workoutId),
                    fitnessActivitiesAPI.list()
                ]);
                setWorkout(workoutResponse.data);
                setFitnessActivities(activitiesResponse.data.results || []);
            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchWorkoutData();
    }, [workoutId]);

    const handleLogClick = (exerciseToLog) => {
        const matchedActivity = fitnessActivities.find(
            (activity) => activity.name.toLowerCase() === exerciseToLog.name.toLowerCase()
        );

        if (matchedActivity) {
            setSelectedExercise(matchedActivity);
        } else {
            console.warn(
                `Activity "${exerciseToLog.name}" not found in fitness library. Logging as custom activity.`
            );

            // Still allow the user to log it
            setSelectedExercise({
                ...exerciseToLog,
                isCustom: true, // optional flag
            });
        }
    };


    const handleLogSuccess = (loggedActivity) => {
        alert(`Successfully logged "${loggedActivity.name}"!`);
        setSelectedExercise(null);
    };

    if (loading) {
        return <div className="text-center p-12"><FaSpinner className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300 mx-auto" /></div>;
    }

    if (error || !workout) {
        return <div className="text-center p-12 text-red-500">{error || 'Workout not found.'}</div>;
    }

    const backLink = workout.training_category ? `/training/${workout.training_category}` : '/training';

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <Link to={backLink} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4">
                        <FaArrowLeft className="mr-2" /> Back to workout list
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{workout.name}</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{workout.description}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workout.exercises && workout.exercises.length > 0 ? (
                        workout.exercises.map(exercise => (
                            <ExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onLogClick={() => handleLogClick(exercise)}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No exercises found for this workout.</p>
                    )}
                </div>
            </div>

            {selectedExercise && (
                <LogExerciseModal
                    exercise={selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                    onLogSuccess={handleLogSuccess}
                />
            )}
        </>
    );
};

export default WorkoutDetailPage;