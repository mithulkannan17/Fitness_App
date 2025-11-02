import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Link } from 'react-router-dom';
import { performanceAPI, handleAPIError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaChartLine } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, TimeScale, Filler);

const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="h-64 md:h-80">{children}</div>
    </div>
);

const Performance = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { hasCompleteProfile } = useAuth();

    const [progressChartData, setProgressChartData] = useState(null);
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
            if (performanceData.exercise_progress?.length > 0) {
                const datasets = performanceData.exercise_progress.map((ex, index) => {
                    const colors = ['#4F46E5', '#EF4444', '#8B5CF6'];
                    return {
                        label: `${ex.exercise_name} (kg)`,
                        data: ex.progress.map(p => ({ x: p.date, y: p.max_weight })),
                        borderColor: colors[index % colors.length],
                        tension: 0.2,
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
                        borderColor: '#FFFFFF',
                    }]
                });
            }
        }
    }, [performanceData]);

    if (loading) {
        return <div className="text-center p-12 text-gray-700 dark:text-gray-300">Loading performance data...</div>;
    }

    if (!hasCompleteProfile()) {
        return <div className="text-center p-12 text-gray-700 dark:text-gray-300">Please complete your profile to view performance analytics.</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-red-600 dark:text-red-400">{error}</div>;
    }

    if (!performanceData || !performanceData.summary_stats.total_workouts_last_30d) {
        return (
            <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 max-w-2xl mx-auto">
                <FaChartLine className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Performance Data Yet</h2>
                <p className="text-gray-600 dark:text-gray-300">Start logging your workouts to see your progress and analytics here!</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Performance Analytics</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Visualize your progress and stay motivated.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {progressChartData && (
                    <div className="lg:col-span-2">
                        <ChartCard title="Progression on Main Lifts">
                            <Line
                                data={progressChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: { type: 'time', time: { unit: 'week' } },
                                        y: { ticks: { color: '#374151' } }
                                    },
                                    plugins: {
                                        legend: { labels: { color: '#374151' } }
                                    }
                                }}
                            />
                        </ChartCard>
                    </div>
                )}

                {frequencyChartData && (
                    <ChartCard title="Workout Frequency">
                        <Bar
                            data={frequencyChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: { ticks: { color: '#374151' } },
                                    x: { ticks: { color: '#374151' } }
                                },
                                plugins: {
                                    legend: { labels: { color: '#374151' } }
                                }
                            }}
                        />
                    </ChartCard>
                )}

                {volumeChartData && (
                    <ChartCard title="Total Volume Over Time">
                        <Line
                            data={volumeChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    x: { type: 'time', time: { unit: 'day' }, ticks: { color: '#374151' } },
                                    y: { ticks: { color: '#374151' } }
                                },
                                plugins: {
                                    legend: { labels: { color: '#374151' } }
                                }
                            }}
                        />
                    </ChartCard>
                )}

                {breakdownChartData && (
                    <div className="lg:col-span-2">
                        <ChartCard title="Activity Breakdown (Last 30 Days)">
                            <div className="max-w-xs mx-auto">
                                <Doughnut
                                    data={breakdownChartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { labels: { color: '#374151' } }
                                        }
                                    }}
                                />
                            </div>
                        </ChartCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Performance;
