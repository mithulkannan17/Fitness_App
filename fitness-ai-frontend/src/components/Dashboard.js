import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { performanceAPI, handleAPIError } from '../services/api';
import AiCoachCard from './dashboard/AiCoachCard';
import { FrequencyChart, BreakdownChart } from './dashboard/PerformanceCharts';
import { FaPlus, FaChartLine, FaUtensils, FaRunning } from 'react-icons/fa';

const Dashboard = () => {
    const { profile, hasCompleteProfile } = useAuth();
    const { theme } = useTheme();
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboardData = async () => {
            if (hasCompleteProfile()) {
                try {
                    const perfResponse = await performanceAPI.getDashboard();
                    setPerformanceData(perfResponse.data);
                } catch (err) {
                    setError(handleAPIError(err));
                }
            }
            setLoading(false);
        };
        loadDashboardData();
    }, [hasCompleteProfile]);

    const WelcomeCard = () => (
        <div className="animated-border-card rounded-lg mb-8">
            
            <div className="relative z-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md shadow-lg p-6 text-white m-[2px]">
                <h1 className="text-2xl font-bold">Welcome back, {profile?.first_name || 'User'}!</h1>
                <p className="text-indigo-100">Here's your fitness overview for today.</p>
            </div>
        </div>
    );

    if (loading) {
        return <div className="text-center p-12 dark:text-gray-300">Loading Dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <WelcomeCard />

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>}

            <AiCoachCard />

            {hasCompleteProfile() && performanceData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {performanceData.weekly_frequency?.length > 0 && <FrequencyChart data={performanceData.weekly_frequency} theme={theme} />}
                    {performanceData.activity_breakdown?.length > 0 && <BreakdownChart data={performanceData.activity_breakdown} theme={theme} />}
                </div>
            )}

    
            <div className="animated-border-card">
                {/* 2. Inner wrapper for the content, matching the card's original styles */}
                <div className="relative z-10 bg-gray-100 border border-gray-200 dark:bg-gray-800 rounded-[11px] m-[2px] p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/activity-log" className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition">
                            <FaPlus className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                            <div><p className="font-medium text-gray-900 dark:text-gray-100">Log Activity</p><p className="text-sm text-gray-600 dark:text-gray-300">Track your workout</p></div>
                        </Link>
                        <Link to="/performance" className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                            <FaChartLine className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                            <div><p className="font-medium text-gray-900 dark:text-gray-100">Performance</p><p className="text-sm text-gray-600 dark:text-gray-300">Analyze progress</p></div>
                        </Link>
                        <Link to="/nutrition" className="flex items-center p-4 bg-green-50 dark:bg-green-900/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition">
                            <FaUtensils className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                            <div><p className="font-medium text-gray-900 dark:text-gray-100">Nutrition</p><p className="text-sm text-gray-600 dark:text-gray-300">View meal plans</p></div>
                        </Link>
                        <Link to="/fitness-plan" className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900 transition">
                            <FaRunning className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-3" />
                            <div><p className="font-medium text-gray-900 dark:text-gray-100">Your Fitness Plan</p><p className="text-sm text-gray-600 dark:text-gray-300">View weekly schedule</p></div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;