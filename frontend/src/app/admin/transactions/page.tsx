'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { Search, DollarSign, CheckCircle, XCircle, Clock, Download, Receipt, Wallet } from 'lucide-react';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<'auction' | 'wallet'>('auction');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [transactionsRes, walletRes] = await Promise.all([
        adminAPI.getAllTransactions().catch((err) => {
          console.error('Failed to fetch auction transactions:', err);
          return { data: [] };
        }),
        adminAPI.getAllWalletTransactions().catch((err) => {
          console.error('Failed to fetch wallet transactions:', err);
          return { data: [] };
        }),
      ]);
      setTransactions(transactionsRes.data || []);
      setWalletTransactions(walletRes.data || []);
      console.log('Fetched transactions:', transactionsRes.data?.length || 0);
      console.log('Fetched wallet transactions:', walletRes.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
      setWalletTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (activeTab === 'auction') {
      // Export Auction Payments
      const csvHeaders = ['ID', 'Auction', 'Buyer', 'Seller', 'Amount', 'Status', 'Date'];
      const csvRows = filteredTransactions.map(t => [
        t.transactionId,
        t.auction?.itemName || 'N/A',
        t.buyer?.username || 'N/A',
        t.seller?.username || 'N/A',
        t.amount,
        t.status,
        new Date(t.transactionTime).toLocaleString()
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auction-payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Export Wallet Transactions
      const csvHeaders = ['ID', 'User ID', 'Type', 'Amount', 'Balance After', 'Description', 'Date'];
      const csvRows = walletTransactions.map(wt => [
        wt.walletTransactionId,
        wt.userId,
        wt.transactionType,
        wt.amount,
        wt.balanceAfter,
        wt.description || '',
        new Date(wt.createdAt).toLocaleString()
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.auction?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyer?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.seller?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Platform revenue = 20% of all completed transactions
  const totalRevenue = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.amount * 0.20), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600 mt-1">Monitor all platform transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download size={18} />
          Export {activeTab === 'auction' ? 'Auction Payments' : 'Wallet Transactions'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('auction')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'auction'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt size={20} />
            Auction Payments ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'wallet'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wallet size={20} />
            Wallet Transactions ({walletTransactions.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Transactions"
          value={transactions.length}
          icon={<DollarSign size={24} />}
          color="blue"
        />
        <StatCard
          title="Platform Revenue (20%)"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="green"
        />
        <StatCard
          title="Completed"
          value={transactions.filter(t => t.status === 'COMPLETED').length}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={transactions.filter(t => t.status === 'PENDING').length}
          icon={<Clock size={24} />}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auction Payments Table */}
      {activeTab === 'auction' && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.transactionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{transaction.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.auction?.itemName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.buyer?.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.seller?.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ${transaction.amount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.transactionTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No transactions found matching your criteria
            </div>
          )}
        </>
      )}

      {/* Wallet Transactions Table */}
      {activeTab === 'wallet' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="w-36 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {walletTransactions.map((wt: any) => (
                  <tr key={wt.walletTransactionId} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-900">
                      #{wt.walletTransactionId}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      #{wt.userId}
                    </td>
                    <td className="px-3 py-3">
                      <WalletTransactionTypeBadge type={wt.transactionType} />
                    </td>
                    <td className="px-3 py-3">
                      <div className={`text-xs font-bold ${
                        wt.transactionType === 'BUYER_PAYMENT' || wt.transactionType === 'DEDUCT' || wt.transactionType === 'WITHDRAW' || wt.transactionType === 'FREEZE'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {wt.transactionType === 'BUYER_PAYMENT' || wt.transactionType === 'DEDUCT' || wt.transactionType === 'WITHDRAW' || wt.transactionType === 'FREEZE' ? '-' : '+'}
                        ${wt.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900">
                      ${wt.balanceAfter?.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 truncate" title={wt.description}>
                      {wt.description}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {new Date(wt.createdAt).toLocaleDateString()}<br/>
                      <span className="text-gray-400">{new Date(wt.createdAt).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {walletTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No wallet transactions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: any = {
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    PENDING: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Clock },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
      <Icon size={14} />
      {status}
    </span>
  );
}

function WalletTransactionTypeBadge({ type }: { type: string }) {
  const typeConfig: any = {
    BUYER_PAYMENT: { bg: 'bg-red-100', text: 'text-red-800' },
    SELLER_PAYMENT: { bg: 'bg-green-100', text: 'text-green-800' },
    SYSTEM_FEE: { bg: 'bg-purple-100', text: 'text-purple-800' },
    DEPOSIT: { bg: 'bg-blue-100', text: 'text-blue-800' },
    WITHDRAW: { bg: 'bg-orange-100', text: 'text-orange-800' },
    FREEZE: { bg: 'bg-gray-100', text: 'text-gray-800' },
    UNFREEZE: { bg: 'bg-gray-100', text: 'text-gray-800' },
    DEDUCT: { bg: 'bg-red-100', text: 'text-red-800' },
    REFUND: { bg: 'bg-green-100', text: 'text-green-800' },
    ADMIN_ADJUSTMENT: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  };

  const config = typeConfig[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${config.bg} ${config.text}`}>
      {type}
    </span>
  );
}
