'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Key, PlusCircle, Trash2, Eye, EyeOff, Copy, Check, 
  X, ShieldAlert, Sparkles, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const apiKeySchema = z.object({
  name: z.string().min(2, { message: 'Key label must be at least 2 characters' }),
  scopes: z.array(z.string()).min(1, { message: 'Select at least one scope' }),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

export default function ApiKeysPage() {
  const apiKeys = useDataStore((state) => state.apiKeys);
  const addApiKey = useDataStore((state) => state.addApiKey);
  const revokeApiKey = useDataStore((state) => state.revokeApiKey);
  const { toast } = useToastStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newGeneratedKey, setNewGeneratedKey] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      scopes: ['chat:read'],
    }
  });

  const onSubmit = (data: ApiKeyFormValues) => {
    // Generate a mock complete secret key token
    const suffix = Math.random().toString(36).substr(2, 20);
    const keyToken = `aeh_live_${suffix}`;
    
    // Trigger Zustand store creation
    addApiKey(data.name, data.scopes);
    
    setNewGeneratedKey(keyToken);
    toast({
      title: 'API Key Generated',
      description: 'Copy your secret token now. It will not be shown again.',
      type: 'success',
    });
  };

  const handleCopySecret = () => {
    if (!newGeneratedKey) return;
    navigator.clipboard.writeText(newGeneratedKey);
    setCopiedKey(true);
    toast({
      title: 'Copied Key',
      description: 'Secret token copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRevoke = (id: string, name: string) => {
    revokeApiKey(id);
    toast({
      title: 'API Key Revoked',
      description: `Credential "${name}" was permanently deactivated.`,
      type: 'warning',
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewGeneratedKey(null);
    reset({ name: '', scopes: ['chat:read'] });
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Credentials</h1>
          <p className="text-sm text-muted-foreground mt-1">Provision developer credentials to programmatically trigger workflows and ingest document vector chunks.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4" /> Generate API Key
        </button>
      </div>

      {/* Table grid */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Credential Label</TableHead>
            <TableHead className="font-bold">Key Prefix</TableHead>
            <TableHead className="font-bold">Secret Token</TableHead>
            <TableHead className="font-bold">Privilege Scopes</TableHead>
            <TableHead className="font-bold">Created Date</TableHead>
            <TableHead className="font-bold">Last Used</TableHead>
            <TableHead className="font-bold">Status State</TableHead>
            <TableHead className="font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => {
            const isActive = key.status === 'Active';
            return (
              <TableRow key={key.id} className="hover:bg-muted/20">
                <TableCell className="font-bold text-foreground">{key.name}</TableCell>
                <TableCell>
                  <span className="font-mono bg-muted border px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-bold">{key.keyPrefix}</span>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{key.secretMasked}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {key.scopes.map((scope) => (
                      <span key={scope} className="text-[9px] bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-bold px-1.5 py-0.5 rounded">
                        {scope}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{key.created}</TableCell>
                <TableCell className="text-muted-foreground">{key.lastUsed}</TableCell>
                <TableCell>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {key.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {isActive && (
                    <button
                      onClick={() => handleRevoke(key.id, key.name)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Generation Dialog Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={handleCloseModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-foreground">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" /> Generate Client API Key
              </h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!newGeneratedKey ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Key Label</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Ingestion pipeline trigger"
                    {...register('name')}
                    className={errors.name ? "border-rose-500" : ""}
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-muted-foreground">Privilege Scopes</label>
                  <div className="space-y-2 border border-border bg-muted/10 p-3 rounded-xl">
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input type="checkbox" value="chat:write" {...register('scopes')} className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                      <span>chat:write (Consult agent messaging)</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input type="checkbox" value="chat:read" {...register('scopes')} className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                      <span>chat:read (Read chat session threads)</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input type="checkbox" value="documents:write" {...register('scopes')} className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                      <span>documents:write (Trigger ingestion vector updates)</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input type="checkbox" value="workflows:trigger" {...register('scopes')} className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                      <span>workflows:trigger (Execute pipeline chains)</span>
                    </label>
                  </div>
                  {errors.scopes && <p className="text-[10px] text-rose-500 font-semibold">{errors.scopes.message}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 font-semibold hover:bg-muted/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
                  >
                    Create Credentials
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-4 text-center">
                <div className="flex justify-center">
                  <ShieldCheck className="h-12 w-12 text-emerald-500 animate-bounce" />
                </div>
                <h4 className="font-bold text-foreground">Write Down Your Secret Token</h4>
                <p className="text-[10px] text-muted-foreground leading-normal px-4">
                  For security, it is stored in encrypted vectors and cannot be retrieved again. If lost, you must revoke the key prefix and generate another.
                </p>

                <div className="flex items-center gap-2 border border-border bg-muted/30 p-2.5 rounded-xl font-mono text-[10px] select-all break-all text-left">
                  <span className="flex-1 text-foreground font-bold">{newGeneratedKey}</span>
                  <button
                    onClick={handleCopySecret}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy secret"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="border-t border-border/60 pt-4 mt-2">
                  <button
                    onClick={handleCloseModal}
                    className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/95 transition-colors"
                  >
                    I Have Stored the Secret Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
