'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bidAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TrendingUp, DollarSign, Trophy, X, AlertCircle, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Bid {
  bidId: number;
  bidAmount: number;
  bidTime: string;
  status: string;
  auction: {
    auctionId: number;
    itemName: string;
    description: string;
    imageUrl: string;
    currentPrice: number;
    status: string;
    currentDeadline: string;
    seller: {
      username: string;
    };
  };
}

export default function MyBidsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    winning: 0,
    won: 0,
    lost: 0,
    totalBidAmount: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyBids();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchMyBids, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchMyBids = async () => {
    if (!user) return;
    try {
      const response = await bidAPI.getUserBids(user.userId);
      const myBids = response.data;
      setBids(myBids);

      // Calculate stats
      const total = myBids.length;
      const winning = myBids.filter((b: Bid) => b.status === 'WINNING').length;
      const won = myBids.filter((b: Bid) => b.status === 'WON').length;
      const lost = myBids.filter((b: Bid) => b.status === 'LOST' || b.status === 'OUTBID').length;
      const totalBidAmount = myBids
        .filter((b: Bid) => b.status === 'WINNING' || b.status === 'WON')
        .reduce((sum: number, b: Bid) => sum + b.bidAmount, 0);

      setStats({ total, winning, won, lost, totalBidAmount });
    } catch (error) {
      console.error('Error fetching my bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBidStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      WINNING: 'bg-green-100 text-green-800',
      OUTBID: 'bg-red-100 text-red-800',
      WON: 'bg-green-100 text-green-800 font-bold',
      LOST: 'bg-gray-100 text-gray-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBidStatusIcon = (status: string) => {
    switch (status) {
      case 'WINNING':
        return <TrendingUp className="text-green-600" size={16} />;
      case 'WON':
        return <Trophy className="text-green-600" size={16} />;
      case 'OUTBID':
      case 'LOST':
        return <X className="text-red-600" size={16} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your bids..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bids</h1>
            <p className="text-gray-600">Track all your bidding activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Bids</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Currently Winning</p>
              <p className="text-3xl font-bold text-green-600">{stats.winning}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="text-green-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Auctions Won</p>
              <p className="text-3xl font-bold text-green-600">{stats.won}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-orange-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Active Bid Amount</p>
              <p className="text-3xl font-bold text-orange-600">
                ${stats.totalBidAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Bids List */}
          {bids.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <TrendingUp className="mx-auto h-24 w-24" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bids yet</h3>
              <p className="text-gray-600 mb-6">Start bidding on auctions to see your activity here</p>
              <button
                onClick={() => router.push('/auctions')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Browse Auctions
              </button>
            </div>
          ) : (
            <>
              {/* Winning Bids */}
              {bids.filter((b) => b.status === 'WINNING').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-green-600" />
                    Currently Winning ({bids.filter((b) => b.status === 'WINNING').length})
                  </h2>
                  <div className="space-y-4">
                    {bids
                      .filter((b) => b.status === 'WINNING')
                      .map((bid) => (
                        <div key={bid.bidId} className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
                          <div className="flex items-start gap-4">
                            {/* Image */}
                            <Link href={`/auctions/${bid.auction.auctionId}`}>
                              <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80">
                                {bid.auction.imageUrl ? (
                                  <img
                                    src={bid.auction.imageUrl}
                                    alt={bid.auction.itemName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </Link>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Link href={`/auctions/${bid.auction.auctionId}`}>
                                    <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                                      {bid.auction.itemName}
                                    </h3>
                                  </Link>
                                  <p className="text-gray-600 text-sm mb-2">Seller: {bid.auction.seller.username}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBidStatusColor(bid.status)} flex items-center gap-1`}>
                                  {getBidStatusIcon(bid.status)}
                                  {bid.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Your Bid</p>
                                  <p className="text-lg font-bold text-green-600">${bid.bidAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Current Price</p>
                                  <p className="text-lg font-bold text-gray-900">${bid.auction.currentPrice.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Bid Time</p>
                                  <p className="text-sm text-gray-700">{formatDistanceToNow(new Date(bid.bidTime), { addSuffix: true })}</p>
                                </div>
                                <div>
                                  <Link href={`/auctions/${bid.auction.auctionId}`}>
                                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center text-sm">
                                      View Auction
                                      <ExternalLink size={14} className="ml-1" />
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Won Bids */}
              {bids.filter((b) => b.status === 'WON').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Trophy className="mr-2 text-green-600" />
                    Auctions Won ({bids.filter((b) => b.status === 'WON').length})
                  </h2>
                  <div className="space-y-4">
                    {bids
                      .filter((b) => b.status === 'WON')
                      .map((bid) => (
                        <div key={bid.bidId} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                          <div className="flex items-start gap-4">
                            <Link href={`/auctions/${bid.auction.auctionId}`}>
                              <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80">
                                {bid.auction.imageUrl ? (
                                  <img src={bid.auction.imageUrl} alt={bid.auction.itemName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </Link>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Link href={`/auctions/${bid.auction.auctionId}`}>
                                    <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer">{bid.auction.itemName}</h3>
                                  </Link>
                                  <p className="text-gray-600 text-sm">Seller: {bid.auction.seller.username}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBidStatusColor(bid.status)} flex items-center gap-1`}>
                                  {getBidStatusIcon(bid.status)}
                                  {bid.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Winning Bid</p>
                                  <p className="text-lg font-bold text-green-600">${bid.bidAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Won Date</p>
                                  <p className="text-sm text-gray-700">{format(new Date(bid.bidTime), 'PP')}</p>
                                </div>
                                <div>
                                  <Link href={`/auctions/${bid.auction.auctionId}`}>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                                      View Details
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Outbid/Lost Bids */}
              {bids.filter((b) => b.status === 'OUTBID' || b.status === 'LOST').length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <X className="mr-2 text-gray-600" />
                    Past Bids ({bids.filter((b) => b.status === 'OUTBID' || b.status === 'LOST').length})
                  </h2>
                  <div className="space-y-3">
                    {bids
                      .filter((b) => b.status === 'OUTBID' || b.status === 'LOST')
                      .slice(0, 10)
                      .map((bid) => (
                        <div key={bid.bidId} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Link href={`/auctions/${bid.auction.auctionId}`}>
                                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80">
                                  {bid.auction.imageUrl ? (
                                    <img src={bid.auction.imageUrl} alt={bid.auction.itemName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </Link>
                              <div>
                                <Link href={`/auctions/${bid.auction.auctionId}`}>
                                  <h4 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{bid.auction.itemName}</h4>
                                </Link>
                                <p className="text-sm text-gray-600">{formatDistanceToNow(new Date(bid.bidTime), { addSuffix: true })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Your Bid</p>
                                <p className="font-bold text-gray-900">${bid.bidAmount.toLocaleString()}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBidStatusColor(bid.status)} flex items-center gap-1`}>
                                {getBidStatusIcon(bid.status)}
                                {bid.status}
                              </span>
                            </div>
                          </div>
                        </div>
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
