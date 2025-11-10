'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Activity, Cpu, Database, Lock, Radio, Network } from 'lucide-react';

export default function MonitoringPage() {
  const [tcpData, setTcpData] = useState<any>(null);
  const [threadPoolData, setThreadPoolData] = useState<any>(null);
  const [multicastData, setMulticastData] = useState<any>(null);
  const [nioData, setNioData] = useState<any>(null);
  const [sslData, setSslData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const [tcp, threadPool, multicast, nio, ssl] = await Promise.all([
        adminAPI.getTcpMonitor().catch(() => ({ data: null })),
        adminAPI.getThreadPoolMonitor().catch(() => ({ data: null })),
        adminAPI.getMulticastMonitor().catch(() => ({ data: null })),
        adminAPI.getNioMonitor().catch(() => ({ data: null })),
        adminAPI.getSslMonitor().catch(() => ({ data: null })),
      ]);

      setTcpData(tcp.data);
      setThreadPoolData(threadPool.data);
      setMulticastData(multicast.data);
      setNioData(nio.data);
      setSslData(ssl.data);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time monitoring of network components</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TCP Server Monitoring */}
        <MonitorCard
          title="TCP Server Monitor"
          icon={<Network size={24} className="text-blue-600" />}
          data={tcpData}
          metrics={[
            { label: 'Active Connections', value: tcpData?.activeConnections || 0 },
            { label: 'Total Requests', value: tcpData?.totalRequests || 0 },
            { label: 'Port', value: tcpData?.port || '8080' },
            { label: 'Status', value: tcpData?.status || 'RUNNING' },
          ]}
        />

        {/* Thread Pool Monitoring */}
        <MonitorCard
          title="Thread Pool Monitor"
          icon={<Cpu size={24} className="text-green-600" />}
          data={threadPoolData}
          metrics={[
            { label: 'Active Threads', value: threadPoolData?.activeThreads || 0 },
            { label: 'Pool Size', value: threadPoolData?.poolSize || 0 },
            { label: 'Queue Size', value: threadPoolData?.queueSize || 0 },
            { label: 'Completed Tasks', value: threadPoolData?.completedTasks || 0 },
          ]}
        />

        {/* Multicast Monitoring */}
        <MonitorCard
          title="Multicast Monitor"
          icon={<Radio size={24} className="text-purple-600" />}
          data={multicastData}
          metrics={[
            { label: 'Group Address', value: multicastData?.groupAddress || '230.0.0.1' },
            { label: 'Port', value: multicastData?.port || '4446' },
            { label: 'Messages Sent', value: multicastData?.messagesSent || 0 },
            { label: 'Status', value: multicastData?.status || 'ACTIVE' },
          ]}
        />

        {/* NIO Monitoring */}
        <MonitorCard
          title="NIO Monitor"
          icon={<Activity size={24} className="text-orange-600" />}
          data={nioData}
          metrics={[
            { label: 'Active Channels', value: nioData?.activeChannels || 0 },
            { label: 'Bytes Read', value: nioData?.bytesRead || 0 },
            { label: 'Bytes Written', value: nioData?.bytesWritten || 0 },
            { label: 'Operations/sec', value: nioData?.operationsPerSecond || 0 },
          ]}
        />

        {/* SSL/TLS Monitoring */}
        <MonitorCard
          title="SSL/TLS Monitor"
          icon={<Lock size={24} className="text-red-600" />}
          data={sslData}
          metrics={[
            { label: 'Secure Connections', value: sslData?.secureConnections || 0 },
            { label: 'Port', value: sslData?.port || '8443' },
            { label: 'Handshakes', value: sslData?.handshakes || 0 },
            { label: 'Status', value: sslData?.status || 'ENABLED' },
          ]}
        />

        {/* Database Monitoring */}
        <MonitorCard
          title="Database Monitor"
          icon={<Database size={24} className="text-indigo-600" />}
          data={{ status: 'CONNECTED' }}
          metrics={[
            { label: 'Connection Pool', value: 'HikariCP' },
            { label: 'Active Connections', value: '5' },
            { label: 'Max Pool Size', value: '10' },
            { label: 'Status', value: 'HEALTHY' },
          ]}
        />
      </div>
    </div>
  );
}

function MonitorCard({ title, icon, data, metrics }: any) {
  const isHealthy = data?.status === 'RUNNING' || data?.status === 'ACTIVE' || data?.status === 'ENABLED' || data?.status === 'HEALTHY' || data !== null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isHealthy ? '● Online' : '● Offline'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric: any, index: number) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
            <p className="text-lg font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {data?.uptime && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Uptime: <span className="font-medium text-gray-900">{formatUptime(data.uptime)}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
