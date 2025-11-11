'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notificationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Bell, Check, Trash2, ExternalLink, TrendingUp, Trophy, AlertCircle, Gavel, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedAuctionId?: number;
  relatedBidId?: number;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchNotifications();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await notificationAPI.getUserNotifications(user.userId);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      for (const notification of unreadNotifications) {
        await notificationAPI.markAsRead(notification.notificationId);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) return;

    try {
      await notificationAPI.clearAllNotifications(user.userId);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BID_PLACED':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'OUTBID':
        return <AlertCircle className="text-orange-600" size={20} />;
      case 'AUCTION_WON':
        return <Trophy className="text-green-600" size={20} />;
      case 'AUCTION_LOST':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'AUCTION_ENDED':
        return <Clock className="text-gray-600" size={20} />;
      case 'ENDING_SOON':
        return <Clock className="text-orange-600" size={20} />;
      case 'STARTED':
        return <Gavel className="text-blue-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BID_PLACED':
      case 'STARTED':
        return 'bg-blue-50 border-blue-200';
      case 'OUTBID':
      case 'ENDING_SOON':
        return 'bg-orange-50 border-orange-200';
      case 'AUCTION_WON':
        return 'bg-green-50 border-green-200';
      case 'AUCTION_LOST':
        return 'bg-red-50 border-red-200';
      case 'AUCTION_ENDED':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading notifications..." />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Bell className="mr-3" size={32} />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-gray-600">Stay updated with your auction activity</p>
            </div>

            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <Check size={20} className="mr-2" />
                  Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <Trash2 size={20} className="mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  filter === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  filter === 'unread'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Bell className="mx-auto h-24 w-24 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'unread'
                  ? 'All caught up! Check back later for new updates.'
                  : "You'll receive notifications about your auction activity here"}
              </p>
              {filter === 'unread' && (
                <button
                  onClick={() => setFilter('all')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  View All Notifications
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`rounded-lg shadow-sm border-l-4 p-5 transition-all ${
                    notification.isRead ? 'bg-white border-gray-300 opacity-75' : getNotificationColor(notification.type)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{notification.message}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {notification.relatedAuctionId && (
                            <Link href={`/auctions/${notification.relatedAuctionId}`}>
                              <button
                                onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
                              >
                                View Auction
                                <ExternalLink size={14} className="ml-1" />
                              </button>
                            </Link>
                          )}

                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.notificationId)}
                              className="text-gray-600 hover:text-gray-800 font-semibold text-sm flex items-center"
                            >
                              <Check size={14} className="mr-1" />
                              Mark as Read
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotification(notification.notificationId)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete button - top right corner */}
                    <button
                      onClick={() => deleteNotification(notification.notificationId)}
                      className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More (placeholder for pagination) */}
          {filteredNotifications.length > 0 && filteredNotifications.length >= 20 && (
            <div className="mt-6 text-center">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
                Load More
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
