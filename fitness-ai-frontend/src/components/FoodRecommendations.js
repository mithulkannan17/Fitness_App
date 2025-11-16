import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // This was unused
import { FaFilter, FaTimes } from 'react-icons/fa'; // Removed unused icons
import { nutritionAPI, handleAPIError } from '../services/api';
import { useAuth } from '../context/AuthContext';
// import SupplementModal from './nutrition/SupplementModal'; // This was unused
import FoodCard from './nutrition/FoodCard';



const FoodRecommendations = () => {
    const { hasCompleteProfile } = useAuth();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ type: 'all', search: '', min_protein: '', max_calories: '' });
    const [mealPlan, setMealPlan] = useState(null);
    const [modalData, setModalData] = useState({ isOpen: false, meal: null, suggestions: [] });
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.type !== 'all') params.type = filters.type;
                if (filters.search.trim()) params.search = filters.search.trim();
                if (filters.min_protein) params.min_protein = filters.min_protein;
                if (filters.max_calories) params.max_calories = filters.max_calories;

                const response = await nutritionAPI.getFoodRecommendations(params);

                // --- THIS IS THE FIX ---
                // Data is no longer in "response.data.results", it's just "response.data"
                setFoods(response.data || []);

            } catch (error) {
                setError(handleAPIError(error));
            } finally {
                setLoading(false);
            }
        };
        fetchFoods();
    }, [filters]);

    useEffect(() => {
        if (hasCompleteProfile()) {
            const fetchMealPlan = async () => {
                try {
                    const response = await nutritionAPI.getMealPlan();
                    setMealPlan(response.data);
                } catch (error) {
                    console.error("Failed to fetch meal plan:", error);
                }
            };
            fetchMealPlan();
        }
    }, [hasCompleteProfile]);

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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: 'all', search: '', min_protein: '', max_calories: '' });
    };

    const hasActiveFilters = filters.type !== 'all' || filters.search || filters.min_protein || filters.max_calories;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nutrition Hub</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Your daily meal plan and a database of nutritious foods.</p>
            </header>

            {error && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md">{error}</div>}

            {hasCompleteProfile() && mealPlan && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Your Daily Meal Plan</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Protein Target: <strong>{mealPlan.daily_protein_target_g}g</strong></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mealPlan.meal_plan.map(meal => (
                            <div key={meal.meal} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex flex-col">
                                <h3 className="font-bold dark:text-gray-100">{meal.meal}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Target: {meal.target_protein_g}g protein</p>
                                {meal.suggestions.map((s, i) => (
                                    <div key={i} className="text-sm p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded">
                                        <p className="font-semibold text-indigo-800 dark:text-indigo-200">{s.food}</p>
                                        <p className="text-indigo-700 dark:text-indigo-300">{s.serving_size_g}g • ~{s.calories_approx} kcal</p>
                                    </div>
                                ))}
                                <button onClick={() => handleExpandMeal(meal)} className="mt-auto pt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-left">
                                    See more options &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center dark:text-gray-100"><FaFilter className="mr-2" />Browse Food Database</h2>
                    {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Clear All</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Search..." className="w-full p-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded" />
                    <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="w-full p-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded">
                        <option value="all">All Types</option><option value="veg">Vegetarian</option><option value="non-veg">Non-Vegetarian</option><option value="vegan">Vegan</option>
                    </select>
                    <input type="number" value={filters.min_protein} onChange={(e) => handleFilterChange('min_protein', e.target.value)} placeholder="Min Protein (g)" className="w-full p-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded" />
                    <input type="number" value={filters.max_calories} onChange={(e) => handleFilterChange('max_calories', e.target.value)} placeholder="Max Calories" className="w-full p-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded" />
                </div>
            </div>

            {loading ? <div className="text-center p-12 dark:text-gray-300">Loading foods...</div> : (
                foods.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {foods.map(food => <FoodCard key={food.id} food={food} />)}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 dark:text-gray-300">No foods found for your current filters.</div>
                )
            )}

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
        </div>
    );
};

export default FoodRecommendations;