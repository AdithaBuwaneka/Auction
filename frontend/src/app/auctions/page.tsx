'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auctionAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuctionCard from '@/components/AuctionCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, Filter, Plus } from 'lucide-react';

export default function AuctionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
              {filteredAuctions.map((auction) => (
                <AuctionCard key={auction.auctionId} auction={auction} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
