'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { usePathname } from 'next/navigation';

export default function AuthInitializer() {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Try to fetch profile on mount to check if user is logged in via cookies
    const initAuth = async () => {
      // Determine probable role based on path if user is not set
      let role = 'employee';
      if (pathname.startsWith('/recruiter')) {
        role = 'recuter';
      }

      // Check if we already have a user in the store (from cookie persistence)
      const currentRole = useAuthStore.getState().user?.role;
      
      await fetchProfile(currentRole || role);
    };

    initAuth();
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}
