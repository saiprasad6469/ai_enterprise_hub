'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm font-semibold text-muted-foreground">Redirecting to workspace dashboard...</p>
    </div>
  );
}
