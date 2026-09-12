'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Bot, PlusCircle, Search, Edit2, Trash2, ArrowRight, 
  HelpCircle, Settings, Check, X, ShieldAlert 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AIAgent } from '@/types';

const agentSchema = z.object({
  name: z.string().min(2, { message: 'Agent name must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Provide a detailed description of at least 10 characters' }),
  department: z.string().min(1, { message: 'Select a department' }),
  model: z.string().min(1, { message: 'Select a model configuration' }),
  status: z.enum(['Active', 'Maintenance', 'Disabled']),
  promptTemplate: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export default function AIAgentsPage() {
  const router = useRouter();
  const agents = useDataStore((state) => state.agents);
  const addAgent = useDataStore((state) => state.addAgent);
  const updateAgent = useDataStore((state) => state.updateAgent);
  const deleteAgent = useDataStore((state) => state.deleteAgent);
  const createNewChat = useDataStore((state) => state.createNewChat);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<AIAgent | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      department: 'Engineering',
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
    setValue('department', agent.department);
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
      department: 'Engineering',
      model: 'GPT-4o Enterprise',
      status: 'Active',
      promptTemplate: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: AgentFormValues) => {
    if (editingAgent) {
      updateAgent(editingAgent.id, data);
      toast({
        title: 'Agent Updated',
        description: `Successfully saved modifications to "${data.name}".`,
        type: 'success',
      });
    } else {
      addAgent(data);
      toast({
        title: 'Agent Created',
        description: `Successfully created and deployed "${data.name}" agent.`,
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
    const chatId = createNewChat(agentId);
    toast({
      title: 'Testing Agent',
      description: `Opened new session with "${name}" agent.`,
      type: 'success',
    });
    router.push('/dashboard/chat');
  };

  const filteredAgents = agents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                        a.description.toLowerCase().includes(searchVal.toLowerCase());
    const matchDept = deptFilter === 'All' || a.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agent Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure and manage specific LLM personas assigned to parse company vector directories.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-md transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4" /> Create Agent
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-card/40 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 flex items-center border border-border bg-background px-3 py-1.5 rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents name or specs..."
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

      {/* Agents cards listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const isActive = agent.status === 'Active';
          const isMaintenance = agent.status === 'Maintenance';

          return (
            <Card key={agent.id} className="flex flex-col border-border/80 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground truncate max-w-[150px]" title={agent.name}>
                      {agent.name}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground font-semibold">{agent.department} Division</span>
                  </div>
                </div>

                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded",
                  isActive && "bg-emerald-500/10 text-emerald-500",
                  isMaintenance && "bg-amber-500/10 text-amber-500",
                  agent.status === 'Disabled' && "bg-rose-500/10 text-rose-500"
                )}>
                  {agent.status}
                </span>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{agent.description}</p>
                
                <div className="space-y-2 border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Base Model:</span>
                    <span className="font-semibold text-foreground">{agent.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Consulted:</span>
                    <span className="font-semibold text-foreground">{agent.lastUsed}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(agent)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title="Configure agent"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id, agent.name)}
                    className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"
                    title="Delete agent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleTestAgent(agent.id, agent.name)}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-bold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
                >
                  Test Consultation <ArrowRight className="h-3 w-3" />
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Creation / Editing Modal Dialog */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-foreground">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" /> 
                {editingAgent ? 'Edit Agent Persona' : 'Deploy AI Agent'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Agent Name</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Legal Contract Evaluator"
                  {...register('name')}
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Functional Description</label>
                <textarea 
                  placeholder="Describe what specific knowledge bases or documents this agent is optimized to read and answer."
                  {...register('description')}
                  className={cn(
                    "flex min-h-[60px] w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all focus:border-primary/50 text-foreground",
                    errors.description ? "border-rose-500" : ""
                  )}
                />
                {errors.description && <p className="text-[10px] text-rose-500 font-semibold">{errors.description.message}</p>}
              </div>

              {/* Department & Model Grid */}
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Model Engine</label>
                  <select
                    {...register('model')}
                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                  >
                    <option value="GPT-4o Enterprise">GPT-4o Enterprise</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Llama 3.1 70B">Llama 3.1 70B</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Initial Status</label>
                <select
                  {...register('status')}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              {/* Custom prompt */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">System Prompt Template (Optional)</label>
                <textarea 
                  placeholder="You are an expert Legal advisor. You strictly quote Articles of compliance documents..."
                  {...register('promptTemplate')}
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                />
              </div>

              {/* Actions footer */}
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
                  {editingAgent ? 'Save Changes' : 'Deploy Agent'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
