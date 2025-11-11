'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auctionAPI, fileUploadAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuctionCard from '@/components/AuctionCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, Filter, Plus, Edit, Trash2, Upload, X } from 'lucide-react';

export default function AuctionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; auctionId: number | null; auctionName: string }>({
    show: false,
    auctionId: null,
    auctionName: '',
  });
  const [editModal, setEditModal] = useState<{ show: boolean; auction: any | null }>({
    show: false,
    auction: null,
  });
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    imageUrl: '',
    startTime: '',
    mandatoryEndTime: '',
    bidGapDurationSeconds: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    fetchAuctions();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchAuctions, 10000);
    return () => clearInterval(interval);
  }, [user, authLoading]);

  useEffect(() => {
    filterAuctions();
  }, [auctions, searchQuery, statusFilter]);

  const fetchAuctions = async () => {
    try {
      const response = await auctionAPI.getAllAuctions();
      setAuctions(response.data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAuctions = () => {
    let filtered = [...auctions];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.itemName.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.seller?.username.toLowerCase().includes(query)
      );
    }

    setFilteredAuctions(filtered);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredAuctions(auctions);
      return;
    }

    try {
      const response = await auctionAPI.searchAuctions(searchQuery);
      setFilteredAuctions(response.data);
    } catch (error) {
      console.error('Error searching auctions:', error);
    }
  };

  const handleEdit = async (auctionId: number) => {
    try {
      const response = await auctionAPI.getAuctionById(auctionId);
      const auction = response.data;

      // Format datetime for input fields
      const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        // Use local timezone instead of UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Convert duration to seconds
      const getBidGapSeconds = () => {
        if (auction.bidGapDuration) {
          // bidGapDuration is in ISO-8601 format like "PT5M", "PT24H", "PT86400S"
          if (typeof auction.bidGapDuration === 'number') {
            return auction.bidGapDuration.toString();
          }

          // Parse ISO-8601 duration format
          const durationStr = auction.bidGapDuration.toString();
          let totalSeconds = 0;

          // Match hours: PT24H
          const hoursMatch = durationStr.match(/(\d+)H/);
          if (hoursMatch) {
            totalSeconds += parseInt(hoursMatch[1]) * 3600;
          }

          // Match minutes: PT5M
          const minutesMatch = durationStr.match(/(\d+)M/);
          if (minutesMatch) {
            totalSeconds += parseInt(minutesMatch[1]) * 60;
          }

          // Match seconds: PT86400S
          const secondsMatch = durationStr.match(/(\d+)S/);
          if (secondsMatch) {
            totalSeconds += parseInt(secondsMatch[1]);
          }

          return totalSeconds > 0 ? totalSeconds.toString() : '300';
        }
        return '300';
      };

      setEditFormData({
        itemName: auction.itemName || '',
        description: auction.description || '',
        startingPrice: auction.startingPrice?.toString() || '',
        imageUrl: auction.imageUrl || '',
        startTime: formatDateTime(auction.startTime),
        mandatoryEndTime: formatDateTime(auction.mandatoryEndTime),
        bidGapDurationSeconds: getBidGapSeconds(),
      });

      // Set image preview if auction has an image
      if (auction.imageUrl) {
        setImagePreview(auction.imageUrl);
      } else {
        setImagePreview('');
      }
      setImageFile(null);

      setEditModal({ show: true, auction });
    } catch (error) {
      console.error('Error loading auction:', error);
      alert('Failed to load auction details');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Clear the imageUrl when uploading a new file
      setEditFormData({ ...editFormData, imageUrl: '' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setEditFormData({ ...editFormData, imageUrl: '' });
  };

  const handleEditSubmit = async () => {
    if (!editModal.auction || !user) return;

    if (!editFormData.itemName.trim()) {
      alert('Item name is required');
      return;
    }

    const price = parseFloat(editFormData.startingPrice);
    if (isNaN(price) || price <= 0) {
      alert('Starting price must be greater than 0');
      return;
    }

    // Validate time fields
    if (!editFormData.startTime || !editFormData.mandatoryEndTime) {
      alert('Start time and end time are required');
      return;
    }

    const startTime = new Date(editFormData.startTime);
    const endTime = new Date(editFormData.mandatoryEndTime);

    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    const bidGapSeconds = parseInt(editFormData.bidGapDurationSeconds);
    if (isNaN(bidGapSeconds) || bidGapSeconds < 60) {
      alert('Bid gap must be at least 60 seconds');
      return;
    }

    setUpdating(true);
    try {
      let imageUrl = editFormData.imageUrl;

      // Upload image file if provided
      if (imageFile) {
        try {
          const uploadResponse = await fileUploadAPI.uploadAuctionImage(imageFile);
          imageUrl = `http://localhost:8080${uploadResponse.data.url}`;
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          alert(uploadError.response?.data?.error || 'Failed to upload image');
          setUpdating(false);
          return;
        }
      }

      // Convert local datetime to ISO format without timezone conversion
      const toLocalISOString = (dateStr: string) => {
        if (!dateStr) return '';
        // Input format: "YYYY-MM-DDTHH:mm"
        // Output format: "YYYY-MM-DDTHH:mm:ss" (no timezone)
        return dateStr + ':00';
      };

      const auctionData: any = {
        itemName: editFormData.itemName.trim(),
        description: editFormData.description?.trim() || null,
        startingPrice: price,
        imageUrl: imageUrl?.trim() || null,
        startTime: toLocalISOString(editFormData.startTime),
        mandatoryEndTime: toLocalISOString(editFormData.mandatoryEndTime),
        bidGapDurationSeconds: parseInt(editFormData.bidGapDurationSeconds),
      };

      console.log('Updating auction with data:', auctionData);

      await auctionAPI.updateAuction(editModal.auction.auctionId, auctionData);
      setEditModal({ show: false, auction: null });
      setImageFile(null);
      setImagePreview('');
      fetchAuctions();
      alert('Auction updated successfully!');
    } catch (error: any) {
      console.error('Error updating auction:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update auction. Backend may restrict editing for active auctions.';
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleEditCancel = () => {
    setEditModal({ show: false, auction: null });
    setEditFormData({
      itemName: '',
      description: '',
      startingPrice: '',
      imageUrl: '',
      startTime: '',
      mandatoryEndTime: '',
      bidGapDurationSeconds: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleDeleteClick = (auctionId: number, auctionName: string) => {
    setDeleteModal({ show: true, auctionId, auctionName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.auctionId) return;

    setDeleting(true);
    try {
      await auctionAPI.deleteAuction(deleteModal.auctionId);
      setDeleteModal({ show: false, auctionId: null, auctionName: '' });
      fetchAuctions();
      alert('Auction deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting auction:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete auction';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, auctionId: null, auctionName: '' });
  };

  const canEditOrDelete = (auction: any) => {
    // Show edit/delete icons on ALL user's own auctions regardless of status
    // The actual validation happens when user clicks (only PENDING can be edited)
    if (!user || !auction.seller) return false;
    return auction.seller.userId === user.userId;
  };

  const renderAuctionWithActions = (auction: any) => {
    const showActions = canEditOrDelete(auction);

    return (
      <div key={auction.auctionId} className="relative">
        <AuctionCard auction={auction} />

        {/* Action Icons - Top Left */}
        {showActions && (
          <div className="absolute top-4 left-4 flex gap-1.5 z-30">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit(auction.auctionId);
              }}
              className="bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 p-1.5 rounded shadow-md transition-all"
              title="Edit Auction"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteClick(auction.auctionId, auction.itemName);
              }}
              className="bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 p-1.5 rounded shadow-md transition-all"
              title="Delete Auction"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading auctions..." />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Auctions</h1>
              <p className="text-gray-600">Discover and bid on items</p>
            </div>

            <button
              onClick={() => router.push('/auctions/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Create Auction
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by item name, description, or seller..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Status Filter */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="text-gray-400" size={20} />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ENDING_SOON">Ending Soon</option>
                    <option value="PENDING">Pending</option>
                    <option value="ENDED">Ended</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-center md:justify-start">
                <p className="text-gray-600">
                  <span className="font-bold text-gray-900">{filteredAuctions.length}</span> auction{filteredAuctions.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {/* Auctions Grid */}
          {filteredAuctions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No auctions found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create an auction!'}
              </p>
              <button
                onClick={() => router.push('/auctions/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Create Auction
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuctions.map((auction) => renderAuctionWithActions(auction))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editModal.show && editModal.auction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 my-4">
            {/* Header with Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Auction #{editModal.auction.auctionId}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                editModal.auction.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                editModal.auction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                editModal.auction.status === 'ENDED' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {editModal.auction.status}
              </span>
            </div>

            {/* Auction Info Grid - Show all details */}
            <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-gray-50 rounded-md text-xs border border-gray-200">
              <div>
                <p className="text-gray-500 mb-0.5">Auction ID</p>
                <p className="font-semibold text-gray-900">#{editModal.auction.auctionId}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Current Price</p>
                <p className="font-semibold text-green-600">${editModal.auction.currentPrice?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Total Bids</p>
                <p className="font-semibold text-gray-900">{editModal.auction.bidCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Created</p>
                <p className="font-semibold text-gray-900">{new Date(editModal.auction.createdAt || editModal.auction.startTime).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-0.5">Start Time</p>
                <p className="font-semibold text-gray-900">{new Date(editModal.auction.startTime).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-0.5">End Time</p>
                <p className="font-semibold text-gray-900">{new Date(editModal.auction.mandatoryEndTime).toLocaleString()}</p>
              </div>
              {editModal.auction.currentDeadline && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-0.5">Current Deadline</p>
                  <p className="font-semibold text-orange-600">{new Date(editModal.auction.currentDeadline).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 mb-0.5">Bid Gap</p>
                <p className="font-semibold text-gray-900">
                  {editModal.auction.bidGapDuration
                    ? (typeof editModal.auction.bidGapDuration === 'number'
                        ? `${editModal.auction.bidGapDuration}s`
                        : editModal.auction.bidGapDuration.replace('PT', '').replace('M', ' min'))
                    : '5 min'}
                </p>
              </div>
              {editModal.auction.seller && (
                <div>
                  <p className="text-gray-500 mb-0.5">Seller</p>
                  <p className="font-semibold text-gray-900">{editModal.auction.seller.username}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Item Name */}
              <div className="col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={editFormData.itemName}
                  onChange={(e) => setEditFormData({ ...editFormData, itemName: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Item name"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Item description"
                />
              </div>

              {/* Starting Price */}
              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Starting Price ($) *
                </label>
                <input
                  type="number"
                  value={editFormData.startingPrice}
                  onChange={(e) => setEditFormData({ ...editFormData, startingPrice: e.target.value })}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Bid Gap Duration */}
              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Bid Gap (seconds) *
                </label>
                <input
                  type="number"
                  value={editFormData.bidGapDurationSeconds}
                  onChange={(e) => setEditFormData({ ...editFormData, bidGapDurationSeconds: e.target.value })}
                  min="60"
                  step="30"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="300"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={editFormData.mandatoryEndTime}
                  onChange={(e) => setEditFormData({ ...editFormData, mandatoryEndTime: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload Section */}
              <div className="col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Image (Optional)
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mb-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-colors shadow-md"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* File Upload Button - Always visible */}
                <div className="mb-2">
                  <label className="flex items-center justify-center w-full h-24 border-2 border-blue-300 border-dashed rounded-md cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                    <div className="flex flex-col items-center justify-center py-2">
                      <Upload className="w-8 h-8 mb-1 text-blue-500" />
                      <p className="text-xs text-gray-700 font-medium">
                        <span className="font-semibold">Click to upload image</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, GIF (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* OR divider */}
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500 font-medium">Or enter image URL</span>
                  </div>
                </div>

                {/* Image URL Input */}
                <input
                  type="url"
                  value={editFormData.imageUrl}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, imageUrl: e.target.value });
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                      setImageFile(null);
                    } else if (!imageFile) {
                      // Only clear preview if no file is uploaded
                      setImagePreview('');
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleEditCancel}
                disabled={updating}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={updating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Auction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the auction <span className="font-semibold">"{deleteModal.auctionName}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
