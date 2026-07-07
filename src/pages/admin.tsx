import { useState, useEffect } from 'react';
import {
  Building2, Database, Activity, Plus, Search, MoreHorizontal, Download, Upload,
  ShieldCheck,
} from 'lucide-react';
import { useUsers } from '@/lib/hooks';
import { exportToCSV } from '@/lib/export-utils';
import { PageHeader, AnimatedCard } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const auditLogs = [
  { id: 1, user: 'Admin Office', action: 'Created announcement', target: 'Mid-Seminar Schedule', time: '2 hours ago', type: 'create' },
  { id: 2, user: 'Dr. Priya Sharma', action: 'Approved weekly log', target: 'John Doe - Week 26', time: '5 hours ago', type: 'approve' },
  { id: 3, user: 'Chairman', action: 'Generated report', target: 'Department Analytics Q2', time: '1 day ago', type: 'report' },
  { id: 4, user: 'Admin Office', action: 'Updated user role', target: 'Vikram Singh → Scholar', time: '2 days ago', type: 'update' },
  { id: 5, user: 'Dr. Priya Sharma', action: 'Rejected weekly log', target: 'Vikram Singh - Week 25', time: '3 days ago', type: 'reject' },
];

const logTypeColors: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-600',
  approve: 'bg-blue-500/10 text-blue-600',
  report: 'bg-amber-500/10 text-amber-600',
  update: 'bg-purple-500/10 text-purple-600',
  reject: 'bg-red-500/10 text-red-600',
};

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const { users, setUsers } = useUsers();

  // Compute departments from users
  const departmentsData = [
    { code: 'CSE', name: 'Computer Science and Engineering', hod: 'Dr. S. K. Singh' },
    { code: 'ECE', name: 'Electronics and Communication', hod: 'Dr. M. L. Sharma' },
    { code: 'ME', name: 'Mechanical Engineering', hod: 'Dr. R. K. Verma' },
    { code: 'EE', name: 'Electrical Engineering', hod: 'Dr. P. N. Rao' },
    { code: 'CE', name: 'Civil Engineering', hod: 'Dr. K. S. Reddy' },
    { code: 'CH', name: 'Chemical Engineering', hod: 'Dr. A. B. Ghosh' },
  ].map(d => {
    const dUsers = users.filter((u: any) => u.department === d.code);
    const scholarsCount = dUsers.filter((u: any) => u.role === 'scholar').length;
    const guidesCount = dUsers.filter((u: any) => u.role === 'guide').length;
    // We would ideally map publications to scholars to find dept publications, but this is an approximation for admin
    return { ...d, scholarsCount, guidesCount, publicationsCount: Math.floor(scholarsCount * 1.5) };
  });

  const [editUser, setEditUser] = useState<ManagedUser | null>(null);

  const filteredUsers = users.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleAddUser = (data: { name: string; email: string; role: string; department: string }) => {
    if (!data.name.trim() || !data.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setUsers((prev) => [...prev, { id: `u${Date.now()}`, ...data, status: 'active' }]);
    toast.success('User added successfully.');
    setAddUserOpen(false);
  };

  const handleEditUser = (data: { name: string; email: string; role: string; department: string }) => {
    if (!editUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...data } : u)));
    toast.success('User updated successfully.');
    setEditUser(null);
  };

  const handleResetPassword = (user: ManagedUser) => {
    toast.success(`Password reset link sent to ${user.email}.`);
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.users && Array.isArray(data.users)) {
            setUsers(data.users);
            toast.success('Database restored successfully.');
          } else {
            toast.error('Invalid backup file format.');
          }
        } catch {
          toast.error('Failed to parse backup file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDeactivate = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'inactive' } : u)));
    toast.success('User deactivated.');
  };

  const handleExportUsers = () => {
    exportToCSV('users.csv', ['Name', 'Email', 'Role', 'Department', 'Status'],
      filteredUsers.map((u) => [u.name, u.email, u.role, u.department, u.status]));
    toast.success('Exported to CSV.');
  };

  const handleBackup = () => {
    const data = { users, departments: departmentsData, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rsms-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Database backup downloaded.');
  };

  return (
    <div>
      <PageHeader title="Admin Panel" description="Manage users, departments, and system configuration." />

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">User Management</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
                </div>
                <Button variant="outline" size="sm" onClick={handleExportUsers}><Download className="w-4 h-4 mr-1" /> Export</Button>
                <Button size="sm" onClick={() => setAddUserOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{u.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback></Avatar>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">{u.role}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{u.department}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{u.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditUser(u)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(u)}>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeactivate(u.id)}>Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentsData.map((d, i) => (
              <AnimatedCard key={d.code} delay={i * 0.05}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary">{d.code}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug">{d.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">HoD: {d.hod}</p>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
                      <div><div className="font-display text-lg font-bold">{d.scholarsCount}</div><div className="text-xs text-muted-foreground">Scholars</div></div>
                      <div><div className="font-display text-lg font-bold">{d.guidesCount}</div><div className="text-xs text-muted-foreground">Guides</div></div>
                      <div><div className="font-display text-lg font-bold">{d.publicationsCount}</div><div className="text-xs text-muted-foreground">Pubs</div></div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle className="text-base">Audit Logs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${logTypeColors[log.type]}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm"><span className="font-medium">{log.user}</span> <span className="text-muted-foreground">{log.action}</span> <span className="font-medium">{log.target}</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">{log.time}</div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{log.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Database Management</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Database className="w-5 h-5 text-primary" /></div>
                    <div><div className="text-sm font-medium">Backup Database</div><div className="text-xs text-muted-foreground">Download a JSON snapshot</div></div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleBackup}><Download className="w-4 h-4 mr-1" /> Backup</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Upload className="w-5 h-5 text-amber-500" /></div>
                    <div><div className="text-sm font-medium">Restore Database</div><div className="text-xs text-muted-foreground">From a previous backup</div></div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRestore}><Upload className="w-4 h-4 mr-1" /> Restore</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">System Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'API Server', status: 'Operational', color: 'text-emerald-500' },
                  { label: 'Database', status: 'Operational', color: 'text-emerald-500' },
                  { label: 'Storage (S3)', status: 'Operational', color: 'text-emerald-500' },
                  { label: 'Email Service', status: 'Operational', color: 'text-emerald-500' },
                  { label: 'Notification Service', status: 'Degraded', color: 'text-amber-500' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className={`text-sm ${s.color} flex items-center gap-1.5`}>
                      <span className="w-2 h-2 rounded-full bg-current" /> {s.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} onSubmit={handleAddUser} />
      <EditUserDialog user={editUser} onClose={() => setEditUser(null)} onSubmit={handleEditUser} />
    </div>
  );
}

function AddUserDialog({
  open, onOpenChange, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: { name: string; email: string; role: string; department: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Scholar');
  const [department, setDepartment] = useState('CSE');

  const submit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    onSubmit({ name, email, role, department });
    setName(''); setEmail(''); setRole('Scholar'); setDepartment('CSE');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Full Name <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@institution.edu" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scholar">Scholar</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Chairman">Chairman</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="ME">ME</SelectItem>
                  <SelectItem value="EE">EE</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="CH">CH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}><ShieldCheck className="w-4 h-4 mr-2" /> Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ user, onClose, onSubmit }: {
  user: ManagedUser | null;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; role: string; department: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Scholar');
  const [department, setDepartment] = useState('CSE');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setDepartment(user.department);
    }
  }, [user]);

  if (!user) return null;

  const submit = () => {
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name, email, role, department });
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information and role.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scholar">Scholar</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Chairman">Chairman</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="ME">ME</SelectItem>
                  <SelectItem value="EE">EE</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="CH">CH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}><ShieldCheck className="w-4 h-4 mr-2" /> Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
