'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Auction } from '@/lib/types';
import { Search, Eye, CheckCircle, XCircle, Clock, Gavel } from 'lucide-react';
import Link from 'next/link';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'ended'>('all');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await adminAPI.getAllAuctions();
      setAuctions(response.data);
    } catch (error) {
      console.warn('Failed to fetch auctions - API may not be available');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAuction = async (auctionId: number) => {
    try {
      await adminAPI.approveAuction(auctionId);
      fetchAuctions();
    } catch (error: any) {
      console.warn('Failed to approve auction:', error.response?.status);
      alert('Failed to approve auction. This feature may not be available yet.');
    }
  };

  const handleCancelAuction = async (auctionId: number) => {
    if (!confirm('Are you sure you want to cancel this auction?')) return;
    
    try {
      await adminAPI.cancelAuction(auctionId);
      fetchAuctions();
    } catch (error: any) {
      console.warn('Failed to cancel auction:', error.response?.status);
      alert('Failed to cancel auction. Please ensure the backend is running.');
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || auction.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Auction Management</h1>
        <p className="text-gray-600 mt-1">Manage all platform auctions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Auctions"
          value={auctions.length}
          icon={<Gavel size={24} />}
          color="blue"
        />
        <StatCard
          title="Active"
          value={auctions.filter(a => a.status === 'ACTIVE').length}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={auctions.filter(a => a.status === 'PENDING').length}
          icon={<Clock size={24} />}
          color="orange"
        />
        <StatCard
          title="Ended"
          value={auctions.filter(a => a.status === 'ENDED').length}
          icon={<XCircle size={24} />}
          color="gray"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'ended'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction) => (
          <AuctionCard
            key={auction.auctionId}
            auction={auction}
            onApprove={handleApproveAuction}
            onCancel={handleCancelAuction}
          />
        ))}
      </div>

      {filteredAuctions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No auctions found matching your criteria
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AuctionCard({ auction, onApprove, onCancel }: any) {
  const statusColors: any = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-orange-100 text-orange-800',
    ENDED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-48 bg-gray-200 relative">
        {auction.imageUrl ? (
          <img src={auction.imageUrl} alt={auction.itemName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel size={48} className="text-gray-400" />
          </div>
        )}
        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${statusColors[auction.status]}`}>
          {auction.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{auction.itemName}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{auction.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Price:</span>
            <span className="font-bold text-gray-900">${auction.currentPrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Starting Price:</span>
            <span className="text-gray-700">${auction.startingPrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Bids:</span>
            <span className="text-gray-700">{auction.totalBids || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Seller:</span>
            <span className="text-gray-700">{auction.seller?.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ends:</span>
            <span className="text-gray-700">
              {new Date(auction.mandatoryEndTime).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/admin/auctions/${auction.auctionId}`}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <Eye size={16} className="inline mr-1" />
            View
          </Link>
          {auction.status === 'PENDING' && (
            <button
              onClick={() => onApprove(auction.auctionId)}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          )}
          {auction.status === 'ACTIVE' && (
            <button
              onClick={() => onCancel(auction.auctionId)}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
