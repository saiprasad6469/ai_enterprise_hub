'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  const fetchInitialData = useDataStore((state) => state.fetchInitialData);

  // 1. Wait for Zustand persist store to finish rehydrating from localStorage on page refresh
  React.useEffect(() => {
    if (useAuthStore.persist?.hasHydrated()) {
      setIsHydrated(true);
    }
    const unsub = useAuthStore.persist?.onFinishHydration(() => {
      setIsHydrated(true);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // 2. Perform Route Protection & RBAC Checks ONLY after store hydration is complete
  React.useEffect(() => {
    if (!isHydrated) return;

    // Authentication Route Guard: Block unauthenticated access
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const isSuperAdmin = user.role === 'SuperAdmin' || user.role === 'SUPER_ADMIN';
    const isAdmin = user.role === 'Admin' || user.role === 'ADMIN';

    // Role-Based Route Guards:
    // Protect Super Admin routes
    if (pathname.startsWith('/dashboard/super-admin') && !isSuperAdmin) {
      router.replace(isAdmin ? '/dashboard/admin' : '/dashboard/employee');
      return;
    }

    // Protect Admin-only operations routes
    if (pathname.startsWith('/dashboard/admin') && !isAdmin && !isSuperAdmin) {
      router.replace('/dashboard/employee');
      return;
    }

    setChecking(false);
    fetchInitialData();
  }, [isHydrated, isAuthenticated, user, pathname, router, fetchInitialData]);

  if (!isHydrated || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-10 w-10 text-teal-700 animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Verifying workspace credentials & RBAC authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Right container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky navbar */}
        <Navbar />
        
        {/* Main Content viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
