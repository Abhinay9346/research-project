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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/weekly-logs" element={<WeeklyLogsPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/scholars" element={<ScholarsPage />} />
        <Route path="/committee" element={<CommitteePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/scholar-monitoring" element={<ScholarMonitoringPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
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
