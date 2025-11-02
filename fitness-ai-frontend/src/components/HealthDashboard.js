import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { healthAPI, handleAPIError } from '../services/api';
import { useTheme } from '../context/ThemeContext'; // Import useTheme for chart styling
import { FaHeartbeat, FaPlus, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import LogVitalsModal from './health/LogVitalsModal'; // Import the new modal

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler);

const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="h-64">{children}</div>
    </div>
);

const HealthDashboard = () => {
    const { theme } = useTheme(); // Get the current theme
    const [history, setHistory] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal

    const fetchData = async () => {
        try {
            // No need to set loading true here if we call it from a non-initial load
            const [historyRes, analysisRes] = await Promise.all([
                healthAPI.getHistory(),
                healthAPI.getAnalysis()
            ]);
            setHistory(historyRes.data || []);
            setAnalysis(analysisRes.data);
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setLoading(false); // Always set loading false at the end
        }
    };

    // Initial data fetch
    useEffect(() => {
        setLoading(true);
        fetchData();
    }, []);

    console.log("Health History Received:", history);

    const handleLogSuccess = () => {
        setIsModalOpen(false);
        fetchData(); // Refresh all data after a new log is added
    };

    // --- ENHANCED CHART OPTIONS ---
    const chartOptions = {
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: { unit: 'day' },
                ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' },
                grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' }
            },
            y: {
                ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' },
                grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' }
            }
        },
        plugins: {
            legend: { labels: { color: theme === 'dark' ? '#E5E7EB' : '#4B5563' } }
        },
    };

    // --- PREPARE CHART DATA (INCLUDING STEPS) ---
    const chartData = {
        labels: history.map(log => log.timestamp).reverse(),
        bp: {
            datasets: [
                { label: 'Systolic', data: history.map(log => log.systolic_bp).reverse(), borderColor: '#EF4444', backgroundColor: '#EF444430', fill: true, tension: 0.3 },
                { label: 'Diastolic', data: history.map(log => log.diastolic_bp).reverse(), borderColor: '#3B82F6', backgroundColor: '#3B82F630', fill: true, tension: 0.3 },
            ]
        },
        spo2: { datasets: [{ label: 'SpO2 (%)', data: history.map(log => log.spo2).reverse(), borderColor: '#10B981', backgroundColor: '#10B98130', fill: true, tension: 0.3 }] },
        stress: { datasets: [{ label: 'Stress Level', data: history.map(log => log.stress_level).reverse(), borderColor: '#F59E0B', backgroundColor: '#F59E0B30', fill: true, tension: 0.3 }] },
        steps: { datasets: [{ label: 'Steps per Day', data: history.map(log => log.steps_today).reverse(), backgroundColor: '#8B5CF6' }] },
    };

    const getAlertUI = (alert) => { /* ... same as before ... */ };
    if (loading) { return <div className="text-center p-12"><FaSpinner className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300 mx-auto" /></div>; }

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <FaHeartbeat className="mr-3 text-red-500" /> Health Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Your real-time health vitals and AI-powered analysis.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                        <FaPlus className="mr-2" /> Log Vitals
                    </button>
                </header>

                {error && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}

                {analysis && analysis.alerts && analysis.alerts.length > 0 && (
                    <div className="mb-8">{/* ... Alert section JSX ... */}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartCard title="Blood Pressure (mmHg)"><Line data={{ labels: chartData.labels, datasets: chartData.bp.datasets }} options={chartOptions} /></ChartCard>
                    <ChartCard title="Blood Oxygen (SpO2)"><Line data={{ labels: chartData.labels, datasets: chartData.spo2.datasets }} options={chartOptions} /></ChartCard>
                    <ChartCard title="Stress Level"><Line data={{ labels: chartData.labels, datasets: chartData.stress.datasets }} options={chartOptions} /></ChartCard>
                    <ChartCard title="Daily Steps"><Bar data={{ labels: chartData.labels, datasets: chartData.steps.datasets }} options={chartOptions} /></ChartCard>
                </div>
            </div>

            {isModalOpen && <LogVitalsModal onClose={() => setIsModalOpen(false)} onLogSuccess={handleLogSuccess} />}
        </>
    );
};

export default HealthDashboard;