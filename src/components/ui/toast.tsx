'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useToastStore, ToastMessage } from '@/store/useToastStore';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ 
  toast, 
  onDismiss 
}: { 
  toast: ToastMessage; 
  onDismiss: (id: string) => void;
}) {
  const icons = {
    default: <Info className="h-5 w-5 text-primary" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
  };

  const bgClasses = {
    default: 'border-border/60 bg-background/90 dark:bg-card/90',
    success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/20 dark:border-emerald-500/30',
    warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/20 dark:border-amber-500/30',
    error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/20 dark:border-rose-500/30',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-colors",
        bgClasses[toast.type || 'default']
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type || 'default']}
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-semibold leading-none">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-lg p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
