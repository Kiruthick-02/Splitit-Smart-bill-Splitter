import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import { useSettlements } from '../../context/SettlementsContext'; // Added import for SettlementsContext

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const AddBill = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { refetchSettlements } = useSettlements(); // Added hook to refetch settlements

  const [description, setDescription] = useState('');
  const [allParticipants, setAllParticipants] = useState([]);
  const [splits, setSplits] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const { data } = await api.get(`/groups/${groupId}`);
        const registered = data.members.map(m => ({ id: m._id, name: m.username }));
        const virtual = data.virtualMembers.map(m => ({ id: m._id, name: m.name }));
        const combined = [...registered, ...virtual];
        setAllParticipants(combined);
        // Initialize splits with zero amount for each participant
        setSplits(combined.map(p => ({ participantId: p.id, amount: 0 })));
      } catch (err) {
        setError('Failed to load group participants.');
      } finally {
        setLoadingParticipants(false);
      }
    };
    fetchGroupData();
  }, [groupId]);

  const handleSplitAmountChange = (participantId, value) => {
    const newAmount = parseFloat(value) || 0;
    setSplits(currentSplits =>
      currentSplits.map(s =>
        s.participantId === participantId ? { ...s, amount: newAmount } : s
      )
    );
  };

  // The total amount is now always the sum of the individual splits
  const calculatedTotal = useMemo(() => {
    return splits.reduce((sum, s) => sum + s.amount, 0);
  }, [splits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      setError('Please enter a description for the bill.');
      return;
    }
    if (calculatedTotal <= 0) {
      setError('The total bill amount must be greater than zero.');
      return;
    }
    
    setError('');
    setLoading(true);

    const billData = {
      groupId,
      description,
      amount: calculatedTotal,
      // Filter out participants who are not paying anything
      splits: splits.filter(s => s.amount > 0),
    };
    
    try {
      await api.post('/bills', billData);
      refetchSettlements(); // Added call to refetch settlements after bill creation
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bill.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingParticipants) {
    return <div className="text-center py-10">Loading participants...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Add a New Bill</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <input 
              type="text" 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              className="mt-1 input-field"
            />
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <label htmlFor="totalAmount" className="block text-lg font-semibold text-gray-800 dark:text-gray-200">Total Bill Amount</label>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(calculatedTotal)}</span>
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter each person's share:</p>
            <div className="mt-2 space-y-2">
                {allParticipants.map(member => (
                    <div key={member.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{member.name}</span>
                        <div className="flex items-center">
                            <span className="text-gray-500 dark:text-gray-400 mr-2">₹</span>
                            <input 
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-28 input-field text-right"
                                onChange={(e) => handleSplitAmountChange(member.id, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading || calculatedTotal <= 0} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Bill'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBill;