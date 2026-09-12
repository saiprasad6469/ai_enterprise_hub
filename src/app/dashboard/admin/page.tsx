'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Users, FileText, CheckSquare, Building2, 
  ArrowRight, Plus, CheckCircle2, Clock, AlertCircle, TrendingUp,
  UserPlus, FileUp, Sparkles, Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const documents = useDataStore((state) => state.documents);
  const users = useDataStore((state) => state.users);
  const companyTasks = useDataStore((state) => state.companyTasks);
  const departmentsList = useDataStore((state) => state.departmentsList);
  const auditLogs = useDataStore((state) => state.auditLogs);

  const employees = users.filter(u => u.role === 'Employee' || u.role === 'EMPLOYEE');
  const activeEmployees = employees.filter(u => u.status === 'Active');
  const pendingTasks = companyTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasks = companyTasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-8 select-none">
      
      {/* Admin Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> Admin Operations Center
            </span>
            <span className="text-xs text-slate-300 font-medium">Workspace Admin: {user?.name || 'Administrator'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Hub Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Coordinate workforce operations, onboard employees with direct ID credentials, upload company RAG documents, and track company tasks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard/admin/employees"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 text-xs font-bold shadow-lg transition-all"
          >
            <UserPlus className="h-4 w-4" /> Add Employee
          </Link>
          <Link
            href="/dashboard/admin/documents"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-bold shadow-lg transition-all"
          >
            <FileUp className="h-4 w-4" /> Upload Document
          </Link>
          <Link
            href="/dashboard/admin/tasks"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 text-xs font-bold border border-white/20 transition-colors"
          >
            <CheckSquare className="h-4 w-4" /> Assign Task
          </Link>
        </div>
      </div>

      {/* Organization Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Employees */}
        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Employees</span>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length} Members</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {activeEmployees.length} Active accounts ({employees.length - activeEmployees.length} Inactive)
            </p>
          </CardContent>
        </Card>

        {/* Company Tasks Status */}
        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Pending Company Tasks</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length} In Progress</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {completedTasks.length} Completed of {companyTasks.length} Total
            </p>
          </CardContent>
        </Card>

        {/* Ingested Documents */}
        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Recent Documents</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length} Files</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Structured for RAG vector assistant
            </p>
          </CardContent>
        </Card>

        {/* Active Departments */}
        <Card className="hover:border-teal-500/40 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Department Partitions</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentsList.length} Departments</div>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">
              100% Operational Status
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Main Grid: Company Tasks Overview & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Company Tasks Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-teal-600" /> Company Tasks Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Active organizational deliverables and department execution deadlines.
                </CardDescription>
              </div>
              <Link 
                href="/dashboard/admin/tasks"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Manage Tasks <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 text-xs">
                {companyTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{task.title}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          task.priority === 'Urgent' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700' :
                          task.priority === 'High' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Assigned to: <span className="font-semibold text-foreground">{task.assignedTo}</span> • Department: {task.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-muted-foreground block">Deadline: {task.deadline}</span>
                        <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Employee Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" /> Recent Employee Activity
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time log of team document consults, chat interactions, and task updates.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 text-xs">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{log.action}</p>
                        <p className="text-[11px] text-muted-foreground">{log.user} • {log.target}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Department Stats & Quick Onboarding */}
        <div className="space-y-6">
          
          {/* Department Statistics */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" /> Department Statistics
              </CardTitle>
              <CardDescription className="text-xs">
                Staff distribution & RAG documents count.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {departmentsList.slice(0, 5).map((dept) => (
                <div key={dept.id} className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{dept.name}</span>
                    <span className="font-extrabold text-teal-700 dark:text-teal-400">{dept.employeeCount} Members</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Head: {dept.head}</span>
                    <span>{dept.documentCount} Documents</span>
                  </div>
                </div>
              ))}
              <Link
                href="/dashboard/admin/departments"
                className="inline-flex w-full h-9 items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors mt-2"
              >
                View All Departments <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-900 dark:to-slate-950 border-teal-200 dark:border-teal-900">
            <CardHeader>
              <CardTitle className="text-base font-bold text-teal-900 dark:text-teal-200">
                Administrative Quick Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Shortcuts for everyday operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard/admin/employees"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/60 dark:border-teal-900/60 text-xs font-bold hover:bg-teal-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground"><UserPlus className="h-4 w-4 text-teal-600" /> Onboard New Employee</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/dashboard/admin/documents"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/60 dark:border-teal-900/60 text-xs font-bold hover:bg-teal-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground"><FileUp className="h-4 w-4 text-emerald-600" /> Ingest RAG Knowledge</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/dashboard/admin/tasks"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/60 dark:border-teal-900/60 text-xs font-bold hover:bg-teal-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground"><CheckSquare className="h-4 w-4 text-amber-600" /> Create Company Task</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
