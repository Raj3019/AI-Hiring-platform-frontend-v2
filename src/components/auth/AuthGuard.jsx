'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { cookieStorage, hasValidAuth, getStoredAuth } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Helper to check if user has an allowed role
// Backend returns 'Employee' for candidates, frontend uses 'candidate'
const hasAllowedRole = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  
  const lowerUserRole = userRole.toLowerCase();
  
  return allowedRoles.some(allowedRole => {
    const lowerAllowedRole = allowedRole.toLowerCase();
    
    // Handle Employee/candidate equivalence
    if ((lowerUserRole === 'employee' || lowerUserRole === 'candidate') && 
        (lowerAllowedRole === 'employee' || lowerAllowedRole === 'candidate')) {
      return true;
    }
    
    // Handle Recruiter/Recuter equivalence
    if ((lowerUserRole === 'recruiter' || lowerUserRole === 'recuter') && 
        (lowerAllowedRole === 'recruiter' || lowerAllowedRole === 'recuter')) {
      return true;
    }
    
    return lowerUserRole === lowerAllowedRole;
  });
};

// Helper to normalize role for display/routing (API returns 'Employee', frontend uses 'candidate')
const normalizeRole = (role) => {
  if (!role) return null;
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'employee' || lowerRole === 'candidate') return 'candidate';
  if (lowerRole === 'recruiter' || lowerRole === 'recuter') return 'recruiter';
  return role;
};

export default function AuthGuard({ children, allowedRoles }) {
  const { user, isAuthenticated, fetchProfile } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Normalize the user's role
  const userRole = normalizeRole(user?.role);
  
  // Check if user has allowed role
  const isAllowed = hasAllowedRole(user?.role, allowedRoles);
  
  // Debug logging
  useEffect(() => {
    if (mounted) {
      // console.log('🔒 AuthGuard Debug:', {
      //   pathname,
      //   rawRole: user?.role,
      //   normalizedRole: userRole,
      //   allowedRoles,
      //   isAuthenticated,
      //   isAllowed,
      //   hasUser: !!user,
      //   hasToken: hasValidAuth(),
      //   isHydrating
      // });
    }
  }, [mounted, user?.role, userRole, pathname, allowedRoles, isAuthenticated, isAllowed, user, isHydrating]);

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
    
    // Give Zustand persist time to hydrate from cookies
    const checkHydration = async () => {
      // If store says authenticated, we're good
      if (isAuthenticated && user) {
        setIsHydrating(false);
        return;
      }
      
      // If token exists but store not hydrated yet, try to fetch profile (auto-detect)
      if (hasValidAuth() && !isAuthenticated) {
        // console.log('🔄 Token found in cookies but store not hydrated, attempting to restore session (auto)...');
        
        // Try to get stored role to avoid noisy 401s
        const storedUser = getStoredAuth();
        await fetchProfile(storedUser?.role || undefined);
      }
      
      setIsHydrating(false);
    };
    
    // Small delay to allow Zustand to hydrate
    const timer = setTimeout(checkHydration, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || isHydrating) return;

    // Double-check: if token exists but somehow not authenticated, don't redirect yet
    if (!isAuthenticated && hasValidAuth()) {
      // console.log('⏳ Token exists but not authenticated yet, waiting...');
      return;
    }

    // If not authenticated and no token, redirect to login
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    // If authenticated but wrong role, redirect to appropriate dashboard
    if (!isAllowed) {
      if (userRole === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    }
  }, [mounted, isAuthenticated, userRole, router, pathname, allowedRoles, isAllowed, isHydrating]);

  // Show loader while mounting, hydrating, or checking auth
  if (!mounted || isHydrating) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  if (!isAuthenticated || !isAllowed) {
    // If token exists, show loader (might still be hydrating)
    if (hasValidAuth()) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
          <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
        </div>
      );
    }
    
    // console.log('🔒 AuthGuard: Showing loader', { isAuthenticated, isAllowed });
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  // console.log('🔒 AuthGuard: Rendering children');
  return children;
}
