'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Scan, Layers, Database, ShieldCheck, 
  BrainCircuit, Sparkles, ArrowRight, CheckCircle2, ChevronRight, Info
} from 'lucide-react';

export default function LandingPage() {
  const [activeStep, setActiveStep] = React.useState<string | null>(null);

  const pipelineSteps = [
    {
      id: 'docs',
      name: 'Documents',
      description: 'PDF, DOCX, TXT, CSV, & Markdown enterprise file ingestion',
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderStyle: 'border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.35)]',
      bgGradient: 'bg-gradient-to-b from-blue-50 to-blue-100/60 dark:from-blue-950/60 dark:to-blue-900/40',
    },
    {
      id: 'ocr',
      name: 'OCR',
      description: 'AI vision & text extraction for scanned documents and images',
      icon: Scan,
      iconColor: 'text-sky-500 dark:text-sky-300',
      borderStyle: 'border-sky-400/80 shadow-[0_0_20px_rgba(14,165,233,0.35)]',
      bgGradient: 'bg-gradient-to-b from-sky-50 to-sky-100/60 dark:from-sky-950/60 dark:to-sky-900/40',
    },
    {
      id: 'chunking',
      name: 'Chunking',
      description: 'Smart semantic chunking with overlapping context boundaries',
      icon: Layers,
      iconColor: 'text-teal-600 dark:text-teal-300',
      borderStyle: 'border-teal-400/80 shadow-[0_0_20px_rgba(20,184,166,0.35)]',
      bgGradient: 'bg-gradient-to-b from-teal-50 to-teal-100/60 dark:from-teal-950/60 dark:to-teal-900/40',
    },
    {
      id: 'vectordb',
      name: 'Vector DB',
      description: 'Dense vector embeddings stored with hybrid BM25 + cosine search index',
      icon: Database,
      iconColor: 'text-cyan-600 dark:text-cyan-300',
      borderStyle: 'border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      bgGradient: 'bg-gradient-to-b from-cyan-50 to-cyan-100/60 dark:from-cyan-950/60 dark:to-cyan-900/40',
    },
    {
      id: 'retrieval',
      name: 'Retrieval',
      description: 'RBAC-filtered semantic retrieval with re-ranking accuracy',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-300',
      borderStyle: 'border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      bgGradient: 'bg-gradient-to-b from-emerald-50 to-emerald-100/60 dark:from-emerald-950/60 dark:to-emerald-900/40',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google Gemini 1.5 Pro engine processing context & dynamic prompts',
      icon: BrainCircuit,
      iconColor: 'text-purple-600 dark:text-purple-300',
      borderStyle: 'border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      bgGradient: 'bg-gradient-to-b from-purple-50 to-purple-100/60 dark:from-purple-950/60 dark:to-purple-900/40',
    },
    {
      id: 'answer',
      name: 'Answer',
      description: 'Synthesized, hyper-accurate answers with explicit source document citations',
      icon: Sparkles,
      iconColor: 'text-amber-500 dark:text-amber-300',
      borderStyle: 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      bgGradient: 'bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-950/60 dark:to-amber-900/40',
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,_#e6f7f5_0%,_#f2faf8_50%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_50%_20%,_#091d1a_0%,_#0c1514_50%,_#090d0e_100%)] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-teal-100/60 dark:border-teal-900/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#0d2826] dark:text-teal-200">
              AI Enterprise Hub
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/login" 
              className="text-xs sm:text-sm font-bold text-[#006d64] dark:text-teal-300 hover:text-teal-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50"
            >
              Sign In
            </Link>
            <Link 
              href="/login?role=SuperAdmin" 
              className="inline-flex h-9 sm:h-10 items-center justify-center rounded-full bg-[#006d64] hover:bg-[#005750] px-5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-800/20 transition-all duration-200 hover:scale-[1.03]"
            >
              Super Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Pipeline Section matching exact visual image layout */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16 relative z-10 max-w-6xl mx-auto w-full text-center">
        
        {/* Badge Pill Header - Matches Image */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center rounded-full bg-[#00a896] hover:bg-[#009282] text-white px-7 py-2.5 text-[11px] sm:text-xs font-black tracking-[0.18em] uppercase shadow-md shadow-teal-500/20 mb-8 select-none"
        >
          ENTERPRISE RAG ARCHITECTURE
        </motion.div>

        {/* Big Bold Headline - Matches Image */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-[#0f2725] dark:text-slate-50 tracking-tight leading-[1.06] max-w-4xl mb-8"
        >
          Enterprise AI<br />Knowledge Hub
        </motion.h1>

        {/* Super Admin Login CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-14 sm:mb-16 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/login?role=SuperAdmin"
            className="inline-flex h-12 sm:h-14 items-center justify-center gap-3 rounded-full bg-[#006d64] hover:bg-[#00544d] text-white px-8 sm:px-9 text-base sm:text-lg font-extrabold shadow-lg shadow-teal-900/20 transition-all duration-200 hover:scale-[1.03] group"
          >
            Super Admin Login <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 sm:h-14 items-center justify-center gap-3 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white text-[#006d64] dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-7 sm:px-8 text-base font-bold shadow-md transition-all duration-200 hover:scale-[1.03]"
          >
            Workspace Login
          </Link>
        </motion.div>

        {/* RAG Architecture Flow Pipeline Diagram - Matches Image layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-5xl my-4 sm:my-6 relative py-4"
        >
          {/* Connector Line behind nodes */}
          <div className="absolute top-[40%] left-[6%] right-[6%] -translate-y-1/2 h-[2px] bg-gradient-to-r from-blue-300 via-teal-300 via-emerald-300 via-purple-300 to-amber-300 dark:from-blue-800 dark:via-teal-600 dark:to-amber-800 z-0 hidden sm:block" />

          {/* Decorative small green/cyan dots above line */}
          <div className="absolute top-[28%] left-[37.5%] w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6] hidden sm:block" />
          <div className="absolute top-[28%] left-[66%] w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_#14b8a6] hidden sm:block" />

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 sm:gap-3 relative z-10 items-center justify-items-center">
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeStep === step.id;

              return (
                <div 
                  key={step.id} 
                  onClick={() => setActiveStep(isSelected ? null : step.id)}
                  className="flex flex-col items-center group cursor-pointer w-full"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${step.bgGradient} border-2 ${step.borderStyle} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1.5 relative backdrop-blur-sm`}>
                    <Icon className={`w-7 h-7 sm:w-9 sm:h-9 ${step.iconColor} transition-transform duration-300 group-hover:rotate-6`} />
                  </div>
                  <span className="mt-3 text-xs sm:text-sm font-bold text-[#1a3835] dark:text-slate-200 tracking-tight">
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Step Detail Card (Interactive on Click) */}
        <AnimatePresence>
          {activeStep && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-teal-200 dark:border-teal-800 shadow-xl backdrop-blur-md text-left"
            >
              {(() => {
                const step = pipelineSteps.find(s => s.id === activeStep);
                if (!step) return null;
                const Icon = step.icon;
                return (
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${step.bgGradient} border ${step.borderStyle}`}>
                      <Icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0d2826] dark:text-slate-100 flex items-center gap-2">
                        {step.name} Step
                        <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                          RAG Engine Node
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Pill Feature Badges at Bottom - Matches Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-12 sm:mt-16"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-teal-100 dark:border-teal-900/60 px-5 sm:px-6 py-2.5 shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-[#1e3a38] dark:text-slate-200">
              Documents Indexed
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-teal-100 dark:border-teal-900/60 px-5 sm:px-6 py-2.5 shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-[#1e3a38] dark:text-slate-200">
              Department Isolation
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-full bg-white/95 dark:bg-slate-900/90 border border-teal-100 dark:border-teal-900/60 px-5 sm:px-6 py-2.5 shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-[#1e3a38] dark:text-slate-200">
              Source Cited Answers
            </span>
          </div>
        </motion.div>

      </main>

      {/* Multi-Column Professional Enterprise Footer */}
      <footer className="border-t border-teal-100/80 dark:border-teal-900/60 bg-gradient-to-b from-white/60 via-teal-50/30 to-teal-100/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 font-sans pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Col 1: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-600/20">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#0d2826] dark:text-teal-200">
                AI Enterprise Hub
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Enterprise-grade Retrieval-Augmented Generation (RAG) platform connecting multi-department knowledge bases with dense vector search, OCR vision, and Google Gemini engine reasoning.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
              <span className="text-[11px] text-slate-500 font-medium">SOC2 Type II Certified</span>
            </div>
          </div>

          {/* Col 2: Platform Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#006d64] dark:text-teal-300">
              RAG Architecture
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Document OCR Ingestion</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Semantic Chunking</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Vector DB Store</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Department Isolation</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Source Citation Links</Link></li>
            </ul>
          </div>

          {/* Col 3: Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#006d64] dark:text-teal-300">
              Workspace Solutions
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Admin Command Center</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Employee RAG Assistant</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Department AI Agents</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Automated Workflows</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Security & Audit Logs</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#006d64] dark:text-teal-300">
              Governance & Legal
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Security Standards</Link></li>
              <li><Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">API Documentation</Link></li>
              <li><a href="mailto:support@enterprise.ai" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Contact Engineering</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Security Note */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-teal-200/50 dark:border-teal-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>&copy; {new Date().getFullYear()} AI Enterprise Hub Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Cookies</Link>
            <Link href="/login" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

