'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auctionAPI, fileUploadAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Upload, Calendar, DollarSign, Clock, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { format, addDays, addHours } from 'date-fns';

export default function CreateAuctionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    mandatoryEndTime: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
    bidGapDurationSeconds: '120',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

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

  const fillDemoData = () => {
    const demoItems = [
      {
        itemName: 'Vintage Rolex Submariner Watch',
        description: 'Authentic 1960s Rolex Submariner in excellent condition. Comes with original box and papers. This timepiece is a true collector\'s item with a beautiful patina on the dial. Recently serviced and keeping excellent time.',
        startingPrice: '5000',
        imageUrl: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600',
      },
      {
        itemName: 'MacBook Pro 16" M3 Max (2024)',
        description: 'Brand new MacBook Pro 16-inch with M3 Max chip, 48GB RAM, 2TB SSD. Space Black finish. Still sealed in original packaging with full warranty. Perfect for developers and creative professionals.',
        startingPrice: '2500',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
      },
      {
        itemName: 'Sony PlayStation 5 Pro Console',
        description: 'Brand new PlayStation 5 Pro with 2TB storage. Includes one DualSense controller and cables. Never opened, factory sealed. Rare limited edition model.',
        startingPrice: '700',
        imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600',
      },
      {
        itemName: 'Canon EOS R5 Mirrorless Camera + Lens Kit',
        description: 'Professional-grade mirrorless camera with 45MP full-frame sensor. Includes RF 24-70mm f/2.8 lens, 3 batteries, charger, and camera bag. Shutter count under 5,000. Perfect condition.',
        startingPrice: '3200',
        imageUrl: 'https://images.unsplash.com/photo-1606980668001-066a5e36bc66?w=600',
      },
      {
        itemName: 'Gaming PC - RTX 4090 Build',
        description: 'High-end gaming PC with RTX 4090, Intel i9-13900K, 64GB DDR5 RAM, 2TB NVMe SSD. Custom water cooling. Built 2 months ago, perfect condition. Includes RGB keyboard, mouse, and gaming headset.',
        startingPrice: '3500',
        imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
      },
    ];

    const randomDemo = demoItems[Math.floor(Math.random() * demoItems.length)];

    setFormData({
      itemName: randomDemo.itemName,
      description: randomDemo.description,
      startingPrice: randomDemo.startingPrice,
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      mandatoryEndTime: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
      bidGapDurationSeconds: '120',
      imageUrl: randomDemo.imageUrl,
    });

    setImagePreview('');
    setImageFile(null);
    setError('');
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

    setCreating(true);
    setError('');

    try {
      let imageUrl = formData.imageUrl;

      // Upload image file if provided
      if (imageFile) {
        try {
          const uploadResponse = await fileUploadAPI.uploadAuctionImage(imageFile);
          // Construct full URL for the uploaded image
          imageUrl = `http://localhost:8080${uploadResponse.data.url}`;
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          setError(uploadError.response?.data?.error || 'Failed to upload image');
          setCreating(false);
          return;
        }
      }

      // If no image provided, use placeholder
      if (!imageUrl) {
        imageUrl = `https://via.placeholder.com/600x400?text=${encodeURIComponent(formData.itemName)}`;
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

      await auctionAPI.createAuction(auctionData);

      // Redirect to my auctions page
      router.push('/my-auctions');
    } catch (error: any) {
      console.error('Error creating auction:', error);
      setError(error.response?.data?.error || 'Failed to create auction. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Auction</h1>
                  <p className="text-gray-600">List an item for auction and start receiving bids</p>
                </div>

                <button
                  type="button"
                  onClick={fillDemoData}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-colors"
                >
                  <Sparkles size={20} className="mr-2" />
                  Demo Fill
                </button>
              </div>
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
                    <p className="font-semibold mb-1">Auction Rules</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Bidders' funds will be frozen until they are outbid or win</li>
                      <li>Each new bid extends the deadline by the bid gap duration</li>
                      <li>The auction will automatically end at the mandatory end time</li>
                      <li>You cannot bid on your own auction</li>
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
                  disabled={creating}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${
                    creating
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {creating ? 'Creating Auction...' : 'Create Auction'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
