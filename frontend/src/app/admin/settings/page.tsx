'use client';

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Save, Info } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Auction System',
    contactEmail: 'admin@auction.com',
    minBidIncrement: 10,
    maxBidGapMinutes: 60,
    minAuctionDuration: 24,
    maxAuctionDuration: 168,
    defaultStartingBalance: 10000,
    tcpPort: 8080,
    sslPort: 8443,
    multicastGroup: '230.0.0.1',
    multicastPort: 4446,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSystemSettings();
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.warn('Failed to fetch settings - using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSystemSettings(settings);
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please ensure the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform parameters</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Auction Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Auction Rules</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Bid Increment ($)
              </label>
              <input
                type="number"
                value={settings.minBidIncrement}
                onChange={(e) => setSettings({ ...settings, minBidIncrement: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Bid Gap (minutes)
              </label>
              <input
                type="number"
                value={settings.maxBidGapMinutes}
                onChange={(e) => setSettings({ ...settings, maxBidGapMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Auction Duration (hours)
                </label>
                <input
                  type="number"
                  value={settings.minAuctionDuration}
                  onChange={(e) => setSettings({ ...settings, minAuctionDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Auction Duration (hours)
                </label>
                <input
                  type="number"
                  value={settings.maxAuctionDuration}
                  onChange={(e) => setSettings({ ...settings, maxAuctionDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Starting Balance ($)
              </label>
              <input
                type="number"
                value={settings.defaultStartingBalance}
                onChange={(e) => setSettings({ ...settings, defaultStartingBalance: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Network Configuration (Read-only) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Network Configuration</h2>
            <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
              READ ONLY
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TCP Server Port
                </label>
                <input
                  type="text"
                  value={settings.tcpPort}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SSL/TLS Port
                </label>
                <input
                  type="text"
                  value={settings.sslPort}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multicast Group Address
                </label>
                <input
                  type="text"
                  value={settings.multicastGroup}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multicast Port
                </label>
                <input
                  type="text"
                  value={settings.multicastPort}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start gap-2">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">
              Network settings are configured in the backend application.properties file and cannot be changed from the admin panel.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} className={saving ? 'animate-pulse' : ''} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
