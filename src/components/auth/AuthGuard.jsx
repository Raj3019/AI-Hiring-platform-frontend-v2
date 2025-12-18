'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
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
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Normalize the user's role
  const userRole = normalizeRole(user?.role);
  
  // Check if user has allowed role
  const isAllowed = hasAllowedRole(user?.role, allowedRoles);
  
  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('🔒 AuthGuard Debug:', {
        pathname,
        rawRole: user?.role,
        normalizedRole: userRole,
        allowedRoles,
        isAuthenticated,
        isAllowed,
        hasUser: !!user
      });
    }
  }, [mounted, user?.role, userRole, pathname, allowedRoles, isAuthenticated, isAllowed, user]);

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // If not authenticated, redirect to login
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
  }, [mounted, isAuthenticated, userRole, router, pathname, allowedRoles, isAllowed]);

  // Show loader while mounting or checking auth
  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  if (!isAuthenticated || !isAllowed) {
    console.log('🔒 AuthGuard: Showing loader', { isAuthenticated, isAllowed });
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  console.log('🔒 AuthGuard: Rendering children');
  return children;
}
