import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import BackButton from '../../components/BackButton'; // <-- Import the component

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const BillDetail = () => {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const { data } = await api.get(`/bills/${billId}`);
        setBill(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bill details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  if (loading) return <div className="text-center py-10">Loading bill...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!bill) return <div className="text-center py-10">Bill not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
        <BackButton /> {/* <-- Add the component here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{bill.group?.name || 'Group'}</p>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{bill.description}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                Added on {new Date(bill.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Total Bill Amount</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</span>
            </div>

            <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                Paid by <span className="font-bold text-black dark:text-white">{bill.paidBy?.username || 'Unknown'}</span>
                </p>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Split Breakdown</h2>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {bill.splits?.map((split, index) => (
                    <li key={index} className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${split.participantName}`} 
                            alt={split.participantName}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{split.participantName || 'Unknown Participant'}</span>
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(split.amount)}</span>
                    </li>
                ))}
                </ul>
            </div>
        </div>
    </div>
  );
};

export default BillDetail;