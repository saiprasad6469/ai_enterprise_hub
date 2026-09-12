'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    // Simple client-side route guard simulation
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Accessing workspace secure vault...</p>
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
