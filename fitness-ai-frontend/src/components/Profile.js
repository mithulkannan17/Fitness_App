import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, handleAPIError } from '../services/api';

const Profile = () => {
    const { profile: initialProfile, fetchProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        age: '',
        weight: '',
        height: '',
        goal: 'muscle_gain',
        activity_level: 'moderately_active',
        diet_preference: 'both',
        experience_level: 'intermediate',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialProfile) {
            setProfileData({
                first_name: initialProfile.first_name || '',
                last_name: initialProfile.last_name || '',
                gender: initialProfile.gender || '',
                age: initialProfile.age || '',
                weight: initialProfile.weight || '',
                height: initialProfile.height || '',
                goal: initialProfile.goal || 'muscle_gain',
                activity_level: initialProfile.activity_level || 'moderately_active',
                diet_preference: initialProfile.diet_preference || 'both',
                experience_level: initialProfile.experience_level || 'intermediate',
            });
            setLoading(false);
        }
    }, [initialProfile]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await profileAPI.update(profileData);
            await fetchProfile();
            alert('Profile updated successfully!');
            navigate('/');
        } catch (error) {
            console.error('Failed to update profile', error);
            setError(handleAPIError(error));
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Fitness Profile</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Keep this information up-to-date for the best recommendations.</p>
            </header>

            {/* --- REWARDS INFO ADDED HERE --- */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Rank</h2>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{initialProfile?.rank || 'Novice'}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Total Points</h2>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-right">{initialProfile?.reward_points || 0}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                {error && <div className="mb-4 bg-red-50 dark:bg-red-700 text-red-700 dark:text-red-100 p-3 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input type="text" name="first_name" id="first_name" value={profileData.first_name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input type="text" name="last_name" id="last_name" value={profileData.last_name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                        </div>
                    </div>

                    {/* Physical Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                            <select name="gender" id="gender" value={profileData.gender} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                            <input type="number" name="age" id="age" value={profileData.age} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
                            <input type="number" step="0.1" name="weight" id="weight" value={profileData.weight} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
                            <input type="number" name="height" id="height" value={profileData.height} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100" />
                        </div>
                    </div>

                    {/* Fitness Details */}
                    <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <input type="radio" id="beginner" name="experience_level" value="beginner" checked={profileData.experience_level === 'beginner'} onChange={handleChange} />
                                    <label htmlFor="beginner" className="ml-2 text-gray-700 dark:text-gray-300">Beginner</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="intermediate" name="experience_level" value="intermediate" checked={profileData.experience_level === 'intermediate'} onChange={handleChange} />
                                    <label htmlFor="intermediate" className="ml-2 text-gray-700 dark:text-gray-300">Intermediate</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="advanced" name="experience_level" value="advanced" checked={profileData.experience_level === 'advanced'} onChange={handleChange} />
                                    <label htmlFor="advanced" className="ml-2 text-gray-700 dark:text-gray-300">Advanced</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Level</label>
                            <select name="activity_level" id="activity_level" value={profileData.activity_level} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-100">
                                <option value="sedentary">Sedentary (little/no exercise)</option>
                                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                                <option value="very_active">Very Active (6-7 days a week)</option>
                                <option value="extra_active">Extra Active (very physical job)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dietary Preference</label>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <input type="radio" id="veg" name="diet_preference" value="veg" checked={profileData.diet_preference === 'veg'} onChange={handleChange} />
                                    <label htmlFor="veg" className="ml-2 text-gray-700 dark:text-gray-300">Vegetarian</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="non-veg" name="diet_preference" value="non-veg" checked={profileData.diet_preference === 'non-veg'} onChange={handleChange} />
                                    <label htmlFor="non-veg" className="ml-2 text-gray-700 dark:text-gray-300">Non-Vegetarian</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="both" name="diet_preference" value="both" checked={profileData.diet_preference === 'both'} onChange={handleChange} />
                                    <label htmlFor="both" className="ml-2 text-gray-700 dark:text-gray-300">Both</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goal</label>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <input type="radio" id="muscle_gain" name="goal" value="muscle_gain" checked={profileData.goal === 'muscle_gain'} onChange={handleChange} />
                                    <label htmlFor="muscle_gain" className="ml-2 text-gray-700 dark:text-gray-300">Muscle Gain</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="fat_loss" name="goal" value="fat_loss" checked={profileData.goal === 'fat_loss'} onChange={handleChange} />
                                    <label htmlFor="fat_loss" className="ml-2 text-gray-700 dark:text-gray-300">Fat Loss</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="maintenance" name="goal" value="maintenance" checked={profileData.goal === 'maintenance'} onChange={handleChange} />
                                    <label htmlFor="maintenance" className="ml-2 text-gray-700 dark:text-gray-300">Maintenance</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="endurance" name="goal" value="endurance" checked={profileData.goal === 'endurance'} onChange={handleChange} />
                                    <label htmlFor="endurance" className="ml-2 text-gray-700 dark:text-gray-300">Endurance</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button onClick={handleLogout} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;