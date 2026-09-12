'use client';

import * as React from 'react';
import { 
  CheckSquare, Search, Clock, CheckCircle2, AlertCircle, 
  Building2, User, Calendar, Flag, Sparkles, Filter
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CompanyTask } from '@/types';

export default function EmployeeTasksPage() {
  const { user } = useAuthStore();
  const companyTasks = useDataStore((state) => state.companyTasks);
  const updateTask = useDataStore((state) => state.updateTask);
  const { toast } = useToastStore();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const userDept = user?.department || 'Engineering';
  const userName = user?.name || '';

  const [searchVal, setSearchVal] = React.useState('');
  const [filterMode, setFilterMode] = React.useState<'All' | 'MyTasks'>('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  // Department Scoping: Employee only has access to their department's tasks
  const deptTasks = companyTasks.filter((task) => {
    if (isSuperAdmin) return true;
    return task.department === userDept;
  });

  const handleUpdateProgress = (task: CompanyTask, newProgress: number) => {
    const newStatus = newProgress === 100 ? 'Completed' : (newProgress > 0 ? 'In Progress' : 'Pending');
    updateTask(task.id, {
      progress: newProgress,
      status: newStatus,
    });
    toast({
      title: 'Progress Updated',
      description: `Updated "${task.title}" to ${newProgress}% (${newStatus}).`,
      type: 'success',
    });
  };

  const handleToggleStatus = (task: CompanyTask) => {
    let nextStatus: CompanyTask['status'] = 'In Progress';
    let nextProgress = task.progress;

    if (task.status === 'Pending') {
      nextStatus = 'In Progress';
      nextProgress = task.progress === 0 ? 25 : task.progress;
    } else if (task.status === 'In Progress') {
      nextStatus = 'Completed';
      nextProgress = 100;
    } else {
      nextStatus = 'In Progress';
      nextProgress = 50;
    }

    updateTask(task.id, {
      status: nextStatus,
      progress: nextProgress,
    });

    toast({
      title: 'Status Updated',
      description: `Marked "${task.title}" as ${nextStatus}.`,
      type: 'success',
    });
  };

  const filteredTasks = deptTasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      task.description.toLowerCase().includes(searchVal.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchVal.toLowerCase());
    const matchStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchFilterMode = filterMode === 'All' || task.assignedTo.toLowerCase().includes(userName.toLowerCase());
    return matchSearch && matchStatus && matchFilterMode;
  });

  const myTasksCount = deptTasks.filter(t => t.assignedTo.toLowerCase().includes(userName.toLowerCase())).length;

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-teal-600" /> {userDept} Department Objectives
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Company Tasks</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track and execute deliverables assigned to your department team.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilterMode('All')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'All' ? 'bg-teal-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All {userDept} Tasks ({deptTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('MyTasks')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'MyTasks' ? 'bg-teal-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assigned to Me ({myTasksCount})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-96 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${userDept} tasks by keyword or title...`}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-700 font-semibold text-foreground"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Deferred">Deferred</option>
          </select>
        </div>
      </div>

      {/* Task List Table */}
      <Card className="border border-border/80 shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-extrabold">Task Deliverable</TableHead>
              <TableHead className="text-xs font-extrabold">Assignee</TableHead>
              <TableHead className="text-xs font-extrabold">Priority</TableHead>
              <TableHead className="text-xs font-extrabold">Progress</TableHead>
              <TableHead className="text-xs font-extrabold">Status</TableHead>
              <TableHead className="text-xs font-extrabold">Deadline</TableHead>
              <TableHead className="text-xs font-extrabold text-right">Quick Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                  No company tasks found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const isAssignedToCurrent = task.assignedTo.toLowerCase().includes(userName.toLowerCase());

                return (
                  <TableRow key={task.id} className={`transition-colors ${isAssignedToCurrent ? 'bg-teal-50/20 dark:bg-teal-950/20' : 'hover:bg-muted/30'}`}>
                    <TableCell className="font-semibold max-w-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">{task.title}</p>
                          {isAssignedToCurrent && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                              My Task
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {task.assignedTo}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        task.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        task.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        task.priority === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5 w-28">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>{task.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={task.progress}
                          onChange={(e) => handleUpdateProgress(task, parseInt(e.target.value))}
                          className="w-full accent-teal-700 cursor-pointer h-1.5 bg-muted rounded-lg"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        task.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {task.deadline}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(task)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          task.status === 'Completed'
                            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 hover:bg-emerald-100'
                            : 'border-teal-200 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 hover:bg-teal-100'
                        }`}
                      >
                        {task.status === 'Completed' ? 'Completed ✓' : (task.status === 'Pending' ? 'Start Task' : 'Mark Done')}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}
