import { useState } from 'react';
import {
  User, Mail, Award, Calendar, BookOpen, FileText, TrendingUp,
  Upload, Download, GraduationCap, MapPin, Phone,
} from 'lucide-react';
import { useScholars } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { PageHeader, StatusBadge, AnimatedCard } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [avatarSeed, setAvatarSeed] = useState(0);

  if (!user) return null;

  const { scholars } = useScholars();
  // Find the scholar record matching the logged-in user (by email), fall back to first scholar
  const scholar = scholars.find((s) => s.email === user.email) || scholars[0] || {} as any;
  const isScholar = user.role === 'scholar';
  const displayName = user.name;
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const handleUploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setAvatarSeed((s) => s + 1);
        toast.success('Profile photo updated.');
      }
    };
    input.click();
  };

  const handleDownloadResume = () => {
    const resumeContent = `CURRICULUM VITAE\n\nName: ${displayName}\nEmail: ${user.email}\nDepartment: ${user.department || 'N/A'}\nResearch Area: ${scholar.researchArea || 'N/A'}\nGuide: ${scholar.guideName || 'N/A'}\nRegistration Date: ${scholar.registrationDate || 'N/A'}\nProgress: ${scholar.progress || 0}%\nPublications: ${scholar.publicationsCount || 0}\nWeekly Logs: ${scholar.weeklyLogsCount || 0}\n\nAchievements:\n${(scholar.achievements || []).map((a: string) => `- ${a}`).join('\n')}\n`;
    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${displayName.replace(/\s+/g, '_')}_CV.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('Resume downloaded.');
  };

  return (
    <div>
      <PageHeader title="My Profile" description="Your research scholar profile and progress." />

      {/* Profile header card */}
      <AnimatedCard>
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-blue-600" />
          <CardContent className="p-6 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="w-24 h-24 border-4 border-card rounded-2xl" key={avatarSeed}>
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <h2 className="font-display text-2xl font-bold">{displayName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isScholar && <StatusBadge status={scholar.status} />}
                  <Badge variant="secondary">{user.department || scholar.department}</Badge>
                  {isScholar && <Badge variant="outline">{scholar.researchArea}</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleUploadPhoto}><Upload className="w-4 h-4 mr-2" /> Upload Photo</Button>
                <Button variant="outline" onClick={handleDownloadResume}><Download className="w-4 h-4 mr-2" /> Resume</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Personal details */}
        <AnimatedCard delay={0.05}>
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: User, label: 'Full Name', value: displayName },
                { icon: Mail, label: 'Email', value: user.email },
                ...(isScholar ? [
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: GraduationCap, label: 'Guide', value: scholar.guideName },
                  { icon: Calendar, label: 'Registration', value: scholar.registrationDate },
                ] : []),
                { icon: MapPin, label: 'Department', value: user.department || scholar.department },
              ].map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{d.label}</div>
                      <div className="text-sm font-medium truncate">{d.value}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Progress */}
        <AnimatedCard delay={0.1} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Research Progress</CardTitle></CardHeader>
            <CardContent>
              {isScholar ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="font-display text-2xl font-bold text-primary">{scholar.progress}%</span>
                    </div>
                    <Progress value={scholar.progress} className="h-3" />
                  </div>

                  <h4 className="font-semibold text-sm mb-3">Milestones Timeline</h4>
                  <div className="space-y-3">
                    {(scholar.milestones || []).map((m: any, i: number) => (
                      <div key={m.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            m.status === 'completed' ? 'bg-emerald-500 text-white' :
                            m.status === 'in_progress' ? 'bg-blue-500 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {m.status === 'completed' ? '\u2713' : i + 1}
                          </div>
                          {i < (scholar.milestones?.length || 0) - 1 && (
                            <div className={`w-0.5 h-8 ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{m.title}</span>
                            <StatusBadge status={m.status} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {m.completedDate ? `Completed: ${m.completedDate}` : `Target: ${m.targetDate}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Research progress tracking is available for scholar accounts.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Stats and achievements */}
      {isScholar && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Weekly Logs', value: scholar.weeklyLogsCount || 0, icon: FileText, color: 'text-primary' },
              { label: 'Publications', value: scholar.publicationsCount || 0, icon: BookOpen, color: 'text-emerald-500' },
              { label: 'Progress', value: `${scholar.progress || 0}%`, icon: TrendingUp, color: 'text-blue-500' },
              { label: 'Achievements', value: (scholar.achievements || []).length, icon: Award, color: 'text-amber-500' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <AnimatedCard key={s.label} delay={0.15 + i * 0.05}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
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

          {/* Achievements */}
          <AnimatedCard delay={0.3} className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Achievements & Awards</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(scholar.achievements || []).map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3 bg-amber-500/5">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </>
      )}
    </div>
  );
}
