// src/components/health/LogVitalsModal.js

import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { healthAPI, handleAPIError } from '../../services/api';

const LogVitalsModal = ({ onClose, onLogSuccess }) => {
    const [formData, setFormData] = useState({
        systolic_bp: '', diastolic_bp: '', spo2: '', stress_level: '', steps_today: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Filter out empty fields before submitting
            const dataToSubmit = Object.entries(formData)
                .filter(([_, value]) => value !== '')
                .reduce((obj, [key, value]) => ({ ...obj, [key]: Number(value) }), {});

            if (Object.keys(dataToSubmit).length === 0) {
                setError('Please enter at least one value.');
                setLoading(false);
                return;
            }

            const response = await healthAPI.logData(dataToSubmit);
            onLogSuccess(response.data);
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Log Your Vitals</h2>
                    <button onClick={onClose}><FaTimes className="text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="systolic_bp" value={formData.systolic_bp} onChange={handleChange} type="number" placeholder="Systolic BP" className="p-2 border rounded" />
                        <input name="diastolic_bp" value={formData.diastolic_bp} onChange={handleChange} type="number" placeholder="Diastolic BP" className="p-2 border rounded" />
                    </div>
                    <input name="spo2" value={formData.spo2} onChange={handleChange} type="number" placeholder="SpO2 (%)" className="w-full p-2 border rounded" />
                    <input name="stress_level" value={formData.stress_level} onChange={handleChange} type="number" placeholder="Stress Level (1-100)" className="w-full p-2 border rounded" />
                    <input name="steps_today" value={formData.steps_today} onChange={handleChange} type="number" placeholder="Steps Today" className="w-full p-2 border rounded" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? 'Logging...' : 'Log Vitals'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LogVitalsModal;