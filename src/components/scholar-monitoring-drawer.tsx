import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X, User, Mail, Award, Calendar, BookOpen, FileText, TrendingUp,
  Users, Clock, CheckCircle2, AlertTriangle, Save, FileCheck,
  GraduationCap, PenLine, MessageSquare, Download,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useWeeklyLogs, usePublications, useMeetings } from '@/lib/hooks';
import { useResearchProjects, useGuideExplanations, useChairmanReviews } from '@/lib/monitoring-hooks';
import { supabase } from '@/lib/supabase';
import { StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Scholar, ResearchProject, ChairmanReview } from '@/lib/types';

function yearsSince(dateStr: string): number {
  const reg = new Date(dateStr);
  const now = new Date();
  return Math.round(((now.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
}

interface EnrichedScholar extends Scholar {
  yearsRegistered: number;
  isOverdue: boolean;
  expectedYear: string;
  weeklyLogStatus: string;
  publicationsCount: number;
  dcMeetingsCount: number;
  hasGuideExplanation: boolean;
  hasChairmanReview: boolean;
  hasResearchProject: boolean;
}

export function ScholarMonitoringDrawer({
  scholar,
  onClose,
}: {
  scholar: EnrichedScholar | Scholar | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { logs } = useWeeklyLogs();
  const { publications } = usePublications();
  const { meetings } = useMeetings();
  const { projects, refetch: refetchProjects } = useResearchProjects();
  const { explanations, refetch: refetchExplanations } = useGuideExplanations();
  const { reviews, refetch: refetchReviews } = useChairmanReviews();

  const isChairman = user?.role === 'chairman';
  const isGuide = user?.role === 'guide';

  const [activeTab, setActiveTab] = useState('overview');
  const [savingExplanation, setSavingExplanation] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // Guide explanation form state
  const [explForm, setExplForm] = useState({
    reasonForDelay: '',
    challengesFaced: '',
    currentProgress: '',
    expectedCompletionDate: '',
    additionalRemarks: '',
    digitalSignature: '',
  });

  // Chairman review form state
  const [reviewForm, setReviewForm] = useState({
    observation: '',
    comments: '',
    recommendations: '',
    requiredActions: '',
    newDeadline: '',
    reviewStatus: 'needs_immediate_attention' as ChairmanReview['reviewStatus'],
  });

  // Research project form state
  const [projectForm, setProjectForm] = useState({
    projectTitle: '',
    projectDescription: '',
    researchDomain: '',
    technologiesUsed: '',
    majorContributions: '',
    relatedPublications: '',
    progressPercentage: 0,
    thesisStatus: 'in_progress' as ResearchProject['thesisStatus'],
  });

  const scholarId = scholar?.id || '';
  const years = scholar ? yearsSince(scholar.registrationDate) : 0;
  const isOverdue = years >= 4;

  const scholarProject = useMemo(() => projects.find((p) => p.scholarId === scholarId), [projects, scholarId]);
  const scholarExplanation = useMemo(() => explanations.find((e) => e.scholarId === scholarId), [explanations, scholarId]);
  const scholarReviews = useMemo(() => reviews.filter((r) => r.scholarId === scholarId), [reviews, scholarId]);
  const scholarLogs = useMemo(() => logs.filter((l) => l.scholarId === scholarId), [logs, scholarId]);
  const scholarPubs = useMemo(() => publications.filter((p) => p.scholarId === scholarId), [publications, scholarId]);
  const scholarMeetings = useMemo(() => meetings.filter((m) => m.scholarId === scholarId), [meetings, scholarId]);

  // Populate forms when scholar changes
  useEffect(() => {
    if (scholarExplanation) {
      setExplForm({
        reasonForDelay: scholarExplanation.reasonForDelay,
        challengesFaced: scholarExplanation.challengesFaced,
        currentProgress: scholarExplanation.currentProgress,
        expectedCompletionDate: scholarExplanation.expectedCompletionDate || '',
        additionalRemarks: scholarExplanation.additionalRemarks,
        digitalSignature: scholarExplanation.digitalSignature,
      });
    } else {
      setExplForm({ reasonForDelay: '', challengesFaced: '', currentProgress: '', expectedCompletionDate: '', additionalRemarks: '', digitalSignature: '' });
    }
    if (scholarReviews.length > 0) {
      const latest = scholarReviews[0];
      setReviewForm({
        observation: latest.observation,
        comments: latest.comments,
        recommendations: latest.recommendations,
        requiredActions: latest.requiredActions,
        newDeadline: latest.newDeadline || '',
        reviewStatus: latest.reviewStatus,
      });
    } else {
      setReviewForm({ observation: '', comments: '', recommendations: '', requiredActions: '', newDeadline: '', reviewStatus: 'needs_immediate_attention' });
    }
    if (scholarProject) {
      setProjectForm({
        projectTitle: scholarProject.projectTitle,
        projectDescription: scholarProject.projectDescription,
        researchDomain: scholarProject.researchDomain,
        technologiesUsed: scholarProject.technologiesUsed.join(', '),
        majorContributions: scholarProject.majorContributions,
        relatedPublications: scholarProject.relatedPublications,
        progressPercentage: scholarProject.progressPercentage,
        thesisStatus: scholarProject.thesisStatus,
      });
    } else {
      setProjectForm({ projectTitle: '', projectDescription: '', researchDomain: '', technologiesUsed: '', majorContributions: '', relatedPublications: '', progressPercentage: 0, thesisStatus: 'in_progress' });
    }
  }, [scholarId, scholarExplanation, scholarReviews, scholarProject]);

  // Build timeline
  const timeline = useMemo(() => {
    if (!scholar) return [];
    const events: { date: string; title: string; type: string; icon: typeof User }[] = [
      { date: scholar.registrationDate, title: 'Registration', type: 'registration', icon: GraduationCap },
      { date: scholar.registrationDate, title: `Guide Assigned: ${scholar.guideName}`, type: 'guide', icon: Users },
    ];
    scholarLogs.forEach((l) => {
      events.push({ date: l.weekDate, title: `Weekly Log: ${l.researchWork.substring(0, 50)}...`, type: 'log', icon: FileText });
    });
    scholarMeetings.forEach((m) => {
      events.push({ date: m.date, title: `DC Meeting: ${m.title}`, type: 'meeting', icon: Calendar });
    });
    scholarPubs.forEach((p) => {
      events.push({ date: p.publishedDate || p.title, title: `Publication: ${p.title.substring(0, 50)}...`, type: 'publication', icon: BookOpen });
    });
    scholarReviews.forEach((r) => {
      events.push({ date: r.updatedAt, title: `Chairman Review: ${r.reviewStatus.replace(/_/g, ' ')}`, type: 'review', icon: MessageSquare });
    });
    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [scholar, scholarLogs, scholarMeetings, scholarPubs, scholarReviews]);

  if (!scholar) return null;

  const initials = scholar.name.split(' ').map((n) => n[0]).join('');

  const handleSaveExplanation = async () => {
    if (!explForm.reasonForDelay.trim()) {
      toast.error('Reason for delay is mandatory.');
      return;
    }
    if (!explForm.digitalSignature.trim()) {
      toast.error('Digital signature is required.');
      return;
    }
    setSavingExplanation(true);
    try {
      const payload = {
        scholar_id: scholarId,
        guide_name: scholar.guideName,
        reason_for_delay: explForm.reasonForDelay,
        challenges_faced: explForm.challengesFaced,
        current_progress: explForm.currentProgress,
        expected_completion_date: explForm.expectedCompletionDate || null,
        additional_remarks: explForm.additionalRemarks,
        digital_signature: explForm.digitalSignature,
        updated_at: new Date().toISOString(),
      };
      if (scholarExplanation) {
        const { error } = await supabase.from('guide_explanations').update(payload).eq('id', scholarExplanation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('guide_explanations').insert(payload);
        if (error) throw error;
      }
      toast.success('Guide explanation saved successfully.');
      refetchExplanations();
    } catch (err) {
      toast.error('Failed to save. ' + (err as Error).message);
    }
    setSavingExplanation(false);
  };

  const handleSaveReview = async () => {
    if (!scholarExplanation && isOverdue) {
      toast.error('Chairman review cannot be submitted until a guide explanation exists.');
      return;
    }
    if (!reviewForm.observation.trim()) {
      toast.error('Observation is required.');
      return;
    }
    setSavingReview(true);
    try {
      const payload = {
        scholar_id: scholarId,
        observation: reviewForm.observation,
        comments: reviewForm.comments,
        recommendations: reviewForm.recommendations,
        required_actions: reviewForm.requiredActions,
        new_deadline: reviewForm.newDeadline || null,
        review_status: reviewForm.reviewStatus,
        chairman_name: user?.name || 'Chairman',
        updated_at: new Date().toISOString(),
      };
      if (scholarReviews.length > 0) {
        const { error } = await supabase.from('chairman_reviews').update(payload).eq('id', scholarReviews[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('chairman_reviews').insert(payload);
        if (error) throw error;
      }
      toast.success('Chairman review saved successfully.');
      refetchReviews();
    } catch (err) {
      toast.error('Failed to save. ' + (err as Error).message);
    }
    setSavingReview(false);
  };

  const handleSaveProject = async () => {
    if (!projectForm.projectTitle.trim()) {
      toast.error('Project title is required.');
      return;
    }
    setSavingProject(true);
    try {
      const payload = {
        scholar_id: scholarId,
        project_title: projectForm.projectTitle,
        project_description: projectForm.projectDescription,
        research_domain: projectForm.researchDomain,
        technologies_used: projectForm.technologiesUsed.split(',').map((t) => t.trim()).filter(Boolean),
        major_contributions: projectForm.majorContributions,
        related_publications: projectForm.relatedPublications,
        progress_percentage: projectForm.progressPercentage,
        thesis_status: projectForm.thesisStatus,
        updated_at: new Date().toISOString(),
      };
      if (scholarProject) {
        const { error } = await supabase.from('research_projects').update(payload).eq('id', scholarProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('research_projects').insert(payload);
        if (error) throw error;
      }
      toast.success('Research project saved successfully.');
      refetchProjects();
    } catch (err) {
      toast.error('Failed to save. ' + (err as Error).message);
    }
    setSavingProject(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'publications', label: 'Publications' },
    { id: 'meetings', label: 'DC Meetings' },
    ...(isOverdue ? [{ id: 'research', label: 'Research Work' }] : []),
    ...(isOverdue ? [{ id: 'explanation', label: 'Guide Explanation' }] : []),
    ...(isOverdue ? [{ id: 'review', label: "Chairman's Review" }] : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-sm">{scholar.name}</h2>
              <p className="text-xs text-muted-foreground">{scholar.id} · {scholar.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOverdue && (
              <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-3 h-3 mr-1" /> Research Duration Exceeded
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-border shrink-0 overflow-x-auto scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                activeTab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard icon={User} label="Name" value={scholar.name} />
                  <InfoCard icon={Mail} label="Email" value={scholar.email} />
                  <InfoCard icon={Building2} label="Department" value={scholar.department} />
                  <InfoCard icon={Users} label="Guide" value={scholar.guideName} />
                  <InfoCard icon={BookOpen} label="Research Area" value={scholar.researchArea} />
                  <InfoCard icon={Calendar} label="Registration" value={scholar.registrationDate} />
                  <InfoCard icon={Clock} label="Years Registered" value={`${years} years`} highlight={isOverdue} />
                  <InfoCard icon={TrendingUp} label="Expected Completion" value={expectedCompletionYear(scholar.registrationDate)} />
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Research Progress</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={scholar.progress} className="h-3 flex-1" />
                    <span className="font-display text-lg font-bold">{scholar.progress}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {scholar.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                        <div className={cn('w-2 h-2 rounded-full',
                          m.status === 'completed' ? 'bg-emerald-500' :
                          m.status === 'in_progress' ? 'bg-blue-500' :
                          m.status === 'overdue' ? 'bg-red-500' : 'bg-muted-foreground/30'
                        )} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{m.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.completedDate ? `Completed: ${m.completedDate}` : `Target: ${m.targetDate}`}
                          </div>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {scholar.achievements.map((a, i) => (
                      <Badge key={i} variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Award className="w-3 h-3 mr-1" /> {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                {timeline.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No timeline events.</p>}
                {timeline.map((event, i) => {
                  const Icon = event.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        {i < timeline.length - 1 && <div className="w-0.5 h-6 bg-border" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PUBLICATIONS */}
            {activeTab === 'publications' && (
              <div className="space-y-3">
                {scholarPubs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No publications recorded.</p>}
                {scholarPubs.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium leading-snug">{p.title}</h4>
                      {p.verified && <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.journal}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={p.status} />
                      {p.publishedDate && <span className="text-xs text-muted-foreground">{p.publishedDate}</span>}
                    </div>
                    {p.indexing && p.indexing.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.indexing.map((idx) => <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary">{idx}</Badge>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* DC MEETINGS */}
            {activeTab === 'meetings' && (
              <div className="space-y-3">
                {scholarMeetings.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No DC meetings recorded.</p>}
                {scholarMeetings.map((m) => (
                  <div key={m.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{m.title}</h4>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{m.date} at {m.time}</p>
                    <p className="text-sm">{m.agenda}</p>
                    {m.minutes && (
                      <div className="mt-2 p-2 rounded bg-muted/40">
                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Minutes</div>
                        <p className="text-xs">{m.minutes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* RESEARCH WORK (only for overdue) */}
            {activeTab === 'research' && isOverdue && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Research Work Completed</h4>
                  {(isGuide || isChairman) && (
                    <Button size="sm" variant="outline" onClick={handleSaveProject} disabled={savingProject}>
                      <Save className="w-3.5 h-3.5 mr-1.5" /> {savingProject ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Project Title</Label>
                    <Input value={projectForm.projectTitle} onChange={(e) => setProjectForm({ ...projectForm, projectTitle: e.target.value })} disabled={isChairman} placeholder="Research project title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Project Description</Label>
                    <Textarea rows={3} value={projectForm.projectDescription} onChange={(e) => setProjectForm({ ...projectForm, projectDescription: e.target.value })} disabled={isChairman} placeholder="Project description" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Research Domain</Label>
                      <Input value={projectForm.researchDomain} onChange={(e) => setProjectForm({ ...projectForm, researchDomain: e.target.value })} disabled={isChairman} placeholder="e.g. Computer Vision" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Technologies Used</Label>
                      <Input value={projectForm.technologiesUsed} onChange={(e) => setProjectForm({ ...projectForm, technologiesUsed: e.target.value })} disabled={isChairman} placeholder="comma-separated" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Major Contributions</Label>
                    <Textarea rows={2} value={projectForm.majorContributions} onChange={(e) => setProjectForm({ ...projectForm, majorContributions: e.target.value })} disabled={isChairman} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Related Publications</Label>
                    <Input value={projectForm.relatedPublications} onChange={(e) => setProjectForm({ ...projectForm, relatedPublications: e.target.value })} disabled={isChairman} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Progress Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="0" max="100" value={projectForm.progressPercentage} onChange={(e) => setProjectForm({ ...projectForm, progressPercentage: Number(e.target.value) || 0 })} disabled={isChairman} />
                        <span className="text-sm font-medium">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Thesis Status</Label>
                      <Select value={projectForm.thesisStatus} onValueChange={(v) => setProjectForm({ ...projectForm, thesisStatus: v as ResearchProject['thesisStatus'] })} disabled={isChairman}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {scholarProject && scholarProject.uploadedReports.length > 0 && (
                    <div>
                      <Label>Uploaded Reports</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {scholarProject.uploadedReports.map((r, i) => (
                          <Badge key={i} variant="secondary" className="cursor-pointer">
                            <Download className="w-3 h-3 mr-1" /> {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GUIDE EXPLANATION (only for overdue) */}
            {activeTab === 'explanation' && isOverdue && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Guide Explanation</h4>
                    <p className="text-xs text-muted-foreground">Mandatory for scholars exceeding 4 years</p>
                  </div>
                  {isGuide && (
                    <Button size="sm" onClick={handleSaveExplanation} disabled={savingExplanation}>
                      <Save className="w-3.5 h-3.5 mr-1.5" /> {savingExplanation ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </div>

                {scholarExplanation ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Explanation Submitted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Pending Guide Explanation
                  </Badge>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Reason for Delay <span className="text-destructive">*</span></Label>
                    <Textarea rows={3} value={explForm.reasonForDelay} onChange={(e) => setExplForm({ ...explForm, reasonForDelay: e.target.value })} disabled={isChairman} placeholder="Explain the reason for the delay..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Challenges Faced</Label>
                    <Textarea rows={2} value={explForm.challengesFaced} onChange={(e) => setExplForm({ ...explForm, challengesFaced: e.target.value })} disabled={isChairman} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Current Progress</Label>
                    <Textarea rows={2} value={explForm.currentProgress} onChange={(e) => setExplForm({ ...explForm, currentProgress: e.target.value })} disabled={isChairman} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Expected Completion Date</Label>
                      <Input type="date" value={explForm.expectedCompletionDate} onChange={(e) => setExplForm({ ...explForm, expectedCompletionDate: e.target.value })} disabled={isChairman} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Digital Signature</Label>
                      <Input value={explForm.digitalSignature} onChange={(e) => setExplForm({ ...explForm, digitalSignature: e.target.value })} disabled={isChairman} placeholder="Type your name to sign" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Additional Remarks</Label>
                    <Textarea rows={2} value={explForm.additionalRemarks} onChange={(e) => setExplForm({ ...explForm, additionalRemarks: e.target.value })} disabled={isChairman} />
                  </div>
                </div>

                {scholarExplanation && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    <div className="flex items-center gap-2">
                      <PenLine className="w-3 h-3" />
                      <span>Guide: {scholarExplanation.guideName}</span>
                      <span>·</span>
                      <span>Last Updated: {new Date(scholarExplanation.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHAIRMAN REVIEW (only for overdue) */}
            {activeTab === 'review' && isOverdue && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Chairman's Review</h4>
                    <p className="text-xs text-muted-foreground">
                      {scholarExplanation ? 'Guide explanation submitted. You can now review.' : 'Guide explanation required before review.'}
                    </p>
                  </div>
                  {isChairman && (
                    <Button size="sm" onClick={handleSaveReview} disabled={savingReview || !scholarExplanation}>
                      <Save className="w-3.5 h-3.5 mr-1.5" /> {savingReview ? 'Saving...' : 'Save Review'}
                    </Button>
                  )}
                </div>

                {!scholarExplanation && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Chairman review cannot be submitted until the guide provides an explanation.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Observation</Label>
                    <Textarea rows={2} value={reviewForm.observation} onChange={(e) => setReviewForm({ ...reviewForm, observation: e.target.value })} disabled={!isChairman} placeholder="Your observations..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Comments</Label>
                    <Textarea rows={2} value={reviewForm.comments} onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })} disabled={!isChairman} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Recommendations</Label>
                    <Textarea rows={2} value={reviewForm.recommendations} onChange={(e) => setReviewForm({ ...reviewForm, recommendations: e.target.value })} disabled={!isChairman} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Required Actions</Label>
                    <Textarea rows={2} value={reviewForm.requiredActions} onChange={(e) => setReviewForm({ ...reviewForm, requiredActions: e.target.value })} disabled={!isChairman} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>New Deadline</Label>
                      <Input type="date" value={reviewForm.newDeadline} onChange={(e) => setReviewForm({ ...reviewForm, newDeadline: e.target.value })} disabled={!isChairman} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={reviewForm.reviewStatus} onValueChange={(v) => setReviewForm({ ...reviewForm, reviewStatus: v as ChairmanReview['reviewStatus'] })} disabled={!isChairman}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="continue_research">Continue Research</SelectItem>
                          <SelectItem value="needs_immediate_attention">Needs Immediate Attention</SelectItem>
                          <SelectItem value="extension_recommended">Extension Recommended</SelectItem>
                          <SelectItem value="extension_rejected">Extension Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {scholarReviews.length > 0 && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    <span>Reviewed by: {scholarReviews[0].chairmanName}</span>
                    <span> · Last Updated: {new Date(scholarReviews[0].updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </>
  );
}

function InfoCard({ icon: Icon, label, value, highlight }: { icon: typeof User; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg border border-border p-3', highlight && 'border-red-500/30 bg-red-500/5')}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={cn('text-sm font-medium', highlight && 'text-red-600 dark:text-red-400')}>{value}</div>
    </div>
  );
}

function expectedCompletionYear(dateStr: string): string {
  const reg = new Date(dateStr);
  reg.setFullYear(reg.getFullYear() + 5);
  return reg.getFullYear().toString();
}
