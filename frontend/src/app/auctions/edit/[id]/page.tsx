'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auctionAPI, fileUploadAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Upload, Calendar, DollarSign, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function EditAuctionPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    startTime: '',
    mandatoryEndTime: '',
    bidGapDurationSeconds: '120',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [auction, setAuction] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAuction();
  }, [user, auctionId]);

  const fetchAuction = async () => {
    try {
      const response = await auctionAPI.getAuctionById(parseInt(auctionId));
      const auctionData = response.data;

      // Check if user is the seller
      if (auctionData.seller.userId !== user?.userId) {
        setError('You are not authorized to edit this auction');
        setLoading(false);
        return;
      }

      // Check if auction can be edited
      if (auctionData.status !== 'PENDING' && !(auctionData.status === 'ACTIVE' && !auctionData.currentPrice)) {
        setError('This auction cannot be edited');
        setLoading(false);
        return;
      }

      setAuction(auctionData);

      // Format dates for datetime-local input
      const formatDateTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, "yyyy-MM-dd'T'HH:mm");
      };

      setFormData({
        itemName: auctionData.itemName || '',
        description: auctionData.description || '',
        startingPrice: auctionData.startingPrice?.toString() || '',
        startTime: formatDateTime(auctionData.startTime),
        mandatoryEndTime: formatDateTime(auctionData.mandatoryEndTime),
        bidGapDurationSeconds: auctionData.bidGapDurationSeconds?.toString() || '120',
        imageUrl: auctionData.imageUrl || '',
      });

      if (auctionData.imageUrl) {
        setImagePreview(auctionData.imageUrl);
      }
    } catch (error: any) {
      console.error('Error fetching auction:', error);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return;
    }

    const price = parseFloat(formData.startingPrice);
    if (isNaN(price) || price <= 0) {
      setError('Starting price must be greater than 0');
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.mandatoryEndTime);
    const now = new Date();

    if (endTime <= now) {
      setError('End time must be in the future');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      let imageUrl = formData.imageUrl;

      // Upload image file if provided
      if (imageFile) {
        try {
          const uploadResponse = await fileUploadAPI.uploadAuctionImage(imageFile);
          imageUrl = `http://localhost:8080${uploadResponse.data.url}`;
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          setError(uploadError.response?.data?.error || 'Failed to upload image');
          setUpdating(false);
          return;
        }
      }

      const auctionData = {
        sellerId: user.userId,
        itemName: formData.itemName,
        description: formData.description,
        startingPrice: price,
        startTime: formData.startTime,
        mandatoryEndTime: formData.mandatoryEndTime,
        bidGapDurationSeconds: parseInt(formData.bidGapDurationSeconds),
        imageUrl: imageUrl,
      };

      await auctionAPI.updateAuction(parseInt(auctionId), auctionData);

      // Redirect to my auctions page
      router.push('/my-auctions');
    } catch (error: any) {
      console.error('Error updating auction:', error);
      setError(error.response?.data?.error || 'Failed to update auction. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading auction..." />
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">Error</h3>
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => router.push('/my-auctions')}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Back to My Auctions
                </button>
              </div>
            </div>
          </main>
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
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Auction</h1>
              <p className="text-gray-600">Update your auction listing details</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-start">
                <AlertCircle className="mr-2 mt-0.5" size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g., Vintage Watch, Gaming Laptop"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about the item..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({ ...formData, imageUrl: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* File Input */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image URL (Alternative) */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or provide image URL</span>
                    </div>
                  </div>

                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Starting Price */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Starting Price ($) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="number"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    placeholder="100.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Date and Time Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    End Time *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="datetime-local"
                      name="mandatoryEndTime"
                      value={formData.mandatoryEndTime}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bid Gap Duration */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bid Gap Duration (seconds) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="number"
                    name="bidGapDurationSeconds"
                    value={formData.bidGapDurationSeconds}
                    onChange={handleChange}
                    min="30"
                    max="600"
                    placeholder="120"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Time added to deadline after each new bid (30-600 seconds)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="text-blue-600 mr-3 mt-0.5" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Edit Rules</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>You can only edit auctions that are PENDING or ACTIVE without bids</li>
                      <li>Changes will be applied immediately</li>
                      <li>Make sure all information is accurate before saving</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${
                    updating
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {updating ? 'Updating Auction...' : 'Update Auction'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
