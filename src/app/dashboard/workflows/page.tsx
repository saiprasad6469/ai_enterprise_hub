'use client';

import * as React from 'react';
import { 
  GitBranch, Play, Pause, Trash2, Calendar, Clock, 
  ArrowRight, ShieldCheck, Zap, AlertTriangle, CheckCircle2, 
  Settings, Network, PlusCircle, X, ChevronRight, Layers, Sliders
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Workflow } from '@/types';

export default function WorkflowsPage() {
  const workflows = useDataStore((state) => state.workflows);
  const toggleWorkflowStatus = useDataStore((state) => state.toggleWorkflowStatus);
  const runWorkflow = useDataStore((state) => state.runWorkflow);
  const deleteWorkflow = useDataStore((state) => state.deleteWorkflow);
  const addWorkflow = useDataStore((state) => state.addWorkflow);
  const { toast } = useToastStore();

  const [activeTab, setActiveTab] = React.useState<'list' | 'builder'>('list');
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | null>(workflows[0] || null);
  const [runningId, setRunningId] = React.useState<string | null>(null);

  // New workflow creation dialog
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newWfName, setNewWfName] = React.useState('');
  const [newWfDesc, setNewWfDesc] = React.useState('');
  const [newWfSteps, setNewWfSteps] = React.useState<string[]>(['Trigger: Event', 'AI Node: Processing', 'Action: Notify Slack']);

  const handleRunNow = async (id: string, name: string) => {
    setRunningId(id);
    toast({
      title: 'Workflow Triggered',
      description: `Executing "${name}" pipeline nodes...`,
      type: 'default',
    });
    try {
      await runWorkflow(id);
      toast({
        title: 'Workflow Execution Completed',
        description: `Successfully finished "${name}" runs.`,
        type: 'success',
      });
    } catch {
      toast({
        title: 'Workflow Failed',
        description: `Error on execution of "${name}".`,
        type: 'error',
      });
    } finally {
      setRunningId(null);
    }
  };

  const handleStatusToggle = (id: string, name: string, status: string) => {
    toggleWorkflowStatus(id);
    toast({
      title: status === 'Running' ? 'Workflow Paused' : 'Workflow Resumed',
      description: `Pipeline "${name}" status toggled.`,
      type: 'success',
    });
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName || !newWfDesc) {
      toast({ title: 'Validation Error', description: 'Name and description are required.', type: 'error' });
      return;
    }

    addWorkflow({
      name: newWfName,
      description: newWfDesc,
      steps: newWfSteps.filter(s => s.trim() !== ''),
    });

    toast({
      title: 'Workflow Deployed',
      description: `Pipeline "${newWfName}" configured.`,
      type: 'success',
    });

    setNewWfName('');
    setNewWfDesc('');
    setIsCreateOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteWorkflow(id);
    toast({
      title: 'Workflow Deleted',
      description: `Removed "${name}" from server.`,
      type: 'warning',
    });
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(workflows.find(w => w.id !== id) || null);
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Orchestrator</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect corporate ingestion events to conditional filters and custom AI reasoning nodes.</p>
        </div>

        {/* Create / Toggle Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex border border-border bg-card rounded-xl p-0.5">
            <button
              onClick={() => setActiveTab('list')}
              className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors", activeTab === 'list' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
            >
              Pipeline Directory
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors", activeTab === 'builder' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
            >
              Visual Node Builder
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-md transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" /> Create Pipeline
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        /* WORKFLOW DIRECTORY (LIST & HISTORY) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Pipeline Cards */}
          <div className="lg:col-span-2 space-y-4">
            {workflows.map((wf) => {
              const isSelected = selectedWorkflow?.id === wf.id;
              const isRunning = runningId === wf.id || wf.status === 'Running';
              const isPaused = wf.status === 'Paused';

              return (
                <Card 
                  key={wf.id}
                  className={cn(
                    "cursor-pointer border-border/80 hover:border-primary/20 transition-all duration-300",
                    isSelected ? "border-primary/40 ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10" : ""
                  )}
                  onClick={() => setSelectedWorkflow(wf)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <GitBranch className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{wf.name}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Last run: {wf.lastRun}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded",
                          wf.status === 'Completed' && "bg-emerald-500/10 text-emerald-500",
                          wf.status === 'Running' && "bg-blue-500/10 text-blue-500",
                          wf.status === 'Paused' && "bg-amber-500/10 text-amber-500",
                          wf.status === 'Failed' && "bg-rose-500/10 text-rose-500"
                        )}>
                          {wf.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{wf.description}</p>

                    {/* Nodes path preview */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-[10px] text-muted-foreground font-semibold">
                      {wf.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
                          <span className="bg-muted dark:bg-muted/30 border border-border/40 px-2 py-0.5 rounded flex-shrink-0">{step}</span>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Interactive controls */}
                    <div className="flex justify-between items-center border-t border-border/30 pt-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusToggle(wf.id, wf.name, wf.status)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[10px] font-bold text-foreground hover:bg-muted transition-colors"
                        >
                          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                          {isPaused ? 'Resume' : 'Pause'}
                        </button>

                        <button
                          onClick={() => handleDelete(wf.id, wf.name)}
                          className="p-2 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete pipeline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRunNow(wf.id, wf.name)}
                        disabled={runningId !== null || isPaused}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-4.5 text-[10px] font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-40"
                      >
                        <Zap className="h-3.5 w-3.5" /> Trigger Execution
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right: Selected Pipeline Execution History */}
          <div className="space-y-4">
            {selectedWorkflow ? (
              <Card className="border-border/80">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Execution History</CardTitle>
                  <CardDescription>Historical run logs for &ldquo;{selectedWorkflow.name}&rdquo;.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedWorkflow.runs.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted-foreground px-4">No runs registered yet. Trigger execution above.</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {selectedWorkflow.runs.map((run) => (
                        <div key={run.id} className="p-4 text-xs flex justify-between items-center hover:bg-muted/20 transition-colors">
                          <div className="space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {run.runAt}
                            </div>
                            <p className="text-[10px] text-muted-foreground">Duration: {run.duration} • By {run.triggerBy}</p>
                          </div>

                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded",
                            run.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>{run.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground text-xs">
                Select a workflow from the directory to review historical runs.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* VISUAL NODE BUILDER CANVAS */
        <Card className="border border-border/80 overflow-hidden h-[calc(100vh-20rem)] flex flex-col relative select-none">
          {/* Builder Control menu */}
          <div className="h-12 border-b border-border/60 px-4 bg-muted/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-foreground">Canvas: {selectedWorkflow?.name || 'Create a workflow'}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> 5 Nodes Configured</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast({
                    title: 'Layout Arranged',
                    description: 'Canvas elements aligned automatically.',
                    type: 'success',
                  });
                }}
                className="inline-flex h-7 items-center justify-center border border-border bg-card px-3 rounded-lg font-bold hover:bg-muted transition-colors"
              >
                Auto-Layout
              </button>
              <button
                onClick={() => {
                  toast({
                    title: 'Configuration Saved',
                    description: 'Workflow pipeline variables saved in cloud vector index.',
                    type: 'success',
                  });
                }}
                className="inline-flex h-7 items-center justify-center bg-primary px-3 rounded-lg font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
              >
                Save Pipeline
              </button>
            </div>
          </div>

          {/* Nodes Canvas background */}
          <div className="flex-1 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] flex items-center justify-center overflow-auto p-8 relative">
            
            {/* Visual Node Chain */}
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
              {selectedWorkflow?.steps.map((step, idx) => {
                const isTrigger = step.toLowerCase().includes('trigger');
                const isAI = step.toLowerCase().includes('ai node');
                const isAlert = step.toLowerCase().includes('slack') || step.toLowerCase().includes('email') || step.toLowerCase().includes('sync');

                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <div className="flex items-center justify-center font-bold text-muted-foreground flex-shrink-0">
                        <ArrowRight className="h-5 w-5 animate-pulse hidden sm:block text-primary" />
                        <span className="sm:hidden text-xs">▼</span>
                      </div>
                    )}
                    
                    {/* Node Box */}
                    <div className="w-52 border border-border bg-card shadow-lg rounded-2xl p-4 space-y-3 relative hover:border-primary/40 transition-all duration-200">
                      {/* Port handles */}
                      <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary border border-background hidden sm:block" />
                      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary border border-background hidden sm:block" />

                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded",
                          isTrigger && "bg-blue-500/10 text-blue-500",
                          isAI && "bg-purple-500/10 text-purple-500",
                          isAlert && "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {isTrigger ? 'Trigger' : isAI ? 'AI Model' : 'Action'}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground">ID_{idx + 1}</span>
                      </div>

                      <h4 className="text-[11px] font-bold text-foreground leading-normal">{step}</h4>
                      
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/30 pt-2.5">
                        <span className="flex items-center gap-1"><Sliders className="h-3 w-3" /> Configured</span>
                        <span className="font-semibold text-foreground">OK</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Deploy Pipeline Modal */}
      {isCreateOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsCreateOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-foreground">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" /> Deploy Workflow Pipeline
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Pipeline Name</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Legal Ingestion Slack Alert"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Pipeline Description</label>
                <textarea 
                  placeholder="Explain trigger condition and AI execution flow."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-muted-foreground">Pipeline Steps Outline</label>
                <div className="space-y-2">
                  {newWfSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="font-mono text-[9px] text-muted-foreground w-8">Step {idx + 1}:</span>
                      <Input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...newWfSteps];
                          updated[idx] = e.target.value;
                          setNewWfSteps(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 font-semibold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
                >
                  Deploy Pipeline
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
