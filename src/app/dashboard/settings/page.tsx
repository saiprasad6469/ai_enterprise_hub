'use client';

import * as React from 'react';
import { 
  Settings, ShieldAlert, Sparkles, Bell, LayoutGrid, 
  Tv, Lock, ShieldCheck, Save, Eye 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/store/useToastStore';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';

export default function WorkspaceSettingsPage() {
  const { toast } = useToastStore();
  const { theme, setTheme } = useThemeStore();

  const [density, setDensity] = React.useState<'spacious' | 'compact'>('spacious');
  const [sessionLimit, setSessionLimit] = React.useState('8');
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [secAudit, setSecAudit] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Settings Saved',
      description: 'Workspace preferences updated successfully.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure layout densities, security limits, global appearance themes, and alert endpoints.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Appearance Settings */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-primary" /> Appearance & Display</CardTitle>
            <CardDescription>Adjust how the dashboard components render on your screens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-xs">
            {/* Theme picker */}
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Global Color Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border border-border rounded-xl text-center font-bold hover:bg-muted/30 transition-all duration-200",
                    theme === 'light' ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-primary" : "text-muted-foreground bg-card"
                  )}
                >
                  <span className="text-xs">Light Appearance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border border-border rounded-xl text-center font-bold hover:bg-muted/30 transition-all duration-200",
                    theme === 'dark' ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-primary" : "text-muted-foreground bg-card"
                  )}
                >
                  <span className="text-xs">Dark Appearance</span>
                </button>
              </div>
            </div>

            {/* Density picker */}
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Interface Density</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDensity('spacious')}
                  className={cn(
                    "flex items-center justify-center p-3 border border-border rounded-xl font-bold hover:bg-muted/30 transition-all duration-200",
                    density === 'spacious' ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-primary" : "text-muted-foreground bg-card"
                  )}
                >
                  Spacious Layout
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={cn(
                    "flex items-center justify-center p-3 border border-border rounded-xl font-bold hover:bg-muted/30 transition-all duration-200",
                    density === 'compact' ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-primary" : "text-muted-foreground bg-card"
                  )}
                >
                  Compact Layout
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Preferences */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><Lock className="h-5 w-5 text-emerald-500" /> Security Controls</CardTitle>
            <CardDescription>Setup access policies and login durations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Session Idle Timeout Limit (Hours)</label>
              <Input 
                type="number" 
                value={sessionLimit}
                onChange={(e) => setSessionLimit(e.target.value)}
                min="1"
                max="24"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border/80 rounded-xl">
              <div>
                <h4 className="font-bold text-foreground">Enforce Detailed Ingestion Audit</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Logs all file metadata attributes during upload pipelines.</p>
              </div>
              <button
                type="button"
                onClick={() => setSecAudit(!secAudit)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                  secAudit ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                  secAudit ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Config */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-indigo-500" /> Alert Subscriptions</CardTitle>
            <CardDescription>Manage alert trigger endpoints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 border border-border/80 rounded-xl">
              <div>
                <h4 className="font-bold text-foreground">Daily Email Digests</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Receive summary reports on storage indexes and token usage totals.</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                  emailAlerts ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                  emailAlerts ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Workspace policies locked.</span>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
            >
              <Save className="h-4 w-4" /> Save Preferences
            </button>
          </CardFooter>
        </Card>

      </form>
    </div>
  );
}
