'use client';

import * as React from 'react';
import { 
  MessageSquare, Plus, Send, Copy, Check, FileText, 
  Bot, Trash2, ShieldCheck, Sparkles, ChevronRight, Info 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/useToastStore';

// Custom lightweight Markdown/Code renderer for React 19 compatibility
function MarkdownRenderer({ content }: { content: string }) {
  const [copiedBlockIdx, setCopiedBlockIdx] = React.useState<number | null>(null);
  const { toast } = useToastStore();

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBlockIdx(index);
    toast({
      title: 'Copied Code',
      description: 'Code snippet copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setCopiedBlockIdx(null), 2000);
  };

  // Detect code blocks
  const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract language and code content
          const lines = part.split('\n');
          const langMatch = lines[0].match(/```([a-zA-Z0-9-]*)/);
          const lang = langMatch ? langMatch[1] : 'code';
          const code = lines.slice(1, -1).join('\n');

          return (
            <div key={index} className="relative border border-border/80 rounded-xl overflow-hidden bg-muted/40 dark:bg-black/40 font-mono my-2 text-xs">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-muted/80 dark:bg-card/90 text-muted-foreground font-semibold">
                <span>{lang}</span>
                <button
                  onClick={() => handleCopyCode(code, index)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded"
                >
                  {copiedBlockIdx === index ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBlockIdx === index ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] leading-normal text-foreground">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render simple Markdown-like text (bold, list items, files links)
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              // List items
              if (line.startsWith('* ') || line.startsWith('- ')) {
                return (
                  <ul key={lIdx} className="list-disc pl-6 space-y-1">
                    <li>{parseInlineElements(line.substring(2))}</li>
                  </ul>
                );
              }
              // Numbered list items
              if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+)\.\s(.*)/);
                if (match) {
                  return (
                    <ol key={lIdx} className="list-decimal pl-6 space-y-1">
                      <li value={parseInt(match[1])}>{parseInlineElements(match[2])}</li>
                    </ol>
                  );
                }
              }
              // Headings
              if (line.startsWith('### ')) {
                return <h4 key={lIdx} className="text-sm font-bold text-foreground mt-3 mb-1">{parseInlineElements(line.substring(4))}</h4>;
              }
              if (line.startsWith('## ')) {
                return <h3 key={lIdx} className="text-base font-bold text-foreground mt-4 mb-2">{parseInlineElements(line.substring(3))}</h3>;
              }
              if (line.startsWith('# ')) {
                return <h2 key={lIdx} className="text-lg font-bold text-foreground mt-5 mb-3">{parseInlineElements(line.substring(2))}</h2>;
              }

              // Normal paragraph
              return line.trim() === '' ? null : (
                <p key={lIdx} className="leading-relaxed">
                  {parseInlineElements(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Simple inline parser for **bold** and [link](url)
function parseInlineElements(text: string) {
  const elements: React.ReactNode[] = [];
  let index = 0;

  // Pattern for link: [docName](id) or standard text formats
  // Pattern for bold: **text**
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const matches = text.split(regex);

  return matches.map((match, idx) => {
    if (match.startsWith('**') && match.endsWith('**')) {
      return <strong key={idx} className="font-bold text-foreground">{match.slice(2, -2)}</strong>;
    }
    if (match.startsWith('[') && match.includes('](')) {
      const linkMatch = match.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 font-semibold text-primary dark:text-primary-foreground underline cursor-pointer hover:opacity-80"
          >
            <FileText className="h-3 w-3 inline" /> {label}
          </span>
        );
      }
    }
    return match;
  });
}

export default function AIChatPage() {
  const chats = useDataStore((state) => state.chats);
  const activeChatId = useDataStore((state) => state.activeChatId);
  const agents = useDataStore((state) => state.agents);
  const setActiveChatId = useDataStore((state) => state.setActiveChatId);
  const createNewChat = useDataStore((state) => state.createNewChat);
  const sendMessage = useDataStore((state) => state.sendMessage);
  const deleteChat = useDataStore((state) => state.deleteChat);

  const { toast } = useToastStore();
  
  const [inputVal, setInputVal] = React.useState('');
  const [selectedAgentId, setSelectedAgentId] = React.useState(agents[0]?.id || '');
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Auto Scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages, activeChat?.messages[activeChat.messages.length - 1]?.content]);

  // Suggested Prompts
  const suggestedPrompts = [
    { title: 'Check contract liabilities', text: 'What are the main liabilities described in the GDPR compliance text?' },
    { title: 'Review infrastructure cost', text: 'How do I query the infrastructure cost model from my service?' },
    { title: 'Explain GDPR consent rules', text: 'What is the consent policy outline inside the compliance document?' },
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInputVal('');

    let chatId = activeChatId;
    // Create new chat session if none active
    if (!chatId) {
      chatId = createNewChat(selectedAgentId);
    }

    try {
      await sendMessage(chatId, text);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const handlePromptClick = (text: string) => {
    setInputVal(text);
  };

  const handleNewChat = () => {
    const newId = createNewChat(selectedAgentId);
    toast({
      title: 'Session Started',
      description: 'New chat consultation thread created.',
      type: 'success',
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-border bg-card overflow-hidden select-none">
      
      {/* Left Chat History Panel (Sidebar inside Chat) */}
      <div className="hidden sm:flex flex-col w-64 border-r border-border/80 bg-muted/10">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Consultations</h2>
          <button
            onClick={handleNewChat}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Start new thread"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {chats.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">No active threads.</div>
          ) : (
            chats.map((c) => {
              const isActive = c.id === activeChatId;
              const hasAgent = agents.find((a) => a.id === c.agentId);

              return (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                  onClick={() => setActiveChatId(c.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate pr-2">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-primary-foreground/20 text-muted-foreground hover:text-rose-500 transition-all",
                      isActive ? "text-primary-foreground/80 hover:text-white" : ""
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-background/20">
        
        {/* Active Chat Header */}
        <div className="h-14 border-b border-border/60 px-6 flex items-center justify-between bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground truncate">
                {activeChat ? activeChat.title : 'Consult AI Knowledge Base'}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {activeChat 
                  ? `Active Model: ${agents.find((a) => a.id === activeChat.agentId)?.model || 'GPT-4o Enterprise'}`
                  : 'Select an agent below to start a thread'
                }
              </p>
            </div>
          </div>

          {/* Agent Picker for New Sessions */}
          {!activeChat && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Consult:</span>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="text-xs bg-muted/40 border border-border rounded-lg px-2 py-1 focus:outline-none focus:border-primary font-bold text-foreground"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Message Panel Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-muted/5"
        >
          {!activeChat || activeChat.messages.length === 0 ? (
            /* Empty State / Suggestions */
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto space-y-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-lg shadow-primary/5">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Secure Organization AI Assistant</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select an AI agent tailored to corporate divisions and query vector databases containing company documentation. Ready to assist with secure OCR extraction.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 gap-3 w-full">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.title}
                    onClick={() => handlePromptClick(p.text)}
                    className="flex items-center justify-between text-left p-3.5 border border-border/80 bg-card rounded-xl text-xs font-medium hover:border-primary/40 hover:bg-muted/10 transition-all group duration-200 shadow-sm"
                  >
                    <span>{p.text}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Messages List */
            activeChat.messages.map((m) => {
              const isAssistant = m.sender === 'assistant';

              return (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex gap-4 max-w-3xl items-start animate-in fade-in-50 duration-200",
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  {/* Avatar icon */}
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 text-xs font-bold border",
                    isAssistant 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-muted border-border text-foreground"
                  )}>
                    {isAssistant ? <Bot className="h-4 w-4" /> : 'ME'}
                  </div>

                  <div className="space-y-2">
                    {/* Message Bubble Card */}
                    <div className={cn(
                      "p-4 rounded-2xl text-xs shadow-sm border",
                      isAssistant 
                        ? "bg-card border-border/80 text-foreground" 
                        : "bg-primary text-primary-foreground border-primary"
                    )}>
                      {isAssistant ? (
                        <MarkdownRenderer content={m.content} />
                      ) : (
                        <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                      )}

                      {/* Streaming Indicator */}
                      {m.isStreaming && (
                        <span className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 rounded font-semibold text-[10px] animate-pulse">
                          Streaming response...
                        </span>
                      )}
                    </div>

                    {/* Message Meta Info: Timestamp, Copy Button, Citations */}
                    <div className={cn("flex items-center gap-3 text-[10px] text-muted-foreground", isAssistant ? "justify-start" : "justify-end")}>
                      <span>{m.timestamp}</span>
                      
                      {isAssistant && m.content && !m.isStreaming && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.content);
                            toast({
                              title: 'Copied',
                              description: 'Message copied to clipboard.',
                              type: 'success',
                            });
                          }}
                          className="hover:text-foreground flex items-center gap-1 transition-colors p-0.5 rounded hover:bg-muted"
                          title="Copy message"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}

                      {isAssistant && !m.isStreaming && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="h-3.5 w-3.5" /> End-to-End Encrypted
                        </span>
                      )}
                    </div>

                    {/* Citations Grid */}
                    {isAssistant && m.citations && m.citations.length > 0 && !m.isStreaming && (
                      <div className="border border-border/50 rounded-xl p-3 bg-muted/20 dark:bg-muted/5 max-w-xl space-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <Info className="h-3.5 w-3.5 text-primary" /> Sources Cited
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                          {m.citations.map((cit) => (
                            <div 
                              key={cit.id} 
                              className="p-2 border border-border/80 bg-card rounded-lg flex flex-col justify-between text-[11px] hover:border-primary/20 transition-colors"
                            >
                              <div className="font-bold text-foreground truncate flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                {cit.docName} {cit.page && <span className="text-[10px] text-muted-foreground">p.{cit.page}</span>}
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 leading-normal italic">&ldquo;{cit.textSnippet}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Text Form Area */}
        <div className="p-4 border-t border-border/60 bg-card/40">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="flex items-center gap-3 bg-card border border-border rounded-2xl p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 shadow-sm"
          >
            {/* Input field */}
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything about legal contracts, employee handbook or financial data..." 
              className="flex-1 bg-transparent border-0 px-3 py-2 text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || sending}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="text-[10px] text-muted-foreground mt-2 text-center">
            Corporate knowledge databases are updated securely. Intercepting or logging data is SOC2 compliant.
          </div>
        </div>

      </div>

    </div>
  );
}
