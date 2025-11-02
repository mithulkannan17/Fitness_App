import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ChartCard = ({ title, children }) => (
    // 1. This is the outer wrapper with our animation class
    <div className="animated-border-card">
        {/* 2. This inner wrapper holds all the content.
             We use m-[2px] to create the border "thickness" 
             and rounded-[11px] to be slightly smaller than the outer rounded-xl.
        */}
        <div className="relative z-10 bg-white dark:bg-gray-800 rounded-[11px] m-[2px] p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
            <div className="h-64">{children}</div>
        </div>
    </div>
);

export const FrequencyChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => `Week ${item.week.split('-')[1]}`),
        datasets: [{
            label: 'Workouts',
            data: data.map(item => item.workouts),
            backgroundColor: '#8B5CF6',
        }]
    };
    return (
        <ChartCard title="Workout Frequency">
            <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </ChartCard>
    );
};

export const BreakdownChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => item.category),
        datasets: [{
            data: data.map(item => item.count),
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            borderColor: '#FFFFFF',
        }]
    };
    return (
        <ChartCard title="Activity Breakdown">
            <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </ChartCard>
    );
};