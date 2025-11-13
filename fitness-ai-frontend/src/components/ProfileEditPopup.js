import React, { useState } from 'react';
import { profileAPI } from '../services/api';

const ProfileEditPopup = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        age: '',
        weight: '',
        height: '',
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await profileAPI.update(formData);
            alert('Profile updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="bg-gray-800 text-gray-100 rounded-xl shadow-lg p-6 w-96 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-center text-indigo-400">
                    Complete Your Profile
                </h2>

                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="number"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full mb-4 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPopup;
