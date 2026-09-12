'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  FileText, Users, MessageSquare, HardDrive, Cpu, 
  GitBranch, Bot, Activity, PlusCircle, ArrowRight, Zap 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';

export default function DashboardHome() {
  const documents = useDataStore((state) => state.documents);
  const users = useDataStore((state) => state.users);
  const agents = useDataStore((state) => state.agents);
  const workflows = useDataStore((state) => state.workflows);
  const chats = useDataStore((state) => state.chats);
  const auditLogs = useDataStore((state) => state.auditLogs);

  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const totalRuns = workflows.reduce((acc, curr) => acc + curr.runs.length, 0);

  // Cards configuration
  const statCards = [
    { title: 'Total Documents', value: documents.length, desc: 'Ingested in Vector DB', icon: <FileText className="h-5 w-5 text-blue-500" />, href: '/dashboard/documents' },
    { title: 'Active Users', value: activeUsersCount, desc: 'Current team seats', icon: <Users className="h-5 w-5 text-emerald-500" />, href: '/dashboard/users' },
    { title: 'AI Chat Consultations', value: chats.length, desc: 'Active conversation threads', icon: <MessageSquare className="h-5 w-5 text-indigo-500" />, href: '/dashboard/chat' },
    { title: 'Storage Allocation', value: '36.8 GB', desc: 'Out of 100 GB used', icon: <HardDrive className="h-5 w-5 text-purple-500" />, progress: 36.8 },
    { title: 'Token Usage (Mo.)', value: '4.2M', desc: 'Out of 10M token quota', icon: <Cpu className="h-5 w-5 text-amber-500" />, progress: 42 },
    { title: 'Total Workflow Runs', value: totalRuns, desc: 'Automated events processed', icon: <GitBranch className="h-5 w-5 text-pink-500" />, href: '/dashboard/workflows' },
    { title: 'Deployed AI Agents', value: agents.length, desc: 'Configured model engines', icon: <Bot className="h-5 w-5 text-teal-500" />, href: '/dashboard/agents' },
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Here is a summary of your organization&apos;s AI orchestration and resources.</p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/knowledge-base"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-md transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" /> Upload Document
          </Link>
          <Link
            href="/dashboard/agents"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            <Bot className="h-4 w-4" /> Create Agent
          </Link>
          <Link
            href="/dashboard/workflows"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            <GitBranch className="h-4 w-4" /> New Workflow
          </Link>
          <Link
            href="/dashboard/chat"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> Start AI Chat
          </Link>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const content = (
            <Card key={idx} className="cursor-pointer hover:border-primary/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 dark:bg-muted/10">
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                <p className="text-[11px] text-muted-foreground">{card.desc}</p>
                {card.progress !== undefined && (
                  <div className="w-full bg-muted dark:bg-muted/30 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${card.progress}%` }} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );

          return card.href ? (
            <Link key={idx} href={card.href} className="block">
              {content}
            </Link>
          ) : content;
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Requests Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Daily API Requests (7 Days)</CardTitle>
            <CardDescription>Daily volumes across RAG database checks and agent invokes.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-end pt-4">
            {/* Inline SVG Chart */}
            <div className="relative w-full h-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 180">
                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* Area under the line */}
                <path
                  d="M 20 150 L 90 110 L 160 135 L 230 60 L 300 85 L 370 45 L 440 25 L 440 150 Z"
                  fill="url(#chartGrad)"
                  className="opacity-20"
                />
                {/* Line graph */}
                <path
                  d="M 20 150 L 90 110 L 160 135 L 230 60 L 300 85 L 370 45 L 440 25"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots on nodes */}
                <circle cx="20" cy="150" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />
                <circle cx="90" cy="110" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />
                <circle cx="160" cy="135" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />
                <circle cx="230" cy="60" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />
                <circle cx="300" cy="85" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />
                <circle cx="370" cy="45" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />
                <circle cx="440" cy="25" r="4.5" className="fill-background stroke-primary" strokeWidth="2.5" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* X Axis Labels */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[9px] font-bold text-muted-foreground px-4">
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Allocation Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Storage Growth (30 Days)</CardTitle>
            <CardDescription>Vector index size build-up progression.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-between pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Index Partition Size</span>
                <span className="font-bold text-foreground">36.8 GB / 100 GB</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/30 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: '36.8%' }} />
              </div>
            </div>
            
            {/* Custom SVG Mini Bar Chart */}
            <div className="h-28 flex items-end justify-between gap-1.5 px-2">
              {[25, 28, 30, 31, 33, 34, 36, 36.8].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/20 dark:bg-primary/15 rounded-t-md hover:bg-primary transition-colors duration-200" 
                    style={{ height: `${val * 2}px` }} 
                  />
                  <span className="text-[8px] text-muted-foreground font-bold">W{idx + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Recent Activity & Agent Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold">Recent System Logs</CardTitle>
              <CardDescription>Real-time audit trailing of organizational access.</CardDescription>
            </div>
            <Link 
              href="/dashboard/audit-logs" 
              className="text-xs font-semibold text-primary hover:text-primary/95 flex items-center gap-1 hover:translate-x-0.5 transition-all"
            >
              All Logs <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground flex-shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-foreground">{log.action}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{log.user} • {log.target}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">{log.timestamp.split(' ')[1]}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      log.status === 'Success' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Agents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold">Active AI Assistants</CardTitle>
              <CardDescription>Department model mapping states.</CardDescription>
            </div>
            <Link 
              href="/dashboard/agents" 
              className="text-xs font-semibold text-primary hover:text-primary/95 flex items-center gap-1 hover:translate-x-0.5 transition-all"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {agents.slice(0, 4).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.model} • {agent.department}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    agent.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
