import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { FaCalendarAlt, FaClock, FaTimes, FaStickyNote, FaSpinner } from 'react-icons/fa';
import { calendarAPI, handleAPIError } from '../services/api';

const LogDetailModal = ({ activities, date, onClose, colors }) => {
    if (!activities || activities.length === 0) return null;

    const renderSetDetails = (set) => {
        if (set.weight_kg && set.reps) {
            return (
                <span className="font-mono font-semibold dark:text-gray-100">
                    {set.weight_kg}kg x {set.reps} reps
                </span>
            );
        }
        if (set.duration_minutes && set.distance_km) {
            return (
                <span className="font-mono font-semibold dark:text-gray-100">
                    {set.distance_km}km in {set.duration_minutes} min
                </span>
            );
        }
        if (set.duration_minutes) {
            return (
                <span className="font-mono font-semibold dark:text-gray-100">
                    {set.duration_minutes} minutes
                </span>
            );
        }
        return <span className="font-mono font-semibold dark:text-gray-100">--</span>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-bold dark:text-gray-100">
                        Logs for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><FaTimes className="text-gray-500 dark:text-gray-300" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {activities.map(activity => (
                        <div key={activity.id} className="border-l-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg" style={{ borderColor: colors[activity.category] || '#ccc' }}>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">{activity.name}</h3>
                            <div className="flex items-center flex-wrap gap-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {activity.duration && <span className="flex items-center"><FaClock className="mr-1" />{activity.duration} min</span>}
                                <span className="font-medium px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: `${colors[activity.category]}20`, color: colors[activity.category] }}>{activity.category}</span>
                            </div>
                            {activity.notes && <p className="text-sm mt-2 italic text-gray-500 dark:text-gray-400 flex"><FaStickyNote className="mr-2 mt-1 flex-shrink-0" />"{activity.notes}"</p>}

                            <div className="mt-3 pt-3 border-t dark:border-gray-600">
                                <h4 className="font-semibold text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">Sets Logged ({activity.sets.length})</h4>
                                <div className="space-y-1 text-sm">
                                    {activity.sets.map((set, index) => (
                                        <div key={index} className="flex justify-between p-2 bg-white dark:bg-gray-600 rounded border dark:border-gray-500">
                                            <span className="dark:text-gray-200">{set.exercise_name}</span>
                                            {renderSetDetails(set)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getLocalDateString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const CalendarLog = () => {
    const [date, setDate] = useState(new Date());
    const [logs, setLogs] = useState({});
    const [colors, setColors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDateData, setSelectedDateData] = useState(null);

    useEffect(() => {
        const fetchLogsForMonth = async (currentDate) => {
            try {
                setLoading(true);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const response = await calendarAPI.getLogs(year, month);
                setLogs(response.data.logs);
                setColors(response.data.category_colors);
            } catch (err) {
                setError(handleAPIError(err));
            } finally {
                setLoading(false);
            }
        };
        fetchLogsForMonth(date);
    }, [date, setLoading]);

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = getLocalDateString(date);
            if (logs[dateString]) {
                const categories = [...new Set(logs[dateString].map(act => act.category))];
                return (
                    <div className="workout-dots">
                        {categories.map(category => (
                            <div key={category} className="workout-dot" style={{ backgroundColor: colors[category] || '#ccc' }} title={category}></div>
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    const handleDayClick = (clickedDate) => {
        const dateString = getLocalDateString(clickedDate);
        if (logs[dateString]) {
            setSelectedDateData({
                date: dateString,
                activities: logs[dateString]
            });
        }
    };

    return (
        <>
         
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center"><FaCalendarAlt className="mr-3 text-indigo-600" />Workout Calendar</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Click on a day with dots to see the workout details.</p>
                </div>

                {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                {loading ? (
                    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-300 mx-auto" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading calendar...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <Calendar
                            onChange={setDate}
                            value={date}
                            tileContent={tileContent}
                            onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)}
                            onClickDay={handleDayClick}
                            className="custom-calendar"
                        />
                    </div>
                )}

                <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Legend</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {Object.entries(colors).map(([category, color]) => (
                            <div key={category} className="flex items-center text-sm">
                                <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                                <span className="text-gray-700 dark:text-gray-300">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedDateData && (
                <LogDetailModal
                    activities={selectedDateData.activities}
                    date={selectedDateData.date}
                    onClose={() => setSelectedDateData(null)}
                    colors={colors}
                />
            )}
        </>
    );
};

export default CalendarLog;