import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDumbbell, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ProfileEditPopup from '../../components/ProfileEditPopup';

const Signup = () => {
    const navigate = useNavigate();
    const { register, loading, error, isAuthenticated, clearError } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [newUser, setNewUser] = useState(null);

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        clearError();
        setLocalErrors({});
    }, [formData, clearError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (localErrors[name]) {
            setLocalErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        if (!formData.password_confirm) {
            errors.password_confirm = 'Please confirm your password';
        } else if (formData.password !== formData.password_confirm) {
            errors.password_confirm = 'Passwords do not match';
        }
        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setIsSubmitting(true);
            const result = await register(formData);
            if (result.success) {
                setNewUser(result.data);
                setShowProfilePopup(true);
            } else if (result.error) {
                if (typeof result.error === 'object') {
                    setLocalErrors(result.error);
                }
            }
        } catch (err) {
            console.error('Signup error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldError = (fieldName) => {
        return localErrors[fieldName] || '';
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['red', 'orange', 'yellow', 'blue', 'green'];
        return {
            strength,
            label: labels[strength - 1] || '',
            color: colors[strength - 1] || 'gray'
        };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const strengthColorClass = {
        red: 'bg-red-500 text-red-400',
        orange: 'bg-orange-500 text-orange-400',
        yellow: 'bg-yellow-500 text-yellow-400',
        blue: 'bg-blue-500 text-blue-400',
        green: 'bg-green-500 text-green-400',
        gray: 'bg-gray-500 text-gray-400'
    }[passwordStrength.color || 'gray'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="animated-border-card rounded-2xl">
                    <div className="relative z-10 bg-gray-800 rounded-[13px] m-[3px] p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                                <FaDumbbell className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-100 mb-2">Create Account</h1>
                            <p className="text-gray-400">Join FitMind and start your fitness journey</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-200">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                <div className="relative">
                                    <input
                                        type="text" name="username" id="username" required
                                        value={formData.username} onChange={handleChange} disabled={isSubmitting || loading}
                                        className={`w-full px-4 py-3 pr-10 bg-gray-700 text-gray-100 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${getFieldError('username') ? 'border-red-500' : 'border-gray-600'}`}
                                        placeholder="Choose a unique username"
                                    />
                                    {getFieldError('username') && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                                        </div>
                                    )}
                                </div>
                                {getFieldError('username') && <p className="mt-1 text-sm text-red-400">{getFieldError('username')}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email" name="email" id="email" required
                                        value={formData.email} onChange={handleChange} disabled={isSubmitting || loading}
                                        className={`w-full px-4 py-3 pr-10 bg-gray-700 text-gray-100 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${getFieldError('email') ? 'border-red-500' : 'border-gray-600'}`}
                                        placeholder="Enter your email address"
                                    />
                                    {getFieldError('email') && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                                        </div>
                                    )}
                                </div>
                                {getFieldError('email') && <p className="mt-1 text-sm text-red-400">{getFieldError('email')}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'} name="password" id="password" required
                                        value={formData.password} onChange={handleChange} disabled={isSubmitting || loading}
                                        className={`w-full px-4 py-3 pr-12 bg-gray-700 text-gray-100 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${getFieldError('password') ? 'border-red-500' : 'border-gray-600'}`}
                                        placeholder="Create a strong password"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {getFieldError('password') ? (
                                            <div className="pointer-events-none">
                                                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting || loading} className="text-gray-400 hover:text-gray-300">
                                                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-600 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${strengthColorClass.split(' ')[0]}`}
                                                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${strengthColorClass.split(' ')[1]}`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {getFieldError('password') && <p className="mt-1 text-sm text-red-400">{getFieldError('password')}</p>}
                            </div>

                            <div>
                                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'} name="password_confirm" id="password_confirm" required
                                        value={formData.password_confirm} onChange={handleChange} disabled={isSubmitting || loading}
                                        className={`w-full px-4 py-3 pr-12 bg-gray-700 text-gray-100 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${getFieldError('password_confirm') ? 'border-red-500' : 'border-gray-600'}`}
                                        placeholder="Confirm your password"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {getFieldError('password_confirm') ? (
                                            <div className="pointer-events-none">
                                                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isSubmitting || loading} className="text-gray-400 hover:text-gray-300">
                                                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {formData.password_confirm && formData.password && !getFieldError('password_confirm') && (
                                    <div className="mt-2 flex items-center">
                                        {formData.password === formData.password_confirm ? (
                                            <div className="flex items-center text-green-400"><FaCheckCircle className="h-4 w-4 mr-1" /><span className="text-xs">Passwords match</span></div>
                                        ) : (
                                            <span className="text-xs text-red-400">Passwords don't match</span>
                                        )}
                                    </div>
                                )}
                                {getFieldError('password_confirm') && <p className="mt-1 text-sm text-red-400">{getFieldError('password_confirm')}</p>}
                            </div>

                            <button type="submit" disabled={isSubmitting || loading} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                                {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Sign in here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showProfilePopup && (
                <ProfileEditPopup
                    user={newUser}
                    onClose={() => {
                        setShowProfilePopup(false);
                        navigate('/');
                    }}
                />
            )}
        </div>
    );
};

export default Signup;