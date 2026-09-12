'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, UserPlus, Search, Edit2, Trash2, ShieldCheck, 
  X, Check, AlertCircle, Sparkles, Building2, User 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';

const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.enum(['SuperAdmin', 'Admin', 'Employee', 'Member', 'Viewer']),
  department: z.string().min(2, { message: 'Department is required' }),
  status: z.enum(['Active', 'Inactive', 'Invited']),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersManagementPage() {
  const users = useDataStore((state) => state.users);
  const addUser = useDataStore((state) => state.addUser);
  const updateUser = useDataStore((state) => state.updateUser);
  const deleteUser = useDataStore((state) => state.deleteUser);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserType | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Employee',
      department: 'Engineering',
      status: 'Active',
    }
  });

  const handleOpenEdit = (u: UserType) => {
    setEditingUser(u);
    setValue('name', u.name);
    setValue('email', u.email);
    setValue('role', (u.role === 'SUPER_ADMIN' ? 'SuperAdmin' : (u.role === 'ADMIN' ? 'Admin' : (u.role === 'EMPLOYEE' ? 'Employee' : u.role))) as any);
    setValue('department', u.department);
    setValue('status', u.status);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset({
      name: '',
      email: '',
      role: 'Member',
      department: 'Engineering',
      status: 'Invited',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: UserFormValues) => {
    if (editingUser) {
      updateUser(editingUser.id, data);
      toast({
        title: 'User Updated',
        description: `Successfully modified profile of ${data.name}.`,
        type: 'success',
      });
    } else {
      addUser(data);
      toast({
        title: 'User Invited',
        description: `Invitation sent to ${data.email}.`,
        type: 'success',
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteUser(id);
    toast({
      title: 'User Removed',
      description: `Removed ${name} from your workspace seats.`,
      type: 'warning',
    });
  };

  // Filter list
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchVal.toLowerCase());
    const matchDept = deptFilter === 'All' || u.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Administration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage seat allocations, roles, and functional divisions for workspace developers.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-card/40 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 flex items-center border border-border bg-background px-3 py-1.5 rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search email or name..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground px-2 text-foreground"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-semibold text-foreground"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Legal">Legal</option>
          <option value="HR">HR</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
          <option value="Finance">Finance</option>
        </select>
      </div>

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <Card className="border border-border/80 text-center p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">No members found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Try typing another email or invite a new collaborator to join.</p>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Member</TableHead>
              <TableHead className="font-bold">Email Address</TableHead>
              <TableHead className="font-bold">Department</TableHead>
              <TableHead className="font-bold">Role Seat</TableHead>
              <TableHead className="font-bold">Joined Date</TableHead>
              <TableHead className="font-bold">Status State</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => {
              const isActive = u.status === 'Active';
              const isInvited = u.status === 'Invited';

              return (
                <TableRow key={u.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-xl border border-border bg-muted">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                            {u.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-foreground">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      u.role === 'Admin' && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                      u.role === 'Member' && "bg-neutral-500/10 border-neutral-500/20 text-neutral-500 dark:text-neutral-400",
                      u.role === 'Viewer' && "bg-teal-500/10 border-teal-500/20 text-teal-500"
                    )}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.joinedAt}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded",
                      isActive && "bg-emerald-500/10 text-emerald-500",
                      isInvited && "bg-blue-500/10 text-blue-500",
                      u.status === 'Inactive' && "bg-rose-500/10 text-rose-500"
                    )}>
                      {u.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit privileges"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Invite/Edit Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-foreground">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> 
                {editingUser ? 'Update Member Workspace' : 'Invite Team Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Full Name</label>
                <Input 
                  type="text" 
                  placeholder="John Connor" 
                  {...register('name')}
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="john.connor@sky-net.io" 
                  {...register('email')}
                  className={errors.email ? "border-rose-500" : ""}
                />
                {errors.email && <p className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Privileges Role</label>
                  <select
                    {...register('role')}
                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Department Slot</label>
                  <select
                    {...register('department')}
                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Legal">Legal</option>
                    <option value="HR">HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Status State</label>
                <select
                  {...register('status')}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 font-semibold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
                >
                  {editingUser ? 'Save Privileges' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
