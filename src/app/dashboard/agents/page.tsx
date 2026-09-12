'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Bot, PlusCircle, Search, Edit2, Trash2, ArrowRight, 
  HelpCircle, Settings, Check, X, ShieldAlert, Building2 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AIAgent } from '@/types';

const agentSchema = z.object({
  name: z.string().min(2, { message: 'Agent name must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Provide a detailed description of at least 10 characters' }),
  model: z.string().min(1, { message: 'Select a model configuration' }),
  status: z.enum(['Active', 'Maintenance', 'Disabled']),
  promptTemplate: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export default function AIAgentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const agents = useDataStore((state) => state.agents);
  const addAgent = useDataStore((state) => state.addAgent);
  const updateAgent = useDataStore((state) => state.updateAgent);
  const deleteAgent = useDataStore((state) => state.deleteAgent);
  const createNewChat = useDataStore((state) => state.createNewChat);
  const { toast } = useToastStore();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const userDept = user?.department || 'Engineering';

  const [searchVal, setSearchVal] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<AIAgent | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      model: 'GPT-4o Enterprise',
      status: 'Active',
      promptTemplate: '',
    }
  });

  // Open modal for editing
  const handleOpenEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setValue('name', agent.name);
    setValue('description', agent.description);
    setValue('model', agent.model);
    setValue('status', agent.status);
    setValue('promptTemplate', agent.promptTemplate || '');
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleOpenCreate = () => {
    setEditingAgent(null);
    reset({
      name: '',
      description: '',
      model: 'GPT-4o Enterprise',
      status: 'Active',
      promptTemplate: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: AgentFormValues) => {
    if (editingAgent) {
      updateAgent(editingAgent.id, {
        ...data,
        department: editingAgent.department,
      });
      toast({
        title: 'Agent Updated',
        description: `Successfully saved modifications to "${data.name}".`,
        type: 'success',
      });
    } else {
      addAgent({
        ...data,
        department: userDept, // Auto-bound to Admin's department
      });
      toast({
        title: 'Agent Created',
        description: `Successfully created and deployed "${data.name}" agent for ${userDept}.`,
        type: 'success',
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteAgent(id);
    toast({
      title: 'Agent Deleted',
      description: `Removed "${name}" from system deployment.`,
      type: 'warning',
    });
  };

  const handleTestAgent = (agentId: string, name: string) => {
    createNewChat(agentId);
    toast({
      title: 'Testing Agent',
      description: `Opened new session with "${name}" agent.`,
      type: 'success',
    });
    router.push('/dashboard/chat');
  };

  // Department Scoping: Admin ONLY sees their department agents. Super Admin sees all.
  const filteredAgents = agents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                        a.description.toLowerCase().includes(searchVal.toLowerCase());
    if (isSuperAdmin) {
      const matchDept = deptFilter === 'All' || a.department === deptFilter;
      return matchSearch && matchDept;
    } else {
      return matchSearch && a.department === userDept;
    }
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-teal-600" />
              {isSuperAdmin ? 'Global AI Agent Registry' : `${userDept} Department AI Agents`}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            {isSuperAdmin ? 'AI Agent Registry' : `${userDept} AI Agents`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin 
              ? 'Configure and manage LLM personas assigned across all organizational departments.'
              : `Manage autonomous AI personas specialized for ${userDept} department documents & pipelines.`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-md hover:scale-105 transition-all"
        >
          <PlusCircle className="h-4 w-4" /> Create {userDept} Agent
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${userDept} agents...`}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>

        {isSuperAdmin && (
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-700 font-semibold text-foreground"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
            <option value="Legal">Legal</option>
            <option value="IT">IT</option>
          </select>
        )}
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl space-y-2">
          <Bot className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-foreground">No AI agents active for {userDept}</p>
          <p className="text-xs text-muted-foreground">Deploy a new persona to assist your department team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="border border-border/80 hover:border-teal-500/40 shadow-sm flex flex-col justify-between transition-all duration-300">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center justify-center border border-teal-200/40">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    agent.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold">{agent.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Model Engine:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">{agent.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Department:</span>
                    <span className="font-bold text-foreground">{agent.department}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/60 p-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleTestAgent(agent.id, agent.name)}
                  className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Chat with Agent <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(agent)}
                  className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(agent.id, agent.name)}
                  className="p-2 rounded-xl border border-border hover:bg-rose-50 hover:text-rose-500 text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {editingAgent ? 'Update AI Agent' : 'Create Department AI Agent'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Personas are bound to the {userDept} partition.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Department Assignment</label>
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/40 px-3.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal-600" /> {userDept} Department
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-teal-200/60 dark:bg-teal-900 px-2 py-0.5 rounded-full">
                    Auto-Bound
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Agent Name</label>
                <Input placeholder="e.g. Legal Compliance Auditor" {...register('name')} />
                {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Model Engine</label>
                  <select
                    {...register('model')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="GPT-4o Enterprise">GPT-4o Enterprise</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Status</label>
                  <select
                    {...register('status')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Persona Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Primary focus and document processing responsibilities..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 text-foreground"
                />
                {errors.description && <p className="text-[11px] text-rose-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">System Prompt Template (Optional)</label>
                <textarea
                  {...register('promptTemplate')}
                  rows={3}
                  placeholder="You are an enterprise AI assistant specialized in..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 text-foreground font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all"
                >
                  {editingAgent ? 'Save Changes' : 'Deploy Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
