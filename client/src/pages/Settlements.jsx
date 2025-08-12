import React from 'react';
import BackButton from '../components/BackButton';
import { useAuth } from '../hooks/useAuth';
import { useSettlements } from '../context/SettlementsContext';
import api from '../services/api';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const SettlementItem = ({ debt, onSettle }) => {
  if (!debt || !debt.payee) return null;
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={debt.payee.avatar || `https://ui-avatars.com/api/?name=${debt.payee.username || debt.payee.name}`}
          alt={debt.payee.username || debt.payee.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            You owe <span className="font-bold">{debt.payee.username || debt.payee.name}</span>
          </p>
          <p className="text-xs text-gray-400">in group: {debt.groupName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-red-500 dark:text-red-400">
          {formatCurrency(debt.amount)}
        </p>
        <button
          onClick={() => onSettle(debt.payee._id, debt.amount, debt.groupId)}
          className="mt-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700"
        >
          Settle
        </button>
      </div>
    </div>
  );
};

const CreditItem = ({ credit }) => {
  if (!credit || !credit.payer) return null;
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={credit.payer.avatar || `https://ui-avatars.com/api/?name=${credit.payer.username || credit.payer.name}`}
          alt={credit.payer.username || credit.payer.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            <span className="font-bold">{credit.payer.username || credit.payer.name}</span> owes you
          </p>
          <p className="text-xs text-gray-400">in group: {credit.groupName}</p>
        </div>
      </div>
      <p className="font-bold text-lg text-green-600 dark:text-green-400">
        {formatCurrency(credit.amount)}
      </p>
    </div>
  );
};

const RequestItem = ({ req, onAction, currentUserId }) => {
  if (!req.payer || !req.payee) return null;
  const isPayee = req.payee._id === currentUserId;
  const statusClasses = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500',
    paid: 'bg-green-100 dark:bg-green-900/50 border-green-500',
    rejected: 'bg-red-100 dark:bg-red-900/50 border-red-500',
  };
  console.log('RequestItem - CurrentUserId:', currentUserId, 'Payee:', req.payee._id); // Debug log
  return (
    <div className={`p-4 rounded-lg shadow-sm border-l-4 ${statusClasses[req.status]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{req.groupName}</p>
          <p className="text-sm mt-1">From: <span className="font-medium">{req.payer.username}</span></p>
          <p className="text-sm">To: <span className="font-medium">{req.payee.username}</span></p>
          <p className="text-sm font-semibold capitalize mt-2">Status: {req.status}</p>
        </div>
        <p className="font-bold text-lg">{formatCurrency(req.amount)}</p>
      </div>
      {isPayee && req.status === 'pending' && (
        <div className="flex gap-2 mt-2 justify-end">
          <button
            onClick={() => onAction(req._id, 'paid')}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Accept
          </button>
          <button
            onClick={() => onAction(req._id, 'rejected')}
            className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

const Settlements = () => {
  const { user } = useAuth();
  const { settlements, loading, refetchSettlements } = useSettlements();

  const handleSendRequest = async (payeeId, amount, groupId) => {
    if (!groupId) {
      alert('Could not create settlement request.');
      return;
    }
    try {
      await api.post('/settlements', { payeeId, amount, groupId });
      refetchSettlements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRequestAction = async (settlementId, status) => {
    try {
      console.log('Handling request action:', settlementId, status); // Debug log
      // Remove optimistic update since setSettlements is not available
      await api.put(`/settlements/${settlementId}`, { status });
      console.log('Request action successful, refetching...'); // Debug log
      refetchSettlements();
    } catch (err) {
      console.error('Request action failed:', err); // Debug log
      alert(err.response?.data?.message || 'Failed to update request');
      refetchSettlements(); // Refetch to revert to server state
    }
  };

  if (loading) return <div className="text-center py-10">Calculating settlements...</div>;
  if (!settlements) return <div className="text-center py-10 card">Could not load settlement data.</div>;

  const { debts = [], credits = [], allSettlements = [] } = settlements;
  const totalOwed = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalCredit = credits.reduce((sum, credit) => sum + credit.amount, 0);
  const pendingRequests = allSettlements.filter((req) => req.status === 'pending');

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settlements</h1>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-red-100 dark:bg-red-900/50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Total You Owe</h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {formatCurrency(totalOwed)}
          </p>
        </div>
        <div className="p-6 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">Total You Are Owed</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(totalCredit)}
          </p>
        </div>
      </div>

      {/* Pending */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <RequestItem
                key={req._id}
                req={req}
                onAction={handleRequestAction}
                currentUserId={user.id}
              />
            ))
          ) : (
            <p className="text-gray-500 card text-center">No pending requests.</p>
          )}
        </div>
      </div>

      {/* Debts & Credits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">What You Owe</h2>
          {debts.length > 0 ? (
            <div className="space-y-4">
              {debts.map((debt) => (
                <SettlementItem key={debt.id} debt={debt} onSettle={handleSendRequest} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 card text-center">You're all settled up!</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">What You Are Owed</h2>
          {credits.length > 0 ? (
            <div className="space-y-4">
              {credits.map((credit) => (
                <CreditItem key={credit.id} credit={credit} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 card text-center">No one owes you anything.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settlements;