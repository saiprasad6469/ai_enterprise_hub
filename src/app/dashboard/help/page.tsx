'use client';

import * as React from 'react';
import { 
  HelpCircle, Search, BookOpen, MessageSquare, 
  ChevronDown, Send, FileText, Bot, GitBranch, Key, ShieldCheck 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';

export default function HelpCenterPage() {
  const { toast } = useToastStore();
  const [searchVal, setSearchVal] = React.useState('');
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  // Ticket form states
  const [ticketSubject, setTicketSubject] = React.useState('');
  const [ticketDesc, setTicketDesc] = React.useState('');
  const [priority, setPriority] = React.useState('Medium');

  const guideCards = [
    { title: 'Vector Ingestion & RAG', desc: 'Learn how PDF and DOCX files are chunked into 1536-dimensional embeddings.', icon: <FileText className="h-5 w-5 text-blue-500" /> },
    { title: 'Deploying AI Agent Personas', desc: 'Instructions for selecting models (GPT-4o, Claude) and customizing prompts.', icon: <Bot className="h-5 w-5 text-indigo-500" /> },
    { title: 'Event-driven Workflows', desc: 'Connect Webhook triggers to Slack alerts and PDF extraction pipelines.', icon: <GitBranch className="h-5 w-5 text-emerald-500" /> },
    { title: 'REST API Authentication', desc: 'Securely authenticate using key prefixes and granular scopes.', icon: <Key className="h-5 w-5 text-amber-500" /> },
  ];

  const faqs = [
    { q: 'How does AI Enterprise Hub isolate my corporate vector data?', a: 'Every organization is assigned an isolated vector namespace in Pinecone with tenant-isolated encryption keys. No data is shared or used to train public LLM models.' },
    { q: 'Which file formats are supported for automatic text extraction?', a: 'We support PDF, DOCX, TXT, CSV, XLSX, PPTX, and standard image formats (PNG, JPG, WEBP). Images undergo automatic OCR extraction.' },
    { q: 'Can I restrict AI agent access by enterprise department?', a: 'Yes! Access control lists allow you to assign agents specifically to Legal, HR, Engineering, Marketing, Operations, or Finance teams.' },
    { q: 'How do semantic cache hits improve latency and reduce costs?', a: 'When a user query matches an existing embedded vector pattern in the cache, the response is delivered in under 50ms without invoking downstream LLMs.' },
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) {
      toast({
        title: 'Validation Error',
        description: 'Subject and details are required to submit a ticket.',
        type: 'error',
      });
      return;
    }

    toast({
      title: 'Support Ticket Submitted',
      description: `Ticket TICKET-#${Math.floor(Math.random() * 10000)} created. A Staff Engineer will respond shortly.`,
      type: 'success',
    });

    setTicketSubject('');
    setTicketDesc('');
  };

  return (
    <div className="space-y-8 select-none max-w-5xl">
      
      {/* Hero Search */}
      <div className="text-center py-8 space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">How can we help your team?</h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">Explore documentation, deployment tutorials, or submit a support ticket directly to our Staff Engineers.</p>
        
        <div className="relative max-w-lg mx-auto flex items-center border border-border bg-card shadow-lg px-4 py-2 rounded-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help topics, API errors, or vector setup..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground px-3 text-foreground"
          />
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {guideCards.map((g, idx) => (
          <Card key={idx} className="hover:border-primary/30 cursor-pointer transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 mb-3">
                {g.icon}
              </div>
              <CardTitle className="text-sm font-bold">{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Accordions & Support Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="border border-border/80 rounded-2xl bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted/20 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Ticket Form */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Submit Support Request</CardTitle>
            <CardDescription>Direct line to enterprise support engineers.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Issue Subject</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Pinecone vector embedding timeout on large PDF"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground font-semibold"
                >
                  <option value="Low">Low - General Question</option>
                  <option value="Medium">Medium - Feature Guidance</option>
                  <option value="High">High - Pipeline Error</option>
                  <option value="Urgent">Urgent - System Outage</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Detailed Message</label>
                <textarea 
                  placeholder="Describe what steps you performed, document file name, or API error status code..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="flex min-h-[90px] w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/50 text-foreground"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 transition-all duration-200 mt-2"
              >
                <Send className="h-4 w-4" /> Transmit Ticket
              </button>
            </form>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
