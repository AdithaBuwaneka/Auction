'use client';

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { FileText, AlertCircle, Info, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function LogsPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'transaction' | 'auction' | 'wallet'>('all');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [selectedType]);

  const fetchLogs = async () => {
    try {
      // Fetch real data from transactions and auctions
      const [transactionsRes, auctionsRes, walletRes] = await Promise.all([
        adminAPI.getAllTransactions().catch(() => ({ data: [] })),
        adminAPI.getAllAuctions().catch(() => ({ data: [] })),
        adminAPI.getAllWalletTransactions().catch(() => ({ data: [] })),
      ]);

      const transactions = transactionsRes.data || [];
      const auctions = auctionsRes.data || [];
      const walletTxs = walletRes.data || [];

      // Convert to log format
      const generatedLogs: any[] = [];

      // Transaction logs
      transactions.slice(0, 30).forEach((t: any) => {
        generatedLogs.push({
          id: `txn-${t.transactionId}`,
          type: 'transaction',
          level: t.status === 'COMPLETED' ? 'success' : t.status === 'FAILED' ? 'error' : 'info',
          message: `Transaction #${t.transactionId}: ${t.buyer?.username} → ${t.seller?.username} - $${t.amount}`,
          timestamp: new Date(t.transactionTime)
        });
      });

      // Auction logs
      auctions.slice(0, 30).forEach((a: any) => {
        generatedLogs.push({
          id: `auction-${a.auctionId}`,
          type: 'auction',
          level: a.status === 'ACTIVE' ? 'info' : a.status === 'ENDED' ? 'success' : 'warning',
          message: `Auction #${a.auctionId}: ${a.itemName} - ${a.status}`,
          timestamp: new Date(a.createdAt)
        });
      });

      // Wallet logs (recent)
      walletTxs.slice(0, 20).forEach((w: any) => {
        generatedLogs.push({
          id: `wallet-${w.walletTransactionId}`,
          type: 'wallet',
          level: w.transactionType.includes('PAYMENT') ? 'success' : 'info',
          message: `Wallet #${w.walletTransactionId}: User ${w.userId} - ${w.transactionType} $${w.amount}`,
          timestamp: new Date(w.createdAt)
        });
      });

      // Sort by timestamp
      generatedLogs.sort((a, b) => b.timestamp - a.timestamp);

      setLogs(generatedLogs);
    } catch (error) {
      console.warn('Failed to fetch logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = selectedType === 'all' ? logs : logs.filter(log => log.type === selectedType);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 mt-1">View and monitor system activity logs</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-2">
          {['all', 'transaction', 'auction', 'wallet'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log, index) => (
              <LogEntry key={log.id || index} log={log} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No logs available
          </div>
        )}
      </div>
    </div>
  );
}

function LogEntry({ log }: any) {
  const levelConfig: any = {
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    warning: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  };

  const config = levelConfig[log.level];
  const Icon = config.icon;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon size={20} className={config.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded uppercase">
              {log.type}
            </span>
            <span className="text-sm text-gray-500">
              {log.timestamp.toLocaleString()}
            </span>
          </div>
          <p className="text-gray-900">{log.message}</p>
        </div>
      </div>
    </div>
  );
}
