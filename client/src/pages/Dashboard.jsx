import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSettlements } from '../context/SettlementsContext';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const Dashboard = () => {
  const { user } = useAuth();
  const { settlements, loading } = useSettlements();

  const totalOwed = settlements?.debts?.reduce((sum, debt) => sum + debt.amount, 0) || 0;
  const totalCredit = settlements?.credits?.reduce((sum, credit) => sum + credit.amount, 0) || 0;

  if (loading) {
      return <div className="text-center p-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Welcome back, {user?.username || 'friend'}!
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">Total You Are Owed</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatCurrency(totalCredit)}
              </p>
          </div>
          <div className="p-6 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Total You Owe</h2>
               <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {formatCurrency(totalOwed)}
               </p>
          </div>
      </div>
      <div className="mt-8">
        <Link to="/groups" className="btn-primary">View Your Groups</Link>
      </div>
    </div>
  );
};

export default Dashboard;