import { useState, useEffect } from 'react';
import { User, Lock, Palette, Bell, Globe, Moon, Sun, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { PageHeader, AnimatedCard } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PROFILE_KEY = 'rsms_profile';
const NOTIF_KEY = 'rsms_notif_prefs';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifPrefs, setNotifPrefs] = useState({
    email: true, push: true, weeklyLog: true, meetings: true, publications: false, deadlines: true,
  });
  const [securitySettings, setSecuritySettings] = useState(() => {
    const stored = localStorage.getItem('rsms_security');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { '2fa': false, loginNotif: true, sessionTimeout: true };
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('rsms_language') || 'en');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('rsms_timezone') || 'ist');

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setName(p.name || user?.name || '');
        setEmail(p.email || user?.email || '');
        setDepartment(p.department || user?.department || '');
      } catch { /* ignore */ }
    }
    const storedNotif = localStorage.getItem(NOTIF_KEY);
    if (storedNotif) {
      try { setNotifPrefs(JSON.parse(storedNotif)); } catch { /* ignore */ }
    }
  }, [user]);

  if (!user) return null;
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, email, department }));
    toast.success('Profile updated successfully.');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error('Password must contain uppercase, lowercase, and a number.');
      return;
    }
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    toast.success('Password updated successfully.');
  };

  const handleSaveNotifs = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifPrefs));
    toast.success('Notification preferences saved.');
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account preferences and configuration." />

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" /> Security</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" /> Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AnimatedCard>
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 rounded-2xl">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" onClick={() => toast.info('Avatar upload would open a file picker.')}>Change Avatar</Button>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="security">
          <AnimatedCard>
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, and a number.
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.05} className="mt-4">
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-base">Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', key: '2fa' },
                  { label: 'Login Notifications', desc: 'Get notified of new sign-ins', key: 'loginNotif' },
                  { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', key: 'sessionTimeout' },
                ].map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                    <Switch
                      checked={securitySettings[s.key as keyof typeof securitySettings]}
                      onCheckedChange={(v) => {
                        setSecuritySettings((prev: Record<string, boolean>) => {
                          const updated = { ...prev, [s.key]: v };
                          localStorage.setItem('rsms_security', JSON.stringify(updated));
                          return updated;
                        });
                        toast.success(`${s.label} ${v ? 'enabled' : 'disabled'}.`);
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="appearance">
          <AnimatedCard>
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTheme(t); toast.success(`Switched to ${t} mode.`); }}
                      className={cn(
                        'relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                        theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}
                    >
                      {theme === t && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className={cn('w-16 h-12 rounded-lg border-2', t === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700')}>
                        <div className={cn('m-1.5 h-2 w-8 rounded', t === 'light' ? 'bg-gray-300' : 'bg-slate-600')} />
                        <div className={cn('m-1.5 h-2 w-12 rounded', t === 'light' ? 'bg-gray-200' : 'bg-slate-700')} />
                      </div>
                      <div className="flex items-center gap-2">
                        {t === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span className="font-medium capitalize">{t} Mode</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.05} className="mt-4">
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-base">Language & Region</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4" /> Language</div>
                    <div className="text-xs text-muted-foreground">Display language preference</div>
                  </div>
                  <select value={language} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" onChange={(e) => { setLanguage(e.target.value); localStorage.setItem('rsms_language', e.target.value); toast.success(`Language set to ${e.target.value}.`); }}>
                    <option>English</option>
                    <option>हिन्दी</option>
                    <option>தமிழ்</option>
                    <option>తెలుగు</option>
                  </select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Timezone</div>
                    <div className="text-xs text-muted-foreground">IST (UTC+5:30)</div>
                  </div>
                  <select value={timezone} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" onChange={(e) => { setTimezone(e.target.value); localStorage.setItem('rsms_timezone', e.target.value); toast.success(`Timezone set to ${e.target.value}.`); }}>
                    <option>IST (UTC+5:30)</option>
                    <option>UTC</option>
                    <option>EST (UTC-5)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="notifications">
          <AnimatedCard>
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'weeklyLog', label: 'Weekly Log Reminders', desc: 'Reminders to submit weekly logs' },
                  { key: 'meetings', label: 'Meeting Reminders', desc: 'Upcoming committee meeting alerts' },
                  { key: 'publications', label: 'Publication Updates', desc: 'Notifications about publication status' },
                  { key: 'deadlines', label: 'Deadline Alerts', desc: 'Important deadline reminders' },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-xs text-muted-foreground">{n.desc}</div>
                    </div>
                    <Switch
                      checked={notifPrefs[n.key as keyof typeof notifPrefs]}
                      onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [n.key]: v }))}
                    />
                  </div>
                ))}
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifs}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
