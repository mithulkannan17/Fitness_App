import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaSpinner } from 'react-icons/fa';
import { championSpaceAPI, handleAPIError } from '../services/api';

const CategoryCard = ({ category }) => (
    <Link
        to={`/competitions/${category.id}`}
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
        style={{ borderLeft: `5px solid ${category.color_code}` }}
    >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{category.description}</p>
    </Link>
);

const CompetitionCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await championSpaceAPI.getCategories();
                setCategories(response.data.results || []);
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <FaTrophy className="mr-3 text-yellow-500" />
                    Champion Space
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Select a category to find pre-competition plans and guidance.
                </p>
            </header>
            {error && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => <CategoryCard key={category.id} category={category} />)}
            </div>
        </div>
    );
};

export default CompetitionCategoryPage;