import React from 'react';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const BillCard = ({ bill, onDelete }) => {
  if (!bill) {
    return null;
  }

  // This wrapper prevents the Link from also triggering the delete button's onClick
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(bill._id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
      <Link to={`/bills/${bill._id}`} className="block p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate pr-10">
            {bill.description}
          </h3>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            {formatCurrency(bill.amount)}
          </p>
        </div>
        <div className="mt-4 flex justify-between items-end text-sm text-gray-500 dark:text-gray-400">
          <div>
            <p>
              Paid by: <span className="font-medium text-gray-700 dark:text-gray-300">{bill.paidBy?.username || 'N/A'}</span>
            </p>
          </div>
          <p className="text-xs">
            {formatDate(bill.createdAt)}
          </p>
        </div>
      </Link>
      <button 
        onClick={handleDeleteClick} 
        title="Delete Bill"
        className="absolute top-3 right-3 p-2 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
      >
        <DeleteIcon />
      </button>
    </div>
  );
};

export default BillCard;