import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, ArrowRight, Shield, Users, BookOpen, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import api from '@/lib/api';

const roleOptions: { value: Role; label: string; icon: typeof Shield; desc: string }[] = [
  { value: 'chairman', label: 'Chairman', icon: Shield, desc: 'Institution oversight' },
  { value: 'guide', label: 'Guide', icon: Users, desc: 'Mentor scholars' },
  { value: 'scholar', label: 'Scholar', icon: BookOpen, desc: 'Research candidate' },
  { value: 'admin', label: 'Admin', icon: Award, desc: 'System management' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem('rsms_remember_email') || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('scholar');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalScholars: string | number;
    totalPublications: string | number;
    totalGuides: string | number;
    departments: string | number;
  }>({
    totalScholars: '--',
    totalPublications: '--',
    totalGuides: '--',
    departments: '--'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        const res = response as any;
        
        if (res?.success) {
          setStats({
            totalScholars: res.data.totalScholars ?? 0,
            totalPublications: res.data.totalPublications ?? 0,
            totalGuides: res.data.totalGuides ?? 0,
            departments: res.data.departments ?? 0
          });
        } else {
          setStats({ totalScholars: 0, totalPublications: 0, totalGuides: 0, departments: 0 });
        }
      } catch (err) {
        setStats({ totalScholars: 0, totalPublications: 0, totalGuides: 0, departments: 0 });
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (remember) {
      localStorage.setItem('rsms_remember_email', email);
    } else {
      localStorage.removeItem('rsms_remember_email');
    }
    const ok = await login(email, password, role);
    if (!ok) {
      toast.error('Login failed. Please check your credentials.');
    } else {
      toast.success('Welcome back!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">RSMS</h1>
              <p className="text-sm text-white/70">Research Scholar Management</p>
            </div>
          </div>

          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl font-bold leading-tight"
            >
              Advancing Research,<br />Empowering Scholars
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-white/80 max-w-md"
            >
              A comprehensive platform for managing doctoral research programs — from weekly logs to publications, committee meetings, and institutional analytics.
            </motion.p>
            <div className="grid grid-cols-2 gap-4 max-w-md pt-4">
              {[
                { label: 'Active Scholars', value: stats.totalScholars },
                { label: 'Publications', value: stats.totalPublications },
                { label: 'Research Guides', value: stats.totalGuides },
                { label: 'Departments', value: stats.departments },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="rounded-xl bg-white/10 backdrop-blur p-4"
                >
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/60">© 2026 Research Scholar Management System. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">RSMS</span>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2">Sign in to your account</h2>
          <p className="text-muted-foreground mb-8">Select your role and enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="mb-3 block text-sm font-medium">Select Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline" onClick={() => toast.info('Password reset instructions would be sent to your email.')}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Keep me signed in on this device
              </Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          
        </motion.div>
      </div>
    </div>
  );
}
