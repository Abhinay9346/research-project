import { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays, Plus, Clock, Users, FileText, CheckCircle2, Trash2, XCircle,
} from 'lucide-react';
import { useMeetings } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/lib/export-utils';
import { PageHeader, StatusBadge, EmptyState, AnimatedCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { CommitteeMeeting } from '@/lib/types';

export default function CommitteePage() {
  const { meetings, loading, refetch } = useMeetings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [minutesDialog, setMinutesDialog] = useState<CommitteeMeeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommitteeMeeting | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const upcoming = useMemo(() => meetings.filter((m) => m.status === 'scheduled'), [meetings]);
  const past = useMemo(() => meetings.filter((m) => m.status === 'completed'), [meetings]);

  const handleCreate = async (data: { title: string; date: string; time: string; agenda: string; scholarName: string }) => {
    if (!data.title.trim() || !data.date || !data.agenda.trim()) {
      toast.error('Title, date, and agenda are required.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('committee_meetings').insert({
        scholar_id: 's1',
        scholar_name: data.scholarName || 'Arun Patel',
        title: data.title,
        meeting_date: data.date,
        meeting_time: data.time,
        status: 'scheduled',
        agenda: data.agenda,
        attendees: ['Dr. Priya Sharma', 'Prof. Rajesh Kumar', 'Dr. A. Verma', 'Dr. S. Nair'],
      });
      if (error) throw error;
      toast.success('Meeting scheduled successfully.');
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to schedule meeting. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleCancel = async (m: CommitteeMeeting) => {
    try {
      const { error } = await supabase.from('committee_meetings').update({ status: 'cancelled' }).eq('id', m.id);
      if (error) throw error;
      toast.success('Meeting cancelled.');
      refetch();
    } catch (err) {
      toast.error('Failed to cancel. ' + (err as Error).message);
    }
  };

  const handleComplete = async (m: CommitteeMeeting, minutes: string, recommendations: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('committee_meetings').update({
        status: 'completed',
        minutes,
        recommendations,
      }).eq('id', m.id);
      if (error) throw error;
      toast.success('Meeting marked as completed with minutes.');
      setMinutesDialog(null);
      refetch();
    } catch (err) {
      toast.error('Failed to update. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('committee_meetings').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast.success('Meeting deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleExport = () => {
    exportToCSV('committee-meetings.csv',
      ['Title', 'Scholar', 'Date', 'Time', 'Status', 'Agenda', 'Attendees'],
      meetings.map((m) => [m.title, m.scholarName, m.date, m.time, m.status, m.agenda, (m.attendees || []).join('; ')])
    );
    toast.success('Exported to CSV.');
  };

  return (
    <div>
      <PageHeader
        title="Doctoral Committee"
        description="Schedule and track doctoral committee meetings."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={meetings.length === 0}>
              <FileText className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Schedule Meeting</Button>
          </div>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-40 rounded-xl animate-shimmer" />)}</div>
          ) : upcoming.length === 0 ? (
            <Card><CardContent><EmptyState icon={CalendarDays} title="No upcoming meetings" description="Schedule a new committee meeting." action={<Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Schedule Meeting</Button>} /></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((m, i) => (
                <AnimatedCard key={m.id} delay={i * 0.05}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{new Date(m.date).getDate()}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 uppercase">{new Date(m.date).toLocaleString('en', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{m.title}</h3>
                            <StatusBadge status={m.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{m.scholarName}</p>
                          <p className="text-sm mb-3">{m.agenda}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {m.attendees?.length || 0} attendees</span>
                          </div>
                          {m.attendees && m.attendees.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {m.attendees.map((a, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => setMinutesDialog(m)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complete
                          </Button>
                          <Button size="sm" variant="outline" className="text-amber-600" onClick={() => handleCancel(m)}>
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(m)}>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <Card><CardContent><EmptyState icon={FileText} title="No meeting history" /></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {past.map((m, i) => (
                <AnimatedCard key={m.id} delay={i * 0.05}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{m.title}</h3>
                            <StatusBadge status={m.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{m.scholarName} — {m.date}</p>
                          {m.minutes && (
                            <div className="rounded-lg bg-muted/40 p-3 mb-2">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Minutes</div>
                              <p className="text-sm">{m.minutes}</p>
                            </div>
                          )}
                          {m.recommendations && (
                            <div className="rounded-lg bg-amber-500/5 border-l-2 border-amber-500 p-3">
                              <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Recommendations</div>
                              <p className="text-sm">{m.recommendations}</p>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ScheduleDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreate} submitting={submitting} />

      <MinutesDialog meeting={minutesDialog} onOpenChange={setMinutesDialog} onSubmit={handleComplete} submitting={submitting} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
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

function ScheduleDialog({
  open, onOpenChange, onSubmit, submitting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: { title: string; date: string; time: string; agenda: string; scholarName: string }) => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [agenda, setAgenda] = useState('');
  const [scholarName, setScholarName] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(''); setDate(''); setAgenda(''); setScholarName(''); setTime('10:00');
    }
  }, [open]);

  const submit = () => {
    if (!title.trim() || !date || !agenda.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }
    onSubmit({ title, date, time, agenda, scholarName: scholarName || 'Arun Patel' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Committee Meeting</DialogTitle>
          <DialogDescription>Set up a new doctoral committee meeting.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Meeting Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Mid-Seminar Review" />
          </div>
          <div className="space-y-2">
            <Label>Scholar Name</Label>
            <Input value={scholarName} onChange={(e) => setScholarName(e.target.value)} placeholder="Scholar name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Agenda <span className="text-destructive">*</span></Label>
            <Textarea rows={4} value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Meeting agenda and discussion points..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={submitting} onClick={submit}>{submitting ? 'Scheduling...' : 'Schedule Meeting'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MinutesDialog({
  meeting, onOpenChange, onSubmit, submitting,
}: {
  meeting: CommitteeMeeting | null;
  onOpenChange: (o: CommitteeMeeting | null) => void;
  onSubmit: (m: CommitteeMeeting, minutes: string, recommendations: string) => void;
  submitting: boolean;
}) {
  const [minutes, setMinutes] = useState('');
  const [recommendations, setRecommendations] = useState('');

  useEffect(() => {
    setMinutes(meeting?.minutes || '');
    setRecommendations(meeting?.recommendations || '');
  }, [meeting]);

  if (!meeting) return null;

  return (
    <Dialog open={!!meeting} onOpenChange={(o) => !o && onOpenChange(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Meeting</DialogTitle>
          <DialogDescription>{meeting.title} — {meeting.scholarName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border p-3 bg-muted/30">
            <div className="text-xs font-medium text-muted-foreground mb-1">Agenda</div>
            <p className="text-sm">{meeting.agenda}</p>
          </div>
          <div className="space-y-2">
            <Label>Minutes of Meeting</Label>
            <Textarea rows={4} value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Record the meeting minutes..." />
          </div>
          <div className="space-y-2">
            <Label>Recommendations</Label>
            <Textarea rows={3} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} placeholder="Committee recommendations..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>Cancel</Button>
          <Button disabled={submitting} onClick={() => onSubmit(meeting, minutes, recommendations)}>
            {submitting ? 'Saving...' : 'Mark Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
