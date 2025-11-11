'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuctionCard from '@/components/AuctionCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auctionAPI, bidAPI, walletAPI, notificationAPI, transactionAPI } from '@/lib/api';
import { Gavel, TrendingUp, DollarSign, Trophy, Bell, Clock, Package, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [wallet, setWallet] = useState({ balance: 0, frozenBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [biddingActivity, setBiddingActivity] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [bidStatusData, setBidStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDashboardData();

      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchDashboardData, 10000);
      return () => clearInterval(interval);
    }
  }, [user, isLoading, router]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [auctionsRes, bidsRes, myAuctionsRes, walletRes, notificationsRes] = await Promise.all([
        auctionAPI.getActiveAuctions().catch(() => ({ data: [] })),
        bidAPI.getUserBids(user.userId).catch(() => ({ data: [] })),
        auctionAPI.getSellerAuctions(user.userId).catch(() => ({ data: [] })),
        walletAPI.getBalance(user.userId).catch(() => ({ data: { balance: 0, frozenBalance: 0 } })),
        notificationAPI.getUserNotifications(user.userId).catch(() => ({ data: [] })),
      ]);

      setActiveAuctions(auctionsRes.data.slice(0, 8));
      setMyBids(bidsRes.data);
      setMyAuctions(myAuctionsRes.data);
      setWallet(walletRes.data);
      setNotifications(notificationsRes.data.slice(0, 5));

      // Calculate bidding activity (last 7 days)
      const biddingByDay = calculateBiddingActivity(bidsRes.data);
      setBiddingActivity(biddingByDay);

      // Calculate spending trend
      const spending = calculateSpendingData(bidsRes.data);
      setSpendingData(spending);

      // Calculate bid status distribution
      const bidStatus = calculateBidStatus(bidsRes.data);
      setBidStatusData(bidStatus);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBiddingActivity = (bids: any[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activity = days.map(day => ({ day, bids: 0, amount: 0 }));

    bids.forEach((bid: any) => {
      const date = new Date(bid.bidTime);
      const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
      if (activity[dayIndex]) {
        activity[dayIndex].bids++;
        activity[dayIndex].amount += bid.bidAmount;
      }
    });

    return activity;
  };

  const calculateSpendingData = (bids: any[]) => {
    const monthlySpending: any = {};
    bids.forEach((bid: any) => {
      const date = new Date(bid.bidTime);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlySpending[month]) {
        monthlySpending[month] = 0;
      }
      monthlySpending[month] += bid.bidAmount;
    });

    return Object.keys(monthlySpending).map(month => ({
      month,
      spending: monthlySpending[month]
    }));
  };

  const calculateBidStatus = (bids: any[]) => {
    const statusCount: any = { WINNING: 0, OUTBID: 0, WON: 0, LOST: 0 };
    bids.forEach((bid: any) => {
      if (bid.status && statusCount.hasOwnProperty(bid.status)) {
        statusCount[bid.status]++;
      }
    });

    return Object.keys(statusCount).map(status => ({
      name: status,
      value: statusCount[status]
    })).filter(item => item.value > 0);
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const winningBids = myBids.filter((b: any) => b.status === 'WINNING').length;
  const wonAuctions = myBids.filter((b: any) => b.status === 'WON').length;
  const activeMyAuctions = myAuctions.filter((a: any) => a.status === 'ACTIVE' || a.status === 'ENDING_SOON').length;
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;
  const availableBalance = wallet.balance - wallet.frozenBalance;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}! 👋</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your auctions today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Wallet Balance */}
            <Link href="/wallet">
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={28} />
                  <span className="text-sm opacity-90">Available</span>
                </div>
                <p className="text-3xl font-bold mb-1">${availableBalance.toFixed(2)}</p>
                <p className="text-sm opacity-75">Total: ${wallet.balance.toFixed(2)}</p>
              </div>
            </Link>

            {/* Winning Bids */}
            <Link href="/my-bids">
              <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-blue-600" size={28} />
                  <span className="text-2xl font-bold text-blue-600">{winningBids}</span>
                </div>
                <p className="text-gray-900 font-semibold">Winning Bids</p>
                <p className="text-gray-600 text-sm">Currently leading</p>
              </div>
            </Link>

            {/* Auctions Won */}
            <Link href="/my-bids">
              <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="text-green-600" size={28} />
                  <span className="text-2xl font-bold text-green-600">{wonAuctions}</span>
                </div>
                <p className="text-gray-900 font-semibold">Auctions Won</p>
                <p className="text-gray-600 text-sm">All time</p>
              </div>
            </Link>

            {/* My Active Auctions */}
            <Link href="/my-auctions">
              <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <Package className="text-purple-600" size={28} />
                  <span className="text-2xl font-bold text-purple-600">{activeMyAuctions}</span>
                </div>
                <p className="text-gray-900 font-semibold">My Active Auctions</p>
                <p className="text-gray-600 text-sm">Currently selling</p>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/auctions/create">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors shadow-md">
                <Plus size={20} className="mr-2" />
                Create New Auction
              </button>
            </Link>

            <Link href="/auctions">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors shadow-md border border-gray-200">
                <Gavel size={20} className="mr-2" />
                Browse Auctions
              </button>
            </Link>

            <Link href="/wallet">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors shadow-md border border-gray-200">
                <DollarSign size={20} className="mr-2" />
                Manage Wallet
              </button>
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bidding Activity Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-blue-600" size={20} />
                Weekly Bidding Activity
              </h3>
              {biddingActivity.length > 0 && biddingActivity.some(d => d.bids > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={biddingActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bids" fill="#3b82f6" name="Number of Bids" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Gavel className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No bidding activity yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start bidding to see your activity</p>
                  </div>
                </div>
              )}
            </div>

            {/* Spending Trend Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="mr-2 text-green-600" size={20} />
                Monthly Spending Trend
              </h3>
              {spendingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="spending" stroke="#10b981" strokeWidth={3} name="Total Spending ($)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No spending data yet</p>
                    <p className="text-sm text-gray-400 mt-1">Place bids to track your spending</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bid Status Distribution & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bid Status Pie Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="mr-2 text-purple-600" size={20} />
                Bid Status Distribution
              </h3>
              {bidStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bidStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bidStatusData.map((entry, index) => {
                        const COLORS: any = { WINNING: '#10b981', WON: '#3b82f6', OUTBID: '#f59e0b', LOST: '#ef4444' };
                        return <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No bid data yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start bidding to see your performance</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Total Bids Placed</span>
                    <span className="font-bold text-gray-900">{myBids.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Active Listings</span>
                    <span className="font-bold text-gray-900">{activeMyAuctions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Frozen Balance</span>
                    <span className="font-bold text-orange-600">${wallet.frozenBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">Success Rate</span>
                    <span className="font-bold text-green-600">
                      {myBids.length > 0 ? Math.round((wonAuctions / myBids.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                    <p className="text-sm text-blue-800">
                      Track your bidding patterns to improve your success rate!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
