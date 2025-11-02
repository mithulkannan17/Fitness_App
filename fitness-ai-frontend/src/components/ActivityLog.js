import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaPlus,
    FaCalendarAlt,
    FaClock,
    FaStickyNote,
    FaTrash,
    FaDumbbell,
    FaEdit
} from 'react-icons/fa';
import { activitiesAPI, fitnessActivitiesAPI, handleAPIError } from '../services/api';
import EditActivityModal from './EditActivityModal';

const ActivityLog = () => {
    const [fitnessActivities, setFitnessActivities] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [editingActivity, setEditingActivity] = useState(null);

    const initialFormState = {
        name: '',
        date: new Date().toISOString().slice(0, 10),
        duration: '',
        notes: '',
        fitness_activity_id: '',
        sets: [{ exercise_name: '', weight_kg: '', reps: '' }]
    };
    const [newActivity, setNewActivity] = useState(initialFormState);

    const location = useLocation();
    const navigate = useNavigate();
    const prefilledWorkout = location.state?.prefilledWorkout;

    // ✅ Load activities & activity types
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [logsResponse, fitnessActivitiesResponse] = await Promise.all([
                    activitiesAPI.list(),
                    fitnessActivitiesAPI.list()
                ]);

                const logsData = logsResponse.data.results || logsResponse.data || [];
                const fitnessData = fitnessActivitiesResponse.data.results || fitnessActivitiesResponse.data || [];

                setActivities(logsData);
                setFitnessActivities(fitnessData);
            } catch (error) {
                setError(handleAPIError(error));
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // ✅ Handle prefilled workout
    useEffect(() => {
        if (prefilledWorkout && fitnessActivities.length > 0) {
            const matchedActivity = fitnessActivities.find(
                fa => fa.name.toLowerCase() === prefilledWorkout.name.toLowerCase()
            );

            setNewActivity({
                ...initialFormState,
                name: prefilledWorkout.name,
                fitness_activity_id: matchedActivity ? matchedActivity.id : '',
                sets: prefilledWorkout.exercises.map(ex => ({
                    exercise_name: ex.name,
                    weight_kg: '',
                    reps: ''
                }))
            });

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [prefilledWorkout, fitnessActivities, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewActivity(prev => ({ ...prev, [name]: value }));
    };

    const handleSetChange = (index, e) => {
        const { name, value } = e.target;
        const updatedSets = [...newActivity.sets];
        updatedSets[index][name] = value;
        setNewActivity(prev => ({ ...prev, sets: updatedSets }));
    };

    const addSet = () => {
        const lastSet = newActivity.sets[newActivity.sets.length - 1];
        setNewActivity(prev => ({
            ...prev,
            sets: [...prev.sets, { exercise_name: lastSet?.exercise_name || '', weight_kg: '', reps: '' }]
        }));
    };

    const removeSet = (index) => {
        setNewActivity(prev => ({
            ...prev,
            sets: newActivity.sets.filter((_, i) => i !== index)
        }));
    };

    // ✅ Create activity
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newActivity.name.trim()) {
            setError('Please provide a session title.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const setsToSubmit = newActivity.sets
                .filter(set => set.exercise_name && set.weight_kg && set.reps)
                .map(set => ({
                    ...set,
                    weight_kg: parseFloat(set.weight_kg),
                    reps: parseInt(set.reps, 10)
                }));

            if (setsToSubmit.length === 0) {
                setError('Please log at least one complete set.');
                setSubmitting(false);
                return;
            }

            const activityData = {
                name: newActivity.name,
                date: newActivity.date,
                duration: newActivity.duration ? parseInt(newActivity.duration, 10) : null,
                notes: newActivity.notes,
                fitness_activity_id: newActivity.fitness_activity_id ? parseInt(newActivity.fitness_activity_id, 10) : null,
                sets: setsToSubmit
            };

            const response = await activitiesAPI.create(activityData);
            setActivities(prevActivities => [response.data, ...prevActivities]);
            setNewActivity(initialFormState);
        } catch (error) {
            setError(handleAPIError(error));
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Delete activity
    const handleDelete = async (id) => {
        try {
            await activitiesAPI.delete(id);
            setActivities(prev => prev.filter(act => act.id !== id));
        } catch (error) {
            setError(handleAPIError(error));
        }
    };

    // ✅ Update after edit
    const handleSaveEditedActivity = (updatedActivity) => {
        setActivities(prev =>
            prev.map(act => (act.id === updatedActivity.id ? updatedActivity : act))
        );
        setEditingActivity(null);
    };

    if (loading) {
        return <div className="text-center p-12 dark:text-gray-300">Loading activities...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Page header */}
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Activity Log</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                    Track your workouts and stay consistent on your fitness journey 💪
                </p>
            </header>

            {error && <div className="mb-6 bg-red-100 text-red-800 p-3 rounded-md">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700 sticky top-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-gray-100">
                            <FaPlus className="mr-2 text-indigo-600 dark:text-indigo-400" />
                            Log New Workout
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Session Title */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">Session Title *</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={newActivity.name}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                    placeholder="e.g., Morning Chest Day"
                                    required
                                />
                            </div>

                            {/* Activity Type */}
                            <div>
                                <label htmlFor="fitness_activity_id" className="block text-sm font-medium mb-2">Activity Type</label>
                                <select
                                    name="fitness_activity_id"
                                    id="fitness_activity_id"
                                    value={newActivity.fitness_activity_id}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                >
                                    <option value="">-- Select --</option>
                                    {fitnessActivities.map(activity => (
                                        <option key={activity.id} value={activity.id}>
                                            {activity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium mb-2">Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        id="date"
                                        value={newActivity.date}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        className="w-full  dark:bg-gray-700 dark: text-gray-400 px-3 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium mb-2">Duration (min)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        id="duration"
                                        value={newActivity.duration}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        className="w-full  dark:bg-gray-700 px-3 py-2 border rounded-lg"
                                        placeholder="60"
                                    />
                                </div>
                            </div>

                            {/* Sets */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-t pt-4">Sets</h3>
                                {newActivity.sets.map((set, index) => (
                                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md space-y-2 border dark:border-gray-600">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium">Set {index + 1}</p>
                                            {newActivity.sets.length > 1 && (
                                                <button type="button" onClick={() => removeSet(index)} className="text-red-500 hover:text-red-700">
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            name="exercise_name"
                                            value={set.exercise_name}
                                            onChange={(e) => handleSetChange(index, e)}
                                            placeholder="Exercise Name"
                                            className="w-full  dark:bg-gray-700 text-sm p-2 border rounded-md"
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                name="weight_kg"
                                                value={set.weight_kg}
                                                onChange={(e) => handleSetChange(index, e)}
                                                placeholder="Weight (kg)"
                                                className="w-full  dark:bg-gray-700 text-sm p-2 border rounded-md"
                                                required
                                            />
                                            <input
                                                type="number"
                                                name="reps"
                                                value={set.reps}
                                                onChange={(e) => handleSetChange(index, e)}
                                                placeholder="Reps"
                                                className="w-full  dark:bg-gray-700 text-sm p-2 border rounded-md"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSet}
                                    disabled={submitting}
                                    className="w-full text-sm text-indigo-600 border-2 border-dashed rounded-md py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                                >
                                    + Add Set
                                </button>
                            </div>

                            {/* Notes */}
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    id="notes"
                                    value={newActivity.notes}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    rows="3"
                                    className="w-full  dark:bg-gray-700 px-3 py-2 border rounded-md"
                                    placeholder="How did it go?..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow"
                            >
                                {submitting ? 'Submitting...' : 'Log Workout'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ✅ Activity History */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700">
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h2 className="text-xl font-semibold">Your Activity History</h2>
                        </div>
                        <div className="p-6">
                            {activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map(activity => (
                                        <div key={activity.id} className="border-l-4 border-indigo-500 bg-gray-50 dark:bg-gray-700 p-4 rounded-r-lg shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{activity.name}</h3>
                                                    <div className="flex items-center flex-wrap gap-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        <span><FaCalendarAlt className="inline mr-1" />{new Date(activity.date).toLocaleDateString()}</span>
                                                        {activity.duration && <span><FaClock className="inline mr-1" />{activity.duration} min</span>}
                                                        {activity.category && (
                                                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full capitalize">
                                                                {activity.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setEditingActivity(activity)} className="p-2 text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                                    <button onClick={() => handleDelete(activity.id)} className="p-2 text-red-500 hover:text-red-700"><FaTrash /></button>
                                                </div>
                                            </div>
                                            {activity.notes && <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 italic">"{activity.notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaDumbbell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500 mb-4" />
                                    <h3 className="font-medium text-gray-800 dark:text-gray-200">No activities logged yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Use the form to log your first activity!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingActivity && (
                <EditActivityModal
                    activity={editingActivity}
                    onClose={() => setEditingActivity(null)}
                    onSave={handleSaveEditedActivity}
                />
            )}
        </div>
    );
};

export default ActivityLog;
