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

    const fetchProfile = useCallback(async () => {
        try {
            const response = await profileAPI.get();
            setProfile(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            return null;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setProfile(null);
        setError(null);
    }, []);

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                await fetchProfile();
                setUser({ isAuthenticated: true });
            } catch (tokenError) {
                console.warn('Auth check failed:', tokenError);
                logout();
            }
        }
        setLoading(false);
    }, [fetchProfile, logout]);


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

            const registerRes = await authAPI.register(userData);

            const loginRes = await login({
                username: userData.username,
                password: userData.password
            });


            if (loginRes && loginRes.success) {
                return {
                    success: true,
                    data: registerRes.data || loginRes.data,
                };
            } else {
                return {
                    success: false,
                    error: loginRes?.error || 'Login after registration failed.',
                };
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data;
                let firstErrorMessage = 'Sign up failed. Please check the fields below.';
                if (errorData.detail) {
                    firstErrorMessage = errorData.detail;
                } else if (Object.values(errorData).length > 0 && Array.isArray(Object.values(errorData)[0])) {
                    firstErrorMessage = Object.values(errorData)[0][0];
                }
                setError(firstErrorMessage);
                return { success: false, error: errorData };
            }

            const errorMessage = handleAPIError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            setLoading(true);
            const response = await profileAPI.update(profileData);
            setProfile(response.data);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = handleAPIError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('access_token');
    };

    const hasCompleteProfile = () => {
        if (!profile) return false;
        const requiredFields = ['age', 'weight', 'height', 'goal', 'gender'];
        return requiredFields.every(field => profile[field] != null && profile[field] !== '');
    };

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        profile,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
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