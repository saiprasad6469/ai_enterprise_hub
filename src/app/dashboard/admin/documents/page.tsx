'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText, FileUp, Search, Trash2, Eye, Calendar, User, 
  Tag, Download, Sparkles, Building2, CheckCircle2, AlertCircle, X,
  Layers, Database, Shield
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Document } from '@/types';

const documentSchema = z.object({
  name: z.string().min(2, { message: 'Document title is required' }),
  category: z.string().min(2, { message: 'Category is required' }),
  description: z.string().min(5, { message: 'Description is required (min 5 chars)' }),
  type: z.enum(['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'PPTX']),
  accessLevel: z.enum(['Public', 'Department', 'Confidential', 'AdminOnly']),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function AdminDocumentsPage() {
  const { user } = useAuthStore();
  const documents = useDataStore((state) => state.documents);
  const addDocument = useDataStore((state) => state.addDocument);
  const deleteDocument = useDataStore((state) => state.deleteDocument);
  const { toast } = useToastStore();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'SUPER_ADMIN';
  const adminDept = user?.department || 'Engineering';

  const [searchVal, setSearchVal] = React.useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<Document | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: '',
      category: 'Technical',
      description: '',
      type: 'PDF',
      accessLevel: 'Department',
    }
  });

  const onSubmit = (data: DocumentFormValues) => {
    addDocument({
      name: data.name.endsWith(`.${data.type.toLowerCase()}`) ? data.name : `${data.name}.${data.type.toLowerCase()}`,
      type: data.type,
      size: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      department: adminDept, // Auto-locked to Admin's department
      category: data.category,
      description: data.description,
      accessLevel: data.accessLevel,
      chunksCount: Math.floor(Math.random() * 40 + 10),
    });

    toast({
      title: 'Document Ingested',
      description: `"${data.name}" queued for AI chunking & vectorization in ${adminDept}.`,
      type: 'success',
    });
    setIsUploadModalOpen(false);
    reset();
  };

  const handleDelete = (doc: Document) => {
    deleteDocument(doc.id);
    if (selectedDoc?.id === doc.id) setSelectedDoc(null);
    toast({
      title: 'Document Removed',
      description: `Removed "${doc.name}" from vector database index.`,
      type: 'warning',
    });
  };

  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchVal.toLowerCase())) ||
      (doc.category && doc.category.toLowerCase().includes(searchVal.toLowerCase()));
    
    if (isSuperAdmin) return matchSearch;
    return matchSearch && (doc.department === adminDept || doc.accessLevel === 'Public');
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-teal-600" /> {adminDept} Department Documents
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{adminDept} Document Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Upload and maintain company documents for the {adminDept} department RAG retrieval system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            reset();
            setIsUploadModalOpen(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 text-xs font-bold shadow-lg shadow-teal-900/20 transition-all hover:scale-105"
        >
          <FileUp className="h-4 w-4" /> Upload {adminDept} Document
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-96 flex items-center border border-border bg-background px-3 py-2 rounded-xl focus-within:border-teal-700 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${adminDept} document title, description, or category...`}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none px-2 text-foreground"
          />
        </div>

        <div className="text-xs font-bold text-muted-foreground">
          Showing {filteredDocs.length} {adminDept} Documents
        </div>
      </div>

      {/* Documents Table */}
      <Card className="border border-border/80 shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-extrabold">Document Title</TableHead>
              <TableHead className="text-xs font-extrabold">Category</TableHead>
              <TableHead className="text-xs font-extrabold">Department</TableHead>
              <TableHead className="text-xs font-extrabold">Access Level</TableHead>
              <TableHead className="text-xs font-extrabold">RAG Status</TableHead>
              <TableHead className="text-xs font-extrabold">Size</TableHead>
              <TableHead className="text-xs font-extrabold">Uploaded</TableHead>
              <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                  No documents found for {adminDept} department. Click upload to add one.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                        {doc.type}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{doc.description || 'Enterprise documentation'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">
                    {doc.category || 'General'}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                    {doc.department}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.accessLevel === 'Confidential' ? 'bg-rose-100 text-rose-700' :
                      doc.accessLevel === 'AdminOnly' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {doc.accessLevel || 'Department'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {doc.status === 'Processing' ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 animate-spin" /> Chunking ({doc.progress || 20}%)
                        </span>
                        <div className="w-16 bg-muted h-1 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${doc.progress || 20}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> Vectorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {doc.size}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {doc.uploadedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-muted transition-colors"
                        title="Inspect Chunk Data"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete from Vector DB"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Upload Document for {adminDept}</h3>
                <p className="text-xs text-muted-foreground">Document will be tokenized, embedded, and mapped to {adminDept} assistant.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Department Assignment</label>
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/40 px-3.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal-600" /> {adminDept} Department
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-teal-200/60 dark:bg-teal-900 px-2 py-0.5 rounded-full">
                    Auto-Bound
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Document Title</label>
                <Input placeholder="e.g. Q3_Financial_Projections" {...register('name')} />
                {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">File Format</label>
                  <select
                    {...register('type')}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="TXT">Plain Text (.txt)</option>
                    <option value="CSV">Data CSV (.csv)</option>
                    <option value="XLSX">Spreadsheet (.xlsx)</option>
                    <option value="PPTX">Presentation (.pptx)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <Input placeholder="e.g. Policies, Financials, Specs" {...register('category')} />
                  {errors.category && <p className="text-[11px] text-rose-500">{errors.category.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Access Classification</label>
                <select
                  {...register('accessLevel')}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  <option value="Department">{adminDept} Department Only</option>
                  <option value="Public">Company Wide (Public)</option>
                  <option value="Confidential">Confidential / Sensitive</option>
                  <option value="AdminOnly">Administrator Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Summary / Purpose</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Provide context for AI prompt retrieval augmentation..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 text-foreground"
                />
                {errors.description && <p className="text-[11px] text-rose-500">{errors.description.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <FileUp className="h-4 w-4" /> Ingest for {adminDept}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Chunk Inspector Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Vector Data Inspector</h3>
                <p className="text-xs text-muted-foreground">{selectedDoc.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Partition:</span>
                  <span className="font-bold text-foreground">{selectedDoc.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Embedding Model:</span>
                  <span className="font-bold text-teal-600">text-embedding-004</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Semantic Chunks:</span>
                  <span className="font-bold text-foreground">{selectedDoc.chunksCount || 24} Vectors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Classification:</span>
                  <span className="font-bold text-foreground">{selectedDoc.accessLevel || 'Department'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-foreground">Document Description</p>
                <p className="text-muted-foreground leading-relaxed p-2.5 rounded-lg border border-border bg-background">
                  {selectedDoc.description || 'Standard enterprise documentation dataset.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-full h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
