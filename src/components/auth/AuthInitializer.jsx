'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { cookieStorage, hasValidAuth, getStoredAuth } from '@/lib/utils';

export default function AuthInitializer() {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Try to fetch profile on mount to check if user is logged in via cookies
    const initAuth = async () => {
      // Skip if already authenticated
      if (isAuthenticated && user) {
        console.log('✅ AuthInitializer: Already authenticated', { role: user.role });
        return;
      }
      
      // Check if we might have a session
      if (!hasValidAuth()) {
        console.log('🔓 AuthInitializer: No token found in cookies, skipping profile fetch');
        return;
      }
      
      // Try to determine the role from stored state before hydration
      const storedUser = getStoredAuth();
      const currentRole = user?.role || storedUser?.role;
      
      try {
        // Pass the role if we have it to avoid the "guess and check" 401/403 cycle
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
