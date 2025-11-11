import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden (token expired/invalid)
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id: number) => api.get(`/users/${id}`),
  banUser: (id: number) => api.put(`/admin/users/${id}/ban`), // Toggles ban status
  
  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/stats'),
  
  // Auctions
  getAllAuctions: () => api.get('/auctions'),
  getAuctionById: (id: number) => api.get(`/auctions/${id}`),
  approveAuction: (id: number) => api.put(`/admin/auctions/${id}/approve`),
  cancelAuction: (id: number) => api.delete(`/auctions/${id}`),
  
  // Transactions (Main auction payments)
  getAllTransactions: () => api.get('/transactions/admin/all'),
  getTransactionById: (id: number) => api.get(`/transactions/admin/${id}`),

  // Wallet Transactions (Detailed wallet movements)
  getAllWalletTransactions: () => api.get('/admin/wallet/transactions'),
  
  // Bids
  getAuctionBids: (auctionId: number) => api.get(`/auctions/${auctionId}/bids`),
  
  // System Monitoring
  getSystemHealth: () => api.get('/health'),
  getTcpMonitor: () => api.get('/admin/tcp/stats'),
  getThreadPoolMonitor: () => api.get('/admin/threads/pool'),
  getMulticastMonitor: () => api.get('/admin/multicast/stats'),
  getNioMonitor: () => api.get('/admin/nio/stats'),
  getSslMonitor: () => api.get('/admin/ssl/stats'),

  // Logs
  getSystemLogs: (type?: string, limit?: number) =>
    api.get('/admin/logs', { params: { type, limit } }),

  // Settings
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (settings: any) => api.put('/admin/settings', settings),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  getUserById: (id: number) => api.get(`/users/${id}`),
};

// Wallet API
export const walletAPI = {
  getBalance: (userId: number) => api.get(`/wallet/balance/${userId}`),
  getTransactions: (userId: number) => api.get(`/wallet/transactions/${userId}`),
  deposit: (userId: number, amount: number) =>
    api.post('/wallet/deposit', { userId, amount }),
  withdraw: (userId: number, amount: number) =>
    api.post('/wallet/withdraw', { userId, amount }),
};

// Auction API
export const auctionAPI = {
  getAllAuctions: () => api.get('/auctions'),
  getActiveAuctions: () => api.get('/auctions/active'),
  getAuctionById: (id: number) => api.get(`/auctions/${id}`),
  getSellerAuctions: (sellerId: number) => api.get(`/auctions/seller/${sellerId}`),
  createAuction: (data: any) => api.post('/auctions', data),
  updateAuction: (id: number, data: any) => api.put(`/auctions/${id}`, data),
  deleteAuction: (id: number) => api.delete(`/auctions/${id}`),
  searchAuctions: (keyword: string) => api.get(`/auctions/search?keyword=${keyword}`),
  closeAuction: (id: number) => api.post(`/auctions/${id}/close`),
};

// Bid API
export const bidAPI = {
  placeBid: (auctionId: number, bidderId: number, bidAmount: number) =>
    api.post('/bids', { auctionId, bidderId, bidAmount }),
  getUserBids: (userId: number) => api.get(`/bids/user/${userId}`),
  getAuctionBids: (auctionId: number) => api.get(`/bids/auction/${auctionId}`),
  getHighestBid: (auctionId: number) => api.get(`/bids/auction/${auctionId}/highest`),
  getBidById: (bidId: number) => api.get(`/bids/${bidId}`),
};

// Transaction API
export const transactionAPI = {
  getAllTransactions: () => api.get('/transactions'),
  getTransactionById: (id: number) => api.get(`/transactions/${id}`),
  getUserTransactions: (userId: number) => api.get(`/transactions/user/${userId}`),
};

// Notification API
export const notificationAPI = {
  getUserNotifications: (userId: number) => api.get(`/notifications/user/${userId}`),
  markAsRead: (notificationId: number) => api.put(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId: number) => api.delete(`/notifications/${notificationId}`),
  clearAllNotifications: (userId: number) => api.delete(`/notifications/user/${userId}/clear`),
};

// File Upload API
export const fileUploadAPI = {
  uploadAuctionImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/auction-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteAuctionImage: (filename: string) => api.delete(`/upload/auction-image/${filename}`),
};
