'use client';

import * as React from 'react';
import Link from 'next/link';
import { BrainCircuit, Home, LayoutDashboard, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,_#e6f7f5_0%,_#f2faf8_50%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_50%_20%,_#091d1a_0%,_#0c1514_50%,_#090d0e_100%)] text-slate-800 dark:text-slate-100 flex flex-col justify-between items-center px-4 py-12 select-none">
      
      {/* Brand Header */}
      <div className="w-full max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-600/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0d2826] dark:text-teal-200">
            AI Enterprise Hub
          </span>
        </Link>
      </div>

      {/* 404 Center Hero Card */}
      <div className="my-auto max-w-lg w-full text-center space-y-6 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 rounded-3xl border border-teal-200/80 dark:border-teal-900/60 shadow-2xl backdrop-blur-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900 shadow-md">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#00a896]">
            404 • Route Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d2826] dark:text-slate-100">
            Page Missing or Moved
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            The requested vector route or endpoint could not be found in our enterprise routing registry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#006d64] hover:bg-[#005750] text-white px-6 text-xs font-bold shadow-md transition-all"
          >
            <Home className="h-4 w-4" /> Return Home
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-white/90 dark:bg-slate-900 text-teal-800 dark:text-teal-200 px-6 text-xs font-bold hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer copyright note */}
      <p className="text-xs text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} AI Enterprise Hub. All rights reserved.
      </p>

    </div>
  );
}
