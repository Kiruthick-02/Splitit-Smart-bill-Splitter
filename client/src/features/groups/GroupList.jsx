import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const GroupCard = ({ group }) => (
  <Link to={`/groups/${group._id}`} className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h3>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{group.members.length} members</p>
  </Link>
);

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/groups'); 
        setGroups(data);
      } catch (err) {
        setError("Failed to fetch groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading groups...</div>;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Groups</h1>
        <Link to="/groups/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          <PlusIcon />
          <span>New Group</span>
        </Link>
      </div>
      
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No groups yet!</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Create a group to start splitting bills with friends.</p>
             <Link to="/groups/create" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                <PlusIcon />
                <span>Create Your First Group</span>
            </Link>
        </div>
      )}
    </div>
  );
};

export default GroupList;