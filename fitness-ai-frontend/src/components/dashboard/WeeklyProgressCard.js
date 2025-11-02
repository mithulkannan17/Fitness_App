import React, { useState, useEffect } from 'react';
import { FaDumbbell, FaCheckCircle } from 'react-icons/fa';
import { performanceAPI, fitnessAPI, activitiesAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProgressCircle = ({ percentage }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((percentage || 0) / 100) * circumference;

    return (
        <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
            <circle
                className="text-indigo-600"
                strokeWidth="10"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.5s ease-in-out'
                }}
            />
            <text x="50" y="50" className="font-bold text-xl text-indigo-600" textAnchor="middle" dy=".3em">
                {Math.round(percentage || 0)}%
            </text>
        </svg>
    );
};

const WeeklyProgressCard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { hasCompleteProfile } = useAuth();

    useEffect(() => {
        if (hasCompleteProfile()) {
            const fetchWeeklyStats = async () => {
                try {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    startOfWeek.setHours(0, 0, 0, 0);
                    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

                    const [planRes, performanceRes, activitiesRes] = await Promise.allSettled([
                        fitnessAPI.getPlan(),
                        performanceAPI.getDashboard(),
                        activitiesAPI.list({ date_after: startOfWeekStr })
                    ]);

                    const plannedWorkouts = planRes.status === 'fulfilled' ? planRes.value.data.plan.length : 0;
                    const weeklyFrequencyData = performanceRes.status === 'fulfilled' ? performanceRes.value.data.weekly_frequency : [];
                    const currentWeekStr = new Date().toLocaleDateString('en-CA', { year: 'numeric', week: '2-digit' }).replace('-W', '-');

                    const completedWorkouts = weeklyFrequencyData.find(w => w.week === currentWeekStr)?.workouts || 0;

                    let totalMinutes = 0;
                    let weeklyVolume = 0;

                    if (activitiesRes.status === 'fulfilled') {
                        const currentWeekActivities = activitiesRes.value.data;
                        totalMinutes = currentWeekActivities.reduce((sum, act) => sum + (act.duration || 0), 0);

                        currentWeekActivities.forEach(act => {
                            act.sets.forEach(set => {
                                weeklyVolume += (set.weight_kg || 0) * (set.reps || 0);
                            });
                        });
                    }

                    const trainingTime = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                    const completionPercentage = plannedWorkouts > 0 ? (completedWorkouts / plannedWorkouts) * 100 : 0;

                    setStats({
                        plannedWorkouts,
                        completedWorkouts,
                        completionPercentage,
                        trainingTime,
                        weeklyVolume,
                    });
                } catch (err) {
                    console.error("Failed to fetch weekly stats:", handleAPIError(err));
                } finally {
                    setLoading(false);
                }
            };
            fetchWeeklyStats();
        } else {
            setLoading(false);
        }
    }, [hasCompleteProfile]);

    if (loading) {
        return <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse h-[250px]"></div>;
    }

    if (!hasCompleteProfile() || !stats) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Weekly Progress</h2>
                <p className="text-center text-gray-500 dark:text-gray-300 py-8">Complete your profile to track weekly progress.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-indigo-600">This Week's Progress</h2>
            <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                    <ProgressCircle percentage={stats.completionPercentage} />
                </div>
                <div className="ml-6">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">Plan Completion</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{stats.completedWorkouts}</span> of {stats.plannedWorkouts} workouts
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.trainingTime}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Training Time</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{Math.round(stats.weeklyVolume / 1000)}k kg</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Weekly Volume</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-400">--</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Nutrition Goal</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-400">--</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Body Comp</div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyProgressCard;
