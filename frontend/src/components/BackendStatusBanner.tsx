'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { adminAPI } from '@/lib/api';

export default function BackendStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      await adminAPI.getSystemHealth();
      setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    }
  };

  if (!isOffline || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">Backend API Not Connected</p>
            <p className="text-sm text-orange-100">
              The backend server appears to be offline. Please start the backend at{' '}
              <code className="bg-orange-600 px-1 rounded">http://localhost:8080</code>
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-orange-600 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
