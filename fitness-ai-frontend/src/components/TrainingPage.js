import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner, FaDumbbell, FaHeart, FaLeaf, FaRunning } from 'react-icons/fa';
import { trainingAPI, handleAPIError } from '../services/api';

const CategoryCard = ({ category }) => {
    const getIconForCategory = (categoryType) => {
        const iconMap = { 'Strength': FaDumbbell, 'Cardio': FaHeart, 'Flexibility': FaLeaf, 'Sport': FaRunning };
        return iconMap[categoryType] || FaDumbbell;
    };
    const Icon = getIconForCategory(category.category_type);

    return (
        <Link
            to={`/training/${category.id}`}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl hover:-translate-y-2 transition-all aspect-square"
        >
            <div className="p-6 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <Icon className="text-5xl text-indigo-600 dark:text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{category.name}</h3>
        </Link>
    );
};

const TrainingPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await trainingAPI.getCategories();


                setCategories(response.data || []);

            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return <div className="text-center p-12"><FaSpinner className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300 mx-auto" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Training Library</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Browse our library of workout programs tailored for your goals.</p>
            </header>

            {error && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
};

export default TrainingPage;