import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDumbbell, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading, error, isAuthenticated, clearError } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) navigate('/');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        clearError();
        setLocalError('');
    }, [formData, clearError]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateForm = () => {
        if (!formData.username.trim()) { setLocalError('Username is required'); return false; }
        if (!formData.password) { setLocalError('Password is required'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setIsSubmitting(true);
            const result = await login(formData);
            if (result.success) navigate('/');
        } catch (err) {
            setLocalError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = localError || error;

    return (
        // UPDATED: Page background is now dark
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="max-w-md w-full mx-4">

                {/* 1. Outer wrapper for the animated border */}
                <div className="animated-border-card rounded-2xl">
                    {/* 2. Inner wrapper for the dark card content */}
                    {/* We use m-[3px] for a thick border and rounded-xl (12px) which is smaller than rounded-2xl (16px) */}
                    <div className="relative z-10 bg-gray-800 rounded-xl m-[3px] p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                                <FaDumbbell className="h-8 w-8 text-white" />
                            </div>
                            {/* UPDATED: Text is now light */}
                            <h1 className="text-3xl font-bold text-gray-100 mb-2">Welcome Back!</h1>
                            <p className="text-gray-400">Sign in to continue your fitness journey</p>
                        </div>

                        {/* Error Display */}
                        {displayError && (
                            <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-200">{displayError}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                <input
                                    type="text" name="username" id="username" required
                                    value={formData.username} onChange={handleChange} disabled={isSubmitting || loading}
                                    className="w-full px-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'} name="password" id="password" required
                                        value={formData.password} onChange={handleChange} disabled={isSubmitting || loading}
                                        className="w-full px-4 py-3 pr-12 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter your password"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting || loading} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-300" /> : <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting || loading} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                                {isSubmitting || loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="mt-6 text-center space-y-4">
                            <p className="text-sm text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">Sign up here</Link>
                            </p>
                            <div className="border-t border-gray-700 pt-4">
                                <p className="text-xs text-gray-500 mb-2">Demo Account (for testing):</p>
                                <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
                                    <p><strong>Username:</strong> Devil_gamer</p>
                                    <p><strong>Password:</strong> Password123$</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;