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
    if (error.response?.status === 401) {
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
  
  // Transactions
  getAllTransactions: () => api.get('/transactions'),
  getTransactionById: (id: number) => api.get(`/transactions/${id}`),
  
  // Bids
  getAuctionBids: (auctionId: number) => api.get(`/auctions/${auctionId}/bids`),
  
  // System Monitoring
  getSystemHealth: () => api.get('/health'),
  getTcpMonitor: () => api.get('/admin/monitor/tcp'),
  getThreadPoolMonitor: () => api.get('/admin/monitor/threadpool'),
  getMulticastMonitor: () => api.get('/admin/monitor/multicast'),
  getNioMonitor: () => api.get('/admin/monitor/nio'),
  getSslMonitor: () => api.get('/admin/monitor/ssl'),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  getUserWallet: () => api.get('/wallet'),
  getUserBids: () => api.get('/users/me/bids'),
  getUserAuctions: () => api.get('/users/me/auctions'),
  getUserTransactions: () => api.get('/users/me/transactions'),
};

// Auction API
export const auctionAPI = {
  getAllAuctions: () => api.get('/auctions'),
  getAuctionById: (id: number) => api.get(`/auctions/${id}`),
  createAuction: (data: any) => api.post('/auctions', data),
  getActiveAuctions: () => api.get('/auctions/active'),
};

// Bid API
export const bidAPI = {
  placeBid: (auctionId: number, amount: number) =>
    api.post('/bids', { auctionId, amount }),
  getUserBids: () => api.get('/bids/my-bids'),
};

// Transaction API
export const transactionAPI = {
  getUserTransactions: () => api.get('/transactions/my-transactions'),
};
