'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auctionAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuctionCard from '@/components/AuctionCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Package, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function MyAuctionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    ended: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyAuctions();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchMyAuctions, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchMyAuctions = async () => {
    if (!user) return;
    try {
      const response = await auctionAPI.getSellerAuctions(user.userId);
      const myAuctions = response.data;
      setAuctions(myAuctions);

      // Calculate stats
      const total = myAuctions.length;
      const active = myAuctions.filter((a: any) => a.status === 'ACTIVE' || a.status === 'ENDING_SOON').length;
      const ended = myAuctions.filter((a: any) => a.status === 'ENDED').length;
      const totalRevenue = myAuctions
        .filter((a: any) => a.status === 'ENDED' && a.winner)
        .reduce((sum: number, a: any) => sum + (a.currentPrice || 0), 0);

      setStats({ total, active, ended, totalRevenue });
    } catch (error) {
      console.error('Error fetching my auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your auctions..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Auctions</h1>
              <p className="text-gray-600">Manage your auction listings</p>
            </div>

            <button
              onClick={() => router.push('/auctions/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Create Auction
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-blue-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Auctions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-green-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-gray-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Ended</p>
              <p className="text-3xl font-bold text-gray-900">{stats.ended}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Auctions List */}
          {auctions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No auctions yet</h3>
              <p className="text-gray-600 mb-6">Create your first auction to start selling</p>
              <button
                onClick={() => router.push('/auctions/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Create Auction
              </button>
            </div>
          ) : (
            <>
              {/* Active Auctions */}
              {auctions.filter((a) => a.status === 'ACTIVE' || a.status === 'ENDING_SOON').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Auctions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions
                      .filter((a) => a.status === 'ACTIVE' || a.status === 'ENDING_SOON')
                      .map((auction) => (
                        <AuctionCard key={auction.auctionId} auction={auction} showActions={false} />
                      ))}
                  </div>
                </div>
              )}

              {/* Pending Auctions */}
              {auctions.filter((a) => a.status === 'PENDING').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Approval</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions
                      .filter((a) => a.status === 'PENDING')
                      .map((auction) => (
                        <AuctionCard key={auction.auctionId} auction={auction} showActions={false} />
                      ))}
                  </div>
                </div>
              )}

              {/* Ended Auctions */}
              {auctions.filter((a) => a.status === 'ENDED').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ended Auctions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions
                      .filter((a) => a.status === 'ENDED')
                      .map((auction) => (
                        <div key={auction.auctionId} className="relative">
                          <AuctionCard auction={auction} showActions={false} />
                          {auction.winner && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Sold to {auction.winner.username}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Cancelled Auctions */}
              {auctions.filter((a) => a.status === 'CANCELLED').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancelled</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions
                      .filter((a) => a.status === 'CANCELLED')
                      .map((auction) => (
                        <AuctionCard key={auction.auctionId} auction={auction} showActions={false} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
