import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { activitiesAPI, handleAPIError } from '../services/api';

const EditActivityModal = ({ activity, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...activity });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {

        const completeSets = activity.sets.map(set => ({
            exercise_name: set.exercise_name || '',
            weight_kg: set.weight_kg || '',
            reps: set.reps || '',
            distance_km: set.distance_km || '',
            duration_minutes: set.duration_minutes || '',
            ...set 
        }));
        setFormData({ ...activity, sets: completeSets });
    }, [activity]);


    if (!activity) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSetChange = (index, field, value) => {
        const updatedSets = [...formData.sets];
        updatedSets[index][field] = value;
        setFormData(prev => ({ ...prev, sets: updatedSets }));
    };

    const addSet = () => {
        const lastSet = formData.sets[formData.sets.length - 1];
        setFormData(prev => ({
            ...prev, sets: [
                ...prev.sets,
                { exercise_name: lastSet?.exercise_name || '', weight_kg: '', reps: '', distance_km: '', duration_minutes: '' }
            ]
        }));
    };

    const removeSet = (index) => {
        setFormData(prev => ({ ...prev, sets: formData.sets.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cleanedData = {
            ...formData,
            sets: formData.sets.map(set => ({
                id: set.id, // Keep ID for existing sets
                exercise_name: set.exercise_name,
                weight_kg: set.weight_kg ? parseFloat(set.weight_kg) : null,
                reps: set.reps ? parseInt(set.reps, 10) : null,
                distance_km: set.distance_km ? parseFloat(set.distance_km) : null,
                duration_minutes: set.duration_minutes ? parseInt(set.duration_minutes, 10) : null,
                rest_seconds: set.rest_seconds ? parseInt(set.rest_seconds, 10) : null,
            }))
        };

        try {
            const response = await activitiesAPI.update(activity.id, cleanedData);
            onSave(response.data);
            onClose();
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Activity Log</h2>
                </div>
                <form id="edit-activity-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label>Session Title</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                    </div>
                    <div>
                        <label>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Sets</h3>
                        {formData.sets.map((set, index) => (
                            <div key={index} className="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                                <div className="flex justify-between items-center">
                                    <input
                                        type="text"
                                        value={set.exercise_name}
                                        onChange={(e) => handleSetChange(index, 'exercise_name', e.target.value)}
                                        placeholder="Exercise"
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100 font-semibold"
                                    />
                                    <button type="button" onClick={() => removeSet(index)} className="text-red-500 hover:text-red-700 p-2 ml-2"><FaTrash /></button>
                                </div>

                                <div className="flex gap-2">
                                    {/* Strength Inputs */}
                                    {(!formData.category || formData.category === 'Strength') && (
                                        <>
                                            <input type="number" value={set.weight_kg} onChange={(e) => handleSetChange(index, 'weight_kg', e.target.value)} placeholder="kg" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                                            <input type="number" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} placeholder="reps" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                                        </>
                                    )}

                                    {/* Cardio Inputs */}
                                    {(formData.category === 'Cardio') && (
                                        <>
                                            <input type="number" value={set.distance_km} onChange={(e) => handleSetChange(index, 'distance_km', e.target.value)} placeholder="km" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                                            <input type="number" value={set.duration_minutes} onChange={(e) => handleSetChange(index, 'duration_minutes', e.target.value)} placeholder="min" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                                        </>
                                    )}

                                    {/* Flexibility/Other Inputs */}
                                    {(formData.category === 'Flexibility' || formData.category === 'Sport' || formData.category === 'Recovery') && (
                                        <input type="number" value={set.duration_minutes} onChange={(e) => handleSetChange(index, 'duration_minutes', e.target.value)} placeholder="min" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addSet} className="w-full text-sm text-indigo-600 font-semibold border-2 border-dashed rounded-md py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/50">+ Add Set</button>
                    </div>
                    <div>
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button
                        type="submit"
                        form="edit-activity-form"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditActivityModal;