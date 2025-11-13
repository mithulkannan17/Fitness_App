import React from 'react';
import { FaLeaf, FaDrumstickBite } from 'react-icons/fa';

// This is the component moved from FoodRecommendations.js
const FoodCard = ({ food }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 p-4 hover:shadow-md transition">
        <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${food.type === 'veg' ? 'bg-green-100 dark:bg-green-900/50' : food.type === 'vegan' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                {food.type === 'veg' || food.type === 'vegan' ? <FaLeaf className={`text-xl ${food.type === 'veg' ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-400'}`} /> : <FaDrumstickBite className="text-red-600 dark:text-red-400 text-xl" />}
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{food.name || food.food}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${food.type === 'veg' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : food.type === 'vegan' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {food.type?.replace('_', ' ') || 'N/A'}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 border-1">
                    <div className="flex justify-between"><span >Calories:</span><span className="font-semibold text-orange-600 dark:text-orange-400">{food.calories_per_100g || food.calories_approx} kcal</span></div>
                    <div className="flex justify-between"><span >Protein:</span><span className="font-semibold text-red-600 dark:text-red-400">{food.protein_per_100g || food.protein_g}g</span></div>
                    <div className="flex justify-between"><span >Carbs:</span><span className="font-semibold text-blue-600 dark:text-blue-400">{food.carbs_per_100g === 0 ? 0 : (food.carbs_per_100g || 'N/A')}g</span></div>
                    <div className="flex justify-between"><span >Fat:</span><span className="font-semibold text-yellow-600 dark:text-yellow-400">{food.fat_per_100g === 0 ? 0 : (food.fat_per_100g || 'N/A')}g</span></div>
                </div>
                {food.serving_size_g && <div className="mt-2 pt-2 border-t dark:border-gray-700"><p className="text-xs text-gray-500 dark:text-gray-400"><strong>Suggested:</strong> {food.serving_size_g}g</p></div>}
            </div>
        </div>
    </div>
);

export default FoodCard;