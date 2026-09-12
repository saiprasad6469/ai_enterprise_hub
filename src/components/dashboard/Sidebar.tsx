'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, Database, FileText, Bot, GitBranch, 
  BarChart3, Users, Building2, Bell, Key, ShieldCheck, CreditCard, 
  Settings, User, HelpCircle, ChevronLeft, ChevronRight, X, BrainCircuit
} from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { useDataStore } from '@/store/useDataStore';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCountKey?: 'notifications' | 'documents';
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarExpanded, toggleSidebar, mobileSidebarOpen, setMobileSidebar } = useUiStore();
  const notifications = useDataStore((state) => state.notifications);
  const documents = useDataStore((state) => state.documents);

  const unreadNotificationCount = React.useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const getBadgeCount = (key?: string) => {
    if (key === 'notifications') return unreadNotificationCount;
    if (key === 'documents') return documents.length;
    return 0;
  };

  const menuSections = [
    {
      title: 'Workspace',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
        { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: Database },
        { name: 'Documents', href: '/dashboard/documents', icon: FileText, badgeCountKey: 'documents' },
        { name: 'AI Agents', href: '/dashboard/agents', icon: Bot },
        { name: 'Workflows', href: '/dashboard/workflows', icon: GitBranch },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
        { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
        { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: ShieldCheck },
        { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile', href: '/dashboard/profile', icon: User },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badgeCountKey: 'notifications' },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        { name: 'Help Center', href: '/dashboard/help', icon: HelpCircle },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Header / Brand Logo */}
      <div className={cn(
        "flex items-center justify-between h-16 border-b border-sidebar-border px-4",
        !sidebarExpanded && "justify-center px-0"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/10">
            <BrainCircuit className="h-5 w-5 animate-pulse" />
          </div>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sm leading-tight text-foreground">Enterprise Hub</span>
              <span className="text-[10px] text-muted-foreground font-medium">v1.2.0</span>
            </motion.div>
          )}
        </Link>
        {sidebarExpanded && (
          <button 
            onClick={toggleSidebar} 
            className="hidden lg:flex items-center justify-center rounded-lg h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-border">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {sidebarExpanded && (
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2 select-none">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const badgeCount = getBadgeCount(item.badgeCountKey);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/15 dark:shadow-primary/5 font-semibold" 
                      : "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105", isActive ? "" : "text-muted-foreground group-hover:text-foreground")} />
                    {sidebarExpanded && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>
                  {sidebarExpanded && badgeCount > 0 && (
                    <span className={cn(
                      "flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-5",
                      isActive ? "bg-primary-foreground text-primary" : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                    )}>
                      {badgeCount}
                    </span>
                  )}
                  {!sidebarExpanded && badgeCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Toggle Expanded Button */}
      {!sidebarExpanded && (
        <div className="hidden lg:flex items-center justify-center h-16 border-t border-sidebar-border">
          <button 
            onClick={toggleSidebar} 
            className="flex items-center justify-center rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className={cn(
        "hidden md:block h-screen sticky top-0 transition-all duration-300 z-30",
        sidebarExpanded ? "w-64" : "w-16"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Drawer Layout) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 z-50 shadow-2xl"
            >
              <div className="relative h-full">
                {/* Close Button Inside Drawer */}
                <button
                  onClick={() => setMobileSidebar(false)}
                  className="absolute top-4 right-4 flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 z-50"
                >
                  <X className="h-5 w-5" />
                </button>
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
