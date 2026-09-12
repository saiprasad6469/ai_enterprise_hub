'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, ShieldCheck, Users, Database, Activity, FileText, Cpu, 
  Key, Building2, GitBranch, ArrowRight, Plus, CheckCircle2, UserPlus,
  BarChart3, Settings, AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function SuperAdminDashboardPage() {
  const { user } = useAuthStore();
  const documents = useDataStore((state) => state.documents);
  const users = useDataStore((state) => state.users);
  const agents = useDataStore((state) => state.agents);
  const workflows = useDataStore((state) => state.workflows);
  const auditLogs = useDataStore((state) => state.auditLogs);
  const departmentsList = useDataStore((state) => state.departmentsList);

  const superAdmins = users.filter(u => u.role === 'SuperAdmin' || u.role === 'SUPER_ADMIN');
  const adminUsers = users.filter(u => u.role === 'Admin' || u.role === 'ADMIN');
  const employeeUsers = users.filter(u => u.role === 'Employee' || u.role === 'EMPLOYEE');
  const activeAdmins = adminUsers.filter(u => u.status === 'Active');

  return (
    <div className="space-y-8 select-none">
      
      {/* Super Admin Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-teal-500/20 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-teal-500/40 flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="h-3.5 w-3.5 text-teal-400" /> Platform Governance Console
            </span>
            <span className="text-xs text-teal-200/80 font-medium">Access Tier: Highest Authority (Super Admin)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Super Administrator Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Manage organization-level administrators, view cross-department system analytics, enforce RAG safety guardrails, and audit global platform logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10">
          <Link
            href="/dashboard/super-admin/admins"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-5 text-xs font-bold shadow-lg shadow-teal-700/30 transition-all hover:scale-105"
          >
            <UserPlus className="h-4 w-4" /> Provision Admin
          </Link>
          <Link
            href="/dashboard/audit-logs"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 text-xs font-bold border border-white/20 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" /> Global Audit Trail
          </Link>
        </div>
      </div>

      {/* Super Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:border-teal-500/40 transition-all shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Administrators</span>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length} Admins</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeAdmins.length} Active • {adminUsers.length - activeAdmins.length} Deactivated
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Workforce Seats</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length} Users</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {employeeUsers.length} Employees across {departmentsList.length} Departments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Enterprise Knowledge</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length} Documents</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Vectorized RAG chunks in Pinecone Index
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Security Audit Events</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length} Events</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% RBAC Compliance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Super Admin Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Administrator Management Panel */}
        <Card className="border-teal-200/60 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:to-slate-950">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-teal-800 dark:text-teal-300">
              <ShieldCheck className="h-5 w-5" /> Administrator Directory
            </CardTitle>
            <CardDescription className="text-xs">
              Assign and deactivate administrator access and manage security tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-border/60 text-xs">
              {adminUsers.slice(0, 3).map((admin) => (
                <div key={admin.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{admin.name}</p>
                    <p className="text-[11px] text-muted-foreground">{admin.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    admin.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {admin.status}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/super-admin/admins"
              className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors"
            >
              Open Administrator Directory <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Department Governance Panel */}
        <Card className="border-blue-200/60 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 dark:from-slate-900 dark:to-slate-950">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <Building2 className="h-5 w-5" /> Department Structure
            </CardTitle>
            <CardDescription className="text-xs">
              Govern organizational business units and active RAG partitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {departmentsList.slice(0, 4).map((d) => (
                <div key={d.id} className="p-2.5 rounded-xl bg-background border border-border">
                  <p className="font-bold text-foreground truncate">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.employeeCount} Members • {d.documentCount} Docs</p>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/admin/departments"
              className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors"
            >
              Manage Departments <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Global Security & Settings Panel */}
        <Card className="border-purple-200/60 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:to-slate-950">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <Settings className="h-5 w-5" /> Global System Settings
            </CardTitle>
            <CardDescription className="text-xs">
              Configure system-wide model quotas, vector indices, and API rate limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
                <span className="font-semibold text-foreground">Active Model Engine</span>
                <span className="font-extrabold text-purple-600">Gemini 1.5 Pro</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
                <span className="font-semibold text-foreground">API Vault</span>
                <span className="font-extrabold text-emerald-600">4 Active Keys</span>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors"
            >
              Configure System Settings <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* System Activity & Global Audit Trail */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Platform-Wide Audit Log Stream</CardTitle>
            <CardDescription className="text-xs">
              Live monitoring of administrator actions, privilege elevation, and knowledge base syncs.
            </CardDescription>
          </div>
          <Link 
            href="/dashboard/audit-logs"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Full Audit Logs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 font-bold">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{log.action}</p>
                    <p className="text-[11px] text-muted-foreground">Actor: {log.user} • Target: {log.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    log.status === 'Success' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
