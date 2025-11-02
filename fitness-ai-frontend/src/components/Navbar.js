import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    FaDumbbell, FaHome, FaUtensils, FaChartLine, FaUser,
    FaSignOutAlt, FaBars, FaTimes, FaCalendarAlt, FaSun,
    FaMoon, FaTrophy, FaHeartbeat
} from 'react-icons/fa';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>
    );
};

const Navbar = () => {
    const { profile, logout, hasCompleteProfile } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const initials = `${profile?.first_name?.charAt(0) || ''}${profile?.last_name?.charAt(0) || ''}`.toUpperCase() || 'U';

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const activeLinkStyle = "flex items-center px-4 py-2 rounded-lg bg-white bg-opacity-20 font-medium transition-colors";
    const inactiveLinkStyle = "flex items-center px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 font-medium transition-colors";
    const mobileActiveLinkStyle = "flex items-center px-4 py-3 text-indigo-600 bg-indigo-100 rounded-lg font-semibold";
    const mobileInactiveLinkStyle = "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors";

    const publicNavItems = [
        { to: '/', icon: FaHome, label: 'Dashboard' },
        { to: '/training', icon: FaDumbbell, label: 'Training' }
    ];

    const privateNavItems = [
        { to: '/nutrition', icon: FaUtensils, label: 'Nutrition' },
        { to: '/performance', icon: FaChartLine, label: 'Performance' },
        { to: '/competitions', icon: FaTrophy, label: 'Champion Space' },
        { to: '/health', icon: FaHeartbeat, label: 'Health' }
    ];

    return (
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                            <FaDumbbell className="text-indigo-600 text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">FitMind</h1>
                            <p className="text-xs text-indigo-100">Your Fitness Coach</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-1 items-center">
                        {publicNavItems.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to} className={({ isActive }) =>
                                isActive ? activeLinkStyle : inactiveLinkStyle
                            }>
                                <Icon className="mr-2 text-sm" /> {label}
                            </NavLink>
                        ))}

                        {hasCompleteProfile() && privateNavItems.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to} className={({ isActive }) =>
                                isActive ? activeLinkStyle : inactiveLinkStyle
                            }>
                                <Icon className="mr-2 text-sm" /> {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <div className="hidden md:block relative group">
                            <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                                <div className="w-10 h-10 bg-indigo-500 text-white flex items-center justify-center rounded-full border-2 font-bold">
                                    {initials}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{profile?.full_name || 'User Profile'}</p>
                                    <p className="text-xs text-indigo-100 capitalize">{profile?.goal?.replace('_', ' ') || 'Set your goal'}</p>
                                </div>
                            </Link>

                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="py-2">
                                    <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <FaUser className="mr-3 text-gray-400" /> Edit Profile
                                    </Link>
                                    <Link to="/achievements" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <FaTrophy className="mr-3 text-gray-400" /> Rewards
                                    </Link>
                                    <Link to="/calendar" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <FaCalendarAlt className="mr-3 text-gray-400" /> Calendar
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <FaSignOutAlt className="mr-3 text-gray-400" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 focus:outline-none"
                        >
                            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg mt-2 pb-3 animate-slideDown">
                        <div className="flex flex-col space-y-1 p-3">
                            {publicNavItems.map(({ to, icon: Icon, label }) => (
                                <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => isActive ? mobileActiveLinkStyle : mobileInactiveLinkStyle}>
                                    <Icon className="mr-3" /> {label}
                                </NavLink>
                            ))}

                            {hasCompleteProfile() && privateNavItems.map(({ to, icon: Icon, label }) => (
                                <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => isActive ? mobileActiveLinkStyle : mobileInactiveLinkStyle}>
                                    <Icon className="mr-3" /> {label}
                                </NavLink>
                            ))}

                            <hr className="my-2 border-gray-300 dark:border-gray-700" />
                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={mobileInactiveLinkStyle}>
                                <FaUser className="mr-3" /> Profile
                            </Link>
                            <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FaSignOutAlt className="mr-3" /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
