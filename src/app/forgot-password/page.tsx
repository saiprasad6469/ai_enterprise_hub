'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,_#e6f7f5_0%,_#f2faf8_50%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_50%_20%,_#091d1a_0%,_#0c1514_50%,_#090d0e_100%)] py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* App Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl shadow-teal-600/20 hover:scale-105 transition-transform">
            <BrainCircuit className="h-7 w-7" />
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0d2826] dark:text-slate-100 mt-4">Reset Workspace Password</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Regain access to your AI Enterprise Hub environment</p>
        </div>

        <Card className="border border-teal-200/80 dark:border-teal-900/60 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90 rounded-3xl">
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg font-extrabold text-[#0d2826] dark:text-slate-100">Request Reset Link</CardTitle>
                <CardDescription className="text-xs">Enter your email and we will send instructions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-teal-600" /> Workspace Email
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
              </CardContent>

              <CardFooter className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-xs font-bold text-white shadow-lg shadow-teal-800/20 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending link...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
                
                <div className="text-xs text-center text-muted-foreground mt-1">
                  <Link href="/login" className="font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1.5 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reset Email Transmitted</h3>
              <p className="text-xs text-muted-foreground leading-relaxed px-4">
                We have transmitted instructions to reset your password. If it is a registered corporate account, you should receive it in a few minutes.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-teal-700 hover:bg-teal-800 text-xs font-bold text-white shadow-md transition-colors"
                >
                  Back to Log In
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
