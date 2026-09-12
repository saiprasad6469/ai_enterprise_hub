'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, Loader2, KeyRound, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, error } = useAuthStore();
  const { toast } = useToastStore();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const success = await login(data.email, data.email.split('@')[0]);
      if (success) {
        toast({
          title: 'Welcome Back!',
          description: 'Logged in successfully to AI Enterprise Hub.',
          type: 'success',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: error || 'Invalid email or password.',
          type: 'error',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during login.',
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-4">Sign in to Enterprise Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Access your secure workspace database</p>
        </div>

        <Card className="border border-border/80 shadow-xl backdrop-blur-sm bg-card/85">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-bold">Workspace Sign In</CardTitle>
              <CardDescription>Enter your organizational email to access data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="sarah.connor@sky-net.io" 
                    {...register('email')}
                    className={errors.email ? "border-rose-500/80 focus-visible:ring-rose-500" : ""}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-rose-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-semibold text-primary hover:text-primary/95 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    {...register('password')}
                    className={errors.password ? "border-rose-500/80 focus-visible:ring-rose-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-rose-500 mt-1">{errors.password.message}</p>
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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
              
              <div className="text-xs text-center text-muted-foreground mt-1">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary hover:text-primary/95 transition-colors">
                  Create Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
