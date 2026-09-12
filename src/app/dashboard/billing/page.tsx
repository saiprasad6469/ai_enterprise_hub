'use client';

import * as React from 'react';
import { 
  CreditCard, Check, ShieldCheck, Zap, ArrowRight, 
  FileText, Download, Calendar, DollarSign, Sparkles 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const { toast } = useToastStore();
  const [selectedPlan, setSelectedPlan] = React.useState('Enterprise');

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Ideal for small teams launching RAG document lookups.',
      features: ['5 GB Vector Storage', '1M Monthly Tokens', '2 AI Agents', 'Standard Support'],
    },
    {
      name: 'Pro',
      price: '$149',
      period: '/month',
      description: 'Perfect for growing companies scaling multiple model agents.',
      features: ['25 GB Vector Storage', '5M Monthly Tokens', '10 AI Agents', 'Workflow Pipelines', 'Priority Support'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: '/month',
      description: 'Full corporate compliance, custom SLA, and unlimited vector databases.',
      features: ['100 GB Vector Storage', '10M Monthly Tokens', 'Unlimited AI Agents', 'Custom SSO & Audit Logs', '24/7 Dedicated Support'],
    },
  ];

  const invoices = [
    { id: 'INV-2026-007', date: '2026-07-01', amount: '$499.00', status: 'Paid' },
    { id: 'INV-2026-006', date: '2026-06-01', amount: '$499.00', status: 'Paid' },
    { id: 'INV-2026-005', date: '2026-05-01', amount: '$499.00', status: 'Paid' },
    { id: 'INV-2026-004', date: '2026-04-01', amount: '$149.00', status: 'Paid' },
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    toast({
      title: 'Plan Updated',
      description: `Your workspace subscription has been updated to ${planName}.`,
      type: 'success',
    });
  };

  const handleDownloadInvoice = (id: string) => {
    toast({
      title: 'Downloading Invoice',
      description: `Downloading receipt PDF for ${id}`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions & Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage payment methods, review invoice receipts, and scale model token allocations.</p>
      </div>

      {/* Active Plan Overview */}
      <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-card to-card">
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
              <Sparkles className="h-3 w-3" /> Active Plan: {selectedPlan} Tier
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">$499.00 / month</h2>
            <p className="text-xs text-muted-foreground">Your subscription auto-renews on August 15, 2026. Credit card ending in 4242.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toast({
                  title: 'Payment Method Updated',
                  description: 'Payment details saved successfully.',
                  type: 'success',
                });
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold hover:bg-muted/40 transition-colors"
            >
              <CreditCard className="h-4 w-4" /> Edit Payment Card
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = selectedPlan === p.name;

          return (
            <Card 
              key={p.name}
              className={cn(
                "relative flex flex-col border-border/80 transition-all duration-300",
                isCurrent && "border-primary ring-2 ring-primary/20 shadow-lg"
              )}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                <CardDescription className="text-xs">{p.description}</CardDescription>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{p.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pt-2 text-xs">
                {p.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-4">
                <button
                  onClick={() => handleSelectPlan(p.name)}
                  disabled={isCurrent}
                  className={cn(
                    "w-full inline-flex h-10 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200",
                    isCurrent 
                      ? "bg-muted text-muted-foreground cursor-default" 
                      : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10"
                  )}
                >
                  {isCurrent ? 'Active Subscription' : `Upgrade to ${p.name}`}
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Invoice Receipts Table */}
      <Card className="border border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Invoice History</CardTitle>
          <CardDescription>Download tax statements and billing receipts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Invoice Reference</TableHead>
                <TableHead className="font-bold">Billing Date</TableHead>
                <TableHead className="font-bold">Total Billed</TableHead>
                <TableHead className="font-bold">Payment Status</TableHead>
                <TableHead className="font-bold text-right">Receipt Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/20">
                  <TableCell className="font-bold text-foreground">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="font-semibold text-foreground">{inv.amount}</TableCell>
                  <TableCell>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="inline-flex items-center gap-1.5 p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-semibold"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
