import React, { useState, useEffect } from 'react';
import { FaPlus, FaCalendarAlt, FaClock, FaStickyNote, FaTrash, FaDumbbell } from 'react-icons/fa';
import { activitiesAPI, fitnessActivitiesAPI, handleAPIError } from '../services/api';

const ActivityLog = () => {
    const [fitnessActivities, setFitnessActivities] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const initialFormState = {
        name: '',
        date: new Date().toISOString().slice(0, 10),
        duration: '',
        notes: '',
        fitness_activity_id: '',
        sets: [{ exercise_name: '', weight_kg: '', reps: '' }]
    };
    const [newActivity, setNewActivity] = useState(initialFormState);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [logsResponse, fitnessActivitiesResponse] = await Promise.all([
                    activitiesAPI.list(),
                    fitnessActivitiesAPI.list()
                ]);
                setActivities(logsResponse.data.results || []);
                setFitnessActivities(fitnessActivitiesResponse.data.results || []);
            } catch (error) {
                setError(handleAPIError(error));
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

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
        setNewActivity(prev => ({ ...prev, sets: [...prev.sets, { exercise_name: '', weight_kg: '', reps: '' }] }));
    };

    const removeSet = (index) => {
        setNewActivity(prev => ({ ...prev, sets: newActivity.sets.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newActivity.fitness_activity_id || !newActivity.name.trim()) {
            setError('Please select an activity type and provide a session title.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const setsToSubmit = newActivity.sets
                .filter(set => set.exercise_name && set.weight_kg && set.reps)
                .map(set => ({ ...set, weight_kg: parseFloat(set.weight_kg), reps: parseInt(set.reps, 10) }));

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
                fitness_activity_id: parseInt(newActivity.fitness_activity_id, 10),
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

    if (loading) {
        return <div className="text-center p-12"><FaDumbbell className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Activity Log</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Track your workouts and stay consistent on your fitness journey.</p>
            </header>

            {error && <div className="mb-6 bg-red-50 dark:bg-red-700 text-red-700 dark:text-red-200 p-3 rounded-md">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-gray-100">
                            <FaPlus className="mr-2 text-indigo-600 dark:text-indigo-300" /> Log New Workout
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="fitness_activity_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Type *</label>
                                <select name="fitness_activity_id" id="fitness_activity_id" value={newActivity.fitness_activity_id} onChange={handleChange} disabled={submitting} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
                                    <option value="">-- Select an activity --</option>
                                    {fitnessActivities.map(activity => (<option key={activity.id} value={activity.id}>{activity.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Title *</label>
                                <input type="text" name="name" id="name" value={newActivity.name} onChange={handleChange} disabled={submitting} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="e.g., Morning Chest Day" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaCalendarAlt className="inline mr-1" /> Date *</label>
                                    <input type="date" name="date" id="date" value={newActivity.date} onChange={handleChange} disabled={submitting} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaClock className="inline mr-1" /> Duration (min)</label>
                                    <input type="number" name="duration" id="duration" value={newActivity.duration} onChange={handleChange} disabled={submitting} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="60" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-t pt-4"><FaDumbbell className="inline mr-2" /> Sets</h3>
                                {newActivity.sets.map((set, index) => (
                                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Set {index + 1}</p>
                                            {newActivity.sets.length > 1 && (<button type="button" onClick={() => removeSet(index)} className="text-red-500 hover:text-red-700"><FaTrash /></button>)}
                                        </div>
                                        <input type="text" name="exercise_name" value={set.exercise_name} onChange={(e) => handleSetChange(index, e)} placeholder="Exercise Name" className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                                        <div className="flex gap-2">
                                            <input type="number" name="weight_kg" value={set.weight_kg} onChange={(e) => handleSetChange(index, e)} placeholder="Weight (kg)" className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                                            <input type="number" name="reps" value={set.reps} onChange={(e) => handleSetChange(index, e)} placeholder="Reps" className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addSet} disabled={submitting} className="w-full text-sm text-indigo-600 font-semibold border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900">
                                    + Add Set
                                </button>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaStickyNote className="inline mr-1" /> Notes</label>
                                <textarea name="notes" id="notes" value={newActivity.notes} onChange={handleChange} disabled={submitting} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="How did it go?..." />
                            </div>

                            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                                {submitting ? 'Submitting...' : 'Log Workout'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Activity History</h2>
                        </div>
                        <div className="p-6">
                            {activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map(activity => (
                                        <div key={activity.id} className="border-l-4 border-indigo-500 bg-gray-50 dark:bg-gray-700 p-4 rounded-r-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{activity.name}</h3>
                                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        <span className="flex items-center"><FaCalendarAlt className="mr-1" />{new Date(activity.date).toLocaleDateString()}</span>
                                                        {activity.duration && <span className="flex items-center"><FaClock className="mr-1" />{activity.duration} min</span>}
                                                        {activity.category && <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full font-medium capitalize">{activity.category}</span>}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{activity.sets.length} {activity.sets.length === 1 ? 'set' : 'sets'}</span>
                                            </div>
                                            {activity.notes && <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 italic">"{activity.notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaDumbbell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="font-medium text-gray-800 dark:text-gray-100">No activities logged yet</h3>
                                    <p className="text-gray-500 dark:text-gray-300 mt-1">Use the form to log your first activity!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
