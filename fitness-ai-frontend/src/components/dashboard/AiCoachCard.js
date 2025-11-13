import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaDumbbell, FaAppleAlt, FaHeartbeat, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { fitnessAPI, nutritionAPI, healthAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AiCoachCard = () => {
    const { profile, hasCompleteProfile } = useAuth();
    const [plan, setPlan] = useState(null);
    const [nutrition, setNutrition] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!hasCompleteProfile()) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [planResult, nutritionResult, analysisResult] = await Promise.allSettled([
                    fitnessAPI.getPlan(),
                    nutritionAPI.getSummary(),
                    healthAPI.getAnalysis(),
                ]);
                if (planResult.status === 'fulfilled') setPlan(planResult.value.data.plan || []);
                if (nutritionResult.status === 'fulfilled') setNutrition(nutritionResult.value.data);
                if (analysisResult.status === 'fulfilled') setAnalysis(analysisResult.value.data);
            } catch (error) {
                console.error("Failed to fetch AI recommendations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [profile, hasCompleteProfile]);

    const getRiskStatus = () => {
        if (!analysis || !analysis.alerts || analysis.alerts.length === 0) {
            return {
                text: 'Low Risk',
                icon: <FaCheckCircle />,
                classes: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
            };
        }

        // Find the highest priority alert
        const highRisk = analysis.alerts.find(a => a.level === 'High Risk');
        const warning = analysis.alerts.find(a => a.level === 'Warning');

        if (highRisk) {
            return {
                text: 'High Risk',
                icon: <FaExclamationTriangle />,
                classes: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
            };
        }
        if (warning) {
            return {
                text: 'Medium Risk',
                icon: <FaExclamationTriangle />,
                classes: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
            };
        }
        return {
            text: 'Info',
            icon: <FaInfoCircle />,
            classes: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
        };
    };

    const riskStatus = getRiskStatus();

    if (loading) {
        return <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse h-64 border border-gray-200 dark:border-gray-700"></div>;
    }

    if (!hasCompleteProfile()) {
        return (
            <div className=" dark:bg-gray-800 rounded-xl shadow-md p-6 text-center border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FaRobot className="mr-2" /> Coach Recommendations
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Complete your profile to unlock your personalized plans.</p>
            </div>
        );
    }

    return (
        <div className="animated-border-card">
            {/* 2. This inner wrapper holds all the content and sits on top of the animation */}
            <div className="relative z-10 bg-gray-100 border border-gray-200 dark:bg-gray-800 rounded-[11px] p-6 m-[2px]">

                <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400 flex items-center">
                    <FaRobot className="mr-2" /> AI Coach Recommendations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-2"><FaDumbbell className="mr-2" /> Training Plan</h3>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{profile?.goal?.replace('_', ' ')} Plan</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 h-10">
                            {plan && plan.length > 0 ? plan.slice(0, 3).map(p => p.name).join(', ') + '...' : 'No plan generated yet.'}
                        </p>
                        <Link to="/fitness-plan" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-2 inline-block">View Full Plan →</Link>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center mb-2"><FaAppleAlt className="mr-2" /> Nutrition Plan</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">Daily Goal: <strong>{nutrition?.calories?.target || 'N/A'} kcal</strong></p>
                        <div className="flex justify-around mt-3 text-center">
                            <div><div className="text-lg font-bold text-red-600 dark:text-red-400">{nutrition?.macros?.protein_grams || '--'}g</div><div className="text-xs text-red-700 dark:text-red-300">Protein</div></div>
                            <div><div className="text-lg font-bold text-blue-600 dark:text-blue-400">{nutrition?.macros?.carbs_grams || '--'}g</div><div className="text-xs text-blue-700 dark:text-blue-300">Carbs</div></div>
                            <div><div className="text-lg font-bold text-yellow-500 dark:text-yellow-400">{nutrition?.macros?.fat_grams || '--'}g</div><div className="text-xs text-yellow-600 dark:text-yellow-500">Fats</div></div>
                        </div>
                    </div>
                </div>

                <Link to="/health" className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <h4 className="font-semibold text-sm text-purple-600 dark:text-purple-400 flex items-center">
                        <FaHeartbeat className="mr-2" /> Health Status
                    </h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${riskStatus.classes}`}>
                        <span className="mr-1.5">{riskStatus.icon}</span>
                        {riskStatus.text}
                    </div>
                </Link>

            </div>
        </div>
    );
};

export default AiCoachCard;