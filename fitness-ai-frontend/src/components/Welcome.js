import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaDumbbell, FaChartLine, FaHeartbeat } from 'react-icons/fa';
import heroImage from '../assets/hero-image.jpg'; // Importing the image

// Feature Card Sub-Component
const FeatureCard = ({ icon, title, children }) => (
    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);

const Welcome = () => {
    return (
        <div className="bg-gray-900 text-white">
            {/* Section 1: Hero */}
            <section className="min-h-screen flex items-center bg-gradient-to-br from-gray-900 to-indigo-900/50 relative overflow-hidden">
                <div className="container mx-auto px-6 z-10">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="animate-fade-in-up">
                            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                                Unlock Your Peak Performance with <span className="text-indigo-400">FitMind</span>.
                            </h1>
                            <p className="text-lg text-gray-300 mb-8">
                                FitMind creates hyper-personalized training and nutrition plans, analyzes your performance, and helps prevent injuries.
                            </p>
                            <Link to="/signup" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-indigo-500 transition-colors duration-300">
                                Get Started for Free
                            </Link>
                        </div>
                        <div className="hidden md:block relative animate-fade-in">
                            <img src={heroImage} alt="AI Fitness Coach" className="rounded-lg shadow-2xl shadow-indigo-500/20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Features */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">The Future of Fitness is Here</h2>
                    <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
                        Our platform is designed to be your all-in-one partner in achieving your health and fitness goals.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={<FaRobot size={24} />} title="AI-Powered Coach">
                            Receive dynamic workout and meal plans that adapt to your progress, goals, and experience level.
                        </FeatureCard>
                        <FeatureCard icon={<FaChartLine size={24} />} title="Performance Analytics">
                            Track your strength and endurance over time. Our AI predicts your future performance to keep you motivated.
                        </FeatureCard>
                        <FeatureCard icon={<FaHeartbeat size={24} />} title="Injury Prevention">
                            Our system analyzes your symptoms to provide preliminary insights and help you avoid overtraining.
                        </FeatureCard>
                        <FeatureCard icon={<FaDumbbell size={24} />} title="Comprehensive Library">
                            Explore a vast library of exercises and foods to customize your fitness journey.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* Section 3: Call to Action */}
            <section className="py-20 bg-indigo-800/20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Fitness?</h2>
                    <p className="text-gray-300 mb-8">Join thousands of users reaching their goals with FitMind AI.</p>
                    <Link to="/signup" className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-colors duration-300">
                        Sign Up Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Welcome;