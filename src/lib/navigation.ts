import type { Role } from './types';
import {
  LayoutDashboard, Users, FileText, BookOpen, CalendarDays,
  BarChart3, Settings, GraduationCap, ShieldCheck, Megaphone, ClipboardList,
  MonitorCheck,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  roles: Role[];
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['chairman', 'guide', 'scholar', 'admin'] },
  { label: 'Scholars', icon: Users, path: '/scholars', roles: ['chairman', 'guide', 'admin'] },
  { label: 'Weekly Logs', icon: FileText, path: '/weekly-logs', roles: ['chairman', 'guide', 'scholar', 'admin'], badge: 'pending' },
  { label: 'Publications', icon: BookOpen, path: '/publications', roles: ['chairman', 'guide', 'scholar', 'admin'] },
  { label: 'Committee', icon: CalendarDays, path: '/committee', roles: ['chairman', 'guide', 'scholar'] },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['chairman', 'guide', 'admin'] },
  { label: 'Scholar Monitoring', icon: MonitorCheck, path: '/scholar-monitoring', roles: ['chairman'] },
  { label: 'Announcements', icon: Megaphone, path: '/announcements', roles: ['chairman', 'admin'] },
  { label: 'Admin Panel', icon: ShieldCheck, path: '/admin', roles: ['admin', 'chairman'] },
  { label: 'My Profile', icon: ClipboardList, path: '/profile', roles: ['scholar'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['chairman', 'guide', 'scholar', 'admin'] },
];

export const roleLabels: Record<Role, string> = {
  chairman: 'Chairman',
  guide: 'Research Guide',
  scholar: 'Research Scholar',
  admin: 'Administrator',
};

export const roleColors: Record<Role, string> = {
  chairman: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  guide: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  scholar: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  admin: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

export const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  revision: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  submitted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  on_leave: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-muted text-muted-foreground border-border',
  under_review: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  accepted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  scheduled: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  overdue: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export const GradCap = GraduationCap;
