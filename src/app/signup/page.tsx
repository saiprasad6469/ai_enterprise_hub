'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, Loader2, Mail, User, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  department: z.enum(['Engineering', 'Legal', 'HR', 'Marketing', 'Operations', 'Finance']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, error } = useAuthStore();
  const { toast } = useToastStore();
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      department: 'Engineering',
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const success = await signup(data.name, data.email, data.department);
      if (success) {
        toast({
          title: 'Account Created',
          description: `Welcome to the Hub, ${data.name}!`,
          type: 'success',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Registration Failed',
          description: error || 'Could not complete signup.',
          type: 'error',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during signup.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* App Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BrainCircuit className="h-6 w-6" />
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-4">Create Enterprise Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Get access to your team AI environment</p>
        </div>

        <Card className="border border-border/80 shadow-xl backdrop-blur-sm bg-card/85">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-bold">Workspace Sign Up</CardTitle>
              <CardDescription>Enter details to request workspace integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </label>
                <Input 
                  type="text" 
                  placeholder="Sarah Connor" 
                  {...register('name')}
                  className={errors.name ? "border-rose-500/80 focus-visible:ring-rose-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </label>
                <Input 
                  type="email" 
                  placeholder="sarah.connor@sky-net.io" 
                  {...register('email')}
                  className={errors.email ? "border-rose-500/80 focus-visible:ring-rose-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-rose-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Department
                </label>
                <select
                  {...register('department')}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 focus:border-primary/50 text-foreground"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Legal">Legal</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
                {errors.department && (
                  <p className="text-xs font-medium text-rose-500 mt-1">{errors.department.message}</p>
                )}
              </div>

            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating Account...
                  </>
                ) : (
                  'Create Enterprise Account'
                )}
              </button>
              
              <div className="text-xs text-center text-muted-foreground mt-1">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/95 transition-colors">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
