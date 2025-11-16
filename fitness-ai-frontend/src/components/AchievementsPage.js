import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { achievementsAPI, handleAPIError } from '../services/api';
import { FaTrophy, FaSpinner, FaCheckCircle } from 'react-icons/fa';


const ProgressBar = ({ current, target }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const AchievementsPage = () => {
    const { profile } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                setLoading(true);
                const response = await achievementsAPI.getProgress();
                setAchievements(response.data || []);
            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    if (loading) {
        return <div className="text-center p-12 dark:text-gray-300">Loading achievements...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <FaTrophy className="mr-3 text-yellow-500" />
                    Achievements & Rewards
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Complete challenges to earn points and level up your rank.
                </p>
            </header>

            {/* User Rank and Points Card */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Rank</h2>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{profile?.rank || 'Novice'}</p>
                </div>
                <div>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Total Points</h2>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-right">{profile?.reward_points || 0}</p>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((ach) => (
                    <div
                        key={ach.id}
                        className={`p-6 rounded-lg shadow-sm border ${ach.is_unlocked
                                ? 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{ach.achievement_name}</h3>
                                <p className="text-xs font-semibold text-yellow-500">{ach.points_reward} Points</p>
                            </div>
                            {ach.is_unlocked && (
                                <div className="flex items-center text-green-600">
                                    <FaCheckCircle className="mr-1" />
                                    <span className="text-sm font-bold">Completed</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 h-10">{ach.description}</p>

                        {!ach.is_unlocked && (
                            <>
                                <ProgressBar current={ach.progress_value} target={ach.target_value} />
                                <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {Math.round(ach.progress_value)} / {ach.target_value}
                                    {ach.metric === 'volume' ? ' kg' : ach.metric === 'duration' ? ' min' : ''}
                                </p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsPage;