'use client';

import React, { useState } from 'react';
import { FileText, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function LogsPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'tcp' | 'ssl' | 'multicast' | 'nio'>('all');

  // Sample logs - replace with real API data
  const logs = [
    { id: 1, type: 'tcp', level: 'info', message: 'TCP connection established from 192.168.1.100', timestamp: new Date() },
    { id: 2, type: 'ssl', level: 'success', message: 'SSL handshake completed successfully', timestamp: new Date() },
    { id: 3, type: 'multicast', level: 'info', message: 'Multicast message broadcast to group 230.0.0.1', timestamp: new Date() },
    { id: 4, type: 'nio', level: 'warning', message: 'High channel utilization detected', timestamp: new Date() },
    { id: 5, type: 'tcp', level: 'error', message: 'Connection timeout for client 192.168.1.105', timestamp: new Date() },
  ];

  const filteredLogs = selectedType === 'all' ? logs : logs.filter(log => log.type === selectedType);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600 mt-1">View and monitor system activity logs</p>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-2">
          {['all', 'tcp', 'ssl', 'multicast', 'nio'].map((type) => (
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
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
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
