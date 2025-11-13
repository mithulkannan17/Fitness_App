import axios from 'axios';

// Create an Axios instance with a base configuration
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://fitness-app-1-2awu.onrender.com/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle automatic token refresh on 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
                const response = await axios.post(`${apiClient.defaults.baseURL}/token/refresh/`, { refresh: refreshToken });
                const { access } = response.data;
                localStorage.setItem('access_token', access);
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- API Service Objects ---

export const authAPI = {
    // UPDATED: Corrected paths to match backend
    login: (credentials) => apiClient.post('/token/', credentials),
    register: (userData) => apiClient.post('/register/', userData),
    refreshToken: (refreshToken) => apiClient.post('/token/refresh/', { refresh: refreshToken }),
    verifyToken: (token) => apiClient.post('/token/verify/', { token }),
};

export const profileAPI = {
    get: () => apiClient.get('/profile/'),
    update: (data) => apiClient.patch('/profile/', data), // Using PATCH is slightly better for updates
};

export const activitiesAPI = {
    list: (params) => apiClient.get('/activities/', { params }), // Allow params for filtering
    create: (data) => apiClient.post('/activities/', data),
    update: (id, data) => apiClient.patch(`/activities/${id}/`, data), // Kept for future use
    delete: (id) => apiClient.delete(`/activities/${id}/`), // Kept for future use
};

// NEW: API for the list of predefined fitness activities (for dropdowns)
export const fitnessActivitiesAPI = {
    list: () => apiClient.get('/fitness-activities/'),
};

export const fitnessAPI = {
    getPlan: () => apiClient.get('/fitness-plan/'),
};

export const injuryAPI = {
    check: (data) => apiClient.post('/injury-check/', data),
};

export const nutritionAPI = {
    // UPDATED: Corrected paths and added meal plan functions
    getSummary: () => apiClient.get('/nutrition-summary/'),
    getFoodRecommendations: (params) => apiClient.get('/food-recommendations/', { params }),
    getSupplementRecommendations: () => apiClient.get('/supplement-recommendations/'),
    getMealPlan: () => apiClient.get('/meal-plan/'),
    getMoreSuggestions: (meal) => apiClient.get(`/meal-plan/?meal=${meal}`),
};

export const trainingAPI = {

    getCategories: () => apiClient.get('/training/'),
    getCategoryDetail: (id) => apiClient.get(`/training/${id}/`),
    getWorkoutDetail: (id) => apiClient.get(`/training/workout/${id}/`),
};

// NEW: API for performance dashboard
export const performanceAPI = {
    getDashboard: () => apiClient.get('/performance-dashboard/'),
};

// NEW: API for calendar view
export const calendarAPI = {
    getLogs: (year, month) => apiClient.get(`/calendar-logs/?year=${year}&month=${month}`),
};

export const championSpaceAPI = {
    getCategories: () => apiClient.get('/champion-space/categories/'),
    getCategoryDetail: (id) => apiClient.get(`/champion-space/categories/${id}/`),
    getCompetitionDetail: (id) => apiClient.get(`/champion-space/competitions/${id}/`),
};

export const healthAPI = {
    getHistory: (params) => apiClient.get('/health-data/history/', { params }),
    getAnalysis: () => apiClient.get('/health-data/analysis/'),
    logData: (data) => apiClient.post('/health-data/log/', data),
};

// NEW: API for achievements and rewards
export const achievementsAPI = {
    getProgress: () => apiClient.get('/achievements/progress/'),
};


// Helper function to create user-friendly error messages
export const handleAPIError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && typeof data === 'object' && data !== null) {
            const errorKey = Object.keys(data)[0];
            if (errorKey && Array.isArray(data[errorKey])) {
                return data[errorKey][0];
            }
        }
        if (status === 401) return 'Authentication failed. Please log in again.';
        if (status === 404) return 'The requested item was not found.';
        if (status >= 500) return 'A server error occurred. Please try again later.';
        return data.detail || 'An unexpected error occurred.';
    }
    if (error.request) return 'Network error. Please check your connection.';
    return 'An error occurred.';
};