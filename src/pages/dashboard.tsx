import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, BookOpen, TrendingUp, Clock,
  AlertCircle, CalendarDays, Award, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { useWeeklyLogs, usePublications, useMeetings, useScholars, useStats } from '@/lib/hooks';
import { PageHeader, AnimatedCard, StatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logs } = useWeeklyLogs();
  const { publications } = usePublications();
  const { meetings } = useMeetings();
  const { scholars } = useScholars();
  const { stats: dashboardStats } = useStats();

  const isChairman = user?.role === 'chairman';
  const isGuide = user?.role === 'guide';
  const isScholar = user?.role === 'scholar';
  const isAdmin = user?.role === 'admin';

  const pendingLogs = useMemo(() => logs.filter((l) => l.approvalStatus === 'pending'), [logs]);
  const upcomingMeetings = useMemo(() => meetings.filter((m) => m.status === 'scheduled').slice(0, 4), [meetings]);
  const recentLogs = useMemo(() => logs.slice(0, 5), [logs]);

  // Calculate real stats from data
  const myLogs = useMemo(() => logs.filter((l) => l.scholarId === user?.scholarId || l.scholarId === user?.id), [logs, user]);
  const myPubs = useMemo(() => publications.filter((p) => p.scholarId === user?.scholarId || p.scholarId === user?.id), [publications, user]);
  const publishedPubs = publications.filter((p) => p.status === 'published').length;

  // Calculate overdue scholars (registered > 4 years ago)
  const overdueScholars = useMemo(() => {
    const now = new Date();
    return scholars.filter((s) => {
      const reg = new Date(s.registrationDate);
      return (now.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24 * 365.25) >= 4;
    });
  }, [scholars]);
  const overdueCount = overdueScholars.length;

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

  // Calculate monthly log activity from real data
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

  // Calculate indexing distribution from real data
  const indexingDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    publications.forEach((p) => {
      (p.indexing || []).forEach((idx) => {
        counts[idx] = (counts[idx] || 0) + 1;
      });
    });
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [publications]);

  const stats = isScholar
    ? [
        { label: 'Research Progress', value: '62%', icon: TrendingUp, trend: 'On track', trendUp: true, color: 'text-primary' },
        { label: 'Weekly Logs', value: String(myLogs.length), icon: FileText, trend: `${myLogs.filter((l) => l.approvalStatus === 'pending').length} pending`, trendUp: true, color: 'text-emerald-500' },
        { label: 'Publications', value: String(myPubs.length), icon: BookOpen, trend: `${myPubs.filter((p) => p.status === 'under_review').length} under review`, trendUp: true, color: 'text-amber-500' },
        { label: 'Next Milestone', value: 'Mar 2025', icon: Clock, trend: 'Mid-Seminar', trendUp: false, color: 'text-blue-500' },
      ]
    : isGuide
    ? [
        { label: 'Assigned Scholars', value: '4', icon: Users, trend: 'All active', trendUp: true, color: 'text-primary' },
        { label: 'Pending Reviews', value: String(pendingLogs.length), icon: FileText, trend: pendingLogs.length > 0 ? 'Needs attention' : 'All caught up', trendUp: pendingLogs.length === 0, color: 'text-amber-500' },
        { label: 'Publications', value: String(publications.length), icon: BookOpen, trend: `${publishedPubs} published`, trendUp: true, color: 'text-emerald-500' },
        { label: 'Upcoming Meetings', value: String(upcomingMeetings.length), icon: CalendarDays, trend: 'This month', trendUp: true, color: 'text-blue-500' },
      ]
    : [
        { label: 'Total Scholars', value: dashboardStats ? String(dashboardStats.totalScholars) : '...', icon: Users, trend: 'Across departments', trendUp: true, color: 'text-primary' },
        { label: 'Active Guides', value: dashboardStats ? String(dashboardStats.totalGuides) : '...', icon: Award, trend: 'Active guides', trendUp: true, color: 'text-emerald-500' },
        { label: 'Publications', value: dashboardStats ? String(dashboardStats.totalPublications) : '...', icon: BookOpen, trend: dashboardStats ? `${dashboardStats.publishedPublications} published` : '...', trendUp: true, color: 'text-amber-500' },
        { label: 'Pending Approvals', value: dashboardStats ? String(dashboardStats.pendingWeeklyLogs) : '...', icon: AlertCircle, trend: (dashboardStats?.pendingWeeklyLogs > 0) ? 'Action needed' : 'All clear', trendUp: (dashboardStats?.pendingWeeklyLogs === 0), color: 'text-red-500' },
      ];

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ').slice(-1)[0]}`}
        description={
          isScholar
            ? "Here's your research progress overview."
            : isGuide
            ? "Monitor your scholars' research progress and pending reviews."
            : isAdmin
            ? 'System overview and administrative controls.'
            : 'Institution-wide research analytics and department performance.'
        }
        action={
          <Button onClick={() => navigate('/weekly-logs')}>
            <FileText className="w-4 h-4 mr-2" />
            {isScholar ? 'Submit Weekly Log' : 'View Pending Logs'}
          </Button>
        }
      />

      {/* Overdue alert for chairman */}
      {isChairman && overdueCount > 0 && (
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
                  Review guide explanations and submit chairman reviews in Scholar Monitoring.
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto text-red-600 border-red-500/30" onClick={() => navigate('/scholar-monitoring')}>
                View Monitoring
              </Button>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard key={stat.label} delay={i * 0.05}>
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-muted', stat.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={cn('flex items-center gap-1 text-xs font-medium', stat.trendUp ? 'text-emerald-500' : 'text-muted-foreground')}>
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <AnimatedCard delay={0.1} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Weekly Log Activity</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Submission and approval trends</p>
              </div>
              <Badge variant="secondary" className="text-xs">{logs.length} total</Badge>
            </CardHeader>
            <CardContent>
              {monthlyLogData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No log data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyLogData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="logs" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#colorLogs)" name="Total Logs" />
                    <Area type="monotone" dataKey="approved" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#colorApproved)" name="Approved" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.15}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Publication Indexing</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Distribution by index</p>
            </CardHeader>
            <CardContent>
              {indexingDistribution.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No publications yet.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={indexingDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {indexingDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {indexingDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnimatedCard delay={0.2} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Recent Weekly Logs</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/weekly-logs')}>
                View all <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No logs submitted yet.</p>
                )}
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/weekly-logs')}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{log.scholarName}</span>
                        <StatusBadge status={log.approvalStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{log.researchWork}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{log.weekDate}</span>
                        <span>{log.hoursWorked}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.25}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMeetings.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No meetings scheduled.</p>
                )}
                {upcomingMeetings.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer" onClick={() => navigate('/committee')}>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {new Date(m.date).getDate()}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase">
                        {new Date(m.date).toLocaleString('en', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.scholarName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {(isChairman || isGuide || isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <AnimatedCard delay={0.3}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Department Comparison</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Scholars vs Publications by department</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
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

          <AnimatedCard delay={0.35}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Scholar Progress</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Research completion status</p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[260px] pr-4">
                  <div className="space-y-4">
                    {scholars.slice(0, 8).map((s) => (
                      <div key={s.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{s.name}</span>
                            <StatusBadge status={s.status} />
                          </div>
                          <span className="text-sm font-semibold">{s.progress}%</span>
                        </div>
                        <Progress value={s.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">{s.researchArea}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
}
