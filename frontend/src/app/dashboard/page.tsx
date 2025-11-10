'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuctionCard from '@/components/AuctionCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auctionAPI, bidAPI, walletAPI, notificationAPI } from '@/lib/api';
import { Gavel, TrendingUp, DollarSign, Trophy, Bell, Clock, Package, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [wallet, setWallet] = useState({ balance: 0, frozenBalance: 0 });
  const [loading, setLoading] = useState(true);

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

      setActiveAuctions(auctionsRes.data.slice(0, 8)); // Show top 8 active auctions
      setMyBids(bidsRes.data);
      setMyAuctions(myAuctionsRes.data);
      setWallet(walletRes.data);
      setNotifications(notificationsRes.data.slice(0, 5)); // Show latest 5 notifications
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Auctions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Winning Bids Section */}
              {winningBids > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <TrendingUp className="mr-2 text-green-600" />
                      You're Winning! ({winningBids})
                    </h2>
                    <Link href="/my-bids">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center">
                        View All
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </Link>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {myBids
                        .filter((b: any) => b.status === 'WINNING')
                        .slice(0, 3)
                        .map((bid: any) => (
                          <Link key={bid.bidId} href={`/auctions/${bid.auction.auctionId}`}>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-bold text-gray-900">{bid.auction.itemName}</h3>
                                  <p className="text-sm text-gray-600">Your bid: ${bid.bidAmount.toLocaleString()}</p>
                                </div>
                                <Trophy className="text-green-600" size={24} />
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Active Auctions */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Gavel className="mr-2 text-blue-600" />
                    Active Auctions
                  </h2>
                  <Link href="/auctions">
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center">
                      View All
                      <ArrowRight size={16} className="ml-1" />
                    </button>
                  </Link>
                </div>

                <div className="p-6">
                  {activeAuctions.length === 0 ? (
                    <div className="text-center py-12">
                      <Gavel className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No active auctions</p>
                      <p className="text-gray-400 text-sm">Check back later for new items</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeAuctions.map((auction) => (
                        <AuctionCard key={auction.auctionId} auction={auction} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Notifications & Activity */}
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Bell className="mr-2 text-blue-600" size={20} />
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </h3>
                  <Link href="/notifications">
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      View All
                    </button>
                  </Link>
                </div>

                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <Link key={notification.notificationId} href="/notifications">
                        <div className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {notification.type === 'OUTBID' && <AlertCircle className="text-orange-600" size={16} />}
                              {notification.type === 'AUCTION_WON' && <Trophy className="text-green-600" size={16} />}
                              {notification.type === 'BID_PLACED' && <TrendingUp className="text-blue-600" size={16} />}
                              {!['OUTBID', 'AUCTION_WON', 'BID_PLACED'].includes(notification.type) && (
                                <Bell className="text-gray-600" size={16} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Stats */}
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

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                    <p className="text-sm text-blue-800">
                      Keep an eye on auctions ending soon! You can find them in the Browse Auctions page with the "Ending Soon" filter.
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
