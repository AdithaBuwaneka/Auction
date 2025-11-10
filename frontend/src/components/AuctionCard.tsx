'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, User, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuctionCardProps {
  auction: {
    auctionId: number;
    itemName: string;
    description?: string;
    imageUrl?: string;
    currentPrice: number;
    startingPrice: number;
    status: string;
    currentDeadline?: string;
    mandatoryEndTime?: string;
    seller?: {
      username: string;
    };
  };
  showActions?: boolean;
  onBid?: () => void;
}

export default function AuctionCard({ auction, showActions = true, onBid }: AuctionCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ENDING_SOON':
        return 'bg-orange-100 text-orange-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTimeRemaining = () => {
    const deadline = auction.currentDeadline || auction.mandatoryEndTime;
    if (!deadline) return 'No deadline';

    try {
      const endTime = new Date(deadline);
      if (endTime < new Date()) return 'Ended';
      return formatDistanceToNow(endTime, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Image */}
      <Link href={`/auctions/${auction.auctionId}`}>
        <div className="relative h-48 bg-gray-200">
          {auction.imageUrl && !imageError ? (
            <img
              src={auction.imageUrl}
              alt={auction.itemName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500">No Image</p>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
              {auction.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/auctions/${auction.auctionId}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 line-clamp-1">
            {auction.itemName}
          </h3>
        </Link>

        {auction.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{auction.description}</p>
        )}

        {/* Seller */}
        {auction.seller && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <User size={14} className="mr-1" />
            <span>{auction.seller.username}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="text-xl font-bold text-green-600 flex items-center">
              <DollarSign size={20} />
              {auction.currentPrice?.toLocaleString() || auction.startingPrice?.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Starting Price</p>
            <p className="text-sm font-semibold text-gray-700">
              ${auction.startingPrice?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        {(auction.currentDeadline || auction.mandatoryEndTime) && (
          <div className="flex items-center text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
            <Clock size={14} className="mr-2 text-orange-500" />
            <span className="font-medium">{getTimeRemaining()}</span>
          </div>
        )}

        {/* Action Button */}
        {showActions && auction.status === 'ACTIVE' && (
          <Link href={`/auctions/${auction.auctionId}`}>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              onClick={(e) => {
                if (onBid) {
                  e.preventDefault();
                  onBid();
                }
              }}
            >
              Place Bid
            </button>
          </Link>
        )}

        {showActions && auction.status === 'ENDING_SOON' && (
          <Link href={`/auctions/${auction.auctionId}`}>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 animate-pulse">
              Ending Soon - Bid Now!
            </button>
          </Link>
        )}

        {auction.status === 'ENDED' && (
          <Link href={`/auctions/${auction.auctionId}`}>
            <button className="w-full bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed">
              Auction Ended
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
