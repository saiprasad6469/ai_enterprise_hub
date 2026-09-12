'use client';

import * as React from 'react';
import { 
  ShieldCheck, Search, Download, Calendar, 
  User, Activity, CheckCircle2, AlertCircle, ArrowUpDown 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AuditLogsPage() {
  const auditLogs = useDataStore((state) => state.auditLogs);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [actionFilter, setActionFilter] = React.useState('All');

  const handleExport = () => {
    toast({
      title: 'Exporting Logs',
      description: 'Generating audit_logs_2026.csv dataset download...',
      type: 'success',
    });
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch = log.user.toLowerCase().includes(searchVal.toLowerCase()) ||
                        log.target.toLowerCase().includes(searchVal.toLowerCase()) ||
                        log.action.toLowerCase().includes(searchVal.toLowerCase());
    const matchStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchAction = actionFilter === 'All' || log.action.includes(actionFilter);
    return matchSearch && matchStatus && matchAction;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track compliance, user authentication events, document ingestion activities, and API key invocations.</p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-md transition-all duration-200"
        >
          <Download className="h-4 w-4" /> Export CSV Logs
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-card/40 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 flex items-center border border-border bg-background px-3 py-1.5 rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search email, action, or target..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground px-2 text-foreground"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-semibold text-foreground"
          >
            <option value="All">All Action Types</option>
            <option value="DOC">Document Actions</option>
            <option value="WORKFLOW">Workflow Execution</option>
            <option value="API_KEY">API Credentials</option>
            <option value="CHAT">Chat Consultations</option>
            <option value="AGENT">Agent Changes</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-semibold text-foreground"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success Only</option>
            <option value="Failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      {filteredLogs.length === 0 ? (
        <Card className="border border-border/80 text-center p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 text-muted-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">No audit entries matching filters</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Verify your search queries or filter choices.</p>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Timestamp</TableHead>
              <TableHead className="font-bold">User Identity</TableHead>
              <TableHead className="font-bold">System Action</TableHead>
              <TableHead className="font-bold">Target Entity</TableHead>
              <TableHead className="font-bold">IP Address</TableHead>
              <TableHead className="font-bold text-right">Result State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => {
              const isSuccess = log.status === 'Success';
              return (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="font-bold text-foreground">{log.user}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted/60 dark:bg-muted/10 border px-1.5 py-0.5 rounded text-[10px] text-foreground font-bold">{log.action}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{log.target}</TableCell>
                  <TableCell className="font-mono text-muted-foreground text-[11px]">{log.ipAddress}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1",
                      isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {log.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

    </div>
  );
}
