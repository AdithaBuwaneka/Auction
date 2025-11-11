'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { ArrowLeft, Gavel, User, Clock, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = params?.id as string;

  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auctionId) {
      fetchAuctionDetails();
    }
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        adminAPI.getAuctionById(Number(auctionId)),
        adminAPI.getAuctionBids(Number(auctionId)).catch(() => ({ data: [] })),
      ]);

      setAuction(auctionRes.data);
      setBids(bidsRes.data);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      alert('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this auction?')) return;

    try {
      await adminAPI.approveAuction(Number(auctionId));
      fetchAuctionDetails();
      alert('Auction approved successfully!');
    } catch (error: any) {
      console.error('Error approving auction:', error);
      alert('Failed to approve auction. This feature may not be available yet.');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this auction?')) return;

    try {
      await adminAPI.cancelAuction(Number(auctionId));
      alert('Auction cancelled successfully!');
      router.push('/admin/auctions');
    } catch (error: any) {
      console.error('Error cancelling auction:', error);
      alert('Failed to cancel auction. Please ensure the backend is running.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Auction Not Found</h2>
          <p className="text-red-700 mb-4">The auction you're looking for doesn't exist.</p>
          <Link href="/admin/auctions" className="text-blue-600 hover:underline">
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: any = {
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    PENDING: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    ENDED: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    ENDING_SOON: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  };

  const status = statusColors[auction.status] || statusColors.ACTIVE;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/auctions"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Auctions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Auction Details</h1>
            <p className="text-gray-600">Auction ID: #{auction.auctionId}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${status.bg} ${status.text} ${status.border} border-2`}>
            {auction.status}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Auction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image and Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-80 bg-gray-200 relative">
              {auction.imageUrl ? (
                <img src={auction.imageUrl} alt={auction.itemName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gavel size={64} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{auction.itemName}</h2>
              <p className="text-gray-700 mb-6">{auction.description || 'No description provided'}</p>

              {/* Price Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Starting Price</p>
                  <p className="text-2xl font-bold text-blue-900">${auction.startingPrice?.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-green-900">${auction.currentPrice?.toLocaleString()}</p>
                </div>
              </div>

              {/* Time Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center">
                    <Calendar size={18} className="mr-2" />
                    Start Time
                  </span>
                  <span className="font-semibold text-gray-900">
                    {new Date(auction.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center">
                    <Clock size={18} className="mr-2" />
                    End Time
                  </span>
                  <span className="font-semibold text-gray-900">
                    {new Date(auction.mandatoryEndTime).toLocaleString()}
                  </span>
                </div>
                {auction.currentDeadline && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 flex items-center">
                      <AlertCircle size={18} className="mr-2" />
                      Current Deadline
                    </span>
                    <span className="font-semibold text-orange-600">
                      {new Date(auction.currentDeadline).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 flex items-center">
                    <TrendingUp size={18} className="mr-2" />
                    Total Bids
                  </span>
                  <span className="font-semibold text-gray-900">{auction.bidCount || bids.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Seller Info & Actions */}
        <div className="space-y-6">
          {/* Seller Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2" />
              Seller Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold text-gray-900">{auction.seller?.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{auction.seller?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-semibold text-gray-900">#{auction.seller?.userId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h3>
            <div className="space-y-3">
              {auction.status === 'PENDING' && (
                <button
                  onClick={handleApprove}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Approve Auction
                </button>
              )}
              {auction.status === 'ACTIVE' && (
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <XCircle size={20} className="mr-2" />
                  Cancel Auction
                </button>
              )}
              <Link
                href={`/auctions/${auction.auctionId}`}
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Gavel size={20} className="mr-2" />
                View as User
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Created At</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {new Date(auction.createdAt || auction.startTime).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Bid Gap Duration</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {auction.bidGapDuration
                    ? (typeof auction.bidGapDuration === 'number'
                        ? `${auction.bidGapDuration}s`
                        : auction.bidGapDuration.replace('PT', '').replace('M', ' min').replace('H', ' hr'))
                    : '5 min'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bids Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <DollarSign size={24} className="mr-2" />
          Bid History ({bids.length})
        </h3>
        {bids.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bid ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bidder</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bids.map((bid: any) => (
                  <tr key={bid.bidId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{bid.bidId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bid.bidder?.username || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">${bid.bidAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(bid.bidTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        bid.status === 'WINNING' ? 'bg-green-100 text-green-800' :
                        bid.status === 'WON' ? 'bg-blue-100 text-blue-800' :
                        bid.status === 'OUTBID' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Gavel className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No bids placed yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
