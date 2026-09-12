'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CheckSquare, Plus, Search, Edit2, Trash2, Calendar, 
  User, Building2, AlertCircle, CheckCircle2, Clock, X, Flag, Sparkles
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { CompanyTask } from '@/types';

const taskSchema = z.object({
  title: z.string().min(3, { message: 'Task title is required (min 3 chars)' }),
  description: z.string().min(5, { message: 'Task description is required (min 5 chars)' }),
  assignedTo: z.string().min(2, { message: 'Assignee is required' }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Deferred']),
  deadline: z.string().min(4, { message: 'Deadline date is required' }),
  progress: z.number().min(0).max(100),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function CompanyTasksPage() {
  const { user } = useAuthStore();
  const companyTasks = useDataStore((state) => state.companyTasks);
  const users = useDataStore((state) => state.users);
  const addTask = useDataStore((state) => state.addTask);
  const updateTask = useDataStore((state) => state.updateTask);
  const deleteTask = useDataStore((state) => state.deleteTask);
  const { toast } = useToastStore();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const adminDept = user?.department || 'Engineering';

  const [searchVal, setSearchVal] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [priorityFilter, setPriorityFilter] = React.useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<CompanyTask | null>(null);

  // Department Scoping: Only list employees from admin's department
  const deptEmployees = users.filter(u => {
    const isEmpRole = u.role === 'Employee' || u.role === 'EMPLOYEE' || u.role === 'Member';
    if (!isEmpRole) return false;
    if (isSuperAdmin) return true;
    return u.department === adminDept;
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: deptEmployees[0]?.name || 'Department Member',
      priority: 'Medium',
      status: 'Pending',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
    }
  });

  const handleOpenCreate = () => {
    reset({
      title: '',
      description: '',
      assignedTo: deptEmployees[0]?.name || 'Department Member',
      priority: 'Medium',
      status: 'Pending',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (task: CompanyTask) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('description', task.description);
    setValue('assignedTo', task.assignedTo);
    setValue('priority', task.priority);
    setValue('status', task.status);
    setValue('deadline', task.deadline);
    setValue('progress', task.progress);
    setIsEditModalOpen(true);
  };

  const onCreateSubmit = (data: TaskFormValues) => {
    addTask({
      ...data,
      department: adminDept, // Auto-locked to Admin's department
    });
    toast({
      title: 'Task Assigned',
      description: `Task "${data.title}" assigned to ${data.assignedTo} in ${adminDept}.`,
      type: 'success',
    });
    setIsCreateModalOpen(false);
  };

  const onEditSubmit = (data: TaskFormValues) => {
    if (editingTask) {
      updateTask(editingTask.id, {
        ...data,
        department: adminDept,
      });
      toast({
        title: 'Task Updated',
        description: `Successfully modified task "${data.title}".`,
        type: 'success',
      });
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = (task: CompanyTask) => {
    deleteTask(task.id);
    toast({
      title: 'Task Removed',
      description: `Removed "${task.title}" from ${adminDept} backlog.`,
      type: 'warning',
    });
  };

  // Department Scoping: Admin ONLY has access to their department's tasks
  const filteredTasks = companyTasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      task.description.toLowerCase().includes(searchVal.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchVal.toLowerCase());
    const matchStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    
    if (isSuperAdmin) {
      return matchSearch && matchStatus && matchPriority;
    }
    return matchSearch && matchStatus && matchPriority && task.department === adminDept;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-teal-600" /> {adminDept} Task Operations
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{adminDept} Company Tasks</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Delegate objectives to {adminDept} department employees and monitor milestone delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Create {adminDept} Task
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full lg:w-96 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${adminDept} tasks or assignees...`}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-700 font-semibold text-foreground"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Deferred">Deferred</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-700 font-semibold text-foreground"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Tasks Table */}
      <Card className="border border-border/80 shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-extrabold">Task Objective</TableHead>
              <TableHead className="text-xs font-extrabold">Assignee</TableHead>
              <TableHead className="text-xs font-extrabold">Department</TableHead>
              <TableHead className="text-xs font-extrabold">Priority</TableHead>
              <TableHead className="text-xs font-extrabold">Progress</TableHead>
              <TableHead className="text-xs font-extrabold">Status</TableHead>
              <TableHead className="text-xs font-extrabold">Deadline</TableHead>
              <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                  No company tasks found for {adminDept} department. Click create task above to delegate work.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold max-w-xs">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{task.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-foreground">
                    {task.assignedTo}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                    {task.department}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      task.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      task.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      task.priority === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 w-24">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            task.progress === 100 ? 'bg-emerald-600' : 'bg-teal-700'
                          }`} 
                          style={{ width: `${task.progress}%` }} 
                        />
                      </div>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-muted transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Task Modal - Locked to Admin's Department */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Create {adminDept} Task</h3>
                <p className="text-xs text-muted-foreground">Delegate work item to a member of {adminDept}.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-3">
              {/* Department Auto-Locked Badge */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Department Assignment</label>
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/40 px-3.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal-600" /> {adminDept} Department
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-teal-200/60 dark:bg-teal-900 px-2 py-0.5 rounded-full">
                    Auto-Bound
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Task Objective / Title</label>
                <Input placeholder="e.g. Audit Department Knowledge Documents" {...register('title')} />
                {errors.title && <p className="text-[11px] text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Assign To ({adminDept} Staff)</label>
                  <select
                    {...register('assignedTo')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    {deptEmployees.length === 0 ? (
                      <option value="Department Member">Department Member</option>
                    ) : (
                      deptEmployees.map(e => (
                        <option key={e.id} value={e.name}>{e.name} ({e.designation || 'Specialist'})</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Priority Level</label>
                  <select
                    {...register('priority')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Target Deadline</label>
                <Input type="date" {...register('deadline')} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Task Scope & Instructions</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Detail deliverables and expected outcomes..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 text-foreground"
                />
                {errors.description && <p className="text-[11px] text-rose-500">{errors.description.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all"
                >
                  Assign {adminDept} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Update Company Task</h3>
                <p className="text-xs text-muted-foreground">Adjust priority, progress percentage, or deadline for {adminDept}.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Task Objective</label>
                <Input {...register('title')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Assignee</label>
                  <select
                    {...register('assignedTo')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    {deptEmployees.map(e => (
                      <option key={e.id} value={e.name}>{e.name} ({e.designation || 'Specialist'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Status</label>
                  <select
                    {...register('status')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Priority</label>
                  <select
                    {...register('priority')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Progress (%)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    {...register('progress', { valueAsNumber: true })} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Deadline Date</label>
                <Input type="date" {...register('deadline')} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
