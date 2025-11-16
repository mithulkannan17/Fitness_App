import React, { useState } from 'react';
import { FaStethoscope, FaExclamationTriangle, FaUndo, FaMedkit, FaInfoCircle } from 'react-icons/fa';
import { injuryAPI, handleAPIError } from '../services/api';

const InjuryCheck = () => {
    const [bodyPart, setBodyPart] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const availableSymptoms = [
        { id: 'sharp_pain', label: 'Sharp, sudden pain', value: 'sharp pain' },
        { id: 'dull_ache', label: 'Persistent dull ache', value: 'dull ache' },
        { id: 'swelling', label: 'Visible swelling', value: 'swelling' },
        { id: 'bruising', label: 'Bruising or discoloration', value: 'bruising' },
        { id: 'limited_movement', label: 'Limited range of motion', value: 'limited movement' },
        { id: 'instability', label: 'Feeling of instability', value: 'instability' },
        { id: 'popping_sound', label: 'Popping or clicking sound', value: 'popping sound' },
        { id: 'weakness', label: 'Muscle weakness', value: 'weakness' },
        { id: 'weak_grip', label: 'Weak grip or strength', value: 'weak grip' },
        { id: 'stiffness', label: 'Stiffness in the area', value: 'stiffness' },
        { id: 'numbness', label: 'Numbness or tingling', value: 'numbness' },
        { id: 'tingling', label: 'Tingling sensation', value: 'tingling' },
        { id: 'radiating_pain', label: 'Radiating or nerve pain', value: 'radiating pain' },
        { id: 'difficulty_bending', label: 'Difficulty bending joint', value: 'difficulty bending' },
        { id: 'confusion', label: 'Confusion or disorientation', value: 'confusion' },
        { id: 'headache', label: 'Headache', value: 'headache' },
        { id: 'nausea', label: 'Nausea', value: 'nausea' },
        { id: 'deformity', label: 'Visible deformity', value: 'deformity' },
        { id: 'muscle_spasm', label: 'Muscle spasm or tightness', value: 'muscle spasm' },         
        { id: 'clicking', label: 'Clicking sound in joint', value: 'clicking' },                     
        { id: 'tenderness', label: 'Tenderness when touching area', value: 'tenderness' },           
        { id: 'stinging', label: 'Stinging or burning pain', value: 'stinging pain' },               
        { id: 'difficulty_walking', label: 'Difficulty walking', value: 'difficulty walking' },      
        { id: 'cramping', label: 'Muscle cramping', value: 'cramping' },                             
        { id: 'throbbing', label: 'Throbbing pain', value: 'throbbing pain' },                       
        { id: 'joint_locking', label: 'Joint locking or catching', value: 'joint locking' }         
    ];



    const bodyParts = [
        'Head',
        'Neck',
        'Shoulder',
        'Upper Back',
        'Lower Back',
        'Chest',
        'Ribs',
        'Abdomen',

        'Hip',
        'Groin',
        'Glutes',
        'Pelvis',

        'Thigh',
        'Hamstring',
        'Quadriceps',
        'IT Band',
        'Outer Thigh',
        'Inner Thigh',

        'Knee',
        'Patellar Tendon',
        'MCL',
        'LCL',

        'Calf',
        'Shin',
        'Achilles Tendon',

        'Ankle',
        'Foot',
        'Heel',
        'Toe',

        'Elbow',
        'Forearm',
        'Wrist',
        'Hand',
        'Finger',
        'Thumb'
    ];



    const handleSymptomChange = (e) => {
        const { value, checked } = e.target;
        setSymptoms(prev =>
            checked
                ? [...prev, value]
                : prev.filter(symptom => symptom !== value)
        );

        if (error) setError('');
    };

    const handleCheckSymptoms = async (e) => {
        e.preventDefault();

        if (!bodyPart) {
            setError('Please select a body part');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await injuryAPI.check({
                body_part: bodyPart,
                symptoms: symptoms
            });

            console.log('API Response:', response.data);
            setResult(response.data);
        } catch (error) {
            console.error("Failed to check injury:", error);
            setError(handleAPIError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setBodyPart('');
        setSymptoms([]);
        setResult(null);
        setError('');

        document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'mild':
                return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
            case 'moderate':
                return 'border-orange-200 bg-orange-50 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200';
            case 'severe':
                return 'border-red-200 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200';
            default:
                return 'border-gray-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };

    const renderResults = () => {
        if (!result) return null;

        if (result.possible_injuries && Array.isArray(result.possible_injuries) && result.possible_injuries.length > 0) {
            return (
                <div className="space-y-4">
                    {result.message && (
                        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 p-4 rounded-md">
                            <p className="text-sm text-blue-800 dark:text-blue-200">{result.message}</p>
                        </div>
                    )}

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Possible Injuries Found:</h3>
                    {result.possible_injuries.map((injury, index) => (
                        <div key={injury.id || index} className={`border-2 p-4 rounded-lg ${getSeverityColor(injury.severity)}`}>
                            <h4 className="font-bold text-lg mb-2">{injury.name}</h4>

                            {injury.severity && (
                                <div className="mb-2">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white dark:bg-gray-700 bg-opacity-50 text-gray-900 dark:text-gray-200">
                                        {injury.severity.charAt(0).toUpperCase() + injury.severity.slice(1)} Severity
                                    </span>
                                </div>
                            )}

                            {injury.symptoms && (
                                <div className="mb-3">
                                    <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Common Symptoms:</p>
                                    <p className="text-sm opacity-90 text-gray-800 dark:text-gray-200">{injury.symptoms}</p>
                                </div>
                            )}

                            {injury.first_aid && (
                                <div className="mb-3">
                                    <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Immediate Care:</p>
                                    <p className="text-sm opacity-90 text-gray-800 dark:text-gray-200">{injury.first_aid}</p>
                                </div>
                            )}

                            {injury.treatment_type && (
                                <div className="mb-3">
                                    <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Treatment Type:</p>
                                    <p className="text-sm opacity-90 text-gray-800 dark:text-gray-200">{injury.treatment_type}</p>
                                </div>
                            )}

                            {injury.recovery_time_days && (
                                <div>
                                    <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Estimated Recovery:</p>
                                    <p className="text-sm opacity-90 text-gray-800 dark:text-gray-200">
                                        {injury.recovery_time_days} days
                                        {injury.recovery_time_days > 7 && ` (~${Math.round(injury.recovery_time_days / 7)} weeks)`}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <strong>Total matches found:</strong> {result.total_matches || result.possible_injuries.length}
                    </div>
                </div>
            );
        }

        if (result.message) {
            return (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-200">{result.message}</p>
                    {result.recommendations && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Recommendations:</p>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                                {result.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-200">
                    Analysis completed. Please consult with a healthcare professional for proper evaluation.
                </p>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
            <header className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                    <FaMedkit className="text-red-600 dark:text-red-300 text-2xl" />
                </div>
                <h1 className="text-3xl font-bold">AI Injury Symptom Checker</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Get preliminary insights about potential injuries based on your symptoms.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
                            <div className="flex">
                                <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Medical Disclaimer</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        This tool provides general information only and is not a substitute for professional medical advice.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCheckSymptoms} className="space-y-6">
                            <div>
                                <label htmlFor="bodyPart" className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                                    Which body part is affected? *
                                </label>
                                <select
                                    id="bodyPart"
                                    value={bodyPart}
                                    onChange={(e) => setBodyPart(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                    required
                                >
                                    <option value="">-- Select affected area --</option>
                                    {bodyParts.map(part => (
                                        <option key={part} value={part}>{part}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                                    What symptoms are you experiencing? (Select all that apply)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableSymptoms.map(symptom => (
                                        <div key={symptom.id} className="flex items-start">
                                            <input
                                                id={symptom.id}
                                                type="checkbox"
                                                value={symptom.value}
                                                onChange={handleSymptomChange}
                                                disabled={loading}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded mt-1 dark:bg-gray-700"
                                            />
                                            <label
                                                htmlFor={symptom.id}
                                                className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                            >
                                                {symptom.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border rounded-md text-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing...
                                    </div>
                                ) : (
                                    <>
                                        <FaStethoscope className="mr-3 h-5 w-5" />
                                        Check Symptoms
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {result ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <FaInfoCircle className="mr-2 text-blue-600" />
                                    Analysis Result
                                </h2>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 flex items-center"
                                >
                                    <FaUndo className="mr-1" /> Reset
                                </button>
                            </div>

                            {renderResults()}

                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <p className="text-xs text-blue-800 dark:text-blue-200">
                                    <strong>Disclaimer:</strong> This analysis is for informational purposes only.
                                    Always consult a qualified healthcare professional.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="text-center text-gray-500 dark:text-gray-300">
                                <FaStethoscope className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>Select your symptoms and click "Check Symptoms" to get analysis</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded-r-md">
                <div className="flex">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400 dark:text-red-300 mr-3 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-red-800 dark:text-red-200">When to Seek Emergency Care</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Severe pain, deformity, numbness, or infection signs require immediate medical attention.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InjuryCheck;
