'use client';

import * as React from 'react';
import { 
  BarChart3, Calendar, Cpu, Clock, PiggyBank, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Zap 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';

export default function AnalyticsPage() {
  const agents = useDataStore((state) => state.agents);
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '12m'>('7d');
  const [agentFilter, setAgentFilter] = React.useState('All');

  // Stats configs
  const metrics = [
    { title: 'Total Tokens Ingested', value: '14.8M', change: '+18.4%', trend: 'up', icon: <Cpu className="h-5 w-5 text-blue-500" /> },
    { title: 'Avg API Latency', value: '420ms', change: '-12.5%', trend: 'down', icon: <Clock className="h-5 w-5 text-emerald-500" /> },
    { title: 'Semantic Cache Hit Rate', value: '68.2%', change: '+4.2%', trend: 'up', icon: <RefreshCw className="h-5 w-5 text-indigo-500" /> },
    { title: 'Estimated LLM Savings', value: '$2,450', change: '+22.1%', trend: 'up', icon: <PiggyBank className="h-5 w-5 text-amber-500" /> },
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise AI Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep analysis of token limits, cost optimization savings, and semantic cache execution metrics.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Time range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-xs bg-card border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-semibold text-foreground"
          >
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
            <option value="12m">Past 12 Months</option>
          </select>

          {/* Agent Picker */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-semibold text-foreground"
          >
            <option value="All">All Active Agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const isUp = m.trend === 'up';
          return (
            <Card key={idx} className="hover:border-primary/20 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground">{m.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 dark:bg-muted/10">
                  {m.icon}
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight">{m.value}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  {isUp ? (
                    <span className="text-emerald-500 inline-flex items-center"><ArrowUpRight className="h-3 w-3 mr-0.5" /> {m.change}</span>
                  ) : (
                    <span className="text-emerald-500 inline-flex items-center"><ArrowDownRight className="h-3 w-3 mr-0.5" /> {m.change}</span>
                  )}
                  <span className="text-muted-foreground font-medium">vs past period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deep Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Token consumption chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Token Utilization Rate</CardTitle>
            <CardDescription>Daily input vs output token metrics.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-end pt-4">
            <div className="relative w-full h-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 180">
                <line x1="0" y1="30" x2="500" y2="30" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* Bar pairs */}
                {/* Input Tokens (Blue) */}
                <rect x="25" y="60" width="16" height="90" className="fill-primary" rx="3" />
                {/* Output Tokens (Teal) */}
                <rect x="44" y="90" width="16" height="60" className="fill-accent" rx="3" />

                <rect x="95" y="75" width="16" height="75" className="fill-primary" rx="3" />
                <rect x="114" y="105" width="16" height="45" className="fill-accent" rx="3" />

                <rect x="165" y="45" width="16" height="105" className="fill-primary" rx="3" />
                <rect x="184" y="80" width="16" height="70" className="fill-accent" rx="3" />

                <rect x="235" y="90" width="16" height="60" className="fill-primary" rx="3" />
                <rect x="254" y="110" width="16" height="40" className="fill-accent" rx="3" />

                <rect x="305" y="55" width="16" height="95" className="fill-primary" rx="3" />
                <rect x="324" y="85" width="16" height="65" className="fill-accent" rx="3" />

                <rect x="375" y="30" width="16" height="120" className="fill-primary" rx="3" />
                <rect x="394" y="60" width="16" height="90" className="fill-accent" rx="3" />

                <rect x="445" y="50" width="16" height="100" className="fill-primary" rx="3" />
                <rect x="464" y="70" width="16" height="80" className="fill-accent" rx="3" />
              </svg>
              {/* Legend */}
              <div className="absolute top-0 right-0 flex gap-4 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary" /> Input Tokens</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-accent" /> Output Tokens</span>
              </div>
              {/* X Labels */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[9px] font-bold text-muted-foreground px-6">
                <span>17 Jul</span>
                <span>18 Jul</span>
                <span>19 Jul</span>
                <span>20 Jul</span>
                <span>21 Jul</span>
                <span>22 Jul</span>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API latency profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Model Response Latency (Avg)</CardTitle>
            <CardDescription>Response delivery times across models.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-end pt-4">
            <div className="relative w-full h-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 180">
                <line x1="0" y1="30" x2="500" y2="30" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />

                {/* Spline Area */}
                <path
                  d="M 20 80 Q 95 100 170 60 T 320 120 T 470 50 L 470 150 L 20 150 Z"
                  fill="url(#latencyGrad)"
                  className="opacity-15"
                />
                
                {/* Spline Line */}
                <path
                  d="M 20 80 Q 95 100 170 60 T 320 120 T 470 50"
                  fill="none"
                  className="stroke-amber-500"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle cx="170" cy="60" r="4.5" className="fill-background stroke-amber-500" strokeWidth="2.5" />
                <circle cx="320" cy="120" r="4.5" className="fill-background stroke-amber-500" strokeWidth="2.5" />

                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Legend */}
              <div className="absolute top-0 right-0 flex gap-4 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500" /> Latency (ms)</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[9px] font-bold text-muted-foreground px-6">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:59</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model costs & breakdown list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Model costs list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Model Quota Breakdown</CardTitle>
            <CardDescription>Monthly dollar allocation limits across deployed neural models.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Row 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span>GPT-4o Enterprise</span>
                <span className="text-muted-foreground">$1,230 used / $3,000 quota</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/30 h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '41%' }} />
              </div>
            </div>
            {/* Row 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span>Claude 3.5 Sonnet</span>
                <span className="text-muted-foreground">$820 used / $2,000 quota</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/30 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '41%' }} />
              </div>
            </div>
            {/* Row 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span>Llama 3.1 70B</span>
                <span className="text-muted-foreground">$140 used / $1,000 quota</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/30 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Savings overview */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold">Semantic Cache Efficacy</CardTitle>
            <CardDescription>Metrics highlighting cache efficiency.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center gap-2">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="absolute h-full w-full" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  className="stroke-muted dark:stroke-muted/30"
                  fill="none"
                  strokeWidth="3.5"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Foreground circle */}
                <path
                  className="stroke-primary"
                  fill="none"
                  strokeWidth="3.5"
                  strokeDasharray="68, 100"
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="text-center z-10 space-y-0.5">
                <p className="text-lg font-extrabold text-foreground">68.2%</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Cache Hit</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center leading-normal px-4">
              68.2% of questions were answered via Semantic Cache. This avoided querying downstream vector datasets, saving computation resources.
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
