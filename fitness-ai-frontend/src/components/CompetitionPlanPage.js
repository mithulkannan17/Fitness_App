import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaUtensils, FaHeartbeat, FaBrain, FaExclamationTriangle, FaDumbbell, FaBookOpen } from 'react-icons/fa';
import { championSpaceAPI, handleAPIError } from '../services/api';

const itemIcons = {
    Nutrition: <FaUtensils className="text-green-500" />,
    Hydration: <FaUtensils className="text-blue-500" />,
    Workout: <FaHeartbeat className="text-red-500" />,
    Recovery: <FaDumbbell className="text-teal-500" />,
    Mindset: <FaBrain className="text-purple-500" />,
    Warning: <FaExclamationTriangle className="text-yellow-500" />,
    default: <FaBookOpen className="text-gray-500" />,
};

const CompetitionPlanPage = () => {
    const { competitionId } = useParams();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                setLoading(true);
                const response = await championSpaceAPI.getCompetitionDetail(competitionId);
                setPlan(response.data);
            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [competitionId]);

    if (loading) {
        return <div className="text-center p-12"><FaSpinner className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300 mx-auto" /></div>;
    }

    // --- THIS IS THE CRUCIAL FIX ---
    // This check prevents the code from continuing if 'plan' is null or an error occurred.
    if (error || !plan) {
        return (
            <div className="text-center py-12 max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Could Not Load Plan</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error || "The requested competition plan could not be found."}</p>
                <Link to="/competitions" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                    <FaArrowLeft className="mr-2" /> Back to Champion Space
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                {/* This link will now work correctly because the backend sends 'plan.category' */}
                <Link to={`/competitions/${plan.category}`} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4">
                    <FaArrowLeft className="mr-2" /> Back to Competition List
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{plan.name} Plan</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{plan.description}</p>
            </header>
            <div className="space-y-8">
                {plan.plan_phases.map(phase => (
                    <div key={phase.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{phase.title}</h2>
                        <div className="space-y-4">
                            {phase.plan_items.map(item => (
                                <div key={item.title} className="flex items-start">
                                    <div className="mr-4 mt-1 text-xl">{itemIcons[item.item_type] || itemIcons.default}</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                                        {item.amount_suggestion && <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">{item.amount_suggestion}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompetitionPlanPage;