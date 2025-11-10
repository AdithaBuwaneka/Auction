'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { Wallet, TrendingUp, TrendingDown, DollarSign, AlertCircle, CreditCard, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface WalletData {
  balance: number;
  frozenBalance: number;
  availableBalance: number;
}

interface WalletTransaction {
  walletTransactionId: number;
  userId: number;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  frozenBefore: number;
  frozenAfter: number;
  availableBefore: number;
  availableAfter: number;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    fetchWalletData();
    fetchTransactions();
  }, [user, authLoading]);

  const fetchWalletData = async () => {
    if (!user) return;
    try {
      const response = await walletAPI.getBalance(user.userId);
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const response = await walletAPI.getTransactions(user.userId);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await walletAPI.deposit(user.userId, depositAmount);
      setSuccess(`Successfully deposited $${depositAmount.toFixed(2)}`);
      setAmount('');
      setShowDepositModal(false);

      // Fetch updated wallet data and transactions
      await fetchWalletData();
      await fetchTransactions();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Deposit error:', error);
      setError(error.response?.data?.error || 'Failed to deposit funds');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wallet) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const availableBalance = wallet.balance - wallet.frozenBalance;
    if (withdrawAmount > availableBalance) {
      setError(`Insufficient available balance. You can withdraw up to $${availableBalance.toFixed(2)}`);
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await walletAPI.withdraw(user.userId, withdrawAmount);
      setSuccess(`Successfully withdrew $${withdrawAmount.toFixed(2)}`);
      setAmount('');
      setShowWithdrawModal(false);

      // Fetch updated wallet data and transactions
      await fetchWalletData();
      await fetchTransactions();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      setError(error.response?.data?.error || 'Failed to withdraw funds');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'WITHDRAW':
        return <TrendingDown className="text-red-600" size={20} />;
      case 'FREEZE':
        return <Lock className="text-orange-600" size={20} />;
      case 'UNFREEZE':
        return <Lock className="text-blue-600" size={20} />;
      case 'DEDUCT':
        return <DollarSign className="text-purple-600" size={20} />;
      case 'REFUND':
        return <TrendingUp className="text-green-600" size={20} />;
      default:
        return <DollarSign className="text-gray-600" size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
      case 'UNFREEZE':
        return 'text-green-600';
      case 'WITHDRAW':
      case 'DEDUCT':
        return 'text-red-600';
      case 'FREEZE':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading wallet..." />
      </div>
    );
  }

  const availableBalance = wallet ? wallet.balance - wallet.frozenBalance : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
            <p className="text-gray-600">Manage your funds and view transaction history</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Wallet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Balance */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Wallet size={32} />
                <span className="text-sm opacity-90">Total Balance</span>
              </div>
              <p className="text-4xl font-bold">${wallet?.balance.toFixed(2) || '0.00'}</p>
            </div>

            {/* Available Balance */}
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={32} />
                <span className="text-sm opacity-90">Available</span>
              </div>
              <p className="text-4xl font-bold">${availableBalance.toFixed(2)}</p>
              <p className="text-sm opacity-75 mt-2">Can be used for bidding</p>
            </div>

            {/* Frozen Balance */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Lock size={32} />
                <span className="text-sm opacity-90">Frozen</span>
              </div>
              <p className="text-4xl font-bold">${wallet?.frozenBalance.toFixed(2) || '0.00'}</p>
              <p className="text-sm opacity-75 mt-2">Locked in active bids</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => {
                setShowDepositModal(true);
                setError('');
                setAmount('');
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
            >
              <TrendingUp className="mr-2" size={20} />
              Deposit Funds
            </button>

            <button
              onClick={() => {
                setShowWithdrawModal(true);
                setError('');
                setAmount('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
            >
              <TrendingDown className="mr-2" size={20} />
              Withdraw Funds
            </button>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            </div>

            <div className="overflow-x-auto">
              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No transactions yet</p>
                  <p className="text-gray-400 text-sm mt-2">Your transaction history will appear here</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.walletTransactionId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransactionIcon(tx.transactionType)}
                            <span className={`ml-2 font-semibold ${getTransactionColor(tx.transactionType)}`}>
                              {tx.transactionType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{tx.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-lg font-bold ${getTransactionColor(tx.transactionType)}`}>
                            ${tx.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">
                              ${tx.balanceAfter.toFixed(2)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Available: ${tx.availableAfter.toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(tx.createdAt), 'PPp')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Deposit Funds"
        size="md"
      >
        <form onSubmit={handleDeposit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              required
              autoFocus
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CreditCard className="text-blue-600 mr-3 mt-1" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Simulation Mode</p>
                <p>This is a simulated deposit. In production, you would enter payment details here.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDepositModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {processing ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Funds"
        size="md"
      >
        <form onSubmit={handleWithdraw}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: $${availableBalance.toFixed(2)}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required
              autoFocus
            />
            <p className="text-sm text-gray-600 mt-2">
              Available balance: ${availableBalance.toFixed(2)}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Note</p>
                <p>You can only withdraw your available balance. Frozen funds (locked in active bids) cannot be withdrawn.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {processing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
