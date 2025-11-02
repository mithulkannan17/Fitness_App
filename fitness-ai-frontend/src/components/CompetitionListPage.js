import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { championSpaceAPI, handleAPIError } from '../services/api';

const CompetitionListPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const response = await championSpaceAPI.getCategoryDetail(categoryId);
                setCategory(response.data);
            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId]);

    if (loading) {
        return <div className="text-center p-12"><FaSpinner className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300 mx-auto" /></div>;
    }

    // --- THIS IS THE CRUCIAL FIX ---
    // This check prevents the code from continuing if 'category' is null or an error occurred.
    if (error || !category) {
        return (
            <div className="text-center py-12 max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Could Not Load Category</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error || "The requested competition category could not be found."}</p>
                <Link to="/competitions" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                    <FaArrowLeft className="mr-2" /> Back to Categories
                </Link>
            </div>
        );
    }

    // This code below will now ONLY run when 'category' is a valid object.
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <Link to="/competitions" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4">
                    <FaArrowLeft className="mr-2" /> Back to Categories
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{category.name} Competitions</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.competition_types.map(comp => (
                    <Link key={comp.id} to={`/competitions/plan/${comp.id}`} className="block bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">{comp.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{comp.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CompetitionListPage;