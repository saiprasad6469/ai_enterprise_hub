'use client';

import * as React from 'react';
import { 
  Upload, Search, Grid, List, FileText, FileSpreadsheet, 
  Image as ImageIcon, MoreVertical, Trash2, Eye, Calendar, 
  HardDrive, FileCode, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Document } from '@/types';

export default function KnowledgeBasePage() {
  const documents = useDataStore((state) => state.documents);
  const addDocument = useDataStore((state) => state.addDocument);
  const deleteDocument = useDataStore((state) => state.deleteDocument);
  const { toast } = useToastStore();

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchVal, setSearchVal] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('All');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const [dragActive, setDragActive] = React.useState(false);
  const [previewDoc, setPreviewDoc] = React.useState<Document | null>(null);

  // File type icon generator
  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'PDF') return <FileText className="h-8 w-8 text-rose-500" />;
    if (t === 'CSV' || t === 'XLSX') return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
    if (t === 'TXT' || t === 'DOCX') return <FileText className="h-8 w-8 text-blue-500" />;
    if (t === 'PPTX') return <FileCode className="h-8 w-8 text-amber-500" />;
    if (['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(t)) return <ImageIcon className="h-8 w-8 text-teal-500" />;
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  // Drag and Drop simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'TXT';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    
    // Trigger Zustand doc creation (which has progress simulation)
    addDocument({
      name: file.name,
      type: ext,
      size: `${sizeMB} MB`,
      department: 'Engineering', // default allocation
    });

    toast({
      title: 'Ingestion Triggered',
      description: `Ingesting "${file.name}" into Vector Knowledge Base.`,
      type: 'success',
    });
  };

  const handleDelete = (id: string, name: string) => {
    deleteDocument(id);
    if (previewDoc?.id === id) setPreviewDoc(null);
    toast({
      title: 'Document Deleted',
      description: `Removed "${name}" from Knowledge Base index.`,
      type: 'warning',
    });
  };

  // Filters logic
  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(searchVal.toLowerCase());
    const matchDept = deptFilter === 'All' || doc.department === deptFilter;
    const matchType = typeFilter === 'All' || doc.type === typeFilter;
    return matchSearch && matchDept && matchType;
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect directories and files. Documents are auto-vectorized, chunked, and embedded into Pinecone.</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden backdrop-blur-sm bg-card/45",
          dragActive 
            ? "border-primary bg-primary/5 scale-[0.99]" 
            : "border-border hover:border-primary/40 hover:bg-muted/10"
        )}
      >
        <input 
          type="file" 
          id="file-upload-input" 
          className="hidden" 
          onChange={handleFileInput} 
          accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx,image/*"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-md shadow-primary/5">
          <Upload className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 z-10">
          <p className="text-xs font-semibold text-foreground">
            <label htmlFor="file-upload-input" className="text-primary hover:underline cursor-pointer font-bold">
              Click to select file
            </label>{' '}
            or drag and drop it here
          </p>
          <p className="text-[10px] text-muted-foreground">Supported file formats: PDF, DOCX, TXT, CSV, XLSX, PPTX, Images up to 25MB.</p>
        </div>
      </div>

      {/* Filters & Search Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center border border-border bg-background px-3 py-1.5 rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search document name..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground px-2"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
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

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-semibold text-foreground"
          >
            <option value="All">All Filetypes</option>
            <option value="PDF">PDF Documents</option>
            <option value="DOCX">Word Documents</option>
            <option value="CSV">CSV Spreadsheets</option>
            <option value="XLSX">Excel Sheets</option>
            <option value="TXT">Plain Text</option>
            <option value="PPTX">PowerPoint</option>
          </select>

          {/* View Mode Switch */}
          <div className="flex border border-border bg-background rounded-lg p-0.5 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Render Slot */}
      {filteredDocs.length === 0 ? (
        <Card className="border border-border/80 text-center p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 text-muted-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">No documents matching filters</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Try clearing search inputs or dragging in a new PDF contract draft to vectorize.</p>
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => {
            const isProcessing = doc.status === 'Processing';
            const isFailed = doc.status === 'Failed';

            return (
              <Card key={doc.id} className="relative group border-border/80 hover:border-primary/30 transition-all duration-300">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 dark:bg-muted/10">
                    {getFileIcon(doc.type)}
                  </div>
                  
                  {/* Actions Dropdown mock */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Inspect metadata"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-foreground truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{doc.size} • {doc.type}</p>
                  </div>

                  {/* Progress bar / Ingestion Status */}
                  {isProcessing ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin text-primary" /> Vectorizing index</span>
                        <span>{doc.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-muted dark:bg-muted/30 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${doc.progress || 0}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                        isFailed 
                          ? "bg-rose-500/10 text-rose-500" 
                          : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {isFailed ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {doc.status}
                      </span>
                      <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">{doc.department}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="border border-border/80 rounded-2xl overflow-hidden bg-card">
          <div className="divide-y divide-border/40">
            {filteredDocs.map((doc) => {
              const isProcessing = doc.status === 'Processing';
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 text-xs hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate max-w-md">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{doc.size} • {doc.type} • Uploaded by {doc.uploadedBy}</p>
                    </div>
                  </div>
                  
                  {/* Processing Status & Actions */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {isProcessing ? (
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold">
                          <span>Vectorizing</span>
                          <span>{doc.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-muted dark:bg-muted/30 h-1 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${doc.progress || 0}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                        doc.status === 'Failed' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {doc.status}
                      </span>
                    )}

                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">{doc.department}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.uploadedAt}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Preview Slide-over Modal Dialog */}
      {previewDoc && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPreviewDoc(null)} />
          <div className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-card border-l border-border shadow-2xl p-6 z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Document Inspector
              </h3>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                Close
              </button>
            </div>

            <div className="py-6 space-y-6 text-xs">
              <div className="flex flex-col items-center justify-center p-6 border border-border/80 rounded-2xl bg-muted/20">
                {getFileIcon(previewDoc.type)}
                <h4 className="font-bold text-foreground text-center mt-3 max-w-full break-all">{previewDoc.name}</h4>
                <span className="text-[10px] text-muted-foreground mt-0.5">{previewDoc.size} • {previewDoc.type}</span>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium">Ingestion ID</span>
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold text-foreground">{previewDoc.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium">Vector Index Status</span>
                  <span className={cn(
                    "font-bold px-1.5 py-0.5 rounded",
                    previewDoc.status === 'Processed' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                  )}>{previewDoc.status}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium">Department Owner</span>
                  <span className="font-bold text-foreground">{previewDoc.department || 'General'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium">Uploaded By</span>
                  <span className="font-bold text-foreground">{previewDoc.uploadedBy}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium">Upload Date</span>
                  <span className="font-bold text-foreground">{previewDoc.uploadedAt}</span>
                </div>
              </div>

              {/* RAG statistics mockup */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground">Semantic Embeddings Overview</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 border border-border/80 bg-muted/10 rounded-xl">
                    <p className="text-[10px] text-muted-foreground">Tokens Chunked</p>
                    <p className="text-base font-extrabold text-foreground mt-1">45.2K</p>
                  </div>
                  <div className="p-3 border border-border/80 bg-muted/10 rounded-xl">
                    <p className="text-[10px] text-muted-foreground">Embedding Dimensions</p>
                    <p className="text-base font-extrabold text-foreground mt-1">1,536</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
