import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// UPDATED: Added new icons for meal cards and modal
import { FaLeaf, FaPills, FaChartPie, FaTimes, FaCoffee, FaSun, FaMoon, FaRunning } from 'react-icons/fa';
import { nutritionAPI, handleAPIError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SupplementModal from './nutrition/SupplementModal';
import SupplementCalculator from './nutrition/SupplementCalculator';
// UPDATED: Import the shared FoodCard component
import FoodCard from './nutrition/FoodCard';

const SupplementItem = ({ supplement, onClick }) => {
    const colorMap = {
        "Whey Protein": "green",
        "Creatine Monohydrate": "purple",
        "Multivitamin": "blue",
        "Green Tea Extract": "teal",
        "Omega-3 Fish Oil": "cyan"
    };
    const color = colorMap[supplement.name] || 'gray';
    return (
        <button
            onClick={onClick}
            className={`text-left w-full p-3 bg-${color}-50 dark:bg-${color}-900 border border-${color}-200 dark:border-${color}-700 rounded-lg hover:shadow-md hover:bg-${color}-100 dark:hover:bg-${color}-800 transition`}
        >
            <h3 className={`font-bold text-sm text-${color}-800 dark:text-${color}-200`}>{supplement.name}</h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-semibold">{supplement.dosage}</span> • {supplement.purpose}
            </div>
        </button>
    );
};

const Nutrition = () => {
    const [supplements, setSupplements] = useState([]);
    const [nutritionSummary, setNutritionSummary] = useState(null);
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState({ supplements: true, summary: true, mealPlan: true });
    const [error, setError] = useState('');
    const { hasCompleteProfile } = useAuth();
    const [selectedSupplement, setSelectedSupplement] = useState(null);

    // --- State for the new meal modal ---
    const [modalData, setModalData] = useState({ isOpen: false, meal: null, suggestions: [] });
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchNutritionData = async () => {
            try {
                const promises = [];
                if (hasCompleteProfile()) {
                    promises.push(nutritionAPI.getSummary(), nutritionAPI.getMealPlan(), nutritionAPI.getSupplementRecommendations());
                } else {
                    promises.push(Promise.resolve(null), Promise.resolve(null), nutritionAPI.getSupplementRecommendations());
                }
                const [summaryResult, mealPlanResult, supplementsResult] = await Promise.allSettled(promises);
                if (summaryResult?.status === 'fulfilled' && summaryResult.value) setNutritionSummary(summaryResult.value.data);
                if (mealPlanResult?.status === 'fulfilled' && mealPlanResult.value) setMealPlan(mealPlanResult.value.data);
                if (supplementsResult?.status === 'fulfilled' && supplementsResult.value) setSupplements(supplementsResult.value.data.recommendations || []);
            } catch (error) {
                setError(handleAPIError(error));
            } finally {
                setLoading({ supplements: false, summary: false, mealPlan: false });
            }
        };
        fetchNutritionData();
    }, [hasCompleteProfile]);

    // --- Function to open the meal modal ---
    const handleExpandMeal = async (meal) => {
        setModalLoading(true);
        setModalData({ isOpen: true, meal: meal, suggestions: [] });
        try {
            const response = await nutritionAPI.getMoreSuggestions(meal.meal);
            setModalData({ isOpen: true, meal: meal, suggestions: response.data.suggestions });
        } catch (error) {
            console.error("Failed to fetch more suggestions:", error);
        } finally {
            setModalLoading(false);
        }
    };

    // --- New meal card styling & icons ---
    const mealDisplay = {
        "Breakfast": { icon: <FaCoffee />, bg: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
        "Lunch": { icon: <FaSun />, bg: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
        "Dinner": { icon: <FaMoon />, bg: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
        "Snack": { icon: <FaLeaf />, bg: 'bg-gradient-to-br from-green-400 to-teal-500' },
        "Post-Workout": { icon: <FaRunning />, bg: 'bg-gradient-to-br from-pink-500 to-red-500' }
    };

    // --- The old 'mealColors' variable has been removed ---

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nutrition Hub</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Your complete guide to nutrition, supplements, and meal planning.
                    </p>
                </header>

                {error && (
                    <div className="mb-8 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Nutrition Goals Card (Unchanged) */}
                        {hasCompleteProfile() && nutritionSummary && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-gray-100">
                                    <FaChartPie className="mr-2 text-indigo-600" />Your Nutrition Goals
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 p-3 rounded-lg">
                                        <h3 className="text-sm font-medium text-green-600 dark:text-green-300">Calories</h3>
                                        <p className="text-xl font-bold text-green-800 dark:text-green-200">{nutritionSummary.calories?.target || 'N/A'}</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-3 rounded-lg">
                                        <h3 className="text-sm font-medium text-red-600 dark:text-red-300">Protein</h3>
                                        <p className="text-xl font-bold text-red-800 dark:text-red-200">{nutritionSummary.macros?.protein_grams || 'N/A'}g</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-3 rounded-lg">
                                        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-300">Carbs</h3>
                                        <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{nutritionSummary.macros?.carbs_grams || 'N/A'}g</p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg">
                                        <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Fat</h3>
                                        <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">{nutritionSummary.macros?.fat_grams || 'N/A'}g</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Today's Meal Plan Card (Updated) */}
                        {hasCompleteProfile() && mealPlan && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Today's Meal Plan</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Protein Target: <strong>{mealPlan.daily_protein_target_g}g</strong>. Click a meal for more options.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {mealPlan.meal_plan.map((meal, idx) => {
                                        const display = mealDisplay[meal.meal] || mealDisplay["Snack"];
                                        const suggestion = meal.suggestions[0];
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleExpandMeal(meal)}
                                                className={`text-left rounded-xl shadow-lg p-5 text-white ${display.bg} transform hover:-translate-y-1 transition-all`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-xl font-bold">{meal.meal}</h3>
                                                    <span className="text-2xl opacity-70">{display.icon}</span>
                                                </div>
                                                <p className="text-sm font-light opacity-90">Target: {meal.target_protein_g}g protein</p>
                                                <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                                                    <p className="font-semibold">{suggestion.food}</p>
                                                    <p className="text-xs opacity-90">{suggestion.serving_size_g}g • ~{suggestion.calories_approx} kcal</p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                                <Link to="/food-recommendations" className="inline-block mt-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm">
                                    Browse more foods →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Supplement Column (Unchanged) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Supplement Recommendations</h2>
                                <div className="space-y-3">
                                    {supplements.map((s, i) => (
                                        <SupplementItem key={i} supplement={s} onClick={() => setSelectedSupplement(s)} />
                                    ))}
                                </div>
                            </div>
                            <SupplementCalculator />
                        </div>
                    </div>
                </div>
            </div>

            {/* Supplement Modal (Unchanged) */}
            <SupplementModal supplement={selectedSupplement} onClose={() => setSelectedSupplement(null)} />

            {/* Meal Plan Modal (NEW) */}
            {modalData.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold dark:text-gray-100">More Options for {modalData.meal?.meal}</h2>
                            <button onClick={() => setModalData({ isOpen: false, meal: null, suggestions: [] })}><FaTimes className="text-gray-500 dark:text-gray-300" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {modalLoading ? <p className="dark:text-gray-300">Loading...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modalData.suggestions.map((food, index) => <FoodCard key={index} food={food} />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Nutrition;