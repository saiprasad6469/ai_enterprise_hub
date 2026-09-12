'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, Database, FileText, Bot, GitBranch, 
  BarChart3, Users, Building2, Bell, Key, ShieldCheck, 
  Settings, User, HelpCircle, ChevronLeft, ChevronRight, X, BrainCircuit,
  ShieldAlert, CheckSquare, FolderGit2
} from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarExpanded, toggleSidebar, mobileSidebarOpen, setMobileSidebar } = useUiStore();
  const { user } = useAuthStore();
  const notifications = useDataStore((state) => state.notifications);
  const documents = useDataStore((state) => state.documents);
  const companyTasks = useDataStore((state) => state.companyTasks);

  const unreadNotificationCount = React.useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'Admin' || user?.role === 'ADMIN';

  const getBadgeCount = (key?: string) => {
    if (key === 'notifications') return unreadNotificationCount;
    if (key === 'documents') return documents.length;
    if (key === 'tasks') return companyTasks.filter(t => t.status === 'Pending').length;
    return 0;
  };

  // Super Admin Menu (Platform Level Governance)
  const superAdminMenuSections = [
    {
      title: 'Platform Governance',
      items: [
        { name: 'Super Admin Overview', href: '/dashboard/super-admin', icon: ShieldAlert },
        { name: 'Manage Administrators', href: '/dashboard/super-admin/admins', icon: Users },
        { name: 'Global Audit Logs', href: '/dashboard/audit-logs', icon: ShieldCheck },
        { name: 'System Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Enterprise Core',
      items: [
        { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: Database },
        { name: 'RAG Documents', href: '/dashboard/documents', icon: FileText, badgeCountKey: 'documents' },
        { name: 'AI Model Agents', href: '/dashboard/agents', icon: Bot },
        { name: 'Automated Pipelines', href: '/dashboard/workflows', icon: GitBranch },
        { name: 'API Keys Vault', href: '/dashboard/api-keys', icon: Key },
        { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
      ]
    },
    {
      title: 'System Settings',
      items: [
        { name: 'Department Governance', href: '/dashboard/admin/departments', icon: FolderGit2 },
        { name: 'System Settings', href: '/dashboard/settings', icon: Settings },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badgeCountKey: 'notifications' },
      ]
    }
  ];

  // Dedicated Admin Menu (Operations, Employee Management, RAG Document uploads, Company Tasks)
  const adminMenuSections = [
    {
      title: 'Operations Center',
      items: [
        { name: 'Admin Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Employee Management', href: '/dashboard/admin/employees', icon: Users },
        { name: 'Add / Manage Documents', href: '/dashboard/admin/documents', icon: FileText, badgeCountKey: 'documents' },
        { name: 'Company Tasks', href: '/dashboard/admin/tasks', icon: CheckSquare, badgeCountKey: 'tasks' },
        { name: 'Department Audit Logs', href: '/dashboard/audit-logs', icon: ShieldCheck },
      ]
    },
    {
      title: 'Enterprise Tools',
      items: [
        { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: Database },
        { name: 'Department AI Agents', href: '/dashboard/agents', icon: Bot },
        { name: 'Pipelines & Workflows', href: '/dashboard/workflows', icon: GitBranch },
      ]
    },
    {
      title: 'Account & Settings',
      items: [
        { name: 'Admin Profile', href: '/dashboard/profile', icon: User },
        { name: 'Announcements', href: '/dashboard/notifications', icon: Bell, badgeCountKey: 'notifications' },
        { name: 'Workspace Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  // Employee Menu (Querying RAG, Department Workflows, Personal Space)
  const employeeMenuSections = [
    {
      title: 'Employee Portal',
      items: [
        { name: 'Employee Overview', href: '/dashboard/employee', icon: LayoutDashboard },
        { name: 'Company Tasks', href: '/dashboard/tasks', icon: CheckSquare, badgeCountKey: 'tasks' },
        { name: 'AI Chat (RAG)', href: '/dashboard/chat', icon: MessageSquare },
        { name: 'My Knowledge Base', href: '/dashboard/knowledge-base', icon: Database },
        { name: 'My Documents', href: '/dashboard/documents', icon: FileText, badgeCountKey: 'documents' },
        { name: 'My Activity Logs', href: '/dashboard/audit-logs', icon: ShieldCheck },
      ]
    },
    {
      title: 'Department Tools',
      items: [
        { name: 'Department Agents', href: '/dashboard/agents', icon: Bot },
        { name: 'Automated Pipelines', href: '/dashboard/workflows', icon: GitBranch },
      ]
    },
    {
      title: 'My Account',
      items: [
        { name: 'Profile & Activity', href: '/dashboard/profile', icon: User },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badgeCountKey: 'notifications' },
        { name: 'Help & Docs', href: '/dashboard/help', icon: HelpCircle },
      ]
    }
  ];

  const menuSections = isSuperAdmin 
    ? superAdminMenuSections 
    : (isAdmin ? adminMenuSections : employeeMenuSections);

  const homeHref = isSuperAdmin 
    ? "/dashboard/super-admin" 
    : (isAdmin ? "/dashboard/admin" : "/dashboard/employee");

  const roleLabel = isSuperAdmin 
    ? "Super Admin Console" 
    : (isAdmin ? "Admin Console" : "Employee Workspace");

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Brand Header */}
      <div className={cn(
        "flex items-center justify-between h-16 border-b border-sidebar-border px-4",
        !sidebarExpanded && "justify-center px-0"
      )}>
        <Link href={homeHref} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-600/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-sm leading-tight text-foreground">AI Enterprise Hub</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isSuperAdmin ? 'text-teal-500 dark:text-teal-400' : (isAdmin ? 'text-teal-600 dark:text-teal-400' : 'text-emerald-600 dark:text-emerald-400')
              }`}>
                {roleLabel}
              </span>
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
              <h4 className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest px-3 mb-2">
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
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md shadow-teal-700/20 font-bold" 
                      : "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    {sidebarExpanded && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>
                  {sidebarExpanded && badgeCount > 0 && (
                    <span className={cn(
                      "flex items-center justify-center text-[10px] px-2 py-0.5 rounded-full font-bold min-w-5",
                      isActive ? "bg-white text-teal-800" : "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                    )}>
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Info Bar at Bottom */}
      {sidebarExpanded && user && (
        <div className="p-3 border-t border-sidebar-border bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.role} • {user.email}</p>
            </div>
          </div>
        </div>
      )}

      {!sidebarExpanded && (
        <div className="hidden lg:flex items-center justify-center h-14 border-t border-sidebar-border">
          <button 
            onClick={toggleSidebar} 
            className="flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className={cn(
        "hidden md:block h-screen sticky top-0 transition-all duration-300 z-30",
        sidebarExpanded ? "w-64" : "w-16"
      )}>
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 z-50 shadow-2xl"
            >
              <div className="relative h-full">
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
