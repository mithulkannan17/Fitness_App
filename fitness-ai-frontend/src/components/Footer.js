import React from 'react';
// UPDATED: Removed unused icons
import { FaFacebookF, FaInstagram, FaTwitter, FaMedkit } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <>
            {/* UPDATED: Reverted to a single Floating Action Button for Injury Check */}
            <Link
                to="/injury-check"
                className="fixed bottom-6 right-6 bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition z-40"
                title="Injury Check"
            >
                <FaMedkit className="text-2xl" />
            </Link>

            <footer className="bg-gray-800 text-gray-400 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="mb-4">Personal fitness coaching, nutrition planning, and injury prevention.</p>
                    <div className="flex justify-center space-x-4 mb-4">
                        <a href="# " className="bg-gray-700 p-3 rounded-full hover:bg-indigo-500 transition-colors"><FaFacebookF /></a>
                        <a href="# " className="bg-gray-700 p-3 rounded-full hover:bg-indigo-500 transition-colors"><FaInstagram /></a>
                        <a href="# " className="bg-gray-700 p-3 rounded-full hover:bg-indigo-500 transition-colors"><FaTwitter /></a>
                    </div>
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} FitMind. All rights reserved. | <a href="# " className="hover:underline">Privacy Policy</a> | <a href="# " className="hover:underline">Terms of Service</a>
                    </p>
                </div>
            </footer>
        </>
    );
};

export default Footer;