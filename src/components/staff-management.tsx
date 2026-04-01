'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Crown, Plus, Trash2, Shield, CheckSquare, Square } from 'lucide-react';

const ALL_PRIVILEGES = [
  { id: 'create_listings', label: 'Create Listings (Draft)' },
  { id: 'edit_listings', label: 'Edit Listings' },
  { id: 'view_all_listings', label: 'View All Listings' },
  { id: 'approve_users', label: 'Approve / Reject Users' },
  { id: 'view_payments', label: 'View Payment Requests' },
  { id: 'confirm_payments', label: 'Confirm Payments' },
  { id: 'view_leads', label: 'View All Leads' },
  { id: 'view_demands', label: 'View All Demands' },
  { id: 'view_analytics', label: 'View Analytics' },
  { id: 'data_governance', label: 'Data Governance Tools' },
  { id: 'manage_users_readonly', label: 'View Users (Read Only)' },
];

export function StaffManagement() {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ email: '', userName: '', phone: '', staffRole: '', privileges: [] as string[] });
  const [saving, setSaving] = React.useState(false);
  const [editEmail, setEditEmail] = React.useState<string | null>(null);

  const staffMembers = Object.values(users).filter((u: any) => u.isInternalStaff);

  const togglePrivilege = (id: string) => {
    setForm(prev => ({
      ...prev,
      privileges: prev.privileges.includes(id)
        ? prev.privileges.filter(p => p !== id)
        : [...prev.privileges, id]
    }));
  };

  const handleSave = async () => {
    if (!form.email || !form.userName || !form.staffRole) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Email, name and role title are required.' });
      return;
    }
    setSaving(true);
    try {
      if (editEmail) {
        await updateUser({ email: editEmail, userName: form.userName, phone: form.phone, staffRole: form.staffRole, privileges: form.privileges } as any);
        toast({ title: 'Staff Updated', description: form.userName + ' privileges updated.' });
      } else {
        await addUser({
          email: form.email,
          userName: form.userName,
          phone: form.phone,
          companyName: 'Lakshmi Balaji ORS Private Limited',
          role: 'O2O',
          password: 'ORS@' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          status: 'approved',
          createdAt: new Date().toISOString(),
          isInternalStaff: true,
          staffRole: form.staffRole,
          privileges: form.privileges,
        } as any);
        const tempPassword = 'ORS@' + Math.random().toString(36).slice(2, 8).toUpperCase();
      // Send welcome email
      fetch('/api/send-staff-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          userName: form.userName,
          staffRole: form.staffRole,
          password: tempPassword,
          privileges: form.privileges,
        }),
      }).catch(e => console.error('Welcome email error:', e));
      toast({ title: 'Staff Account Created', description: form.userName + ' added as ' + form.staffRole + '. Welcome email sent to ' + form.email });
      }
      setForm({ email: '', userName: '', phone: '', staffRole: '', privileges: [] });
      setShowForm(false);
      setEditEmail(null);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSaving(false);
  };

  const handleEdit = (u: any) => {
    setForm({ email: u.email, userName: u.userName, phone: u.phone || '', staffRole: u.staffRole || '', privileges: u.privileges || [] });
    setEditEmail(u.email);
    setShowForm(true);
  };

  const handleDelete = async (email: string, name: string) => {
    if (!confirm('Remove ' + name + ' from internal staff? This cannot be undone.')) return;
    await deleteUser(email);
    toast({ title: 'Staff Removed', description: name + ' has been removed.' });
  };

  return (
    <div className="space-y-6 mt-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> ORS-ONE Internal Staff
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Create and manage internal staff accounts with custom privileges. Gmail accounts permitted.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditEmail(null); setForm({ email: '', userName: '', phone: '', staffRole: '', privileges: [] }); }} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Add Staff
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <p className="text-sm font-bold text-foreground">{editEmail ? 'Edit Staff Member' : 'New Internal Staff Account'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Ravi Kumar" value={form.userName} onChange={e => setForm(p => ({...p, userName: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label>Gmail Address</Label>
              <Input placeholder="ravi.kumar@gmail.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} disabled={!!editEmail} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+91 98XXXXXXXX" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role Title</Label>
              <Input placeholder="e.g. Listing Manager, Accounts, Operations" value={form.staffRole} onChange={e => setForm(p => ({...p, staffRole: e.target.value}))} />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Privileges</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_PRIVILEGES.map(p => (
                <button key={p.id} onClick={() => togglePrivilege(p.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${form.privileges.includes(p.id) ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                  {form.privileges.includes(p.id)
                    ? <CheckSquare className="h-4 w-4 text-primary flex-shrink-0" />
                    : <Square className="h-4 w-4 flex-shrink-0" />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              {saving ? 'Saving...' : editEmail ? 'Update Staff' : 'Create Staff Account'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditEmail(null); }} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {staffMembers.length === 0 && !showForm ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="font-bold text-foreground text-sm">No internal staff yet</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add Staff" to create your first internal staff account.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {staffMembers.map((u: any, i: number) => (
            <div key={u.email} className={`px-5 py-4 flex items-start gap-4 ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                {u.userName?.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-bold text-foreground">{u.userName}</p>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{u.staffRole || 'Staff'}</Badge>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">ORS-ONE Staff</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{u.email}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(u.privileges || []).map((priv: string) => {
                    const label = ALL_PRIVILEGES.find(p => p.id === priv)?.label || priv;
                    return <span key={priv} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{label}</span>;
                  })}
                  {(!u.privileges || u.privileges.length === 0) && <span className="text-xs text-muted-foreground italic">No privileges assigned</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={() => handleEdit(u)}>Edit</Button>
                <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => handleDelete(u.email, u.userName)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}