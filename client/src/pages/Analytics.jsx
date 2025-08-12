import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
// import api from '../services/api'; // Uncomment when you have the analytics endpoint

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const Analytics = () => {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This useEffect would fetch the analytics data from your backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      setError(null);
      setLoading(true);
      try {
        // const { data } = await api.get('/analytics'); // Example API endpoint
        // setChartData(data.chartData);
        // setStats(data.stats);

        // Since the backend endpoint doesn't exist, we'll show an empty state for now.
        // To test with data, you can temporarily set it here:
        // setChartData({ ... }); setStats({ ... });
        throw new Error("Analytics endpoint is not implemented yet.");

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        }
      },
      title: {
        display: true,
        text: 'Your Expense Distribution',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        font: { size: 18 }
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Expense Analytics</h1>
      
      {loading && <div className="text-center py-10">Loading analytics...</div>}
      
      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-center">
            <p className="font-semibold">Feature Not Available</p>
            <p>{error}</p>
        </div>
      )}

      {!loading && !error && chartData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-full h-full max-w-lg mx-auto">
                  <Doughnut data={chartData} options={options} />
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Quick Stats</h2>
              <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Highest Spending Category:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{stats.highestCategory}</span>
                  </li>
                   <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Total Expenses This Month:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(stats.totalMonthly)}</span>
                  </li>
                   <li className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Number of Bills:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{stats.billCount}</span>
                  </li>
              </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;