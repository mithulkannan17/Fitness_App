import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { performanceAPI, handleAPIError } from '../../services/api'; // UPDATED: Import API service
import { useAuth } from '../../context/AuthContext'; // UPDATED: Import useAuth
import { FaChartLine } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PerformanceGraphCard = () => {

    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const { hasCompleteProfile } = useAuth();

    useEffect(() => {
        if (hasCompleteProfile()) {
            const fetchPerformanceData = async () => {
                try {
                    const response = await performanceAPI.getDashboard();
                    const data = response.data;

                    if (data && data.volume_over_time && data.volume_over_time.length > 0) {

                        const labels = data.volume_over_time.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                        const volumeData = data.volume_over_time.map(item => item.total_volume);

                        setChartData({
                            labels,
                            datasets: [{
                                label: 'Total Volume (kg)',
                                data: volumeData,
                                borderColor: '#4F46E5', // Indigo color
                                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                fill: true,
                                tension: 0.4,
                            }],
                        });


                        const firstVolume = volumeData[0];
                        const lastVolume = volumeData[volumeData.length - 1];
                        const change = ((lastVolume - firstVolume) / firstVolume * 100).toFixed(0);
                        if (change > 0) {
                            setSummary(`You've increased your total volume by ${change}%!`);
                        } else {
                            setSummary('Keep logging to see your trend.');
                        }

                    } else {

                        setSummary('Log your first workout to start tracking progress.');
                    }
                } catch (err) {
                    console.error("Failed to fetch performance data:", handleAPIError(err));
                    setSummary('Could not load performance trend.');
                } finally {
                    setLoading(false);
                }
            };
            fetchPerformanceData();
        } else {
            setLoading(false);
        }
    }, [hasCompleteProfile]);


    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { ticks: { display: false }, grid: { display: false } }
        },
        maintainAspectRatio: false,
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    if (!hasCompleteProfile()) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-indigo-600">Performance Trend</h2>
                <div className="text-center py-8">
                    <p className="text-gray-600">Complete your profile to see your progress.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-600">Performance Trend</h2>
                <Link to="/performance" className="text-sm font-medium text-indigo-600 hover:underline">View Details →</Link>
            </div>

            {chartData.labels.length > 0 ? (
                <div className="h-40">
                    <Line data={chartData} options={chartOptions} />
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                    <FaChartLine className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{summary}</p>
                </div>
            )}
        </div>
    );
};

export default PerformanceGraphCard;