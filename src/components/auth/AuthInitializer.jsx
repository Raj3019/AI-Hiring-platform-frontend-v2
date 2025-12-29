'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { cookieStorage, hasValidAuth, getStoredAuth } from '@/lib/utils';

export default function AuthInitializer() {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Try to fetch profile on mount to check if user is logged in via cookies
    const initAuth = async () => {
      if (isAuthenticated && user) return;

      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const isPublicPage = path === '/' || path === '/about' || path === '/jobs' || path.startsWith('/jobs/');
      const hasAuthHint = hasValidAuth();

      // If we are on a public page and have NO auth hint, don't ping the server
      if (isPublicPage && !hasAuthHint) {
        return;
      }

      // Otherwise, try to restore session
      const storedUser = getStoredAuth();
      const currentRole = user?.role || storedUser?.role;

      try {
        await fetchProfile(currentRole || undefined);
      } catch (error) {
        // ignore errors
      }
    };

    initAuth();
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}
