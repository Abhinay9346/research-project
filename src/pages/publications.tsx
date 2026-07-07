import { useState, useMemo, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Filter, ExternalLink, Download,
  CheckCircle2, Clock, FileText, BadgeCheck, Edit, Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usePublications } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/lib/export-utils';
import type { Publication } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState, AnimatedCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const indexingOptions = ['SCI', 'SCIE', 'ESCI', 'Scopus', 'UGC CARE', 'Web of Science', 'Google Scholar'];

export default function PublicationsPage() {
  const { user } = useAuth();
  const { publications, loading, refetch } = usePublications();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isScholar = user?.role === 'scholar';
  const canVerify = user?.role === 'guide' || user?.role === 'chairman' || user?.role === 'admin';

  const filtered = useMemo(() => {
    let result = publications;
    if (isScholar) result = result.filter((p) => p.scholarId === 's1');
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.journal.toLowerCase().includes(q) || p.scholarName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [publications, statusFilter, search, isScholar]);

  const handleSave = async (data: Partial<Publication>) => {
    if (!data.title?.trim() || !data.journal?.trim()) {
      toast.error('Title and journal are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        const { error } = await supabase.from('publications').update({
          title: data.title,
          doi: data.doi || '',
          journal: data.journal,
          conference: data.conference || '',
          issn: data.issn || '',
          indexing: data.indexing || [],
          apc_paid: data.apcPaid || false,
          journal_link: data.journalLink || '',
          status: data.status || 'draft',
          published_date: data.publishedDate || null,
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Publication updated successfully.');
      } else {
        const { error } = await supabase.from('publications').insert({
          scholar_id: 's1',
          scholar_name: user?.name || 'Scholar',
          title: data.title,
          doi: data.doi || '',
          journal: data.journal,
          conference: data.conference || '',
          issn: data.issn || '',
          indexing: data.indexing || [],
          apc_paid: data.apcPaid || false,
          journal_link: data.journalLink || '',
          status: data.status || 'draft',
          verified: false,
        });
        if (error) throw error;
        toast.success('Publication added successfully.');
      }
      setDialogOpen(false);
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error('Failed to save publication. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleVerify = async (pub: Publication) => {
    try {
      const { error } = await supabase.from('publications').update({ verified: !pub.verified }).eq('id', pub.id);
      if (error) throw error;
      toast.success(pub.verified ? 'Publication unverified.' : 'Publication verified.');
      refetch();
    } catch (err) {
      toast.error('Failed to update. ' + (err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('publications').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast.success('Publication deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleExport = () => {
    exportToCSV('publications.csv',
      ['Title', 'Scholar', 'Journal', 'Conference', 'DOI', 'ISSN', 'Indexing', 'Status', 'Verified', 'APC Paid', 'Published Date'],
      filtered.map((p) => [p.title, p.scholarName, p.journal, p.conference || '', p.doi, p.issn || '', (p.indexing || []).join('; '), p.status, p.verified ? 'Yes' : 'No', p.apcPaid ? 'Yes' : 'No', p.publishedDate || ''])
    );
    toast.success('Exported to CSV.');
  };

  const stats = [
    { label: 'Total Publications', value: publications.length, icon: BookOpen, color: 'text-primary' },
    { label: 'Published', value: publications.filter((p) => p.status === 'published').length, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Under Review', value: publications.filter((p) => p.status === 'under_review' || p.status === 'submitted').length, icon: Clock, color: 'text-amber-500' },
    { label: 'Verified', value: publications.filter((p) => p.verified).length, icon: BadgeCheck, color: 'text-blue-500' },
  ];

  return (
    <div>
      <PageHeader
        title="Publications"
        description="Track research publications, indexing, and verification status."
        action={
          isScholar && (
            <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Publication
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <AnimatedCard key={s.label} delay={i * 0.05}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', s.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-xl font-bold">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by title, journal, or scholar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl animate-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent>
          <EmptyState icon={BookOpen} title="No publications found" description="No publications match the current filters." action={isScholar && <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Publication</Button>} />
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((pub, i) => (
            <AnimatedCard key={pub.id} delay={i * 0.04}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">{pub.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{pub.scholarName}</p>
                    </div>
                    {pub.verified && (
                      <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Journal</span>
                      <span className="text-xs font-medium truncate">{pub.journal}</span>
                    </div>
                    {pub.conference && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">Conference</span>
                        <span className="text-xs font-medium">{pub.conference}</span>
                      </div>
                    )}
                    {pub.doi && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">DOI</span>
                        <span className="text-xs font-mono truncate">{pub.doi}</span>
                      </div>
                    )}
                    {pub.publishedDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">Published</span>
                        <span className="text-xs">{pub.publishedDate}</span>
                      </div>
                    )}
                  </div>

                  {pub.indexing && pub.indexing.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {pub.indexing.map((idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {idx}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <StatusBadge status={pub.status} />
                    <div className="flex items-center gap-1.5">
                      {pub.apcPaid && <Badge variant="outline" className="text-xs">APC Paid</Badge>}
                      {canVerify && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleVerify(pub)}>
                          {pub.verified ? 'Unverify' : 'Verify'}
                        </Button>
                      )}
                      {isScholar && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(pub); setDialogOpen(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {(isScholar || canVerify) && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(pub)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {pub.journalLink && (
                        <a href={pub.journalLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}

      <PublicationDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editing={editing}
        onSubmit={handleSave}
        submitting={submitting}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Publication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PublicationDialog({
  open, onOpenChange, editing, onSubmit, submitting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Publication | null;
  onSubmit: (data: Partial<Publication>) => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [doi, setDoi] = useState('');
  const [journal, setJournal] = useState('');
  const [conference, setConference] = useState('');
  const [issn, setIssn] = useState('');
  const [journalLink, setJournalLink] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [status, setStatus] = useState<Publication['status']>('draft');
  const [apcPaid, setApcPaid] = useState(false);
  const [indexing, setIndexing] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title || '');
      setDoi(editing?.doi || '');
      setJournal(editing?.journal || '');
      setConference(editing?.conference || '');
      setIssn(editing?.issn || '');
      setJournalLink(editing?.journalLink || '');
      setPublishedDate(editing?.publishedDate || '');
      setStatus(editing?.status || 'draft');
      setApcPaid(editing?.apcPaid || false);
      setIndexing(editing?.indexing || []);
    }
  }, [open, editing]);

  const toggleIndex = (idx: string) => {
    setIndexing((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };

  const submit = () => {
    if (!title.trim() || !journal.trim()) {
      toast.error('Title and journal are required.');
      return;
    }
    onSubmit({ title, doi, journal, conference, issn, journalLink, status, apcPaid, indexing, publishedDate: publishedDate || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
          <DialogDescription>{editing ? 'Update publication details.' : 'Record a new research publication.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Publication title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Journal <span className="text-destructive">*</span></Label>
              <Input value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="Journal name" />
            </div>
            <div className="space-y-2">
              <Label>Conference</Label>
              <Input value={conference} onChange={(e) => setConference(e.target.value)} placeholder="Conference (if applicable)" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DOI</Label>
              <Input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.xxxx/xxxxx" />
            </div>
            <div className="space-y-2">
              <Label>ISSN</Label>
              <Input value={issn} onChange={(e) => setIssn(e.target.value)} placeholder="0000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Journal Link</Label>
            <Input value={journalLink} onChange={(e) => setJournalLink(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Indexing</Label>
            <div className="flex flex-wrap gap-2">
              {indexingOptions.map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    indexing.includes(idx)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {idx}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Publication['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Published Date</Label>
              <Input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={apcPaid} onCheckedChange={(v) => setApcPaid(!!v)} id="apc" />
            <Label htmlFor="apc" className="text-sm font-normal cursor-pointer">APC Paid</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={submitting} onClick={submit}>{submitting ? 'Saving...' : editing ? 'Update' : 'Add Publication'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
