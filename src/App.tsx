import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from 'sonner';
import { AppShell } from '@/components/app-shell';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import WeeklyLogsPage from '@/pages/weekly-logs';
import PublicationsPage from '@/pages/publications';
import ScholarsPage from '@/pages/scholars';
import CommitteePage from '@/pages/committee';
import AnalyticsPage from '@/pages/analytics';
import AnnouncementsPage from '@/pages/announcements';
import AdminPage from '@/pages/admin';
import ProfilePage from '@/pages/profile';
import SettingsPage from '@/pages/settings';
import ScholarMonitoringPage from '@/pages/scholar-monitoring';
import { navItems } from '@/lib/navigation';
import { useLocation } from 'react-router-dom';

function RoleProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return <Navigate to="/" replace />;
  
  const currentNav = navItems.find(n => n.path === location.pathname);
  if (currentNav && !currentNav.roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function ProtectedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<RoleProtectedRoute><DashboardPage /></RoleProtectedRoute>} />
        <Route path="/weekly-logs" element={<RoleProtectedRoute><WeeklyLogsPage /></RoleProtectedRoute>} />
        <Route path="/publications" element={<RoleProtectedRoute><PublicationsPage /></RoleProtectedRoute>} />
        <Route path="/scholars" element={<RoleProtectedRoute><ScholarsPage /></RoleProtectedRoute>} />
        <Route path="/committee" element={<RoleProtectedRoute><CommitteePage /></RoleProtectedRoute>} />
        <Route path="/analytics" element={<RoleProtectedRoute><AnalyticsPage /></RoleProtectedRoute>} />
        <Route path="/announcements" element={<RoleProtectedRoute><AnnouncementsPage /></RoleProtectedRoute>} />
        <Route path="/admin" element={<RoleProtectedRoute><AdminPage /></RoleProtectedRoute>} />
        <Route path="/scholar-monitoring" element={<RoleProtectedRoute><ScholarMonitoringPage /></RoleProtectedRoute>} />
        <Route path="/profile" element={<RoleProtectedRoute><ProfilePage /></RoleProtectedRoute>} />
        <Route path="/settings" element={<RoleProtectedRoute><SettingsPage /></RoleProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <ProtectedApp />
          <Toaster position="top-right" richColors closeButton />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
