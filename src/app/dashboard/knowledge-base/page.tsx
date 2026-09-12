'use client';

import * as React from 'react';
import { 
  Upload, Search, Grid, List, FileText, FileSpreadsheet, 
  Image as ImageIcon, Trash2, Eye, Calendar, 
  HardDrive, FileCode, CheckCircle2, AlertCircle, RefreshCw,
  Building2, Database, ShieldCheck
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Document } from '@/types';

export default function KnowledgeBasePage() {
  const { user } = useAuthStore();
  const documents = useDataStore((state) => state.documents);
  const uploadDocumentFile = useDataStore((state) => state.uploadDocumentFile);
  const deleteDocument = useDataStore((state) => state.deleteDocument);
  const { toast } = useToastStore();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const canManageDocs = isSuperAdmin || user?.role === 'Admin' || user?.role === 'ADMIN';
  const userDept = user?.department || 'Engineering';

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
    if (!canManageDocs) return;
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
    if (!canManageDocs) return;

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

  const uploadFile = async (file: File) => {
    if (!canManageDocs) {
      toast({
        title: 'Access Forbidden',
        description: 'Employees cannot upload documents. Document ingestion is managed by Department Administrators.',
        type: 'error',
      });
      return;
    }

    await uploadDocumentFile(file, userDept);

    toast({
      title: 'Ingestion Triggered',
      description: `Ingesting "${file.name}" into ${userDept} Vector Knowledge Base.`,
      type: 'success',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!canManageDocs) {
      toast({
        title: 'Access Forbidden',
        description: 'Employees cannot delete documents.',
        type: 'error',
      });
      return;
    }
    deleteDocument(id);
    if (previewDoc?.id === id) setPreviewDoc(null);
    toast({
      title: 'Document Deleted',
      description: `Removed "${name}" from Knowledge Base index.`,
      type: 'warning',
    });
  };

  // Department Scoping: Admin ONLY sees their department documents. Super Admin sees all.
  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(searchVal.toLowerCase());
    const matchType = typeFilter === 'All' || doc.type === typeFilter;
    
    if (isSuperAdmin) {
      const matchDept = deptFilter === 'All' || doc.department === deptFilter;
      return matchSearch && matchDept && matchType;
    } else {
      // Scoped exclusively to user's department
      const matchDept = doc.department === userDept || doc.accessLevel === 'Public';
      return matchSearch && matchDept && matchType;
    }
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-teal-600" />
              {isSuperAdmin ? 'Global Organization Knowledge Base' : `${userDept} Department Knowledge Base`}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            {isSuperAdmin ? 'Enterprise Knowledge Base' : `${userDept} Knowledge Base`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin 
              ? 'Global repository of indexed organizational documents and vector partitions.'
              : `Vectorized documents and RAG knowledge sources scoped for ${userDept} operations.`}
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone (Restricted to Department Admins & SuperAdmin) */}
      {canManageDocs ? (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden backdrop-blur-sm bg-card/45",
            dragActive 
              ? "border-teal-600 bg-teal-50/10 scale-[0.99]" 
              : "border-border hover:border-teal-600/40 hover:bg-muted/10"
          )}
        >
          <input 
            type="file" 
            id="file-upload-input" 
            className="hidden" 
            onChange={handleFileInput} 
            accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx,image/*"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 mb-4 shadow-md">
            <Upload className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 z-10">
            <p className="text-xs font-semibold text-foreground">
              <label htmlFor="file-upload-input" className="text-teal-700 dark:text-teal-400 hover:underline cursor-pointer font-bold">
                Click to select file
              </label>{' '}
              or drag and drop here
            </p>
            <p className="text-[10px] text-muted-foreground">
              PDF, Word, CSV, Excel, TXT (Auto-bound to {userDept} partition)
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-teal-200 dark:border-teal-900 bg-teal-50/30 dark:bg-teal-950/20 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-teal-900 dark:text-teal-200 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" /> {userDept} Knowledge Vault (Employee View)
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You are viewing documents indexed for the {userDept} department. Use the AI Assistant to ask RAG queries against these documents. Document ingestion is managed by your Department Administrator.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-xl whitespace-nowrap">
            Read Only Access
          </span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search in ${userDept} docs...`}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isSuperAdmin && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-700 font-semibold text-foreground"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Legal">Legal</option>
              <option value="IT">IT</option>
            </select>
          )}

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-teal-700 font-semibold text-foreground"
          >
            <option value="All">All Types</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="TXT">TXT</option>
            <option value="CSV">CSV</option>
            <option value="XLSX">XLSX</option>
          </select>

          <div className="flex items-center border border-border rounded-xl p-1 bg-background">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'grid' ? "bg-teal-800 text-white" : "text-muted-foreground")}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'list' ? "bg-teal-800 text-white" : "text-muted-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List of Documents */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl space-y-2">
          <Database className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-foreground">No documents found in {userDept} partition</p>
          <p className="text-xs text-muted-foreground">Upload files above to start vector retrieval indexing.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="border border-border/80 hover:border-teal-500/40 shadow-sm transition-all duration-200 flex flex-col justify-between">
              <CardHeader className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-muted/40">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {doc.department}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      doc.status === 'Indexed' || doc.status === 'Processed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : doc.status === 'Indexing' || doc.status === 'Processing'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    }`}>
                      {doc.status === 'Indexed' || doc.status === 'Processed' ? '✓ Indexed' : (doc.status === 'Indexing' || doc.status === 'Processing' ? '⟳ Indexing' : '✗ Failed')}
                    </span>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xs font-bold truncate leading-tight" title={doc.name}>
                    {doc.name}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {doc.size} • {doc.chunksCount || 16} Chunks
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px]">
                  <span className="text-muted-foreground">{doc.uploadedAt}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Inspect Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {canManageDocs && (
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-border/80 shadow-md divide-y divide-border/50">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors text-xs">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-muted/40">
                  {getFileIcon(doc.type)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground">{doc.size} • {doc.department} Partition</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground">{doc.uploadedAt}</span>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Inspect Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Document Details</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[280px]">{previewDoc.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Department:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">{previewDoc.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">File Type:</span>
                  <span className="font-bold text-foreground">{previewDoc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Size:</span>
                  <span className="font-bold text-foreground">{previewDoc.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Vector Chunks:</span>
                  <span className="font-bold text-emerald-600">{previewDoc.chunksCount || 16} embeddings</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-full h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
