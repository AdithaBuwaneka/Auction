'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import { adminAPI } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import {
  Users,
  Gavel,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        adminAPI.getDashboardStats().catch(err => ({ data: null })),
        adminAPI.getSystemHealth().catch(err => ({ data: null })),
      ]);
      setStats(statsRes.data);
      setSystemHealth(healthRes.data);
    } catch (error) {
      // Silently handle error - API might not be available yet
      console.warn('Dashboard data not available - using mock data');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sample data for charts (replace with real data from backend)
  const activityData = [
    { name: 'Mon', bids: 40, auctions: 24 },
    { name: 'Tue', bids: 30, auctions: 13 },
    { name: 'Wed', bids: 20, auctions: 38 },
    { name: 'Thu', bids: 27, auctions: 39 },
    { name: 'Fri', bids: 18, auctions: 48 },
    { name: 'Sat', bids: 23, auctions: 38 },
    { name: 'Sun', bids: 34, auctions: 43 },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your auction platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users size={24} />}
          change="+12% from last month"
          changeType="positive"
          color="blue"
        />
        <StatsCard
          title="Active Auctions"
          value={stats?.activeAuctions || 0}
          icon={<Gavel size={24} />}
          change={`${stats?.pendingAuctions || 0} pending approval`}
          changeType="neutral"
          color="green"
        />
        <StatsCard
          title="Total Bids Today"
          value={stats?.totalBidsToday || 0}
          icon={<TrendingUp size={24} />}
          change="+8% from yesterday"
          changeType="positive"
          color="orange"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`}
          icon={<DollarSign size={24} />}
          change="+23% from last month"
          changeType="positive"
          color="purple"
        />
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={24} className="text-blue-600" />
          System Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthIndicator 
            label="Database" 
            status={systemHealth?.components?.database?.status || 'UNKNOWN'} 
          />
          <HealthIndicator 
            label="TCP Server" 
            status={systemHealth?.components?.tcp?.status || 'UNKNOWN'} 
          />
          <HealthIndicator 
            label="SSL/TLS" 
            status={systemHealth?.components?.ssl?.status || 'UNKNOWN'} 
          />
          <HealthIndicator 
            label="Multicast" 
            status={systemHealth?.components?.multicast?.status || 'UNKNOWN'} 
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bids" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="auctions" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats?.recentActivities?.slice(0, 10).map((activity: any, index: number) => (
            <ActivityItem key={index} activity={activity} />
          )) || (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}

function HealthIndicator({ label, status }: { label: string; status: string }) {
  const isUp = status === 'UP' || status === 'HEALTHY';
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {isUp ? (
        <CheckCircle size={20} className="text-green-600" />
      ) : (
        <XCircle size={20} className="text-red-600" />
      )}
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className={`text-xs ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Clock size={16} className="text-gray-400 mt-1" />
      <div className="flex-1">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
