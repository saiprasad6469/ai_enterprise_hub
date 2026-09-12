'use client';

import * as React from 'react';
import { 
  ShieldCheck, ShieldAlert, Search, Download, Calendar, 
  User, Activity, CheckCircle2, AlertCircle, RefreshCw, Filter, Building2, HardDrive
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const auditLogs = useDataStore((state) => state.auditLogs);
  const fetchAuditLogs = useDataStore((state) => state.fetchAuditLogs);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [actionFilter, setActionFilter] = React.useState('All');
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const userRole = (user?.role || '').toUpperCase();
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
  const isAdmin = userRole === 'ADMIN';
  const isEmployee = !isSuperAdmin && !isAdmin;

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAuditLogs();
    setIsRefreshing(false);
    toast({
      title: 'Logs Refreshed',
      description: 'Audit trail dataset updated successfully from backend.',
      type: 'success',
    });
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: 'Export Failed',
        description: 'No audit log records available to export.',
        type: 'error',
      });
      return;
    }

    const headers = ['ID', 'Timestamp', 'User Name', 'User Email', 'Role', 'Department', 'Action', 'Target', 'IP Address', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map((log) => [
        `"${log.id}"`,
        `"${log.timestamp}"`,
        `"${log.userName || ''}"`,
        `"${log.user || ''}"`,
        `"${log.userRole || ''}"`,
        `"${log.department || ''}"`,
        `"${log.action}"`,
        `"${log.target.replace(/"/g, '""')}"`,
        `"${log.ipAddress}"`,
        `"${log.status}"`,
      ].join(','))
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `audit_logs_${user?.role || 'user'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: `Downloaded ${filteredLogs.length} audit records to CSV.`,
      type: 'success',
    });
  };

  const filteredLogs = auditLogs.filter((log) => {
    const logUser = (log.user || '').toLowerCase();
    const logUserName = (log.userName || '').toLowerCase();
    const logTarget = (log.target || '').toLowerCase();
    const logAction = (log.action || '').toLowerCase();
    const query = searchVal.toLowerCase();

    const matchSearch = logUser.includes(query) || logUserName.includes(query) || logTarget.includes(query) || logAction.includes(query);
    const matchStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchAction = actionFilter === 'All' || log.action.toUpperCase().includes(actionFilter.toUpperCase());
    const matchRole = roleFilter === 'All' || (log.userRole || '').toUpperCase().includes(roleFilter.toUpperCase());

    return matchSearch && matchStatus && matchAction && matchRole;
  });

  const successCount = filteredLogs.filter(l => l.status === 'Success').length;
  const successPercentage = filteredLogs.length > 0 ? Math.round((successCount / filteredLogs.length) * 100) : 100;

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
              isSuperAdmin 
                ? "bg-teal-500/10 text-teal-600 border-teal-500/20" 
                : (isAdmin ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")
            )}>
              {isSuperAdmin ? 'Global Security Audit' : (isAdmin ? `${user?.department || 'Department'} Admin Audit` : 'Personal Activity Logs')}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isSuperAdmin && 'Enterprise Audit & Compliance Logs'}
            {isAdmin && `${user?.department || 'Department'} Audit Log Stream`}
            {isEmployee && 'My Security & Activity Trail'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin && 'Monitor cross-organization user authentication, administrative changes, document ingestion, and AI model consultations.'}
            {isAdmin && `Audit activity for employees and operations within the ${user?.department || 'assigned'} department.`}
            {isEmployee && 'Review your personal actions, login history, uploaded files, task status updates, and RAG chat sessions.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} /> Refresh
          </button>

          <button
            onClick={handleExport}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 text-xs font-semibold shadow-md transition-all duration-200"
          >
            <Download className="h-4 w-4" /> Export CSV Logs
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Logged Events</span>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length} Records</div>
            <p className="text-[11px] text-muted-foreground mt-1">Matching current filter selections</p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Execution Success Rate</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successPercentage}%</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {successCount} Successful • {filteredLogs.length - successCount} Failed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Scope Access Tier</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {isSuperAdmin ? 'Global Enterprise' : (user?.department || 'Department')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isSuperAdmin ? 'All Departments & Users' : `Role: ${user?.role || 'Member'}`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Latest Event</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {filteredLogs.length > 0 ? filteredLogs[0].timestamp : 'No events'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {filteredLogs.length > 0 ? `${filteredLogs[0].action} by ${filteredLogs[0].userName || filteredLogs[0].user}` : 'Idle'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-card/60 border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full lg:w-96 flex items-center border border-border bg-background px-3 py-1.5 rounded-xl focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search email, name, action, or target entity..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground px-2 text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-semibold text-foreground"
            >
              <option value="All">All User Roles</option>
              <option value="SuperAdmin">Super Admins</option>
              <option value="Admin">Admins</option>
              <option value="Employee">Employees</option>
            </select>
          )}

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-semibold text-foreground"
          >
            <option value="All">All Action Categories</option>
            <option value="DOC">Document Actions</option>
            <option value="TASK">Task Actions</option>
            <option value="WORKFLOW">Workflow Actions</option>
            <option value="CHAT">RAG Chat Queries</option>
            <option value="USER">User & Employee Admin</option>
            <option value="AGENT">AI Agent Updates</option>
            <option value="LOGIN">User Logins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-semibold text-foreground"
          >
            <option value="All">All Result States</option>
            <option value="Success">Success Only</option>
            <option value="Failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table Grid */}
      {filteredLogs.length === 0 ? (
        <Card className="border border-border/80 text-center p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 text-muted-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">No audit entries matching filters</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Try clearing your search terms or filter selection criteria.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-border/80 shadow-md">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold text-xs">Timestamp</TableHead>
                <TableHead className="font-bold text-xs">User Identity</TableHead>
                <TableHead className="font-bold text-xs">System Action</TableHead>
                <TableHead className="font-bold text-xs">Target Entity</TableHead>
                <TableHead className="font-bold text-xs">IP Address</TableHead>
                <TableHead className="font-bold text-xs text-right">Result State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const isSuccess = log.status === 'Success';
                const isSuperAdminUser = (log.userRole || '').toUpperCase().includes('SUPER');
                const isAdminUser = (log.userRole || '').toUpperCase() === 'ADMIN';

                return (
                  <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-foreground">{log.userName || log.user}</span>
                          <span className={cn(
                            "text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase",
                            isSuperAdminUser ? "bg-teal-500/15 text-teal-700 dark:text-teal-300" :
                            (isAdminUser ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-slate-500/15 text-slate-700 dark:text-slate-300")
                          )}>
                            {log.userRole || 'User'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{log.user}</span>
                          {log.department && <span>• {log.department}</span>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono bg-muted/80 border border-border/60 px-2 py-0.5 rounded text-[10px] text-foreground font-bold inline-block">
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {log.target}
                    </TableCell>

                    <TableCell className="font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                        isSuccess ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
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
        </Card>
      )}

    </div>
  );
}
