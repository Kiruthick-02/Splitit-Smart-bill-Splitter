import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import BackButton from '../../components/BackButton'; // Corrected path

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const { data } = await api.get(`/users/profile`);
            setFormData({ username: data.username, email: data.email });
        } catch (err) {
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };
    if (user) { fetchUserData(); }
  }, [user]);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfileText = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
        await api.put('/users/profile', formData);
        setMessage('Profile details updated successfully!');
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to update details.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      <div className="w-full max-w-2xl">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Profile</h1>
        
        {error && <p className="mb-4 text-center p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">{error}</p>}
        {message && <p className="mb-4 text-center p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{message}</p>}

        <form onSubmit={handleUpdateProfileText} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleTextChange} required className="mt-1 input-field"/>
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleTextChange} required className="mt-1 input-field"/>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="btn-primary">Save Changes</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;