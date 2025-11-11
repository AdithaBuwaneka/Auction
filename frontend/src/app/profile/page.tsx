'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Trophy, TrendingUp, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    createdAt: '',
    role: '',
  });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalAuctions: 0,
    totalBids: 0,
    auctionsWon: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [user, authLoading]);

  const loadProfile = () => {
    if (!user) return;

    // Safely handle createdAt date
    let createdAtValue = '';
    if (user.createdAt) {
      try {
        // Validate the date
        const date = new Date(user.createdAt);
        if (!isNaN(date.getTime())) {
          createdAtValue = user.createdAt;
        }
      } catch (e) {
        console.error('Invalid createdAt date:', user.createdAt);
      }
    }

    setProfileData({
      username: user.username,
      email: user.email,
      createdAt: createdAtValue,
      role: user.role,
    });

    setEditForm({
      username: user.username,
      email: user.email,
    });

    // In a real app, fetch these stats from the backend
    // For now, using mock data
    setStats({
      totalAuctions: 0,
      totalBids: 0,
      auctionsWon: 0,
      totalSpent: 0,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!editForm.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update profile via API - use user ID from context
      if (!user) throw new Error('User not available');
      const payload = { username: editForm.username, email: editForm.email };
      console.debug('Updating profile for user', user.userId, payload);
      const response = await userAPI.updateProfile(user.userId, payload);
      console.debug('Update profile response:', response?.data);

      // Update local state
      setProfileData({
        ...profileData,
        username: editForm.username,
        email: editForm.email,
      });

      // Update context
      if (updateUser) {
        updateUser({
          ...user,
          username: editForm.username,
          email: editForm.email,
        });
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Try to extract error message from various possible shapes
      const message = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to update profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      username: profileData.username,
      email: profileData.email,
    });
    setEditing(false);
    setError('');
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Header with Avatar */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-16 mb-6">
                  <div className="flex items-end gap-4">
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{profileData.username}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          profileData.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield size={12} className="inline mr-1" />
                          {profileData.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                      <Edit2 size={18} className="mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Username
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                        {profileData.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                        {profileData.email}
                      </p>
                    )}
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Member Since
                    </label>
                    <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                      {profileData.createdAt ? format(new Date(profileData.createdAt), 'PPP') : 'N/A'}
                    </p>
                  </div>

                  {/* Wallet Balance */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-2" />
                      Wallet Balance
                    </label>
                    <p className="text-gray-900 text-lg px-4 py-3 bg-green-50 rounded-lg font-bold text-green-600">
                      ${user.balance?.toLocaleString() || '0.00'}
                    </p>
                  </div>

                  {/* Action Buttons (when editing) */}
                  {editing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <X size={20} className="mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex-1 font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors ${
                          saving
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Save size={20} className="mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <Package className="text-blue-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm mb-1">My Auctions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAuctions}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm mb-1">Total Bids</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBids}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="text-yellow-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm mb-1">Auctions Won</p>
                <p className="text-3xl font-bold text-gray-900">{stats.auctionsWon}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/wallet')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
                >
                  <DollarSign size={20} className="mr-2" />
                  Manage Wallet
                </button>

                <button
                  onClick={() => router.push('/my-auctions')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Package size={20} className="mr-2" />
                  My Auctions
                </button>

                <button
                  onClick={() => router.push('/my-bids')}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
                >
                  <TrendingUp size={20} className="mr-2" />
                  My Bids
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
