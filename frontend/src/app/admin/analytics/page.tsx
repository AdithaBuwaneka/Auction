'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Gavel, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Sample data - replace with real API data
  const revenueData = [
    { month: 'Jan', revenue: 4000, transactions: 240 },
    { month: 'Feb', revenue: 3000, transactions: 198 },
    { month: 'Mar', revenue: 5000, transactions: 300 },
    { month: 'Apr', revenue: 4500, transactions: 278 },
    { month: 'May', revenue: 6000, transactions: 389 },
    { month: 'Jun', revenue: 5500, transactions: 349 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Art', value: 300 },
    { name: 'Collectibles', value: 200 },
    { name: 'Fashion', value: 278 },
    { name: 'Others', value: 189 },
  ];

  const userGrowthData = [
    { week: 'Week 1', users: 120 },
    { week: 'Week 2', users: 180 },
    { week: 'Week 3', users: 250 },
    { week: 'Week 4', users: 320 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

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
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download size={18} />
          Export All Reports
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Revenue"
          value="$28,000"
          change="+23.5%"
          icon={<DollarSign size={24} />}
          positive={true}
        />
        <MetricCard
          title="Total Users"
          value="1,254"
          change="+12.3%"
          icon={<Users size={24} />}
          positive={true}
        />
        <MetricCard
          title="Total Auctions"
          value="456"
          change="+8.1%"
          icon={<Gavel size={24} />}
          positive={true}
        />
        <MetricCard
          title="Avg. Bid Value"
          value="$842"
          change="-2.4%"
          icon={<TrendingUp size={24} />}
          positive={false}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue & Transactions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" />
              <Bar dataKey="transactions" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Auction Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, positive }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-sm mt-2 ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {change} from last month
      </p>
    </div>
  );
}
