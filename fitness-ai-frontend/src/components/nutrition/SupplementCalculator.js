import React, { useState, useEffect } from 'react';
import { FaCalculator, FaInfoCircle } from 'react-icons/fa';
import { nutritionAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SupplementCalculator = () => {
    const { hasCompleteProfile } = useAuth();
    const [userData, setUserData] = useState({
        weight: '75',
        supplement: 'protein',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (hasCompleteProfile()) {
                try {
                    const response = await nutritionAPI.getSupplementRecommendations();
                    setRecommendations(response.data.recommendations || []);
                } catch (error) {
                    console.error("Failed to fetch recommendations:", error);
                }
            }
        };
        fetchRecommendations();
    }, [hasCompleteProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
        setResult(null);
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        const weightKg = parseFloat(userData.weight);
        if (isNaN(weightKg) || weightKg <= 0) {
            setResult("Please enter a valid weight.");
            return;
        }

        let dosage = '';
        switch (userData.supplement) {
            case 'protein':
                const proteinIntake = Math.round(weightKg * 1.8);
                dosage = `Recommended daily protein intake: ~${proteinIntake}g`;
                break;
            case 'creatine':
                dosage = "Recommended daily intake: 3-5g";
                break;
            case 'bcaa':
                dosage = "Recommended intake: 5-10g around your workout";
                break;
            default:
                dosage = "Calculation not available.";
        }
        setResult(dosage);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FaCalculator className="mr-2 text-purple-600" />
                General Supplement Calculator
            </h2>
            <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            id="weight"
                            value={userData.weight}
                            onChange={handleChange}
                            min="1"
                            step="0.1"
                            className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="supplement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplement</label>
                        <select
                            name="supplement"
                            id="supplement"
                            value={userData.supplement}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="protein">Protein</option>
                            <option value="creatine">Creatine</option>
                            <option value="bcaa">BCAAs</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700">
                    Calculate
                </button>
            </form>
            {result && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg text-center">
                    <p className="font-semibold text-purple-800 dark:text-purple-200">{result}</p>
                </div>
            )}
        </div>
    );
};

export default SupplementCalculator;
