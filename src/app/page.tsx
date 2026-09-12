'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Database, GitBranch, ArrowRight, ShieldCheck, 
  Sparkles, Zap, ChartPie, Check, HelpCircle 
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: 'Knowledge Base (RAG)',
      description: 'Upload corporate PDF, DOCX, CSV files. Instantly parse and query them with semantic retrieval.',
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-indigo-500" />,
      title: 'Multi-Model AI Agents',
      description: 'Create custom agents tailored to departments (Legal, Eng, HR) using leading frontier models.',
    },
    {
      icon: <GitBranch className="h-6 w-6 text-emerald-500" />,
      title: 'Workflow Automation',
      description: 'Build event-driven AI pipelines. Auto-analyze contracts, run sentiment checks, and trigger alerts.',
    },
    {
      icon: <ChartPie className="h-6 w-6 text-amber-500" />,
      title: 'Enterprise Analytics',
      description: 'Monitor token consumption, document ingestion speeds, request counts, and cost distributions.',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden select-none">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-50 dark:opacity-30 pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">AI Enterprise Hub</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-6"
        >
          <Sparkles className="h-3 w-3" /> Introducing Enterprise Agents v2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]"
        >
          The Unified <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Operating System</span> for Modern Enterprises
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Securely connect company documents, deploy custom department-specific assistants, automate text pipelines, and track audit logs—all from a single, beautiful dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200 group"
          >
            Create Free Account <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold hover:bg-muted/40 transition-colors"
          >
            Explore Dashboard Demo
          </Link>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Everything you need to orchestrate corporate intelligence</h2>
          <p className="text-muted-foreground mt-4">Built with bank-grade security, enterprise compliance, and multi-model versatility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 dark:bg-muted/10 mb-5">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="border-t border-border/60 py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <ShieldCheck className="h-10 w-10 text-primary mb-4 animate-bounce" />
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Enterprise Compliance & Control</h2>
          <p className="text-muted-foreground max-w-xl mt-3 text-sm">
            SOC2 Type II Certified, role-based access control, single sign-on (SSO), vector storage isolation, and detailed API request audit logging.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500" /> Private Deployment
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500" /> Isolated VectorDB
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500" /> SOC2 Audited
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">AI Enterprise Hub Inc.</span>
          </div>
          <div>
            &copy; 2026 AI Enterprise Hub. All rights reserved. Built for secure corporate operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
