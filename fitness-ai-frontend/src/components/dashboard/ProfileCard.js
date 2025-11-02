import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <div className="h-64">{children}</div>
    </div>
);

export const FrequencyChart = ({ data, theme }) => {
    const options = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
            x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { display: false } }
        }
    };
    const chartData = {
        labels: data.map(item => `Week ${item.week.split('-')[1]}`),
        datasets: [{
            label: 'Workouts',
            data: data.map(item => item.workouts),
            backgroundColor: '#8B5CF6',
        }]
    };
    return <ChartCard title="Workout Frequency"><Bar data={chartData} options={options} /></ChartCard>;
};

export const BreakdownChart = ({ data, theme }) => {
    const options = {
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: theme === 'dark' ? '#E5E7EB' : '#4B5563' } } }
    };
    const chartData = {
        labels: data.map(item => item.category),
        datasets: [{
            data: data.map(item => item.count),
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        }]
    };
    return <ChartCard title="Activity Breakdown"><Doughnut data={chartData} options={options} /></ChartCard>;
};