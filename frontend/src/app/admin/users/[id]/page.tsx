'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { User } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, User as UserIcon, Mail, Calendar, Shield, DollarSign, Lock, Package, TrendingUp, Ban, CheckCircle } from 'lucide-react';

export default function UserDetailPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminAPI.getUserById(parseInt(userId));
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async () => {
    if (!user) return;

    const action = user.isActive ? 'ban' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      return;
    }

    try {
      await adminAPI.banUser(user.userId);
      alert(`User ${action}d successfully`);
      fetchUserDetails();
    } catch (error) {
      console.error('Failed to toggle ban status:', error);
      alert('Failed to update user status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading user details..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">{error || 'User not found'}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        <p className="text-gray-600 mt-1">View and manage user information</p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <Shield size={12} className="inline mr-1" />
                    {user.role}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBanToggle}
              className={`font-semibold py-2 px-6 rounded-lg flex items-center transition-colors ${
                user.isActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {user.isActive ? (
                <>
                  <Ban size={18} className="mr-2" />
                  Ban User
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Activate User
                </>
              )}
            </button>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                {user.email}
              </p>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <UserIcon size={16} className="inline mr-2" />
                User ID
              </label>
              <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                #{user.userId}
              </p>
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Member Since
              </label>
              <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Shield size={16} className="inline mr-2" />
                Account Status
              </label>
              <p className="text-gray-900 text-lg px-4 py-3 bg-gray-50 rounded-lg">
                {user.isActive ? '✅ Active' : '🚫 Banned'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            ${user.balance?.toLocaleString() || '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Lock className="text-orange-600" size={24} />
          </div>
          <p className="text-gray-600 text-sm mb-1">Frozen Balance</p>
          <p className="text-3xl font-bold text-orange-600">
            ${user.frozenBalance?.toLocaleString() || '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <p className="text-gray-600 text-sm mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-blue-600">
            ${((user.balance || 0) - (user.frozenBalance || 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(`/admin/users/${user.userId}/auctions`)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <Package size={20} className="mr-2" />
            View Auctions
          </button>

          <button
            onClick={() => router.push(`/admin/users/${user.userId}/bids`)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <TrendingUp size={20} className="mr-2" />
            View Bids
          </button>

          <button
            onClick={() => router.push(`/admin/users/${user.userId}/transactions`)}
            className="bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <DollarSign size={20} className="mr-2" />
            View Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
