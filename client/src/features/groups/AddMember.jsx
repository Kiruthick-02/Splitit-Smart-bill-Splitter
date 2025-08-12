import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const UserSearchResult = ({ user, onAdd }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
        <span className="text-gray-800 dark:text-gray-200">{user.username} ({user.email})</span>
        <button onClick={() => onAdd(user._id)} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700">
            Add
        </button>
    </div>
);

const AddMember = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        
        setLoading(true);
        setError('');
        setMessage('');
        try {
            // Use the existing user search endpoint
            const { data } = await api.get(`/users?search=${searchTerm}`);
            setSearchResults(data);
        } catch (err) {
            setError('Failed to search for users.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (userId) => {
        setError('');
        setMessage('');
        try {
            await api.put(`/groups/${groupId}/members`, { userId });
            setMessage(`User successfully added to the group!`);
            // Remove the user from the search results to prevent adding them again
            setSearchResults(results => results.filter(user => user._id !== userId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add a Member</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Search for users by their username to add them to your group.</p>

            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                {error && <p className="mb-4 text-center p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">{error}</p>}
                {message && <p className="mb-4 text-center p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{message}</p>}

                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter username..."
                        className="flex-grow block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? '...' : 'Search'}
                    </button>
                </form>

                <div className="space-y-3">
                    {searchResults.length > 0 ? (
                        searchResults.map(user => <UserSearchResult key={user._id} user={user} onAdd={handleAddMember} />)
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">No users found. Start a search to see results.</p>
                    )}
                </div>
                
                <div className="mt-8 text-center">
                    <button onClick={() => navigate(`/groups/${groupId}`)} className="btn-secondary">
                        Back to Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMember;