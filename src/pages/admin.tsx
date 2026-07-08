import { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, MoreHorizontal, Download,
  ShieldCheck, Users,
} from 'lucide-react';
import { useUsers, useStats } from '@/lib/hooks';
import { exportToCSV } from '@/lib/export-utils';
import { PageHeader, AnimatedCard, EmptyState } from '@/components/common';
import api from '@/lib/api';
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

export const DEPARTMENTS = [
  "Artificial Intelligence",
  "Computer Science",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical"
];
interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  guide_id?: string;
  guide_name?: string;
  status: string;
}

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const { users, setUsers, loading } = useUsers();
  const { stats: dashboardStats } = useStats();

  const departmentsData = dashboardStats?.departmentStats || [];

  const [editUser, setEditUser] = useState<ManagedUser | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });
  const availableGuides = users.filter((u) => (u.role || '').toLowerCase() === 'guide');

  const handleAddUser = async (data: { name: string; email: string; role: string; department: string; guide_id?: string }) => {
    if (!data.name.trim() || !data.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    try {
      const response = await api.post('/users', {
        full_name: data.name,
        email: data.email,
        role: (data.role || '').toLowerCase(),
        department: data.department,
        guide_id: data.guide_id
      });
      const res = response as any;
      if (res.success) {
        toast.success('User created successfully.');
        toast.info("Default password is the user's email address.");
        // Re-fetch users
        const fetchedResponse = await api.get('/users');
        const fetched = fetchedResponse as any;
        if (fetched.success) setUsers(fetched.data);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error('Email already exists');
      } else {
        toast.error('Failed to create user');
      }
    }
    setAddUserOpen(false);
  };

  const handleEditUser = async (data: { name: string; email: string; role: string; department: string; guide_id?: string }) => {
    if (!editUser) return;
    try {
      await api.put(`/users/${editUser.id}`, {
        full_name: data.name,
        email: data.email,
        role: (data.role || '').toLowerCase(),
        department: data.department,
        guide_id: data.guide_id
      });
      toast.success('User updated successfully.');
      const fetchedResponse = await api.get('/users');
      const fetched = fetchedResponse as any;
      if (fetched.success) setUsers(fetched.data);
    } catch (err: any) {
      toast.error('Failed to update user. ' + (err as Error).message);
    }
    setEditUser(null);
  };

  const handleResetPassword = (user: ManagedUser) => {
    toast.success(`Password reset link sent to ${user.email}.`);
  };


  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/users/${id}`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
      const fetchedResponse = await api.get('/users');
      const fetched = fetchedResponse as any;
      if (fetched.success) setUsers(fetched.data);
    } catch (err: any) {
      toast.error('Failed to update user status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully.');
      const fetchedResponse = await api.get('/users');
      const fetched = fetchedResponse as any;
      if (fetched.success) setUsers(fetched.data);
    } catch (err: any) {
      toast.error('Failed to delete user.');
    }
  };

  const handleExportUsers = () => {
    exportToCSV('users.csv', ['Name', 'Email', 'Role', 'Department', 'Status'],
      filteredUsers.map((u) => [u.name, u.email, u.role, u.department, u.status]));
    toast.success('Exported to CSV.');
  };



  return (
    <div>
      <PageHeader title="Admin Panel" description="Manage users, departments, and system configuration." />

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">User Management</CardTitle>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="scholar">Scholars</SelectItem>
                    <SelectItem value="guide">Guides</SelectItem>
                    <SelectItem value="chairman">Chairmen</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
                </div>
                <Button variant="outline" size="sm" onClick={handleExportUsers}><Download className="w-4 h-4 mr-1" /> Export</Button>
                <Button size="sm" onClick={() => setAddUserOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 rounded-xl animate-shimmer" />)}
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={Users} title="No users found" description="No users match your search." action={<Button onClick={() => setAddUserOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add User</Button>} />
              ) : (
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
                          <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{(u.name || '').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback></Avatar>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit bg-emerald-500/10 text-emerald-600">{u.role}</Badge>
                          {(u.role || '').toLowerCase() === 'scholar' && u.guide_name && (
                            <span className="text-[10px] text-muted-foreground">Guide: {u.guide_name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.department}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{u.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="User actions" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditUser(u)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(u)}>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(u.id, u.status)}>
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(u.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          {departmentsData.length === 0 ? (
            <EmptyState icon={Building2} title="No Departments" description="No department statistics are currently available." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentsData.map((d: any, i: number) => (
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
          )}
        </TabsContent>
      </Tabs>

      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} onSubmit={handleAddUser} guides={availableGuides} />
      <EditUserDialog user={editUser} onClose={() => setEditUser(null)} onSubmit={handleEditUser} guides={availableGuides} />
    </div>
  );
}

function AddUserDialog({
  open, onOpenChange, onSubmit, guides
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: { name: string; email: string; role: string; department: string; guide_id?: string }) => void;
  guides: ManagedUser[];
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Scholar');
  const [department, setDepartment] = useState('CSE');
  const [guideId, setGuideId] = useState('unassigned');

  const submit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    onSubmit({ name, email, role, department, guide_id: guideId === 'unassigned' ? undefined : guideId });
    setName(''); setEmail(''); setRole('Scholar'); setDepartment('Computer Science'); setGuideId('unassigned');
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
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {role === 'Scholar' && (
              <div className="space-y-2 col-span-2">
                <Label>Assigned Guide</Label>
                <Select value={guideId} onValueChange={setGuideId}>
                  <SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {guides.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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

function EditUserDialog({ user, onClose, onSubmit, guides }: {
  user: ManagedUser | null;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; role: string; department: string; guide_id?: string }) => void;
  guides: ManagedUser[];
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Scholar');
  const [department, setDepartment] = useState('CSE');
  const [guideId, setGuideId] = useState('unassigned');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase());
      setDepartment(user.department);
      setGuideId(user.guide_id || 'unassigned');
    }
  }, [user]);

  if (!user) return null;

  const submit = () => {
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name, email, role, department, guide_id: guideId === 'unassigned' ? undefined : guideId });
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
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {role.toLowerCase() === 'scholar' && (
              <div className="space-y-2 col-span-2">
                <Label>Assigned Guide</Label>
                <Select value={guideId} onValueChange={setGuideId}>
                  <SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {guides.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
