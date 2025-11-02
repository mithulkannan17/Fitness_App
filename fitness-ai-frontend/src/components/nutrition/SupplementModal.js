import React from 'react';
import { FaTimes, FaInfoCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const SupplementModal = ({ supplement, onClose }) => {
    if (!supplement) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{supplement.name}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition duration-200"
                        >
                            <FaTimes className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <FaInfoCircle className="mr-2 text-blue-600" />
                            Recommended Dosage
                        </h3>
                        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                            <p className="text-blue-800 dark:text-blue-200 font-medium">{supplement.dosage}</p>
                        </div>
                    </div>

                    {supplement.timing && (
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                                <FaClock className="mr-2 text-green-600" />
                                Best Time to Take
                            </h3>
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
                                <p className="text-green-800 dark:text-green-200">{supplement.timing}</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Instructions:</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{supplement.details}</p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Always consult with a healthcare provider before starting any supplement regimen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplementModal;
