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
  department: z.enum(['Engineering', 'Legal', 'HR', 'Marketing', 'Operations', 'Finance']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PersonalProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToastStore();

  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar || '');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Sarah Connor',
      email: user?.email || 'sarah.connor@sky-net.io',
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
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary bg-muted flex-shrink-0 shadow">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-primary-foreground">
                    {user?.name[0]}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 flex-1 w-full">
                <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> Avatar Image URL
                </label>
                <Input 
                  type="text" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </label>
                <Input 
                  type="text" 
                  {...register('name')}
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </label>
                <Input 
                  type="email" 
                  {...register('email')}
                  className={errors.email ? "border-rose-500" : ""}
                />
                {errors.email && <p className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Assigned Department
              </label>
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

          </CardContent>

          <CardFooter className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Authenticated as {user?.role}</span>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
            >
              <Save className="h-4 w-4" /> Save Profile
            </button>
          </CardFooter>
        </Card>

      </form>
    </div>
  );
}
