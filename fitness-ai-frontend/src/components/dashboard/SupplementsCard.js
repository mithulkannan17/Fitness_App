import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCapsules, FaPills, FaUtensils, FaExclamationTriangle } from 'react-icons/fa';
import { nutritionAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SupplementModal from './SupplementModal';

const iconMap = {
    "Whey Protein": <FaCapsules className="text-green-600" />,
    "Creatine Monohydrate": <FaPills className="text-purple-600" />,
    "Multivitamin": <FaCapsules className="text-blue-600" />,
    "Green Tea Extract": <FaCapsules className="text-green-500" />,
    "Omega-3 Fish Oil": <FaCapsules className="text-cyan-600" />
};

const colorMap = {
    "Whey Protein": "green",
    "Creatine Monohydrate": "purple",
    "Multivitamin": "blue",
    "Green Tea Extract": "green",
    "Omega-3 Fish Oil": "cyan"
};

const SupplementItem = ({ supplement, onClick }) => {
    const bgColor = colorMap[supplement.name] || 'gray';

    return (
        <div
            onClick={onClick}
            className={`flex items-start p-3 bg-${bgColor}-50 dark:bg-${bgColor}-900 border border-${bgColor}-100 dark:border-${bgColor}-700 rounded-lg cursor-pointer hover:shadow-md hover:bg-${bgColor}-100 dark:hover:bg-${bgColor}-800 transition duration-200`}
        >
            <div className="bg-white dark:bg-gray-700 rounded-lg p-2 mr-3 shadow-sm">
                {iconMap[supplement.name] || <FaPills className="text-gray-500 dark:text-gray-300" />}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{supplement.name}</h3>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    <strong>Dosage:</strong> {supplement.dosage}
                </div>
                {supplement.timing && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <strong>Timing:</strong> {supplement.timing}
                    </div>
                )}
            </div>
        </div>
    );
};

const SupplementsCard = ({ onSwitchToFoodPlan }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSupplement, setSelectedSupplement] = useState(null);
    const { hasCompleteProfile, profile } = useAuth();

    useEffect(() => {
        if (hasCompleteProfile()) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, [hasCompleteProfile, profile]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await nutritionAPI.getSupplementRecommendations();
            setRecommendations(response.data.recommendations || response.data || []);
        } catch (error) {
            console.error("Failed to fetch supplement recommendations:", error);
            setError(handleAPIError(error));
        } finally {
            setLoading(false);
        }
    };

    if (!hasCompleteProfile()) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Supplement Recommendations</h2>
                <div className="text-center py-6">
                    <FaPills className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Complete your profile to get personalized supplement recommendations
                    </p>
                    <Link
                        to="/profile"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 text-sm"
                    >
                        Complete Profile
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Supplement Recommendations</h2>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg mr-3"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Supplement Recommendations</h2>

                {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm">
                        <FaExclamationTriangle className="inline mr-1" />
                        {error}
                    </div>
                )}

                {recommendations.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {recommendations.map((rec, index) => (
                                <SupplementItem
                                    key={rec.name || index}
                                    supplement={rec}
                                    onClick={() => setSelectedSupplement(rec)}
                                />
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                <strong>Personalized for:</strong> {profile?.goal?.replace('_', ' ')} goal
                                {profile?.weight && ` • ${profile.weight}kg body weight`}
                            </p>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                <FaExclamationTriangle className="inline mr-1" />
                                <strong>Disclaimer:</strong> Consult with a healthcare provider before starting any supplement regimen.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <FaPills className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">No supplement recommendations available</p>
                        <button
                            onClick={fetchRecommendations}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {onSwitchToFoodPlan ? (
                        <button
                            onClick={onSwitchToFoodPlan}
                            className="flex items-center text-green-600 dark:text-green-400 font-medium hover:text-green-800 dark:hover:text-green-200 transition duration-200 text-sm"
                        >
                            <FaUtensils className="mr-2" /> Switch to Food-only Plan
                        </button>
                    ) : (
                        <Link
                            to="/food-recommendations"
                            className="flex items-center text-green-600 dark:text-green-400 font-medium hover:text-green-800 dark:hover:text-green-200 transition duration-200 text-sm"
                        >
                            <FaUtensils className="mr-2" /> View Food Recommendations
                        </Link>
                    )}
                </div>
            </div>

            <SupplementModal
                supplement={selectedSupplement}
                onClose={() => setSelectedSupplement(null)}
            />
        </>
    );
};

export default SupplementsCard;
