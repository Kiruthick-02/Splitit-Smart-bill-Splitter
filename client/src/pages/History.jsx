import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BackButton from '../components/BackButton';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const HistoryItem = ({ item }) => {
    // Defensive check: If payer or payee is null, don't render this item.
    if (!item.payer || !item.payee) {
        return null;
    }

    const statusClasses = {
        paid: 'bg-green-100 dark:bg-green-900/50 border-green-500',
        rejected: 'bg-red-100 dark:bg-red-900/50 border-red-500',
    };
    return (
        <div className={`p-4 rounded-lg shadow-sm border-l-4 ${statusClasses[item.status]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.groupName}</p>
                    <p className="text-sm mt-1">From: <span className="font-medium">{item.payer.username}</span></p>
                    <p className="text-sm">To: <span className="font-medium">{item.payee.username}</span></p>
                    <p className="text-sm font-semibold capitalize mt-2">Status: {item.status}</p>
                </div>
                <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
            </div>
             <p className="text-xs text-gray-400 text-right mt-2">
                Settled on: {new Date(item.updatedAt).toLocaleDateString()}
            </p>
        </div>
    );
};

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/history');
                setHistory(data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-10">Loading history...</div>;

    return (
        <div>
            <BackButton />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settlement History</h1>
            <div className="space-y-4">
                {history.length > 0 ? (
                    history.map(item => <HistoryItem key={item._id} item={item} />)
                ) : (
                    <p className="text-gray-500 card text-center">Your settlement history is empty.</p>
                )}
            </div>
        </div>
    );
};

export default History;