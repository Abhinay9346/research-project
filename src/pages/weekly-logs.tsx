import { useState, useMemo, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Download, Clock, CheckCircle2,
  XCircle, MessageSquare, Edit, Calendar, Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useWeeklyLogs } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/lib/export-utils';
import type { WeeklyLog } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState, AnimatedCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function WeeklyLogsPage() {
  const { user } = useAuth();
  const { logs, loading, refetch } = useWeeklyLogs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tab, setTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<WeeklyLog | null>(null);
  const [editing, setEditing] = useState<WeeklyLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WeeklyLog | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isScholar = user?.role === 'scholar';
  const isGuide = user?.role === 'guide';
  const canManage = isGuide || user?.role === 'chairman' || user?.role === 'admin';

  const filtered = useMemo(() => {
    let result = logs;
    if (isScholar) result = result.filter((l) => l.scholarId === 's1');
    if (tab === 'pending') result = result.filter((l) => l.approvalStatus === 'pending');
    if (tab === 'approved') result = result.filter((l) => l.approvalStatus === 'approved');
    if (tab === 'revision') result = result.filter((l) => l.approvalStatus === 'revision');
    if (statusFilter !== 'all') result = result.filter((l) => l.approvalStatus === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.researchWork.toLowerCase().includes(q) || l.scholarName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, tab, statusFilter, search, isScholar]);

  const handleSave = async (data: Partial<WeeklyLog>) => {
    if (!data.researchWork?.trim()) {
      toast.error('Research work description is required.');
      return;
    }
    if (!data.weekDate) {
      toast.error('Week date is required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('weekly_logs')
          .update({
            week_date: data.weekDate,
            research_work: data.researchWork,
            hours_worked: data.hoursWorked,
            problems_faced: data.problemsFaced,
            future_plan: data.futurePlan,
            approval_status: 'pending',
            guide_comment: null,
            reviewed_at: null,
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Weekly log updated and resubmitted.');
      } else {
        const { error } = await supabase.from('weekly_logs').insert({
          scholar_id: 's1',
          scholar_name: user?.name || 'Scholar',
          guide_id: 'u2',
          week_date: data.weekDate,
          research_work: data.researchWork,
          hours_worked: data.hoursWorked || 0,
          problems_faced: data.problemsFaced || '',
          future_plan: data.futurePlan || '',
          approval_status: 'pending',
        });
        if (error) throw error;
        toast.success('Weekly log submitted successfully.');
      }
      setDialogOpen(false);
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error('Failed to save log. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected' | 'revision', comment: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('weekly_logs')
        .update({
          approval_status: status,
          guide_comment: comment,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Log ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'sent for revision'}.`);
      setReviewDialog(null);
      refetch();
    } catch (err) {
      toast.error('Failed to update log. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('weekly_logs').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast.success('Weekly log deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleExport = () => {
    exportToCSV('weekly-logs.csv',
      ['Scholar', 'Week Date', 'Research Work', 'Hours', 'Problems', 'Future Plan', 'Status', 'Guide Comment'],
      filtered.map((l) => [l.scholarName, l.weekDate, l.researchWork, l.hoursWorked, l.problemsFaced, l.futurePlan, l.approvalStatus, l.guideComment || ''])
    );
    toast.success('Exported to CSV.');
  };

  return (
    <div>
      <PageHeader
        title="Weekly Research Logs"
        description={
          isScholar
            ? 'Submit your weekly research progress for guide review.'
            : 'Review and approve scholar research logs.'
        }
        action={
          isScholar && (
            <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> New Log
            </Button>
          )
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by work description or scholar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="revision">Needs Revision</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No weekly logs found"
              description={isScholar ? "You haven't submitted any logs matching the filters." : 'No logs match the current filters.'}
              action={isScholar && <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Submit First Log</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((log, i) => (
            <AnimatedCard key={log.id} delay={i * 0.03}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold">{log.scholarName}</span>
                          <StatusBadge status={log.approvalStatus} />
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Week of {log.weekDate}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {log.hoursWorked}h
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 line-clamp-2">{log.researchWork}</p>
                        {log.guideComment && (
                          <div className="mt-2 p-2.5 rounded-lg bg-muted/60 border-l-2 border-primary">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-0.5">
                              <MessageSquare className="w-3 h-3" /> Guide Comment
                            </div>
                            <p className="text-xs text-muted-foreground">{log.guideComment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isScholar && (log.approvalStatus === 'pending' || log.approvalStatus === 'revision') && (
                        <Button variant="outline" size="sm" onClick={() => { setEditing(log); setDialogOpen(true); }}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                      )}
                      {canManage && log.approvalStatus === 'pending' && (
                        <Button size="sm" onClick={() => setReviewDialog(log)}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Review
                        </Button>
                      )}
                      {canManage && log.approvalStatus === 'revision' && (
                        <Button size="sm" onClick={() => setReviewDialog(log)}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Re-review
                        </Button>
                      )}
                      {(isScholar || canManage) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(log)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}

      <LogFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editing={editing}
        onSubmit={handleSave}
        submitting={submitting}
      />

      <ReviewDialog
        log={reviewDialog}
        onOpenChange={setReviewDialog}
        onSubmit={handleReview}
        submitting={submitting}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Log?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the weekly log for {deleteTarget?.scholarName} (week of {deleteTarget?.weekDate}). This action cannot be undone.
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

function LogFormDialog({
  open, onOpenChange, editing, onSubmit, submitting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: WeeklyLog | null;
  onSubmit: (data: Partial<WeeklyLog>) => void;
  submitting: boolean;
}) {
  const [weekDate, setWeekDate] = useState('');
  const [researchWork, setResearchWork] = useState('');
  const [hoursWorked, setHoursWorked] = useState('40');
  const [problemsFaced, setProblemsFaced] = useState('');
  const [futurePlan, setFuturePlan] = useState('');

  useEffect(() => {
    if (open) {
      setWeekDate(editing?.weekDate || new Date().toISOString().split('T')[0]);
      setResearchWork(editing?.researchWork || '');
      setHoursWorked(editing ? String(editing.hoursWorked) : '40');
      setProblemsFaced(editing?.problemsFaced || '');
      setFuturePlan(editing?.futurePlan || '');
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Weekly Log' : 'Submit Weekly Log'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Update your research log. Resubmitting will reset approval status.' : 'Record your research activities for this week.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekDate">Week Date <span className="text-destructive">*</span></Label>
              <Input id="weekDate" type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked</Label>
              <Input id="hours" type="number" min="0" max="80" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="work">Research Work <span className="text-destructive">*</span></Label>
            <Textarea id="work" rows={4} placeholder="Describe the research work done this week..." value={researchWork} onChange={(e) => setResearchWork(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="problems">Problems Faced</Label>
            <Textarea id="problems" rows={3} placeholder="Any challenges or blockers encountered..." value={problemsFaced} onChange={(e) => setProblemsFaced(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Future Plan</Label>
            <Textarea id="plan" rows={3} placeholder="Planned activities for next week..." value={futurePlan} onChange={(e) => setFuturePlan(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={submitting || !researchWork.trim()}
            onClick={() => onSubmit({ weekDate, researchWork, hoursWorked: Number(hoursWorked) || 0, problemsFaced, futurePlan })}
          >
            {submitting ? 'Saving...' : editing ? 'Update & Resubmit' : 'Submit Log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({
  log, onOpenChange, onSubmit, submitting,
}: {
  log: WeeklyLog | null;
  onOpenChange: (o: WeeklyLog | null) => void;
  onSubmit: (id: string, status: 'approved' | 'rejected' | 'revision', comment: string) => void;
  submitting: boolean;
}) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment(log?.guideComment || '');
  }, [log]);

  if (!log) return null;

  return (
    <Dialog open={!!log} onOpenChange={(o) => !o && onOpenChange(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Weekly Log</DialogTitle>
          <DialogDescription>{log.scholarName} — Week of {log.weekDate}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Research Work</div>
              <p className="text-sm">{log.researchWork}</p>
            </div>
            {log.problemsFaced && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Problems Faced</div>
                <p className="text-sm">{log.problemsFaced}</p>
              </div>
            )}
            {log.futurePlan && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Future Plan</div>
                <p className="text-sm">{log.futurePlan}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {log.hoursWorked} hours</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Guide Comment</Label>
            <Textarea id="comment" rows={3} placeholder="Provide feedback to the scholar..." value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="destructive" disabled={submitting} onClick={() => onSubmit(log.id, 'rejected', comment)}>
            <XCircle className="w-4 h-4 mr-1.5" /> Reject
          </Button>
          <Button variant="outline" disabled={submitting} onClick={() => onSubmit(log.id, 'revision', comment)}>
            <Edit className="w-4 h-4 mr-1.5" /> Request Revision
          </Button>
          <Button disabled={submitting} onClick={() => onSubmit(log.id, 'approved', comment)}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
