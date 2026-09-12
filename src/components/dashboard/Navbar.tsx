'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, Sun, Moon, Bell, User, Settings, LogOut, CreditCard, ChevronRight, 
  Search, CheckCheck, Inbox, HelpCircle
} from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleMobileSidebar } = useUiStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { notifications, markNotificationsAsRead } = useDataStore();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Breadcrumbs logic
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path
        .replace(/-/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      return { label, href, isLast: index === paths.length - 1 };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-md px-4 select-none">
      
      {/* Left Side: Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm font-medium">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Hub
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              {crumb.isLast ? (
                <span className="text-foreground font-semibold">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Side: Search, Theme, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search Mock */}
        <div className="hidden lg:flex items-center gap-2 border border-border bg-muted/40 dark:bg-muted/10 px-3 py-1.5 rounded-xl w-64 hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search hub..." 
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground"
          />
          <span className="text-[10px] bg-muted dark:bg-card border px-1.5 py-0.5 rounded font-mono text-muted-foreground">⌘K</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Toggle appearance"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative",
              showNotifications && "bg-muted text-foreground border-primary/30"
            )}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-background animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card shadow-xl p-4 z-50 text-foreground animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-primary" /> Inbox
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markNotificationsAsRead();
                      }}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Read all
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto py-2 space-y-2.5 divide-y divide-border/30 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n, index) => (
                      <div key={n.id} className={cn("pt-2 first:pt-0 flex flex-col gap-0.5", !n.read && "font-medium")}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-xs font-semibold rounded px-1.5 py-0.5 text-[10px]",
                            n.category === 'Workflow' && "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
                            n.category === 'Security' && "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20",
                            n.category === 'Billing' && "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20",
                            n.category === 'System' && "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                          )}>
                            {n.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground mt-1">{n.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-normal">{n.description}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="border-t border-border/60 pt-3 mt-1 text-center">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    View all notifications <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-border bg-muted shadow-sm hover:border-primary/30 transition-all duration-200">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                  {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              )}
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl p-2 z-50 text-foreground animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <span className="inline-block bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground text-[10px] font-bold rounded px-1.5 py-0.5 mt-1">{user?.role}</span>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <User className="h-4 w-4" /> Personal Profile
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CreditCard className="h-4 w-4" /> Subscriptions & Billing
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" /> Workspace Settings
                  </Link>
                  <Link
                    href="/dashboard/help"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" /> Help & Resources
                  </Link>
                </div>

                <div className="border-t border-border/60 p-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      router.push('/login');
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
