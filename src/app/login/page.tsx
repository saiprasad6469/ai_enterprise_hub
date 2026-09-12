'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  BrainCircuit, Loader2, KeyRound, Eye, EyeOff, 
  ShieldCheck, User, Users, DollarSign, Megaphone, Settings,
  Scale, Shield, Headphones, Laptop, Code, TrendingUp, Check, Network, ArrowRight,
  ShieldAlert, Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Configuration for departments (reusable/configurable list)
const DEPARTMENTS = [
  { id: 'HR', name: 'HR', fullName: 'Human Resources', icon: Users, desc: 'Department Workspace' },
  { id: 'IT', name: 'IT', fullName: 'IT Infrastructure', icon: Laptop, desc: 'Department Workspace' },
  { id: 'Finance', name: 'FINANCE', fullName: 'Finance & Accounts', icon: DollarSign, desc: 'Department Workspace' },
  { id: 'Marketing', name: 'MARKETING', fullName: 'Marketing & PR', icon: Megaphone, desc: 'Department Workspace' },
  { id: 'Operations', name: 'OPERATIONS', fullName: 'Operations & Logistics', icon: Settings, desc: 'Department Workspace' },
  { id: 'Engineering', name: 'ENGINEERING', fullName: 'Engineering', icon: Code, desc: 'Department Workspace' },
  { id: 'Sales', name: 'SALES', fullName: 'Sales & Growth', icon: TrendingUp, desc: 'Department Workspace' },
  { id: 'Legal', name: 'LEGAL', fullName: 'Legal Affairs', icon: Scale, desc: 'Department Workspace' },
  { id: 'Compliance', name: 'COMPLIANCE', fullName: 'Compliance Check', icon: Shield, desc: 'Department Workspace' },
  { id: 'Support', name: 'SUPPORT', fullName: 'Support Center', icon: Headphones, desc: 'Department Workspace' }
];

const loginSchema = z.object({
  id: z.string().min(3, { message: 'ID must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuthStore();
  const { toast } = useToastStore();
  
  // Authentication Step Tracking:
  // Step 1: Who are you? (Role Selection)
  // Step 2: Department Selection (Skipped for Super Admin!)
  // Step 3: Login form input (Employee ID / Admin ID / Super Admin ID, Password)
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = React.useState<'SuperAdmin' | 'Admin' | 'Employee'>('Employee');
  const [selectedDept, setSelectedDept] = React.useState<string>('Finance');
  
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: '',
      password: '',
    }
  });

  // Check URL query parameters for direct role presets
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role');
      if (roleParam === 'SuperAdmin') {
        setSelectedRole('SuperAdmin');
        // Super Admin goes directly to Step 3 (No department step needed)
        setStep(3);
      } else if (roleParam === 'Admin') {
        setSelectedRole('Admin');
        setStep(2);
      }
    }
  }, []);

  // Set default values for demonstration convenience when steps change
  React.useEffect(() => {
    if (step === 3) {
      if (selectedRole === 'SuperAdmin') {
        setValue('id', 'SADM-001');
        setValue('password', 'superpassword123');
      } else if (selectedRole === 'Admin') {
        setValue('id', 'ADM-101');
        setValue('password', 'adminpassword123');
      } else {
        setValue('id', 'EMP-202');
        setValue('password', 'employeepassword123');
      }
    }
  }, [step, selectedRole, setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    const targetDept = selectedRole === 'SuperAdmin' ? undefined : selectedDept;

    try {
      const success = await login(data.id, data.password, selectedRole, targetDept as any);
      if (success) {
        const loggedUser = useAuthStore.getState().user;
        const actualRole = loggedUser?.role || selectedRole;
        toast({
          title: `Welcome back, ${actualRole === 'SuperAdmin' || actualRole === 'SUPER_ADMIN' ? 'Super Administrator' : actualRole}!`,
          description: `Authenticated successfully to AI Enterprise Hub.`,
          type: 'success',
        });
        if (actualRole === 'SuperAdmin' || actualRole === 'SUPER_ADMIN') {
          router.push('/dashboard/super-admin');
        } else if (actualRole === 'Admin' || actualRole === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/employee');
        }
      } else {
        toast({
          title: 'Login Failed',
          description: error || 'Invalid credentials. You can use the default demo values below.',
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

  // Progress Indicators matching the provided image style
  const renderProgressFlow = (activeStepIndex: number) => {
    const isSuper = selectedRole === 'SuperAdmin';
    const flowItems = isSuper ? [
      { step: 1, label: 'Access Tier' },
      { step: 2, label: 'Super Admin Auth' },
      { step: 3, label: 'Organization Console' }
    ] : [
      { step: 1, label: 'Grant Access' },
      { step: 2, label: 'Select Role' },
      { step: 3, label: 'Department' },
      { step: 4, label: 'Authentication' },
      { step: 5, label: 'Workspace' }
    ];

    const currentStepNum = isSuper ? (activeStepIndex === 1 ? 1 : 2) : activeStepIndex;

    return (
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-semibold text-slate-500 select-none max-w-full overflow-x-auto pb-4 mt-8">
        {flowItems.map((item, idx) => {
          const isCompleted = item.step < currentStepNum;
          const isActive = item.step === currentStepNum;

          return (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[9px] sm:text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-teal-800 text-white shadow-sm' 
                    : isActive 
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900/10' 
                      : 'bg-white border border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3px]" /> : item.step}
                </div>
                <span className={`hidden sm:inline transition-colors duration-300 ${
                  isActive ? 'text-slate-950 dark:text-slate-200 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {item.label}
                </span>
              </div>
              {idx < flowItems.length - 1 && (
                <div className={`h-[1px] w-6 sm:w-10 transition-colors duration-300 ${
                  isCompleted ? 'bg-teal-800' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30 pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md hover:scale-105 transition-transform">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#0d2826] dark:text-teal-200 uppercase">
            Enterprise Knowledge Hub
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <span className="text-xs">?</span>
          </button>
          <button className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <span className="text-xs">⚙️</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-teal-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            <User className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Main Flow Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 w-full mt-6 mb-8">
        
        {/* Step 1: Who are you? (Role Selection) */}
        {step === 1 && (
          <div className="w-full max-w-5xl text-center space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900/50 px-4 py-1 text-[10px] sm:text-xs font-black tracking-widest uppercase select-none">
                Role Based Access Control
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                Choose Your Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Select an access profile to continue into your department workspace or global governance console.
              </p>
            </div>

            {/* Role Options Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* Employee Card */}
              <div className="group relative rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl shadow-slate-100/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:border-teal-500/30 backdrop-blur-md flex flex-col justify-between items-center text-center gap-6 min-h-[300px]">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-teal-500/20 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-teal-500/30 border-dashed animate-[spin_10s_linear_infinite_reverse]" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
                    <User className="h-7 w-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Employee</h2>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                    Standard access to department knowledge, collaborative research, and AI assisted workflows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Employee');
                    setStep(2);
                  }}
                  className="w-full sm:w-auto min-w-[130px] inline-flex h-10 items-center justify-center rounded-full bg-teal-50/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900/50 hover:bg-teal-800 hover:text-white hover:border-teal-800 px-5 text-xs font-bold transition-all duration-200 hover:scale-105"
                >
                  Access Hub <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </button>
              </div>

              {/* Administrator Card */}
              <div className="group relative rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl shadow-slate-100/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:border-teal-500/30 backdrop-blur-md flex flex-col justify-between items-center text-center gap-6 min-h-[300px]">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-teal-500/20 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-teal-500/30 border-dashed animate-[spin_10s_linear_infinite_reverse]" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Administrator</h2>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                    Manage department employees, upload department RAG documents, and coordinate team tasks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Admin');
                    setStep(2);
                  }}
                  className="w-full sm:w-auto min-w-[130px] inline-flex h-10 items-center justify-center rounded-full bg-teal-50/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900/50 hover:bg-teal-800 hover:text-white hover:border-teal-800 px-5 text-xs font-bold transition-all duration-200 hover:scale-105"
                >
                  Enter Console <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </button>
              </div>

              {/* Super Admin Card - DIRECT LOGIN (NO DEPARTMENT STEP) */}
              <div className="group relative rounded-3xl border border-teal-400/80 dark:border-teal-700/80 bg-gradient-to-b from-teal-50/60 to-white dark:from-slate-900 dark:to-slate-950 p-6 shadow-xl shadow-teal-500/10 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:border-teal-600 backdrop-blur-md flex flex-col justify-between items-center text-center gap-6 min-h-[300px]">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-teal-600/30 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-teal-600/50 border-dashed animate-[spin_10s_linear_infinite_reverse]" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-800 text-white shadow-md">
                    <ShieldAlert className="h-7 w-7 text-teal-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-1.5">
                    Super Admin
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                    Global single-authority: manage all administrators, view system audit logs, and global organization settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('SuperAdmin');
                    // DIRECT LOGIN FOR SUPER ADMIN: No department step!
                    setStep(3);
                  }}
                  className="w-full sm:w-auto min-w-[130px] inline-flex h-10 items-center justify-center rounded-full bg-teal-800 text-white shadow-md hover:bg-teal-900 px-5 text-xs font-bold transition-all duration-200 hover:scale-105"
                >
                  Direct Super Login <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </button>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col items-center">
              {renderProgressFlow(2)}
              <Link
                href="/"
                className="mt-6 inline-flex h-9 items-center justify-center px-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-103 transition-all"
              >
                Back to Landing
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Department Selection (ONLY for Employee & Admin) */}
        {step === 2 && (
          <div className="w-full max-w-5xl text-center space-y-8 relative">
            
            {/* Top Left Back Button */}
            <div className="absolute top-0 left-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-3 pt-8 md:pt-0">
              <span className="inline-flex items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900/50 px-4 py-1 text-[10px] sm:text-xs font-black tracking-widest uppercase select-none">
                {selectedRole === 'Admin' ? 'Administrator Department Scope' : 'Employee Department Selection'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                Select Your Department
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Choose the department workspace you operate in.
              </p>
            </div>

            {/* Department Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto pt-4">
              {DEPARTMENTS.map((dept) => {
                const DeptIcon = dept.icon;
                const isSelected = selectedDept === dept.id;

                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept.id);
                      setTimeout(() => setStep(3), 150);
                    }}
                    className={`group relative rounded-2xl border bg-white/70 dark:bg-slate-900/60 p-4 sm:p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg shadow-teal-500/5'
                        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                      isSelected 
                        ? 'bg-teal-800 text-white' 
                        : 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 group-hover:scale-105'
                    }`}>
                      <DeptIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
                        {dept.name}
                      </h3>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {dept.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col items-center">
              {renderProgressFlow(3)}
            </div>
          </div>
        )}

        {/* Step 3: Actual Login Page */}
        {step === 3 && (
          <div className="w-full max-w-md text-center space-y-6 relative">
            
            {/* Top Left Back Button */}
            <div className="absolute top-[-36px] left-0">
              <button
                type="button"
                onClick={() => {
                  if (selectedRole === 'SuperAdmin') {
                    setStep(1); // Super admin goes straight back to Step 1
                  } else {
                    setStep(2); // Regular roles go back to department selection
                  }
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {selectedRole === 'SuperAdmin' ? '← Change Role' : '← Change Department'}
              </button>
            </div>

            <Card className="border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90 rounded-3xl text-left relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="h-1 bg-gradient-to-r from-teal-600 to-emerald-700" />
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader className="space-y-4 pb-4 items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300">
                    {selectedRole === 'SuperAdmin' ? <Globe className="h-6 w-6" /> : <Network className="h-6 w-6" />}
                  </div>
                  
                  {/* Selected badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/30">
                      {selectedRole === 'SuperAdmin' ? 'Super Administrator' : (selectedRole === 'Admin' ? 'Administrator' : 'Employee')}
                    </span>
                    {selectedRole === 'SuperAdmin' ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                        Scope: Whole Organization
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-100 dark:border-teal-900">
                        Dept: {DEPARTMENTS.find(d => d.id === selectedDept)?.fullName || selectedDept}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                      {selectedRole === 'SuperAdmin' ? 'Super Admin Portal' : 'Authenticate'}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-slate-400">
                      {selectedRole === 'SuperAdmin' 
                        ? 'Direct access to platform-wide governance'
                        : 'Use your organization credentials'}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  {/* ID Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-teal-600" /> 
                      {selectedRole === 'SuperAdmin' ? 'Super Admin ID' : (selectedRole === 'Admin' ? 'Administrator ID' : 'Employee ID')}
                    </label>
                    <Input 
                      type="text" 
                      placeholder={selectedRole === 'SuperAdmin' ? "e.g. SADM-001" : (selectedRole === 'Admin' ? "e.g. ADM-101" : "e.g. EMP-202")} 
                      {...register('id')}
                      className={`h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus-visible:ring-teal-800 ${
                        errors.id ? "border-rose-500/80 focus-visible:ring-rose-500" : ""
                      }`}
                    />
                    {errors.id && (
                      <p className="text-xs font-medium text-rose-500 mt-1">{errors.id.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-teal-600" /> Security Password
                      </label>
                    </div>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        {...register('password')}
                        className={`h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 pr-10 focus-visible:ring-teal-800 ${
                          errors.password ? "border-rose-500/80 focus-visible:ring-rose-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs font-medium text-rose-500 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-teal-800 focus:ring-teal-800 h-3.5 w-3.5" />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        toast({
                          title: 'Forgot Password?',
                          description: 'Please contact your enterprise IT administrator to reset credentials.',
                          type: 'default'
                        });
                      }}
                      className="font-bold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex h-11 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg bg-teal-800 hover:bg-teal-900 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Authenticating...
                      </>
                    ) : (
                      <>
                        {selectedRole === 'SuperAdmin' ? 'Access Super Admin Console' : 'Continue to Workspace'} <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Quick Helper Credentials UI */}
                  <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-2">Instant Demo Access:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('SuperAdmin');
                          setValue('id', 'SADM-001');
                          setValue('password', 'superpassword123');
                          clearError();
                        }}
                        className="py-1 px-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold rounded-lg text-teal-900 dark:text-teal-200 hover:bg-teal-100 border border-teal-200/50 truncate"
                      >
                        Super Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('Admin');
                          setValue('id', 'ADM-101');
                          setValue('password', 'adminpassword123');
                          clearError();
                        }}
                        className="py-1 px-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold rounded-lg text-teal-800 dark:text-teal-300 hover:bg-teal-50 border border-teal-200/30 truncate"
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('Employee');
                          setValue('id', 'EMP-202');
                          setValue('password', 'employeepassword123');
                          clearError();
                        }}
                        className="py-1 px-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold rounded-lg text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 border border-emerald-200/30 truncate"
                      >
                        Employee
                      </button>
                    </div>
                  </div>
                </CardFooter>
              </form>
            </Card>

            <div className="pt-2 flex flex-col items-center">
              {renderProgressFlow(4)}
            </div>
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-4 z-10">
        <p className="text-[10px] sm:text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Enterprise AI Knowledge Hub. All rights reserved. Multi-level RBAC access system.
        </p>
      </footer>
      
    </div>
  );
}
