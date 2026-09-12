'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, Plus, Search, Edit2, Trash2, Users, FileText, 
  CheckCircle2, X, Sparkles, FolderGit2
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Department } from '@/types';

const departmentSchema = z.object({
  name: z.string().min(2, { message: 'Department name is required' }),
  code: z.string().min(2, { message: 'Code is required (e.g. ENG, HR)' }),
  head: z.string().min(2, { message: 'Department Head is required' }),
  description: z.string().min(5, { message: 'Description is required' }),
  employeeCount: z.number().min(0),
  documentCount: z.number().min(0),
  status: z.enum(['Active', 'Archived']),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function DepartmentsPage() {
  const departmentsList = useDataStore((state) => state.departmentsList);
  const addDepartment = useDataStore((state) => state.addDepartment);
  const updateDepartment = useDataStore((state) => state.updateDepartment);
  const deleteDepartment = useDataStore((state) => state.deleteDepartment);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      head: '',
      description: '',
      employeeCount: 5,
      documentCount: 8,
      status: 'Active',
    }
  });

  const handleOpenCreate = () => {
    setEditingDept(null);
    reset({
      name: '',
      code: '',
      head: '',
      description: '',
      employeeCount: 1,
      documentCount: 0,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setValue('name', dept.name);
    setValue('code', dept.code);
    setValue('head', dept.head);
    setValue('description', dept.description);
    setValue('employeeCount', dept.employeeCount);
    setValue('documentCount', dept.documentCount);
    setValue('status', dept.status);
    setIsModalOpen(true);
  };

  const onSubmit = (data: DepartmentFormValues) => {
    if (editingDept) {
      updateDepartment(editingDept.id, data);
      toast({
        title: 'Department Updated',
        description: `Modified parameters for ${data.name}.`,
        type: 'success',
      });
    } else {
      addDepartment(data);
      toast({
        title: 'Department Created',
        description: `Created department ${data.name} (${data.code}).`,
        type: 'success',
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (dept: Department) => {
    deleteDepartment(dept.id);
    toast({
      title: 'Department Archived',
      description: `Removed ${dept.name} from active directories.`,
      type: 'warning',
    });
  };

  const filteredDepts = departmentsList.filter(d =>
    d.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    d.code.toLowerCase().includes(searchVal.toLowerCase()) ||
    d.head.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
              Organizational Units
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Departments Governance</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure enterprise business units, designate department leadership, and view RAG knowledge partitions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-96 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search department by name, code, or leader..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {filteredDepts.length} Total Departments
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <Card key={dept.id} className="border border-border/80 shadow-md hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-xs border border-teal-200/50">
                    {dept.code}
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold">{dept.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">Head: {dept.head}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dept.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {dept.status}
                </span>
              </div>
              <CardDescription className="text-xs line-clamp-2 pt-1 leading-relaxed">
                {dept.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                <div className="p-2.5 rounded-xl bg-muted/40 flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  <div>
                    <span className="font-bold text-foreground block">{dept.employeeCount}</span>
                    <span className="text-[10px] text-muted-foreground">Members</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-foreground block">{dept.documentCount}</span>
                    <span className="text-[10px] text-muted-foreground">Documents</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(dept)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold hover:bg-muted/40 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(dept)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Archive Department"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {editingDept ? 'Update Department' : 'Create Department'}
                </h3>
                <p className="text-xs text-muted-foreground">Configure business unit parameters.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-foreground">Department Name</label>
                  <Input placeholder="e.g. Legal & Compliance" {...register('name')} />
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Code</label>
                  <Input placeholder="e.g. LEG" {...register('code')} />
                  {errors.code && <p className="text-[11px] text-rose-500">{errors.code.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Department Head</label>
                <Input placeholder="e.g. Claire Lee" {...register('head')} />
                {errors.head && <p className="text-[11px] text-rose-500">{errors.head.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Member Count</label>
                  <Input type="number" {...register('employeeCount', { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Status</label>
                  <select
                    {...register('status')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Primary mission and operational scope..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 text-foreground"
                />
                {errors.description && <p className="text-[11px] text-rose-500">{errors.description.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
