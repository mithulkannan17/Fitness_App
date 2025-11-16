import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaDumbbell,
    FaHeart,
    FaLeaf,
    FaRunning,
    FaSpinner,
} from "react-icons/fa";
import { trainingAPI, handleAPIError } from "../services/api";
import LogExerciseModal from "./training/LogExerciseModal";

const WorkoutCard = ({ workout }) => {
    const getImageUrl = (url) => {
        
        if (!url || typeof url !== "string") {
            return "https://raw.githubusercontent.com/mithulkannan17/FitMind_images/main/default.png";
        }

        if (url.includes("github.com/") && url.includes("/blob/")) {
            url = url
                .replace("github.com/", "raw.githubusercontent.com/")
                .replace("/blob/", "/");
        }

     
        if (url.includes("raw.githubusercontent.com")) {
            return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
        }

      
        if (url.startsWith("http")) return url;

        return `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
            }${url}`;
    };

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    
    console.log("✅ Workout Image URL:", workout.name, getImageUrl(workout?.imageUrl));

    return (
        <Link
            to={`/training/workout/${workout.id}`}
            className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-2 transition-all group"
        >
            {/* Image wrapper */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {!isLoaded && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaSpinner className="animate-spin text-indigo-500 text-2xl" />
                    </div>
                )}

                <img
                    src={getImageUrl(workout?.imageUrl)}
                    alt={workout.name}
                    loading="lazy"
                    onLoad={() => setIsLoaded(true)}
                    onError={(e) => {
                        setHasError(true);
                        e.target.onerror = null;
                        e.target.src =
                            "https://raw.githubusercontent.com/mithulkannan17/FitMind_images/main/default.png";
                    }}
                    className={`w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                />
            </div>

            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    {workout.name}
                </h3>
            </div>
        </Link>
    );
};

const WorkoutListPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const getIconForCategory = (categoryType) => {
        const iconMap = {
            Strength: FaDumbbell,
            Cardio: FaHeart,
            Flexibility: FaLeaf,
            Sport: FaRunning,
            Recovery: FaLeaf,
        };
        return iconMap[categoryType] || FaDumbbell;
    };

    useEffect(() => {
        const fetchCategoryDetail = async () => {
            try {
                setLoading(true);
                const response = await trainingAPI.getCategoryDetail(categoryId);
                setCategory(response.data);
            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryDetail();
    }, [categoryId]);

    const handleLogSuccess = () => {
        alert("Workout logged successfully!");
        setSelectedWorkout(null);
    };

    if (loading) {
        return (
            <div className="text-center p-12">
                <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-300 mx-auto" />
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="text-center py-12 max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Could Not Load Category
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {error || "The requested training category could not be found."}
                </p>
                <Link
                    to="/training"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                    <FaArrowLeft className="mr-2" /> Back to Training Library
                </Link>
            </div>
        );
    }

    const CategoryIcon = getIconForCategory(category.category_type);

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <Link
                        to="/training"
                        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <FaArrowLeft className="mr-2" /> Back to all categories
                    </Link>
                    <div className="flex items-center">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-4">
                            <CategoryIcon className="text-3xl text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {category.name} Workouts
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {category.description}
                            </p>
                        </div>
                    </div>
                </header>

                {category.workouts && category.workouts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.workouts.map((workout) => (
                            <WorkoutCard
                                key={workout.id || workout.name}
                                workout={workout}
                                onLogClick={() => setSelectedWorkout(workout)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-12">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No workouts available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            This category doesn't have any workout programs yet.
                        </p>
                    </div>
                )}
            </div>

            {selectedWorkout && (
                <LogExerciseModal
                    workout={selectedWorkout}
                    onClose={() => setSelectedWorkout(null)}
                    onLogSuccess={handleLogSuccess}
                />
            )}
        </>
    );
};

export default WorkoutListPage;
