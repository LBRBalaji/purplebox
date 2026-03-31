'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Settings, Trash2, KeyRound, Eye, EyeOff, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type LocationCircle = { name: string; locations: string[]; };

export default function PlatformSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [circles, setCircles] = React.useState([]);
  const [newCircleName, setNewCircleName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [emailNotif, setEmailNotif] = React.useState(user?.emailNotifications ?? true);
  const [savingNotif, setSavingNotif] = React.useState(false);
  const hasAccess = user?.role === 'SuperAdmin';

  const handleSaveNotifPreference = async (val: boolean) => {
    setSavingNotif(true);
    setEmailNotif(val);
    try {
      const allUsers = Object.values({});
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, emailNotifications: val }),
      });
      toast({ title: val ? 'Email notifications enabled' : 'Email notifications disabled', description: val ? 'You will receive important alerts by email.' : 'You will only see alerts in the app.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save preference.' });
    }
    setSavingNotif(false);
  };

  React.useEffect(() => { if (!isLoading && !user) router.push('/dashboard'); }, [user, isLoading, router]);

  React.useEffect(() => {
    if (!hasAccess) return;
    fetch('/api/location-circles').then(r => r.json()).then(setCircles).catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Could not load location circles.' }));
  }, [toast, hasAccess]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in all password fields.' }); return; }
    if (newPassword.length < 6) { toast({ variant: 'destructive', title: 'Too Short', description: 'New password must be at least 6 characters.' }); return; }
    if (newPassword !== confirmPassword) { toast({ variant: 'destructive', title: 'Mismatch', description: 'New password and confirm password do not match.' }); return; }
    setIsChangingPassword(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated');
      await reauthenticateWithCredential(firebaseUser, EmailAuthProvider.credential(firebaseUser.email, currentPassword));
      await updatePassword(firebaseUser, newPassword);
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      const msg = error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' ? 'Current password is incorrect.' : error.message || 'Failed to change password.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally { setIsChangingPassword(false); }
  };

  const handleAddCircle = () => { if (newCircleName && !circles.some(c => c.name.toLowerCase() === newCircleName.toLowerCase())) { setCircles([...circles, { name: newCircleName, locations: [] }]); setNewCircleName(''); }};
  const handleRemoveCircle = (name) => setCircles(circles.filter(c => c.name !== name));
  const handleAddLocation = (idx, loc) => { if (!loc) return; const u = [...circles]; if (!u[idx].locations.includes(loc.toLowerCase())) { u[idx].locations.push(loc.toLowerCase()); setCircles(u); }};
  const handleRemoveLocation = (idx, loc) => { const u = [...circles]; u[idx].locations = u[idx].locations.filter(l => l !== loc); setCircles(u); };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/location-circles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(circles) });
      if (!res.ok) throw new Error('Failed to save.');
      toast({ title: 'Saved', description: 'Location circles updated.' });
    } catch (e) { toast({ variant: 'destructive', title: 'Save Failed', description: e.message }); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return null;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3"><Settings /> Settings</h2>
          <p className="text-muted-foreground mt-2">Manage your account and platform settings.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Change Password</CardTitle>
            <CardDescription>Update your login password. You will need your current password to proceed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? "text" : "password"} placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="pr-10" />
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNew ? "text" : "password"} placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pr-10" />
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowNew(!showNew)}>{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pr-10" />
                <button type="button" className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}><KeyRound className="mr-2 h-4 w-4" />{isChangingPassword ? 'Updating...' : 'Update Password'}</Button>
          </CardFooter>
        </Card>
        {hasAccess && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Location Circles</CardTitle>
              <CardDescription>Group locations into circles to improve search relevance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {circles.map((circle, idx) => (
                <div key={circle.name} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-primary">{circle.name}</h4>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCircle(circle.name)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                  <Input placeholder="Add a location (press Enter)" onKeyDown={(e) => { if (e.key==='Enter') { e.preventDefault(); handleAddLocation(idx, e.currentTarget.value); e.currentTarget.value=''; }}} />
                  <div className="flex flex-wrap gap-2">
                    {circle.locations.map(loc => (
                      <Badge key={loc} variant="secondary" className="gap-1">{loc}
                        <button type="button" className="rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => handleRemoveLocation(idx, loc)}><X className="h-3 w-3"/></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <Input placeholder="New Circle Name" value={newCircleName} onChange={e => setNewCircleName(e.target.value)} />
                <Button onClick={handleAddCircle}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}><Save className="mr-2 h-4 w-4"/>{isSaving ? 'Saving...' : 'Save All Changes'}</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
