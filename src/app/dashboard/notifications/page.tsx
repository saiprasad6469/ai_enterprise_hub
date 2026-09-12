'use client';

import * as React from 'react';
import { 
  Bell, CheckCheck, Trash2, ShieldAlert, Cpu, 
  CreditCard, GitBranch, Info, AlertTriangle 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const notifications = useDataStore((state) => state.notifications);
  const markNotificationsAsRead = useDataStore((state) => state.markNotificationsAsRead);
  const clearNotification = useDataStore((state) => state.clearNotification);
  const { toast } = useToastStore();

  const [categoryFilter, setCategoryFilter] = React.useState('All');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = notifications.filter(n => 
    categoryFilter === 'All' || n.category === categoryFilter
  );

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
    toast({
      title: 'Inbox Updated',
      description: 'Marked all notifications as read.',
      type: 'success',
    });
  };

  const handleDeleteNotif = (id: string) => {
    clearNotification(id);
    toast({
      title: 'Alert Deleted',
      description: 'Notification removed from inbox.',
      type: 'warning',
    });
  };

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    if (category === 'Workflow') return <GitBranch className="h-4 w-4 text-blue-500" />;
    if (category === 'Security') return <ShieldAlert className="h-4 w-4 text-amber-500" />;
    if (category === 'Billing') return <CreditCard className="h-4 w-4 text-rose-500" />;
    return <Info className="h-4 w-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Alerts Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">Review pipeline logs, security compliance triggers, and invoice alerts.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            <CheckCheck className="h-4 w-4 text-primary" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="flex bg-card/40 border border-border p-2 rounded-2xl gap-2 overflow-x-auto text-xs font-semibold text-muted-foreground scrollbar-none">
        {['All', 'Workflow', 'Security', 'Billing', 'System'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
              (categoryFilter === cat) 
                ? "bg-primary text-primary-foreground shadow" 
                : "hover:text-foreground hover:bg-muted/40"
            )}
          >
            {cat === 'All' ? 'All Alerts' : `${cat} Logs`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <Card className="border border-border/80 overflow-hidden">
        <CardContent className="p-0 divide-y divide-border/40">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40 animate-pulse" />
              Inbox is clean. No alerts registered.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-5 text-xs flex gap-4 items-start transition-colors relative hover:bg-muted/10",
                  !n.read ? "bg-primary/5 dark:bg-primary/5 font-semibold" : ""
                )}
              >
                {/* Visual indicator dot */}
                {!n.read && (
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                )}

                {/* Category Icon */}
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 dark:bg-muted/10 border border-border/40">
                  {getCategoryIcon(n.category)}
                </div>

                {/* Text Body */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-foreground leading-snug">{n.title}</h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{n.description}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDeleteNotif(n.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Remove notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
