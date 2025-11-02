import React, { useState, useEffect } from 'react';
import { FaRunning, FaDumbbell, FaHeart, FaLeaf, FaRedo } from 'react-icons/fa';
import { fitnessAPI, handleAPIError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FitnessPlan = () => {
    const [plan, setPlan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const { profile, hasCompleteProfile } = useAuth();

    useEffect(() => {
        if (hasCompleteProfile()) {
            fetchPlan();
        } else {
            setLoading(false);
        }
    }, [hasCompleteProfile]);

    const fetchPlan = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fitnessAPI.getPlan();
            setPlan(response.data.plan || []);
        } catch (error) {
            console.error("Failed to fetch fitness plan:", error);
            setError(handleAPIError(error));
        } finally {
            setLoading(false);
        }
    };

    const generateNewPlan = async () => {
        try {
            setGenerating(true);
            setError('');
            const response = await fitnessAPI.getPlan();
            setPlan(response.data.plan || []);
        } catch (error) {
            console.error("Failed to generate new plan:", error);
            setError(handleAPIError(error));
        } finally {
            setGenerating(false);
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Strength': return <FaDumbbell className="text-red-600" />;
            case 'Cardio': return <FaHeart className="text-blue-600" />;
            case 'Flexibility': return <FaLeaf className="text-green-600" />;
            case 'Sport': return <FaRunning className="text-purple-600" />;
            case 'Recovery': return <FaLeaf className="text-indigo-600" />;
            default: return <FaDumbbell className="text-gray-600" />;
        }
    };

    // UPDATED: Added dark mode classes
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Strength': return 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
            case 'Cardio': return 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
            case 'Flexibility': return 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
            case 'Sport': return 'bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
            case 'Recovery': return 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200';
            default: return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
        }
    };

    // UPDATED: Added dark mode classes
    const getIntensityBadge = (intensity) => {
        const intensityColors = {
            'low': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'moderate': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'high': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            'very_high': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${intensityColors[intensity] || 'bg-gray-100 text-gray-800'}`}>
                {intensity?.replace('_', ' ') || 'N/A'}
            </span>
        );
    };

    if (!hasCompleteProfile()) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                        <FaDumbbell className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Your Profile</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        To generate a personalized fitness plan, please complete your profile.
                    </p>
                    <Link to="/profile" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition">
                        Complete Profile
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <FaRunning className="mr-3 text-indigo-600" />
                            Your Personalized Fitness Plan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 capitalize">
                            Goal: <strong>{profile?.goal?.replace('_', ' ') || 'N/A'}</strong> •
                            Experience: <strong>{profile?.experience_level || 'N/A'}</strong>
                        </p>
                    </div>
                    <button onClick={generateNewPlan} disabled={generating} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
                        <FaRedo className={`mr-2 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Generating...' : 'New Plan'}
                    </button>
                </div>
            </header>

            {error && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md">{error}</div>}

            {plan.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Weekly Training Schedule</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{plan.length} activities recommended for this week</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plan.map((activity, index) => (
                                <div key={activity.id || index} className={`rounded-lg border-2 p-6 transition-all hover:shadow-md ${getCategoryColor(activity.category)}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-lg bg-white dark:bg-gray-700 mr-3">
                                                {getCategoryIcon(activity.category)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{activity.name}</h3>
                                                <p className="text-sm opacity-75 capitalize">{activity.category}</p>
                                            </div>
                                        </div>
                                        {getIntensityBadge(activity.intensity)}
                                    </div>
                                    <p className="text-sm opacity-80 mb-3">{activity.description}</p>
                                    <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-current border-opacity-20">
                                        {activity.difficulty_level && <span><strong>Level:</strong> {activity.difficulty_level}/10</span>}
                                        {activity.calories_per_hour && <span><strong>~{activity.calories_per_hour}</strong> cal/hr</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FaDumbbell className="text-gray-400 dark:text-gray-500 text-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Fitness Plan Available</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">We couldn't generate a plan. Try adjusting your profile or regenerating.</p>
                    <button onClick={generateNewPlan} disabled={generating} className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50">
                        <FaRedo className={`mr-2 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Generating...' : 'Try Again'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FitnessPlan;