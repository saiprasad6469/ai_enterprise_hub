'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, UserPlus, Search, Edit2, Trash2, 
  X, Check, AlertCircle, Sparkles, Building2, User, KeyRound, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { User as UserType } from '@/types';

const adminSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  designation: z.string().optional(),
  department: z.string().min(1, { message: 'Department is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['Admin', 'SuperAdmin']),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export default function SuperAdminAdminsPage() {
  const users = useDataStore((state) => state.users);
  const departmentsList = useDataStore((state) => state.departmentsList);
  const addAdmin = useDataStore((state) => state.addAdmin);
  const deactivateAdmin = useDataStore((state) => state.deactivateAdmin);
  const deleteUser = useDataStore((state) => state.deleteUser);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const adminUsers = users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin' || u.role === 'SUPER_ADMIN');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      designation: 'Enterprise Administrator',
      department: 'Engineering',
      password: '',
      role: 'Admin',
    }
  });

  const onSubmit = (data: AdminFormValues) => {
    addAdmin({
      employeeId: data.employeeId || `ADM-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      email: data.email,
      designation: data.designation || 'Enterprise Administrator',
      department: data.department,
      password: data.password,
      role: data.role,
    });
    toast({
      title: 'Administrator Provisioned',
      description: `Successfully created ${data.role} account for ${data.name}.`,
      type: 'success',
    });
    setIsModalOpen(false);
    reset();
  };


  const handleToggleStatus = (id: string, name: string) => {
    deactivateAdmin(id);
    toast({
      title: 'Status Toggled',
      description: `Updated status for ${name}.`,
      type: 'warning',
    });
  };

  const handleDelete = (id: string, name: string) => {
    deleteUser(id);
    toast({
      title: 'Administrator Removed',
      description: `Revoked privileges and removed ${name}.`,
      type: 'warning',
    });
  };

  const filteredAdmins = adminUsers.filter(u => 
    u.name.toLowerCase().includes(searchVal.toLowerCase()) || 
    u.email.toLowerCase().includes(searchVal.toLowerCase()) ||
    (u.employeeId && u.employeeId.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-900 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-teal-600" /> Super Admin Authority
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Manage Administrators</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Provision new enterprise administrators, revoke permissions, and manage high-level governance keys.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105"
        >
          <UserPlus className="h-4 w-4" /> Add Administrator
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-96 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-600 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or Admin ID..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing {filteredAdmins.length} Administrators
        </div>
      </div>

      {/* Administrators Table */}
      <Card className="border border-border/80 shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-extrabold">Administrator</TableHead>
              <TableHead className="text-xs font-extrabold">Admin ID</TableHead>
              <TableHead className="text-xs font-extrabold">Role Level</TableHead>
              <TableHead className="text-xs font-extrabold">Department Scope</TableHead>
              <TableHead className="text-xs font-extrabold">Status</TableHead>
              <TableHead className="text-xs font-extrabold">Provisioned</TableHead>
              <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-teal-800 text-white flex items-center justify-center text-xs font-bold">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{admin.name}</p>
                      <p className="text-[10px] text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                  {admin.employeeId || 'ADM-101'}
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    admin.role === 'SuperAdmin' || admin.role === 'SUPER_ADMIN'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200'
                      : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200'
                  }`}>
                    {admin.role}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-semibold text-foreground">
                  {admin.department || 'Engineering'}
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    admin.status === 'Active' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {admin.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {admin.joinedAt}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(admin.id, admin.name)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
                        admin.status === 'Active' 
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40' 
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(admin.id, admin.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Revoke and Delete Admin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Administrator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Provision Administrator</h3>
                <p className="text-xs text-muted-foreground">Authorize a new administrator for workspace management.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Admin ID (Custom or Auto)</label>
                  <Input placeholder="e.g. ADM-105" {...register('employeeId')} />
                  {errors.employeeId && <p className="text-xs text-rose-500">{errors.employeeId.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Full Name</label>
                  <Input placeholder="e.g. Johnathan Vance" {...register('name')} />
                  {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Organizational Email</label>
                <Input type="email" placeholder="admin@enterprise.ai" {...register('email')} />
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Designation / Title</label>
                <Input placeholder="e.g. Enterprise Operations Director" {...register('designation')} />
                {errors.designation && <p className="text-xs text-rose-500">{errors.designation.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Role Level</label>
                  <select
                    {...register('role')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Admin">Standard Admin</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Department Scope</label>
                  <select
                    {...register('department')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    {Array.from(new Set([
                      'Engineering', 'Human Resources', 'HR', 'Finance', 'Finance & Accounts', 
                      'Marketing', 'Marketing & PR', 'Operations', 'Operations & Logistics', 
                      'Legal', 'Legal & Compliance', 'IT', 'IT Infrastructure',
                      ...departmentsList.map(d => d.name)
                    ])).map((deptName) => (
                      <option key={deptName} value={deptName}>{deptName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Initial Security Password</label>
                <Input type="password" placeholder="••••••••••••" {...register('password')} />
                {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
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
                  Provision Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
