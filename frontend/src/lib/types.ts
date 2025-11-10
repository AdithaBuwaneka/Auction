export interface User {
  userId: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  balance: number;
  frozenBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Auction {
  auctionId: number;
  itemName: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  bidGapMinutes: number;
  mandatoryEndTime: string;
  actualEndTime?: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  seller: User;
  createdAt: string;
  imageUrl?: string;
  totalBids: number;
}

export interface Bid {
  bidId: number;
  auction: Auction;
  bidder: User;
  amount: number;
  bidTime: string;
  isWinning: boolean;
}

export interface Transaction {
  transactionId: number;
  auction: Auction;
  buyer: User;
  seller: User;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionTime: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: number;
  activeConnections: number;
  recentActivities: Activity[];
}

export interface Activity {
  type: 'BID' | 'AUCTION' | 'USER' | 'TRANSACTION';
  message: string;
  timestamp: string;
  userId?: number;
  auctionId?: number;
}

export interface SystemHealth {
  status: 'UP' | 'DOWN';
  components: {
    database: { status: string };
    tcp: { status: string };
    ssl: { status: string };
    multicast: { status: string };
  };
}

export interface MonitorData {
  activeConnections: number;
  totalRequests: number;
  activeThreads: number;
  queueSize: number;
  uptime: number;
}
