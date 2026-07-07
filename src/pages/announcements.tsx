import { useState, useEffect } from 'react';
import { Megaphone, Plus, AlertCircle, Info, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useAnnouncements } from '@/lib/hooks';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageHeader, EmptyState, AnimatedCard } from '@/components/common';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/lib/types';

const priorityConfig = {
  high: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'High' },
  medium: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Medium' },
  low: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Low' },
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { announcements, loading, refetch } = useAnnouncements();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const canCreate = user?.role === 'chairman' || user?.role === 'admin';

  const handleSave = async (data: { title: string; content: string; priority: string }) => {
    if (!data.title.trim() || !data.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/announcements/${editing.id}`, {
          title: data.title,
          content: data.content,
          priority: data.priority,
        });
        toast.success('Announcement updated.');
      } else {
        await api.post('/announcements', {
          title: data.title,
          content: data.content,
          priority: data.priority,
          author: user?.name || 'Admin',
        });
        toast.success('Announcement published.');
      }
      setDialogOpen(false);
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error('Failed to save. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await api.delete(`/announcements/${deleteTarget.id}`);
      toast.success('Announcement deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete. ' + (err as Error).message);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Institution-wide notices and updates."
        action={canCreate && <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>}
      />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl animate-shimmer" />)}</div>
      ) : announcements.length === 0 ? (
        <Card><CardContent><EmptyState icon={Megaphone} title="No announcements" description={canCreate ? 'Create a new announcement to notify users.' : undefined} action={canCreate && <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>} /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => {
            const cfg = priorityConfig[a.priority as keyof typeof priorityConfig] || priorityConfig.medium;
            const Icon = cfg.icon;
            return (
              <AnimatedCard key={a.id} delay={i * 0.05}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                        <Icon className={cn('w-5 h-5', cfg.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{a.title}</h3>
                          <Badge variant="outline" className={cn('text-xs', cfg.bg, cfg.color)}>{cfg.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{a.content}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span>{a.author}</span>
                          <span>·</span>
                          <span>{new Date(a.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {canCreate && (
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setDialogOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(a)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            );
          })}
        </div>
      )}

      <CreateDialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }} editing={editing} onSubmit={handleSave} submitting={submitting} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
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

function CreateDialog({
  open, onOpenChange, editing, onSubmit, submitting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Announcement | null;
  onSubmit: (data: { title: string; content: string; priority: string }) => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (open) {
      setTitle(editing?.title || '');
      setContent(editing?.content || '');
      setPriority(editing?.priority || 'medium');
    }
  }, [open, editing]);

  const submit = () => {
    if (!title.trim() || !content.trim()) { toast.error('Title and content are required.'); return; }
    onSubmit({ title, content, priority });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          <DialogDescription>{editing ? 'Update announcement details.' : 'Publish a new announcement to all users.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div className="space-y-2">
            <Label>Content <span className="text-destructive">*</span></Label>
            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement content..." />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={submitting} onClick={submit}>{submitting ? 'Saving...' : editing ? 'Update' : 'Publish'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
