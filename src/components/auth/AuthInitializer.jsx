'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { cookieStorage } from '@/lib/utils';
import { usePathname } from 'next/navigation';

// Check if token exists in cookies
const hasTokenInCookies = () => {
  if (typeof document === 'undefined') return false;
  const token = cookieStorage.getItem('token');
  const authStorage = cookieStorage.getItem('auth-storage');
  return !!(token || authStorage);
};

export default function AuthInitializer() {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Try to fetch profile on mount to check if user is logged in via cookies
    const initAuth = async () => {
      // Skip if already authenticated
      if (isAuthenticated && user) {
        console.log('✅ AuthInitializer: Already authenticated', { role: user.role });
        return;
      }
      
      // Check if we have a token in cookies
      if (!hasTokenInCookies()) {
        console.log('🔓 AuthInitializer: No token found in cookies, skipping profile fetch');
        return;
      }
      
      console.log('🔄 AuthInitializer: Token found, attempting to restore session...');
      
      // Check if we already have a user in the store (from cookie persistence)
      const currentRole = useAuthStore.getState().user?.role;
      try {
        // Use auto-detect fetch to try recruiter first then employee
        await fetchProfile(currentRole || undefined);
        console.log('✅ AuthInitializer: Session restored successfully');
      } catch (error) {
        console.error('❌ AuthInitializer: Failed to restore session', error);
      }
    };

    initAuth();
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}
