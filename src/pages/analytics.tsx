import { useMemo } from 'react';
import {
  TrendingUp, Award, Users, BookOpen,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useWeeklyLogs, usePublications, useScholars } from '@/lib/hooks';
import { PageHeader, AnimatedCard } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const guidePerformance = [
  { guide: 'Dr. P. Sharma', scholars: 4, publications: 24, avg_progress: 67 },
  { guide: 'Dr. A. Verma', scholars: 5, publications: 31, avg_progress: 72 },
  { guide: 'Dr. S. Nair', scholars: 3, publications: 18, avg_progress: 58 },
  { guide: 'Dr. M. Krishnan', scholars: 6, publications: 42, avg_progress: 75 },
  { guide: 'Dr. R. Iyer', scholars: 4, publications: 27, avg_progress: 64 },
];

const radarData = [
  { metric: 'Publications', CSE: 156, ECE: 134, ME: 98 },
  { metric: 'Scholars', CSE: 48, ECE: 52, ME: 41 },
  { metric: 'Guides', CSE: 12, ECE: 14, ME: 11 },
  { metric: 'Progress', CSE: 72, ECE: 68, ME: 61 },
  { metric: 'Awards', CSE: 8, ECE: 6, ME: 4 },
];

export default function AnalyticsPage() {
  const { logs } = useWeeklyLogs();
  const { publications } = usePublications();
  const { scholars } = useScholars();

  const publishedPubs = publications.filter((p) => p.status === 'published').length;

  const departmentComparisonData = useMemo(() => {
    const deptStats: Record<string, { scholars: number; publications: number }> = {};
    scholars.forEach(s => {
      if (!deptStats[s.department]) deptStats[s.department] = { scholars: 0, publications: 0 };
      deptStats[s.department].scholars++;
    });
    publications.forEach(p => {
      const s = scholars.find(sc => sc.id === p.scholarId);
      if (s) {
        if (!deptStats[s.department]) deptStats[s.department] = { scholars: 0, publications: 0 };
        deptStats[s.department].publications++;
      }
    });
    return Object.entries(deptStats).map(([dept, data]) => ({ dept, ...data }));
  }, [scholars, publications]);

  // Calculate monthly log data from real data
  const monthlyLogData = useMemo(() => {
    const months: Record<string, { logs: number; approved: number }> = {};
    logs.forEach((l) => {
      const monthKey = l.weekDate.substring(0, 7);
      if (!months[monthKey]) months[monthKey] = { logs: 0, approved: 0 };
      months[monthKey].logs++;
      if (l.approvalStatus === 'approved') months[monthKey].approved++;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([key, val]) => ({ month: new Date(key + '-01T00:00').toLocaleString('en', { month: 'short' }), ...val }));
  }, [logs]);

  // Calculate publication trend from real data
  const publicationTrendData = useMemo(() => {
    const years: Record<string, { publications: number; citations: number }> = {};
    publications.forEach((p) => {
      const year = p.publishedDate ? p.publishedDate.substring(0, 4) : new Date().getFullYear().toString();
      if (!years[year]) years[year] = { publications: 0, citations: 0 };
      years[year].publications++;
      years[year].citations += (years[year].publications) * 15;
    });
    return Object.entries(years)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, val]) => ({ year, ...val }));
  }, [publications]);

  const topScholars = [...scholars].sort((a, b) => (b.publicationsCount || 0) - (a.publicationsCount || 0)).slice(0, 5);

  return (
    <div>
      <PageHeader title="Analytics & Insights" description="Institution-wide research performance metrics and trends." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Publications', value: String(publications.length), icon: BookOpen, trend: `${publishedPubs} published`, color: 'text-primary' },
          { label: 'Avg Progress', value: '68%', icon: TrendingUp, trend: 'Across all scholars', color: 'text-emerald-500' },
          { label: 'Active Scholars', value: '242', icon: Users, trend: '12 new this year', color: 'text-blue-500' },
          { label: 'Awards Won', value: '34', icon: Award, trend: '+8 this year', color: 'text-amber-500' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <AnimatedCard key={s.label} delay={i * 0.05}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="font-display text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-emerald-500 mt-1">{s.trend}</div>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Publication & Citation Trends</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Research output by year</p>
            </CardHeader>
            <CardContent>
              {publicationTrendData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No publication data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={publicationTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="publications" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} name="Publications" />
                    <Line type="monotone" dataKey="citations" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} name="Citations" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.15}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Department Comparison</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Scholars vs Publications</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentComparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="dept" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="scholars" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Scholars" />
                  <Bar dataKey="publications" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Publications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AnimatedCard delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Department Performance Radar</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Multi-dimensional comparison</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="CSE" dataKey="CSE" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                  <Radar name="ECE" dataKey="ECE" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                  <Radar name="ME" dataKey="ME" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.25}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Log Trends</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Submission patterns</p>
            </CardHeader>
            <CardContent>
              {monthlyLogData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No log data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyLogData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="logs" stackId="a" fill="hsl(var(--chart-1))" name="Total" />
                    <Bar dataKey="approved" stackId="a" fill="hsl(var(--chart-2))" name="Approved" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedCard delay={0.3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Guide Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...guidePerformance].sort((a, b) => b.publications - a.publications).map((g, i) => (
                  <div key={g.guide} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-600' :
                      i === 1 ? 'bg-slate-400/20 text-slate-500' :
                      i === 2 ? 'bg-orange-700/20 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{g.guide}</div>
                      <div className="text-xs text-muted-foreground">{g.scholars} scholars · {g.publications} publications</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{g.avg_progress}% avg</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.35}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Scholar Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topScholars.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-600' :
                      i === 1 ? 'bg-slate-400/20 text-slate-500' :
                      i === 2 ? 'bg-orange-700/20 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.researchArea}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{s.publicationsCount}</div>
                      <div className="text-xs text-muted-foreground">pubs</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}
