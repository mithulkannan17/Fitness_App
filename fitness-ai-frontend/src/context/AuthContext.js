import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI, profileAPI, handleAPIError } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // RENAMED: from refreshProfile to fetchProfile for consistency
    const fetchProfile = useCallback(async () => {
        try {
            const response = await profileAPI.get();
            setProfile(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            // Don't logout here, token might still be valid for other things
            return null;
        }
    }, []);

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                // We don't need to verify here, fetching profile does the same job.
                // If get() fails with a 401, the interceptor will handle logout.
                await fetchProfile();
                setUser({ isAuthenticated: true });
            } catch (tokenError) {
                console.warn('Auth check failed:', tokenError);
                logout(); // Use the logout function to clean up
            }
        }
        setLoading(false);
    }, [fetchProfile]);


    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);


    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authAPI.login(credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            await fetchProfile();
            setUser({ isAuthenticated: true });
            return { success: true };
        } catch (error) {
            const errorMessage = handleAPIError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            // Register user first
            const registerRes = await authAPI.register(userData);

            // Auto login after successful registration
            const loginRes = await login({
                username: userData.username,
                password: userData.password
            });

            // ✅ Return consistent structure expected by Signup.js
            if (loginRes && loginRes.success) {
                return {
                    success: true,
                    data: registerRes.data || loginRes.data, // send user info forward
                };
            } else {
                return {
                    success: false,
                    error: loginRes?.error || 'Login after registration failed.',
                };
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data) {
                return { success: false, error: error.response.data };
            }

            const errorMessage = handleAPIError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setProfile(null);
        setError(null);
    };

    // UPDATED: Added loading state management
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            setLoading(true); // Set loading true during the update
            const response = await profileAPI.update(profileData);
            setProfile(response.data);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = handleAPIError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false); // Set loading false after update
        }
    };

    const isAuthenticated = () => {
        // Checking state is more reliable than just the token
        return !!user && !!localStorage.getItem('access_token');
    };

    const hasCompleteProfile = () => {
        if (!profile) return false;
        const requiredFields = ['age', 'weight', 'height', 'goal', 'gender'];
        return requiredFields.every(field => profile[field] != null && profile[field] !== '');
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        profile,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile, // RENAMED
        isAuthenticated,
        hasCompleteProfile,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};