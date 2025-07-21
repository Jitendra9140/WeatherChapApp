'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to protect routes that require authentication
 * @param redirectTo - Path to redirect to if not authenticated (default: '/')
 */
export function useAuthProtection(redirectTo: string = '/') {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth state is loaded and user is not logged in
    if (!loading && !isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, loading, redirectTo, router]);

  return { isLoggedIn, loading };
}