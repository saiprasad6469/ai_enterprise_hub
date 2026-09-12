'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  UserCheck, MessageSquare, Database, FileText, Bot, Sparkles, 
  Search, ArrowRight, BookOpen, Clock, CheckCircle2, Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const documents = useDataStore((state) => state.documents);
  const agents = useDataStore((state) => state.agents);
  const chats = useDataStore((state) => state.chats);

  const [searchQuery, setSearchQuery] = React.useState('');

  const department = user?.department || 'Engineering';
  const myDepartmentAgents = agents.filter(a => a.department === department || a.department === 'Global');
  const myDepartmentDocs = documents.filter(d => d.department === department || d.department === 'Global');

  return (
    <div className="space-y-8 select-none">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Employee Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">Department: {department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Team Member'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Ask questions to your department AI assistant, explore verified organizational documents, and run automated tools.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard/chat"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-5 text-xs font-bold shadow-lg transition-all"
          >
            <MessageSquare className="h-4 w-4" /> Start AI Chat
          </Link>
          <Link
            href="/dashboard/knowledge-base"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 text-xs font-bold border border-white/20 transition-colors"
          >
            <BookOpen className="h-4 w-4" /> Knowledge Base
          </Link>
        </div>
      </div>

      {/* RAG Quick Search Query Bar */}
      <Card className="border-teal-200/80 dark:border-teal-900/80 bg-gradient-to-r from-teal-50/60 via-white to-emerald-50/40 dark:from-slate-900 dark:to-slate-950">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
              <Input
                placeholder={`Ask RAG AI anything about ${department} policies, specs, or guides...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white/80 dark:bg-slate-900/80 border-teal-200 dark:border-teal-900 text-xs sm:text-sm rounded-xl focus-visible:ring-teal-500"
              />
            </div>
            <Link
              href={`/dashboard/chat?q=${encodeURIComponent(searchQuery)}`}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md flex-shrink-0"
            >
              Ask AI Assistant <Sparkles className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-muted-foreground font-semibold">
            <span>Popular Queries:</span>
            <button 
              onClick={() => setSearchQuery('What is the remote work policy?')}
              className="px-2.5 py-1 rounded-full bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-200 transition-colors"
            >
              Remote Work Policy
            </button>
            <button 
              onClick={() => setSearchQuery('How do I submit an expense report?')}
              className="px-2.5 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
            >
              Expense Report Procedure
            </button>
            <button 
              onClick={() => setSearchQuery('Where can I find API documentation?')}
              className="px-2.5 py-1 rounded-full bg-sky-100/70 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 hover:bg-sky-200 transition-colors"
            >
              API Integration Guide
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Employee Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: My Department Knowledge Base */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="h-5 w-5 text-teal-600" /> {department} Department Documents
                </CardTitle>
                <CardDescription className="text-xs">
                  Indexed files available for instant RAG search & semantic extraction.
                </CardDescription>
              </div>
              <Link href="/dashboard/documents" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 text-xs">
                {myDepartmentDocs.slice(0, 4).map((doc, idx) => (
                  <div key={doc.id || `doc_${idx}`} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold border border-teal-200/50 dark:border-teal-900/50">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.type || 'DOC'} • {doc.size} • {doc.chunksCount || 0} vectors</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/chat?docId=${doc.id}`}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      Query Doc <Zap className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Agents Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-emerald-600" /> Assigned AI Assistants
                </CardTitle>
                <CardDescription className="text-xs">
                  Specialized agent bots trained on department knowledge base.
                </CardDescription>
              </div>
              <Link href="/dashboard/agents" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                All Assistants <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 text-xs">
                {myDepartmentAgents.slice(0, 3).map((agent, idx) => (
                  <div key={agent.id || `agent_${idx}`} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-900/50">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{agent.name}</p>
                        <p className="text-[10px] text-muted-foreground">{agent.model} • {agent.department}</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/chat?agentId=${agent.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      Chat Bot <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Recent AI Conversations & Quick Guidelines */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" /> Recent Threads
              </CardTitle>
              <Link href="/dashboard/chat" className="text-xs font-bold text-purple-600 hover:text-purple-700">
                New Chat
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 text-xs">
                {chats.slice(0, 4).map((chat, idx) => (
                  <Link
                    key={chat.id || `chat_${idx}`}
                    href={`/dashboard/chat?id=${chat.id}`}
                    className="p-3.5 flex flex-col gap-1 hover:bg-muted/30 transition-colors block"
                  >
                    <p className="font-bold truncate text-foreground">{chat.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{chat.messagesCount || chat.messages?.length || 0} messages</span>
                      <span>{chat.lastUpdated || chat.updatedAt || 'Recent'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick RAG Tips */}
          <Card className="border-teal-200/60 dark:border-teal-900/60 bg-gradient-to-br from-teal-500/10 via-background to-emerald-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> RAG Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p>Include document titles in your prompt for pinpoint accuracy.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p>Answers automatically link to exact citation source pages.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p>Department documents are protected by isolated RBAC filters.</p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
