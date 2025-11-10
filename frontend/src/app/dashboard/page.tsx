'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { auctionAPI, userAPI } from '@/lib/api';
import { Gavel, TrendingUp, DollarSign, Clock } from 'lucide-react';
import StatsCard from '@/components/StatsCard';

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [userBids, setUserBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [auctionsRes, bidsRes] = await Promise.all([
        auctionAPI.getActiveAuctions().catch(() => ({ data: [] })),
        userAPI.getUserBids().catch(() => ({ data: [] })),
      ]);
      setAuctions(auctionsRes.data);
      setUserBids(bidsRes.data);
    } catch (error) {
      console.warn('Dashboard data not available - API may not be running');
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="My Balance"
              value={`$${user?.balance?.toLocaleString() || '0'}`}
              icon={<DollarSign size={24} />}
              color="green"
            />
            <StatsCard
              title="Active Bids"
              value={userBids.length}
              icon={<TrendingUp size={24} />}
              color="blue"
            />
            <StatsCard
              title="Active Auctions"
              value={auctions.length}
              icon={<Gavel size={24} />}
              color="orange"
            />
            <StatsCard
              title="Won Auctions"
              value={0}
              icon={<Clock size={24} />}
              color="purple"
            />
          </div>

          {/* Active Auctions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Auctions</h2>
            {auctions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active auctions at the moment</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctions.slice(0, 6).map((auction) => (
                  <div key={auction.auctionId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">{auction.itemName}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{auction.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        ${auction.currentPrice?.toLocaleString()}
                      </span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Bid Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
