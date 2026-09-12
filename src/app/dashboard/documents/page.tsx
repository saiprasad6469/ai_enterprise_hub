'use client';

import * as React from 'react';
import { 
  FileText, Search, Trash2, Eye, Calendar, User, 
  Tag, Download, ArrowUpDown, ChevronDown, CheckCircle2, 
  AlertCircle, RefreshCw 
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Document } from '@/types';

export default function DocumentsPage() {
  const documents = useDataStore((state) => state.documents);
  const deleteDocument = useDataStore((state) => state.deleteDocument);
  const { toast } = useToastStore();

  const [searchVal, setSearchVal] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('All');
  const [selectedDoc, setSelectedDoc] = React.useState<Document | null>(null);
  const [sortField, setSortField] = React.useState<'name' | 'size' | 'uploadedAt'>('name');
  const [sortAsc, setSortAsc] = React.useState(true);

  const handleDelete = (id: string, name: string) => {
    deleteDocument(id);
    if (selectedDoc?.id === id) setSelectedDoc(null);
    toast({
      title: 'Document Removed',
      description: `Removed "${name}" from your workspace index.`,
      type: 'warning',
    });
  };

  const handleSort = (field: 'name' | 'size' | 'uploadedAt') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter and sort documents
  const processedDocs = React.useMemo(() => {
    let result = documents.filter((doc) => {
      const matchSearch = doc.name.toLowerCase().includes(searchVal.toLowerCase());
      const matchDept = deptFilter === 'All' || doc.department === deptFilter;
      return matchSearch && matchDept;
    });

    result.sort((a, b) => {
      let aVal: string = a[sortField];
      let bVal: string = b[sortField];
      
      if (sortField === 'size') {
        aVal = parseFloat(a.size).toString();
        bVal = parseFloat(b.size).toString();
      }

      if (sortAsc) {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    return result;
  }, [documents, searchVal, deptFilter, sortField, sortAsc]);

  return (
    <div className="space-y-8 select-none">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Document Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Audit, search, and manage individual data sources synced into your vector pipeline.</p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-card/40 border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 flex items-center border border-border bg-background px-3 py-1.5 rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search document name..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground px-2 text-foreground"
          />
        </div>

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
      </div>

      {/* Table Section */}
      {processedDocs.length === 0 ? (
        <Card className="border border-border/80 text-center p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 text-muted-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold">No documents indexed</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Verify filters or go to the Knowledge Base page to trigger an upload stream.</p>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer font-bold select-none" onClick={() => handleSort('name')}>
                <span className="flex items-center gap-1.5">Document Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
              </TableHead>
              <TableHead className="cursor-pointer font-bold select-none" onClick={() => handleSort('size')}>
                <span className="flex items-center gap-1.5">File Size <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
              </TableHead>
              <TableHead className="font-bold">Extension</TableHead>
              <TableHead className="font-bold">Uploaded By</TableHead>
              <TableHead className="cursor-pointer font-bold select-none" onClick={() => handleSort('uploadedAt')}>
                <span className="flex items-center gap-1.5">Date Synced <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
              </TableHead>
              <TableHead className="font-bold">Department</TableHead>
              <TableHead className="font-bold">Pipeline Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedDocs.map((doc) => {
              const isProcessing = doc.status === 'Processing';
              return (
                <TableRow key={doc.id} className="hover:bg-muted/20">
                  <TableCell className="font-bold text-foreground truncate max-w-xs">{doc.name}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted/60 dark:bg-muted/10 border px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-bold">{doc.type}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.uploadedBy}</TableCell>
                  <TableCell>{doc.uploadedAt}</TableCell>
                  <TableCell>
                    <span className="text-[10px] bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-bold px-1.5 py-0.5 rounded">
                      {doc.department || 'General'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isProcessing ? (
                      <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Vectorizing
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1",
                        doc.status === 'Failed' 
                          ? "bg-rose-500/10 text-rose-500" 
                          : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {doc.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Inspect file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Slide-over Inspection drawer */}
      {selectedDoc && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedDoc(null)} />
          <div className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-card border-l border-border shadow-2xl p-6 z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Document Details
              </h3>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                Close
              </button>
            </div>

            <div className="py-6 space-y-6 text-xs">
              <div className="flex flex-col items-center justify-center p-6 border rounded-2xl bg-muted/20">
                <FileText className="h-10 w-10 text-primary mb-2" />
                <h4 className="font-bold text-foreground text-center mt-2 max-w-full break-all">{selectedDoc.name}</h4>
                <span className="text-[10px] text-muted-foreground mt-0.5">{selectedDoc.size} • {selectedDoc.type}</span>
              </div>

              {/* Specs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> ID Reference</span>
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold text-foreground">{selectedDoc.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Creation Date</span>
                  <span className="font-bold text-foreground">{selectedDoc.uploadedAt}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Sync Triggered By</span>
                  <span className="font-bold text-foreground">{selectedDoc.uploadedBy}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-medium">Division Owner</span>
                  <span className="font-bold text-foreground">{selectedDoc.department || 'General'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    toast({
                      title: 'Download Triggered',
                      description: `Downloading resource "${selectedDoc.name}"`,
                      type: 'success',
                    });
                  }}
                  className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Original File
                </button>
                <button
                  onClick={() => handleDelete(selectedDoc.id, selectedDoc.name)}
                  className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete Vector Index
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
