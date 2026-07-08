import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Printer, Users, AlertTriangle,
  Clock, TrendingUp, Building2, ChevronUp, ChevronDown, Eye,
} from 'lucide-react';
import { useWeeklyLogs, usePublications, useMeetings, useScholars } from '@/lib/hooks';
import { useResearchProjects, useGuideExplanations, useChairmanReviews } from '@/lib/monitoring-hooks';
import { exportToCSV } from '@/lib/export-utils';
import { PageHeader, StatusBadge, AnimatedCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScholarMonitoringDrawer } from '@/components/scholar-monitoring-drawer';
import { cn } from '@/lib/utils';
import type { Scholar } from '@/lib/types';
import { toast } from 'sonner';

type SortField = 'name' | 'registrationDate' | 'yearsRegistered' | 'publicationsCount' | 'department' | 'guideName';
type SortDir = 'asc' | 'desc';

const OVERDUE_LIMIT = 4;

function yearsSince(dateStr: string): number {
  const reg = new Date(dateStr);
  const now = new Date();
  const years = (now.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(years * 10) / 10;
}

function expectedCompletionYearFallback(dateStr: string): string {
  const reg = new Date(dateStr);
  reg.setFullYear(reg.getFullYear() + 5);
  return reg.getFullYear().toString();
}

export default function ScholarMonitoringPage() {
  const { logs } = useWeeklyLogs();
  const { publications } = usePublications();
  const { meetings } = useMeetings();
  const { projects } = useResearchProjects();
  const { explanations } = useGuideExplanations();
  const { reviews } = useChairmanReviews();
  const { scholars, loading } = useScholars();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [guideFilter, setGuideFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);

  // Build enriched scholar data with computed fields
  const enrichedScholars = useMemo(() => {
    return scholars.map((s) => {
      const currentYear = new Date().getFullYear();
      const years = s.admissionYear
        ? currentYear - s.admissionYear
        : yearsSince(s.registrationDate);
        
      const isOverdue = years >= OVERDUE_LIMIT && s.status !== 'completed';
      
      const expectedYear = s.admissionYear 
        ? (s.admissionYear + 5).toString() 
        : expectedCompletionYearFallback(s.registrationDate);
        
      const scholarLogs = logs.filter((l) => l.scholarId === s.id);
      const pendingLogs = scholarLogs.filter((l) => l.approvalStatus === 'pending').length;
      const scholarPubs = publications.filter((p) => p.scholarId === s.id);
      const scholarMeetings = meetings.filter((m) => m.scholarId === s.id);
      const hasGuideExplanation = explanations.some((e) => e.scholarId === s.id);
      const hasChairmanReview = reviews.some((r) => r.scholarId === s.id);
      const hasResearchProject = projects.some((p) => p.scholarId === s.id);
      return {
        ...s,
        yearsRegistered: years,
        isOverdue,
        expectedYear,
        weeklyLogStatus: pendingLogs > 0 ? `${pendingLogs} pending` : 'Up to date',
        publicationsCount: scholarPubs.length || s.publicationsCount,
        dcMeetingsCount: scholarMeetings.length,
        hasGuideExplanation,
        hasChairmanReview,
        hasResearchProject,
      };
    });
  }, [scholars, logs, publications, meetings, explanations, reviews, projects]);

  // Get unique guides and departments for filter dropdowns
  const guides = useMemo(() => Array.from(new Set(scholars.map((s: any) => s.guideName as string))), [scholars]);
  const departments = useMemo(() => Array.from(new Set(scholars.map((s: any) => s.department as string))), [scholars]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = enrichedScholars;
    if (deptFilter !== 'all') result = result.filter((s) => s.department === deptFilter);
    if (guideFilter !== 'all') result = result.filter((s) => s.guideName === guideFilter);
    if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter);
    if (overdueOnly) result = result.filter((s) => s.isOverdue);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => {
        return (
          (s.name || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.researchArea || '').toLowerCase().includes(q) ||
          (s.guideName || '').toLowerCase().includes(q) ||
          (s.department || '').toLowerCase().includes(q) ||
          (s.id || '').toLowerCase().includes(q)
        );
      });
    }
    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'registrationDate') cmp = a.registrationDate.localeCompare(b.registrationDate);
      else if (sortField === 'yearsRegistered') cmp = a.yearsRegistered - b.yearsRegistered;
      else if (sortField === 'publicationsCount') cmp = a.publicationsCount - b.publicationsCount;
      else if (sortField === 'department') cmp = a.department.localeCompare(b.department);
      else if (sortField === 'guideName') cmp = a.guideName.localeCompare(b.guideName);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [enrichedScholars, deptFilter, guideFilter, statusFilter, overdueOnly, search, sortField, sortDir]);

  // Analytics
  const totalScholars = enrichedScholars.length;
  const overdueScholars = enrichedScholars.filter((s) => s.isOverdue);
  const overdueCount = overdueScholars.length;
  const avgCompletion = totalScholars > 0
    ? Math.round((enrichedScholars.reduce((sum, s) => sum + (s.progress || 0), 0) / totalScholars) * 10) / 10
    : 0;
  const avgYears = totalScholars > 0
    ? Math.round((enrichedScholars.reduce((sum, s) => sum + (s.yearsRegistered || 0), 0) / totalScholars) * 10) / 10
    : 0;

  // Department-wise overdue count
  const deptOverdue = useMemo(() => {
    const counts: Record<string, number> = {};
    overdueScholars.forEach((s) => {
      counts[s.department] = (counts[s.department] || 0) + 1;
    });
    return counts;
  }, [overdueScholars]);

  // Guide-wise overdue count
  const guideOverdue = useMemo(() => {
    const counts: Record<string, number> = {};
    overdueScholars.forEach((s) => {
      counts[s.guideName] = (counts[s.guideName] || 0) + 1;
    });
    return counts;
  }, [overdueScholars]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    exportToCSV('scholar-monitoring-report.csv',
      ['Name', 'Scholar ID', 'Department', 'Guide', 'Research Area', 'Registration Date', 'Years Registered', 'Status', 'Weekly Log Status', 'Publications', 'DC Meetings', 'Expected Completion', 'Overdue'],
      filtered.map((s) => [s.name, s.id, s.department, s.guideName, s.researchArea, s.registrationDate, s.yearsRegistered, s.status, s.weeklyLogStatus, s.publicationsCount, s.dcMeetingsCount, s.expectedYear, s.isOverdue ? 'Yes' : 'No'])
    );
    toast.success('Report exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {label}
      {sortField === field && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Scholar Monitoring"
        description="Monitor all registered scholars across departments. Track overdue researchers and review progress."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
            <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
          </div>
        }
      />

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <AnimatedCard>
          <Card className="mb-4 border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {overdueCount} {overdueCount === 1 ? 'scholar has' : 'scholars have'} exceeded the expected research duration.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review guide explanations and submit chairman reviews for overdue scholars.
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto text-red-600 border-red-500/30" onClick={() => setOverdueOnly(true)}>
                View Overdue
              </Button>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {/* Analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Scholars', value: String(totalScholars), icon: Users, color: 'text-primary' },
          { label: 'Overdue Scholars', value: String(overdueCount), icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Avg Completion', value: `${avgCompletion}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Avg Duration', value: `${avgYears}y`, icon: Clock, color: 'text-blue-500' },
          { label: 'Depts w/ Overdue', value: String(Object.keys(deptOverdue).length), icon: Building2, color: 'text-amber-500' },
          { label: 'Guides w/ Overdue', value: String(Object.keys(guideOverdue).length), icon: Users, color: 'text-purple-500' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <AnimatedCard key={s.label} delay={i * 0.04}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg bg-muted flex items-center justify-center', s.color)}>
                      <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
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

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search across all fields..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full lg:w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={guideFilter} onValueChange={setGuideFilter}>
              <SelectTrigger className="w-full lg:w-44"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Guide" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guides</SelectItem>
                {guides.map((g: string) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-36"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={overdueOnly ? 'default' : 'outline'}
              onClick={() => setOverdueOnly(!overdueOnly)}
              className="shrink-0"
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Overdue Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl animate-shimmer" />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead><SortHeader field="name" label="Scholar Name" /></TableHead>
                  <TableHead>Scholar ID</TableHead>
                  <TableHead><SortHeader field="department" label="Dept" /></TableHead>
                  <TableHead><SortHeader field="guideName" label="Guide" /></TableHead>
                  <TableHead>Research Area</TableHead>
                  <TableHead><SortHeader field="registrationDate" label="Reg. Date" /></TableHead>
                  <TableHead><SortHeader field="yearsRegistered" label="Years" /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Weekly Log</TableHead>
                  <TableHead><SortHeader field="publicationsCount" label="Pubs" /></TableHead>
                  <TableHead>DC Mtgs</TableHead>
                  <TableHead>Expected Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
                      No scholars match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((s: any) => (
                  <TableRow
                    key={s.id}
                    className={cn(s.isOverdue && 'bg-red-500/5 hover:bg-red-500/10')}
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{s.id}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell className="text-muted-foreground">{s.guideName}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-muted-foreground" title={s.researchArea}>{s.researchArea}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.registrationDate}</TableCell>
                    <TableCell>
                      <span className={cn('font-medium', s.isOverdue && 'text-red-600 dark:text-red-400')}>
                        {s.yearsRegistered}y
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.weeklyLogStatus}</TableCell>
                    <TableCell className="font-medium">{s.publicationsCount}</TableCell>
                    <TableCell className="text-center">{s.dcMeetingsCount}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.expectedYear}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.isOverdue && (
                          <Badge variant="outline" className="text-xs border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 mr-1">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedScholar(s)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedScholar && (
          <ScholarMonitoringDrawer
            scholar={selectedScholar}
            onClose={() => setSelectedScholar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
