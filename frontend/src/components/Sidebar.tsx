'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Gavel,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  Activity,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Gavel, label: 'Auctions', href: '/admin/auctions' },
  { icon: DollarSign, label: 'Transactions', href: '/admin/transactions' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Activity, label: 'Monitoring', href: '/admin/monitoring' },
  { icon: FileText, label: 'Logs', href: '/admin/logs' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const userNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Gavel, label: 'Auctions', href: '/auctions' },
  { icon: User, label: 'My Bids', href: '/my-bids' },
  { icon: DollarSign, label: 'Wallet', href: '/wallet' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-blue-400">
              {isAdmin ? '🛡️ Admin Panel' : '🏛️ Auction System'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {user?.username}
              {isAdmin && <span className="ml-2 px-2 py-0.5 bg-blue-600 rounded text-xs">ADMIN</span>}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-800 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-lg font-bold text-green-400">
                ${user?.balance?.toLocaleString() || '0.00'}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
