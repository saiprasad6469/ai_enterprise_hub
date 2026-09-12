'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Mail, Building2, KeyRound, Save, 
  Camera, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  department: z.string().min(2, { message: 'Department is required' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PersonalProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToastStore();

  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar || '');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Enterprise User',
      email: user?.email || 'user@enterprise.ai',
      department: user?.department || 'Engineering',
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile({
      name: data.name,
      email: data.email,
      department: data.department,
      avatar: avatarUrl,
    });

    toast({
      title: 'Profile Updated',
      description: 'Personal details saved to workspace identity.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Personal Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your identity avatar, notification emails, and security credentials.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Avatar & Profile Card */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile Identity</CardTitle>
            <CardDescription>Your public information inside team consultations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-xs">
            
            {/* Avatar Preview & URL */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-border/80 rounded-2xl bg-muted/20">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary bg-muted flex-shrink-0 shadow flex items-center justify-center font-bold text-xl text-teal-800">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 w-full space-y-1.5">
                <label className="font-bold flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Avatar Image URL</label>
                <Input 
                  placeholder="https://images.unsplash.com/photo-..." 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="bg-background"
                />
                <p className="text-[10px] text-muted-foreground">Accepts direct JPG, PNG, or Unsplash public image URLs.</p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> Full Name</label>
                <Input {...register('name')} className="bg-background" />
                {errors.name && <p className="text-destructive font-medium">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> Workspace Email</label>
                <Input type="email" {...register('email')} className="bg-background" />
                {errors.email && <p className="text-destructive font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-primary" /> Department</label>
                <select 
                  {...register('department')}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Legal">Legal</option>
                  <option value="HR">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">IT</option>
                  <option value="Sales">Sales</option>
                </select>
                {errors.department && <p className="text-destructive font-medium">{errors.department.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Workspace Role</label>
                <div className="flex h-10 w-full items-center rounded-xl border border-border bg-muted/40 px-3 font-semibold text-muted-foreground">
                  {user?.role || 'Employee'}
                </div>
              </div>

            </div>

          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/80 p-4">
            <button 
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-md hover:scale-103 transition-all"
            >
              <Save className="h-4 w-4" /> Save Profile Details
            </button>
          </CardFooter>
        </Card>

      </form>

    </div>
  );
}
