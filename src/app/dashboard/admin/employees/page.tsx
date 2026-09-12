'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, UserPlus, Search, Edit2, Trash2, ShieldCheck, 
  X, Check, AlertCircle, Sparkles, Building2, User, KeyRound, Lock, Eye, EyeOff
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { User as UserType } from '@/types';

const employeeSchema = z.object({
  employeeId: z.string().min(3, { message: 'Employee ID is required (min 3 chars)' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  designation: z.string().min(2, { message: 'Designation / Title is required' }),
  password: z.string().min(6, { message: 'Initial password must be at least 6 characters' }),
  status: z.enum(['Active', 'Inactive']),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function EmployeeManagementPage() {
  const { user } = useAuthStore();
  const users = useDataStore((state) => state.users);
  const addEmployee = useDataStore((state) => state.addEmployee);
  const updateUser = useDataStore((state) => state.updateUser);
  const deactivateEmployee = useDataStore((state) => state.deactivateEmployee);
  const updateEmployeePassword = useDataStore((state) => state.updateEmployeePassword);
  const deleteUser = useDataStore((state) => state.deleteUser);
  const { toast } = useToastStore();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const adminDept = user?.department || 'Engineering';

  const [searchVal, setSearchVal] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserType | null>(null);
  const [newPassword, setNewPassword] = React.useState('');

  // Department Scoping: Admin ONLY has access to see & manage employees in their particular logged-in department
  const employees = users.filter(u => {
    const isEmpRole = u.role === 'Employee' || u.role === 'EMPLOYEE' || u.role === 'Member';
    if (!isEmpRole) return false;
    if (isSuperAdmin) return true;
    return u.department === adminDept;
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      designation: '',
      password: '',
      status: 'Active',
    }
  });

  const handleOpenCreate = () => {
    reset({
      employeeId: `EMP-${Math.floor(200 + Math.random() * 800)}`,
      name: '',
      email: '',
      designation: '',
      password: 'TemporaryPassword123!',
      status: 'Active',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (emp: UserType) => {
    setSelectedUser(emp);
    setValue('employeeId', emp.employeeId || 'EMP-202');
    setValue('name', emp.name);
    setValue('email', emp.email);
    setValue('designation', emp.designation || 'Team Member');
    setValue('status', emp.status === 'Active' ? 'Active' : 'Inactive');
    setValue('password', 'UNCHANGED');
    setIsEditModalOpen(true);
  };

  const handleOpenPasswordReset = (emp: UserType) => {
    setSelectedUser(emp);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const onCreateSubmit = (data: EmployeeFormValues) => {
    addEmployee({
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      department: adminDept, // Lock to admin's particular department
      designation: data.designation,
      password: data.password,
      status: data.status,
    });
    toast({
      title: 'Employee Onboarded',
      description: `Created account for ${data.name} (ID: ${data.employeeId}) in ${adminDept} department.`,
      type: 'success',
    });
    setIsCreateModalOpen(false);
  };

  const onEditSubmit = (data: EmployeeFormValues) => {
    if (selectedUser) {
      updateUser(selectedUser.id, {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        department: adminDept,
        designation: data.designation,
        status: data.status,
      });
      toast({
        title: 'Employee Updated',
        description: `Successfully modified ${data.name}'s information.`,
        type: 'success',
      });
      setIsEditModalOpen(false);
    }
  };

  const onResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || newPassword.length < 6) {
      toast({
        title: 'Password Error',
        description: 'Password must be at least 6 characters.',
        type: 'error',
      });
      return;
    }
    updateEmployeePassword(selectedUser.id, newPassword);
    toast({
      title: 'Password Reset',
      description: `Updated password for ${selectedUser.name}.`,
      type: 'success',
    });
    setIsPasswordModalOpen(false);
  };

  const handleToggleStatus = (emp: UserType) => {
    deactivateEmployee(emp.id);
    toast({
      title: 'Status Updated',
      description: `${emp.name} account is now ${emp.status === 'Active' ? 'Inactive' : 'Active'}.`,
      type: 'warning',
    });
  };

  const handleDelete = (emp: UserType) => {
    deleteUser(emp.id);
    toast({
      title: 'Employee Removed',
      description: `Removed ${emp.name} from department records.`,
      type: 'warning',
    });
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchVal.toLowerCase()) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchVal.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchVal.toLowerCase()))
    );
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Header & Action Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-teal-600" /> {adminDept} Department Scope
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">
            {adminDept} Employee Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your department workforce, provision direct ID credentials, and maintain team security.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105"
        >
          <UserPlus className="h-4 w-4" /> Add {adminDept} Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-96 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, name, email, or designation..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>

        <div className="text-xs font-bold text-muted-foreground">
          Showing {filteredEmployees.length} {adminDept} Department Employees
        </div>
      </div>

      {/* Employee List Table */}
      <Card className="border border-border/80 shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-extrabold">Employee Name</TableHead>
              <TableHead className="text-xs font-extrabold">Employee ID</TableHead>
              <TableHead className="text-xs font-extrabold">Designation</TableHead>
              <TableHead className="text-xs font-extrabold">Department</TableHead>
              <TableHead className="text-xs font-extrabold">Status</TableHead>
              <TableHead className="text-xs font-extrabold">Onboarded</TableHead>
              <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                  No employees found in {adminDept} department matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-teal-800 text-white flex items-center justify-center text-xs font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                    {emp.employeeId || 'EMP-202'}
                  </TableCell>
                  <TableCell className="text-xs text-foreground font-medium">
                    {emp.designation || 'Specialist'}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                    {emp.department}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      emp.status === 'Active' 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {emp.joinedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-muted transition-colors"
                        title="Edit Employee Info"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenPasswordReset(emp)}
                        className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                        title="Reset Employee Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(emp)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          emp.status === 'Active' 
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(emp)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Employee"
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

      {/* Add Employee Modal - Automatically Bound to Admin's Department */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Onboard New Employee</h3>
                <p className="text-xs text-muted-foreground">Admin provisioning: account credentials will be issued for {adminDept}.</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Employee ID</label>
                  <Input placeholder="e.g. EMP-205" {...register('employeeId')} />
                  {errors.employeeId && <p className="text-[11px] text-rose-500">{errors.employeeId.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Full Name</label>
                  <Input placeholder="e.g. Rachel Adams" {...register('name')} />
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Work Email</label>
                <Input type="email" placeholder="rachel.adams@enterprise.ai" {...register('email')} />
                {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Designation / Title</label>
                <Input placeholder="e.g. AI Prompt Specialist" {...register('designation')} />
                {errors.designation && <p className="text-[11px] text-rose-500">{errors.designation.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Initial Password</label>
                  <Input type="text" placeholder="Pass1234!" {...register('password')} />
                  {errors.password && <p className="text-[11px] text-rose-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Account Status</label>
                  <select
                    {...register('status')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
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
                  Create {adminDept} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Update Employee Profile</h3>
                <p className="text-xs text-muted-foreground">Modify designation or access status for {adminDept}.</p>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Employee ID</label>
                  <Input {...register('employeeId')} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Full Name</label>
                  <Input {...register('name')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Work Email</label>
                <Input type="email" {...register('email')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Department</label>
                  <div className="flex h-10 w-full items-center rounded-xl border border-input bg-muted/40 px-3 text-xs font-bold text-foreground">
                    {adminDept}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Designation</label>
                  <Input {...register('designation')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Account Status</label>
                <select
                  {...register('status')}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Reset Password</h3>
                <p className="text-xs text-muted-foreground">{selectedUser.name} ({selectedUser.employeeId || 'EMP-202'})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Enter New Password</label>
                <Input
                  type="text"
                  placeholder="NewSecurePass2026!"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
