import React, { useState, useEffect } from 'react';
import { FaTimes, FaDumbbell, FaTrash, FaPlus } from 'react-icons/fa';
import { activitiesAPI, handleAPIError } from '../../services/api';

const LogExerciseModal = ({ exercise, onClose, onLogSuccess }) => {
    const [sets, setSets] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (exercise) {
            const initialSets = [{ exercise_name: exercise.name, weight_kg: '', reps: '' }];
            setSets(initialSets);
            setNotes('');
            setError('');
        }
    }, [exercise]);

    if (!exercise) return null;

    const handleSetChange = (index, field, value) => {
        const updatedSets = [...sets];
        updatedSets[index][field] = value;
        setSets(updatedSets);
    };

    const addSet = () => {
        setSets([...sets, { exercise_name: exercise.name, weight_kg: '', reps: '' }]);
    };

    const removeSet = (index) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const setsToSubmit = sets.filter(set => set.weight_kg && set.reps);
        if (setsToSubmit.length === 0) {
            setError('Please fill in at least one set (weight and reps).');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const activityData = {
                name: `${exercise.name} Session`,
                date: new Date().toISOString().slice(0, 10),
                notes: notes,
                fitness_activity_id: exercise.id,
                sets: setsToSubmit.map(s => ({ ...s, weight_kg: parseFloat(s.weight_kg), reps: parseInt(s.reps, 10) })),
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
                    {/* --- THIS IS THE MISSING FORM CONTENT --- */}
                    <div className="space-y-3">
                        {sets.map((set, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-gray-700 dark:text-gray-100">Set {index + 1}</p>
                                    {sets.length > 1 && (
                                        <button type="button" onClick={() => removeSet(index)} className="text-red-500 hover:text-red-700">
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" step="0.1" value={set.weight_kg} onChange={(e) => handleSetChange(index, 'weight_kg', e.target.value)} placeholder="Weight (kg)" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" required />
                                    <input type="number" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} placeholder="Reps" className="w-full text-sm p-2 border rounded-md dark:bg-gray-600 dark:text-gray-100" required />
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