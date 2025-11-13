import React, { useState, useEffect } from 'react';
import { FaTimes, FaDumbbell, FaTrash, FaPlus } from 'react-icons/fa';
import { activitiesAPI, handleAPIError } from '../../services/api';

// 1. Add the helper function to fix timezone bug
const getLocalDateString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// --- Helper to get default log type from category ---
const getLogTypeForCategory = (category) => {
    if (category === 'Strength') return 'weight';
    if (category === 'Cardio') return 'cardio';
    return 'duration'; // Default for Flexibility, Sport, Recovery
};

// --- NEW: Sub-component for the set type buttons ---
const LogTypeButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`text-xs font-semibold py-1 px-3 rounded-full ${isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
    >
        {label}
    </button>
);


const LogExerciseModal = ({ exercise, onClose, onLogSuccess }) => {
    const [sets, setSets] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (exercise) {
            // Get the default log type based on the exercise's category
            const defaultLogType = getLogTypeForCategory(exercise.category);

            // 2. Initialize all possible fields + logType
            const initialSets = [{
                logType: defaultLogType, // Add logType
                exercise_name: exercise.name,
                weight_kg: '',
                reps: '',
                distance_km: '',
                duration_minutes: ''
            }];
            setSets(initialSets);
            setNotes('');
            setError('');
        }
    }, [exercise]);

    if (!exercise) return null;

    // --- NEW: Handler for changing a set's log type ---
    const handleSetLogTypeChange = (index, newLogType) => {
        const updatedSets = [...sets];
        updatedSets[index].logType = newLogType;
        // Clear out old data when type changes
        updatedSets[index].weight_kg = '';
        updatedSets[index].reps = '';
        updatedSets[index].distance_km = '';
        updatedSets[index].duration_minutes = '';
        setSets(updatedSets);
    };

    const handleSetChange = (index, field, value) => {
        const updatedSets = [...sets];
        updatedSets[index][field] = value;
        setSets(updatedSets);
    };

    const addSet = () => {
        // 3. Add all possible fields + logType
        // New sets default to the logType of the *previous* set.
        const lastSetLogType = sets[sets.length - 1]?.logType || getLogTypeForCategory(exercise.category);

        setSets([...sets, {
            logType: lastSetLogType,
            exercise_name: exercise.name,
            weight_kg: '',
            reps: '',
            distance_km: '',
            duration_minutes: ''
        }]);
    };

    const removeSet = (index) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    // 4. Update handleSubmit to check each set's logType
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter sets based on each set's individual logType
        const setsToSubmit = sets.filter(set => {
            if (set.logType === 'weight') {
                return set.weight_kg && set.reps;
            }
            if (set.logType === 'cardio') {
                return set.duration_minutes; // Distance is optional
            }
            if (set.logType === 'duration') {
                return set.duration_minutes;
            }
            return false; // Should not happen
        });

        if (setsToSubmit.length === 0) {
            setError('Please fill in at least one complete set.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const activityData = {
                name: `${exercise.name} Session`,
                date: getLocalDateString(new Date()), // Use local date string
                notes: notes,
                fitness_activity_id: exercise.id,
                // Map all fields, sending null for empty ones based on logType
                sets: setsToSubmit.map(s => ({
                    exercise_name: s.exercise_name,
                    weight_kg: s.logType === 'weight' ? parseFloat(s.weight_kg) : null,
                    reps: s.logType === 'weight' ? parseInt(s.reps, 10) : null,
                    distance_km: (s.logType === 'cardio' && s.distance_km) ? parseFloat(s.distance_km) : null,
                    duration_minutes: (s.logType === 'cardio' || s.logType === 'duration') ? parseInt(s.duration_minutes, 10) : null
                })),
            };
            const response = await activitiesAPI.create(activityData);
            if (onLogSuccess) onLogSuccess(response.data);
            onClose();
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{exercise.name}</h2>
                        <button onClick={onClose}><FaTimes className="text-gray-500" /></button>
                    </div>
                </div>

                <form id="log-exercise-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-3">
                        {sets.map((set, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600 space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-700 dark:text-gray-100">Set {index + 1}</p>
                                    {sets.length > 1 && (
                                        <button type="button" onClick={() => removeSet(index)} className="text-red-500 hover:text-red-700">
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>

                                {/* 5. NEW: Log Type Buttons */}
                                <div className="flex items-center gap-2">
                                    <LogTypeButton
                                        label="Weight"
                                        isActive={set.logType === 'weight'}
                                        onClick={() => handleSetLogTypeChange(index, 'weight')}
                                    />
                                    <LogTypeButton
                                        label="Cardio"
                                        isActive={set.logType === 'cardio'}
                                        onClick={() => handleSetLogTypeChange(index, 'cardio')}
                                    />
                                    <LogTypeButton
                                        label="Duration"
                                        isActive={set.logType === 'duration'}
                                        onClick={() => handleSetLogTypeChange(index, 'duration')}
                                    />
                                </div>

                                {/* 6. Conditional JSX for inputs based on set.logType */}
                                <div className="grid grid-cols-2 gap-2">
                                    {set.logType === 'weight' && (
                                        <>
                                            <input type="number" step="0.1" value={set.weight_kg} onChange={(e) => handleSetChange(index, 'weight_kg', e.target.value)} placeholder="Weight (kg)" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" required />
                                            <input type="number" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} placeholder="Reps" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" required />
                                        </>
                                    )}

                                    {set.logType === 'cardio' && (
                                        <>
                                            <input type="number" step="0.1" value={set.distance_km} onChange={(e) => handleSetChange(index, 'distance_km', e.target.value)} placeholder="Distance (km)" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" />
                                            <input type="number" value={set.duration_minutes} onChange={(e) => handleSetChange(index, 'duration_minutes', e.target.value)} placeholder="Duration (min)" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" required />
                                        </>
                                    )}

                                    {set.logType === 'duration' && (
                                        // Use col-span-2 to make the single input full-width
                                        <input type="number" value={set.duration_minutes} onChange={(e) => handleSetChange(index, 'duration_minutes', e.target.value)} placeholder="Duration (min)" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100 col-span-2" required />
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addSet} className="w-full text-sm text-indigo-600 dark:text-indigo-400 font-semibold border-2 border-dashed rounded-md py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/50">
                            <FaPlus className="inline mr-1" /> Add Set
                        </button>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                        <textarea name="notes" id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={loading} className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" />
                    </div>

                    {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">{error}</div>}
                </form>

                <div className="p-4 mt-auto bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600">
                    <button type="submit" form="log-exercise-form" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {loading ? 'Logging...' : 'Log Workout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogExerciseModal;