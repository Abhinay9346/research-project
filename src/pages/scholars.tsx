import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, Award, BookOpen, FileText, Download } from 'lucide-react';
import { useScholars } from '@/lib/hooks';
import { exportToCSV } from '@/lib/export-utils';
import { PageHeader, StatusBadge, AnimatedCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Scholar } from '@/lib/types';

export default function ScholarsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selected, setSelected] = useState<Scholar | null>(null);

  const { scholars } = useScholars();

  const filtered = useMemo(() => {
    if (!search) return scholars;
    const q = search.toLowerCase();
    return scholars.filter((s) => s.name.toLowerCase().includes(q) || s.researchArea?.toLowerCase().includes(q));
  }, [search, scholars]);

  return (
    <div>
      <PageHeader title="Research Scholars" description="View scholar profiles, progress, and research details." action={
        <Button variant="outline" onClick={() => {
          exportToCSV('scholars.csv', ['Name', 'Email', 'Department', 'Guide', 'Research Area', 'Status', 'Progress', 'Publications', 'Weekly Logs'],
            filtered.map((s) => [s.name, s.email, s.department, s.guideName, s.researchArea, s.status, s.progress, s.publicationsCount, s.weeklyLogsCount]));
          toast.success('Exported to CSV.');
        }}><Download className="w-4 h-4 mr-2" /> Export</Button>
      } />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or research area..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((scholar, i) => (
          <AnimatedCard key={scholar.id} delay={i * 0.05}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(scholar)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {scholar.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{scholar.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{scholar.email}</p>
                    <div className="mt-1"><StatusBadge status={scholar.status} /></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-3.5 h-3.5" /> <span className="truncate">{scholar.researchArea}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" /> {scholar.guideName}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Research Progress</span>
                    <span className="font-semibold">{scholar.progress}%</span>
                  </div>
                  <Progress value={scholar.progress} className="h-2" />
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {scholar.weeklyLogsCount} logs</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {scholar.publicationsCount} pubs</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Scholar Profile</DialogTitle>
                <DialogDescription>Detailed research progress and milestones</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {selected.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selected.status} />
                      <Badge variant="secondary" className="text-xs">{selected.department}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-xs text-muted-foreground">Research Area</div>
                    <div className="text-sm font-medium mt-1">{selected.researchArea}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-xs text-muted-foreground">Guide</div>
                    <div className="text-sm font-medium mt-1">{selected.guideName}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-xs text-muted-foreground">Registration Date</div>
                    <div className="text-sm font-medium mt-1">{selected.registrationDate}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-xs text-muted-foreground">Progress</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selected.progress} className="h-2 flex-1" />
                      <span className="text-sm font-semibold">{selected.progress}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">Milestones</h4>
                  <div className="space-y-2">
                    {selected.milestones?.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                        <div className={`w-2 h-2 rounded-full ${
                          m.status === 'completed' ? 'bg-emerald-500' :
                          m.status === 'in_progress' ? 'bg-blue-500' :
                          m.status === 'overdue' ? 'bg-red-500' : 'bg-muted-foreground/30'
                        }`} />
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
                  <h4 className="font-semibold text-sm mb-3">Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.achievements?.map((a, i) => (
                      <Badge key={i} variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Award className="w-3 h-3 mr-1" /> {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
