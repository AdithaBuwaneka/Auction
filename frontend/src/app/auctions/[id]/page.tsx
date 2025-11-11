'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auctionAPI, bidAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CountdownTimer from '@/components/CountdownTimer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Clock, DollarSign, User, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Auction {
  auctionId: number;
  itemName: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  startingPrice: number;
  status: string;
  currentDeadline: string;
  mandatoryEndTime: string;
  startTime: string;
  bidGapDuration: number;
  seller: {
    userId: number;
    username: string;
    email: string;
  };
  winner: {
    userId: number;
    username: string;
  } | null;
}

interface Bid {
  bidId: number;
  bidAmount: number;
  bidTime: string;
  status: string;
  bidder: {
    userId: number;
    username: string;
  };
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auctionId = params.id as string;

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    fetchAuctionDetails();
    fetchBids();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchAuctionDetails();
      fetchBids();
    }, 5000);

    return () => clearInterval(interval);
  }, [auctionId, user, authLoading]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await auctionAPI.getAuctionById(Number(auctionId));
      setAuction(response.data);
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await bidAPI.getAuctionBids(Number(auctionId));
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction || !user) return;

    const amount = parseFloat(bidAmount);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (amount <= auction.currentPrice) {
      setError(`Bid must be higher than current price ($${auction.currentPrice})`);
      return;
    }

    if (auction.seller.userId === user.userId) {
      setError('You cannot bid on your own auction');
      return;
    }

    setBidding(true);
    setError('');
    setSuccess('');

    try {
      await bidAPI.placeBid(auction.auctionId, user.userId, amount);
      setSuccess('Bid placed successfully!');
      setBidAmount('');

      // Refresh auction and bids
      await fetchAuctionDetails();
      await fetchBids();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error placing bid:', error);
      setError(error.response?.data?.error || 'Failed to place bid. Please try again.');
    } finally {
      setBidding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      ENDING_SOON: 'bg-orange-100 text-orange-800',
      ENDED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  const getBidStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      WINNING: 'text-green-600',
      OUTBID: 'text-red-600',
      WON: 'text-green-700 font-bold',
      LOST: 'text-gray-600',
      ACCEPTED: 'text-blue-600',
    };
    return colors[status] || 'text-gray-600';
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading auction details..." />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-4">The auction you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Auction Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Auction Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Image */}
                <div className="relative h-96 bg-gray-200">
                  {auction.imageUrl ? (
                    <img
                      src={auction.imageUrl}
                      alt={auction.itemName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(auction.status)}`}>
                      {auction.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.itemName}</h1>
                  <p className="text-gray-700 text-lg mb-6">{auction.description}</p>

                  {/* Seller Info */}
                  <div className="flex items-center text-gray-600 mb-4 pb-4 border-b">
                    <User size={20} className="mr-2" />
                    <span>Seller: <span className="font-semibold">{auction.seller.username}</span></span>
                  </div>

                  {/* Auction Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Started</p>
                      <p className="font-semibold">{format(new Date(auction.startTime), 'PPp')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Ends By</p>
                      <p className="font-semibold">{format(new Date(auction.mandatoryEndTime), 'PPp')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Starting Price</p>
                      <p className="font-semibold text-blue-600">${auction.startingPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Bid Gap Duration</p>
                      <p className="font-semibold">{auction.bidGapDuration} seconds</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="mr-2" />
                  Bid History ({bids.length})
                </h2>

                {bids.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bids yet. Be the first to bid!</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bids.map((bid, index) => (
                      <div
                        key={bid.bidId}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          index === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            index === 0 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                          } font-bold text-sm`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{bid.bidder.username}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(bid.bidTime), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            ${bid.bidAmount.toLocaleString()}
                          </p>
                          <p className={`text-xs font-semibold ${getBidStatusColor(bid.status)}`}>
                            {bid.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Bidding Panel */}
            <div className="space-y-6">
              {/* Current Price Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Current Bid</p>
                <p className="text-4xl font-bold mb-4 flex items-center">
                  <DollarSign size={32} />
                  {auction.currentPrice.toLocaleString()}
                </p>
                {auction.status === 'ACTIVE' || auction.status === 'ENDING_SOON' ? (
                  <CountdownTimer endTime={auction.currentDeadline} />
                ) : null}
              </div>

              {/* Bid Form */}
              {auction.status === 'ACTIVE' || auction.status === 'ENDING_SOON' ? (
                auction.seller.userId !== user?.userId ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Place Your Bid</h3>

                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                        {success}
                      </div>
                    )}

                    <form onSubmit={handlePlaceBid}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Bid Amount ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={auction.currentPrice + 0.01}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Min: $${(auction.currentPrice + 0.01).toFixed(2)}`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bidding}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                          bidding
                            ? 'bg-gray-400 cursor-not-allowed'
                            : auction.status === 'ENDING_SOON'
                            ? 'bg-orange-600 hover:bg-orange-700 animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {bidding ? 'Placing Bid...' : auction.status === 'ENDING_SOON' ? 'Bid Now - Ending Soon!' : 'Place Bid'}
                      </button>
                    </form>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                      By placing a bid, funds will be frozen in your wallet until you are outbid or win the auction.
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-2" />
                    <p className="text-yellow-800 font-semibold">This is your auction</p>
                    <p className="text-yellow-700 text-sm mt-1">You cannot bid on your own auction</p>
                  </div>
                )
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-500 mb-2" />
                  <p className="text-gray-800 font-semibold">Auction {auction.status.toLowerCase()}</p>
                  {auction.winner && (
                    <p className="text-gray-700 text-sm mt-2">
                      Winner: <span className="font-bold">{auction.winner.username}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Winner Card */}
              {auction.winner && auction.status === 'ENDED' && (
                <div className={`rounded-lg shadow-md p-6 ${
                  auction.winner.userId === user?.userId
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-gray-50'
                }`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {auction.winner.userId === user?.userId ? 'Congratulations!' : 'Auction Winner'}
                  </h3>
                  <p className="text-gray-700">
                    {auction.winner.userId === user?.userId
                      ? 'You won this auction!'
                      : `Won by ${auction.winner.username}`}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    ${auction.currentPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
