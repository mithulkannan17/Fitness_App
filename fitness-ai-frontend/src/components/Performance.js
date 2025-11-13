import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { performanceAPI, handleAPIError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { FaChartLine, FaDumbbell, FaFire, FaTrophy } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, TimeScale, Filler);

// Stat Card for the top summary
const StatCard = ({ title, value, icon, unit }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value} <span className="text-lg font-normal">{unit}</span>
                </p>
            </div>
        </div>
    </div>
);

// Re-usable Chart Card
const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="h-64 md:h-80">{children}</div>
    </div>
);

const Performance = () => {
    const { theme } = useTheme(); // Get theme
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { hasCompleteProfile } = useAuth();

    // Chart-specific data states
    const [progressChartData, setProgressChartData] = useState(null); // <-- Re-added this
    const [frequencyChartData, setFrequencyChartData] = useState(null);
    const [volumeChartData, setVolumeChartData] = useState(null);
    const [breakdownChartData, setBreakdownChartData] = useState(null);

    useEffect(() => {
        if (hasCompleteProfile()) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await performanceAPI.getDashboard();
                    setPerformanceData(response.data);
                } catch (err) {
                    setError(handleAPIError(err));
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [hasCompleteProfile]);

    useEffect(() => {
        if (performanceData) {

            // --- Re-added logic for the combined lift progression chart ---
            if (performanceData.exercise_progress?.length > 0) {
                const datasets = performanceData.exercise_progress.map((ex, index) => {
                    const colors = ['#4F46E5', '#EF4444', '#8B5CF6']; // Indigo, Red, Purple
                    const color = colors[index % colors.length];
                    return {
                        label: `${ex.exercise_name} (kg)`,
                        data: ex.progress.map(p => ({ x: p.date, y: p.max_weight })),
                        borderColor: color,
                        backgroundColor: color + '30', // Add a light background
                        tension: 0.3,
                        // --- This makes the points "dark" / visible ---
                        pointBackgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        pointBorderColor: color,
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    };
                });
                setProgressChartData({ datasets });
            }

            if (performanceData.weekly_frequency?.length > 0) {
                const labels = performanceData.weekly_frequency.map(item => `Week ${item.week.split('-')[1]}`);
                setFrequencyChartData({
                    labels,
                    datasets: [{
                        label: 'Workouts per Week',
                        data: performanceData.weekly_frequency.map(item => item.workouts),
                        backgroundColor: '#8B5CF6',
                    }]
                });
            }

            if (performanceData.volume_over_time?.length > 0) {
                setVolumeChartData({
                    datasets: [{
                        label: 'Total Volume (kg)',
                        data: performanceData.volume_over_time.map(item => ({ x: item.date, y: item.total_volume })),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                });
            }

            if (performanceData.activity_breakdown?.length > 0) {
                const labels = performanceData.activity_breakdown.map(item => item.category);
                setBreakdownChartData({
                    labels,
                    datasets: [{
                        data: performanceData.activity_breakdown.map(item => item.count),
                        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
                        borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        borderWidth: 2,
                    }]
                });
            }
        }
    }, [performanceData, theme]); // Add theme dependency

    // Chart Options (now using theme)
    const commonLineOptions = {
        maintainAspectRatio: false,
        scales: {
            x: { type: 'time', time: { unit: 'day' }, ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } },
            y: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } }
        },
        plugins: {
            legend: { labels: { color: theme === 'dark' ? '#E5E7EB' : '#4B5563' } }
        }
    };

    const commonBarOptions = {
        maintainAspectRatio: false,
        scales: {
            y: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } },
            x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { display: false } }
        },
        plugins: {
            legend: { labels: { color: theme === 'dark' ? '#E5E7EB' : '#4B5563' } }
        }
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: theme === 'dark' ? '#E5E7EB' : '#4B5563' } }
        }
    };

    if (loading) {
        return <div className="text-center p-12 text-gray-700 dark:text-gray-300">Loading performance data...</div>;
    }

    if (!hasCompleteProfile()) {
        return <div className="text-center p-12 text-gray-700 dark:text-gray-300">Please complete your profile to view performance analytics.</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-red-600 dark:text-red-400">{error}</div>;
    }

    if (!performanceData || !performanceData.summary_stats?.total_workouts_last_30d) {
        return (
            <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 max-w-2xl mx-auto">
                <FaChartLine className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Performance Data Yet</h2>
                <p className="text-gray-600 dark:text-gray-300">Start logging your workouts to see your progress and analytics here!</p>
            </div>
        );
    }

    const { summary_stats } = performanceData;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Performance Analytics</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Visualize your progress and stay motivated.</p>
            </header>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Workouts (30d)"
                    value={summary_stats.total_workouts_last_30d}
                    icon={<FaDumbbell className="text-indigo-600" />}
                />
                <StatCard
                    title="Total Volume (30d)"
                    value={Math.round(summary_stats.total_volume_last_30d / 1000)}
                    unit="K kg"
                    icon={<FaFire className="text-indigo-600" />}
                />
                <StatCard
                    title="Top Activity"
                    value={summary_stats.most_frequent_activity}
                    icon={<FaTrophy className="text-indigo-600" />}
                />
            </div>

            {/* --- REVERTED: Progression on Main Lifts (Full Width) --- */}
            {progressChartData && (
                <ChartCard title="Progression on Main Lifts">
                    <Line data={progressChartData} options={commonLineOptions} />
                </ChartCard>
            )}

            {/* --- Breakdown and Volume (2-Col Grid) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {breakdownChartData && (
                    <ChartCard title="Activity Breakdown (Last 30 Days)">
                        <Doughnut data={breakdownChartData} options={doughnutOptions} />
                    </ChartCard>
                )}

                {volumeChartData && (
                    <ChartCard title="Total Volume Over Time">
                        <Line data={volumeChartData} options={commonLineOptions} />
                    </ChartCard>
                )}
            </div>

            {/* --- Workout Frequency (Full Width) --- */}
            {frequencyChartData && (
                <ChartCard title="Workout Frequency (90d)">
                    <Bar data={frequencyChartData} options={commonBarOptions} />
                </ChartCard>
            )}
        </div>
    );
};

export default Performance;