'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } else {
      // No user, redirect to login
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}