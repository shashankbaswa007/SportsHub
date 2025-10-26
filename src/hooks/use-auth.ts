'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const user = localStorage.getItem('sports-hub-user');
    const role = localStorage.getItem('sports-hub-role');
    
    if (!user) {
      // Not logged in, redirect to login page
      router.push('/');
      return;
    }

    // Check admin access
    if (pathname.startsWith('/admin') && role !== 'admin') {
      router.push('/overview');
      return;
    }
  }, [router, pathname]);
}