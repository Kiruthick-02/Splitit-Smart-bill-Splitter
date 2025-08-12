import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddVirtualMember = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Guest name cannot be empty.');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await api.post(`/groups/${groupId}/virtual-members`, { name });
            navigate(`/groups/${groupId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add guest.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Add a Guest Member</h1>
            <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl space-y-6">
                {error && <p className="text-center p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">{error}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guest's Name</label>
                    <input 
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter a name..."
                        className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate(`/groups/${groupId}`)} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Adding...' : 'Add Guest'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddVirtualMember;