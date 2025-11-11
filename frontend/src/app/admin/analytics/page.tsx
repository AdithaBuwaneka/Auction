'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI, auctionAPI } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Gavel, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [statsRes, transactionsRes, auctionsRes, usersRes] = await Promise.all([
        adminAPI.getDashboardStats().catch(() => ({ data: null })),
        adminAPI.getAllTransactions().catch(() => ({ data: [] })),
        adminAPI.getAllAuctions().catch(() => ({ data: [] })),
        adminAPI.getAllUsers().catch(() => ({ data: [] })),
      ]);

      const transactions = transactionsRes.data || [];
      const auctions = auctionsRes.data || [];
      const users = usersRes.data || [];

      // Calculate real stats
      const completedTransactions = transactions.filter((t: any) => t.status === 'COMPLETED');
      const platformRevenue = completedTransactions.reduce((sum: number, t: any) => sum + (t.amount * 0.20), 0);

      // Calculate monthly revenue (20% platform fee)
      const monthlyRevData = calculateMonthlyRevenue(transactions);

      // Calculate auction status distribution
      const categoryDist = calculateAuctionDistribution(auctions);

      // Calculate user growth (mock data for now)
      const userGrowth = calculateUserGrowth(users);

      const updatedStats = {
        ...statsRes.data,
        totalRevenue: platformRevenue,
        totalUsers: users.length,
        totalAuctions: auctions.length,
        averageBidValue: completedTransactions.length > 0
          ? completedTransactions.reduce((sum: number, t: any) => sum + t.amount, 0) / completedTransactions.length
          : 0,
      };

      setStats(updatedStats);
      setRevenueData(monthlyRevData);
      setCategoryData(categoryDist);
      setUserGrowthData(userGrowth);
    } catch (error) {
      console.warn('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (transactions: any[]) => {
    const monthlyData: any = {};
    transactions
      .filter((t: any) => t.status === 'COMPLETED')
      .forEach((t: any) => {
        const date = new Date(t.transactionTime);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, revenue: 0, transactions: 0 };
        }
        monthlyData[monthKey].revenue += t.amount * 0.20;
        monthlyData[monthKey].transactions += 1;
      });

    return Object.values(monthlyData);
  };

  const calculateAuctionDistribution = (auctions: any[]) => {
    const statusCounts: any = {};
    auctions.forEach((a: any) => {
      const status = a.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      percent: statusCounts[status] / auctions.length
    }));
  };

  const calculateUserGrowth = (users: any[]) => {
    // Simple week-based aggregation
    const weekData: any = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    users.forEach((u: any) => {
      const date = new Date(u.createdAt);
      const dayOfMonth = date.getDate();
      if (dayOfMonth <= 7) weekData['Week 1']++;
      else if (dayOfMonth <= 14) weekData['Week 2']++;
      else if (dayOfMonth <= 21) weekData['Week 3']++;
      else weekData['Week 4']++;
    });

    return Object.keys(weekData).map(week => ({
      week,
      users: weekData[week]
    }));
  };

  const exportAnalyticsToPDF = () => {
    // Create HTML content for PDF
    const reportDate = new Date().toLocaleDateString();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report - ${reportDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
          .metric-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
          .metric-title { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
          .metric-value { color: #1f2937; font-size: 32px; font-weight: bold; }
          .metric-change { color: #10b981; font-size: 12px; margin-top: 8px; }
          .section { margin: 30px 0; }
          .section-title { color: #1f2937; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; font-weight: 600; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Auction Platform Analytics Report</h1>
          <p>Generated on ${reportDate}</p>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-title">Platform Revenue (20%)</div>
            <div class="metric-value">$${stats?.totalRevenue?.toFixed(2) || '0'}</div>
            <div class="metric-change">From all completed auctions</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Users</div>
            <div class="metric-value">${stats?.totalUsers || 0}</div>
            <div class="metric-change">All registered users</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Auctions</div>
            <div class="metric-value">${stats?.totalAuctions || 0}</div>
            <div class="metric-change">All platform auctions</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Avg. Transaction Value</div>
            <div class="metric-value">$${stats?.averageBidValue?.toFixed(2) || '0'}</div>
            <div class="metric-change">Per completed auction</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Monthly Revenue Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Platform Revenue (20%)</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              ${revenueData.map((item: any) => `
                <tr>
                  <td>${item.month}</td>
                  <td>$${item.revenue?.toFixed(2)}</td>
                  <td>${item.transactions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Auction Status Distribution</div>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${categoryData.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.value}</td>
                  <td>${(item.percent * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Auction Platform Analytics Report</p>
          <p>This report contains confidential information</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);

    alert('Analytics report exported! Open the HTML file in your browser and use Print > Save as PDF to create a PDF.');
  };

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
        <button
          onClick={exportAnalyticsToPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download size={18} />
          Export PDF Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Platform Revenue (20%)"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0'}`}
          change="From all completed auctions"
          icon={<DollarSign size={24} />}
          positive={true}
        />
        <MetricCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change="All registered users"
          icon={<Users size={24} />}
          positive={true}
        />
        <MetricCard
          title="Total Auctions"
          value={stats?.totalAuctions?.toLocaleString() || '0'}
          change="All platform auctions"
          icon={<Gavel size={24} />}
          positive={true}
        />
        <MetricCard
          title="Avg. Transaction Value"
          value={`$${stats?.averageBidValue?.toFixed(2) || '0'}`}
          change="Per completed auction"
          icon={<TrendingUp size={24} />}
          positive={true}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue & Transactions</h3>
          {revenueData.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Auction Categories</h3>
          {categoryData.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth Trend</h3>
        {userGrowthData.length > 0 ? (
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
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No user growth data available
          </div>
        )}
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
