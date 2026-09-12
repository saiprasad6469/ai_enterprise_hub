'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Instantly redirect to login as public registration is disabled
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold text-slate-400">Redirecting to login portal...</p>
      </div>
    </div>
  );
}
