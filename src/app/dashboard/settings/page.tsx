'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Settings, Trash2, KeyRound, Eye, EyeOff, Bell, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { AdminSidebar } from '@/components/admin-sidebar';
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

  // Identity verification state (shown only if missing)
  const [idGst, setIdGst] = React.useState('');
  const [idPan, setIdPan] = React.useState('');
  const [idTaxType, setIdTaxType] = React.useState<'gst'|'pan'>('gst');
  const [idSaving, setIdSaving] = React.useState(false);

  const personalDomains = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','live.com','msn.com','protonmail.com'];
  const isPersonalEmail = personalDomains.includes(user?.email?.split('@')[1]?.toLowerCase() || '');
  const isBusinessRole = user?.role === 'Warehouse Developer' || user?.role === 'User' || user?.role === 'Agent';
  const missingGstPan = !((user as any)?.gstNumber || (user as any)?.panNumber);
  const showIdentitySection = isBusinessRole && missingGstPan;



  const handleSaveIdentity = async () => {
    if (idGst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(idGst)) { toast({ variant: 'destructive', title: 'Invalid GST number' }); return; }
    if (!idGst && idPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idPan)) { toast({ variant: 'destructive', title: 'Invalid PAN number' }); return; }
    setIdSaving(true);
    try {
      const updated = { ...user, ...(idGst ? { gstNumber: idGst } : {}), ...(idPan && !idGst ? { panNumber: idPan } : {}) };
      await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
      toast({ title: 'GST/PAN saved', description: 'Your account has been updated.' });
    } catch { toast({ variant: 'destructive', title: 'Save failed' }); }
    setIdSaving(false);
  };

  const handleSaveNotifPreference = async (val: boolean) => {
    setSavingNotif(true);
    setEmailNotif(val);
    try {
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

  React.useEffect(() => { if (!isLoading && !user && !isChangingPassword) router.push('/dashboard'); }, [user, isLoading, router, isChangingPassword]);

  React.useEffect(() => {
    if (!hasAccess) return;
    fetch('/api/location-circles').then(r => r.json()).then(setCircles).catch(() => {});
  }, [hasAccess]);

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
      const errCode = (error as any)?.code || '';
      const msg = errCode === 'auth/wrong-password' || errCode === 'auth/invalid-credential' ? 'Current password is incorrect.' : (error as any)?.message || 'Failed to change password.';
      toast({ variant: 'destructive', title: 'Password Update Failed', description: msg });
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
    <div style={{display:'flex',minHeight:'100vh',background:'hsl(259 30% 96%)'}}>
      <AdminSidebar />
      <main className="container mx-auto p-4 md:p-8" style={{flex:1,overflow:'auto'}}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to receive important alerts from ORS-ONE.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
              <div>
                <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive important platform alerts to your registered email address</p>
              </div>
              <button
                onClick={() => handleSaveNotifPreference(!emailNotif)}
                disabled={savingNotif}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotif ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotif ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">You will be notified by email for: payment confirmations, new leads, account updates, and other time-sensitive alerts.</p>
          </CardContent>
        </Card>

        {showIdentitySection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Identity Verification</CardTitle>
              <CardDescription>
                Add your GST or PAN number for identity and invoicing purposes. These details are not mandatory but recommended.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-md">
              {missingGstPan && (
                <div className="space-y-2">
                  <Label>GST / PAN Number {isPersonalEmail && <span className="text-destructive">*</span>}</Label>
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setIdTaxType('gst')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${idTaxType === 'gst' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}>
                      GST Number
                    </button>
                    <button type="button" onClick={() => setIdTaxType('pan')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${idTaxType === 'pan' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}>
                      PAN (no GST)
                    </button>
                  </div>
                  {idTaxType === 'gst'
                    ? <Input placeholder="29ABCDE1234F1Z5" maxLength={15} value={idGst} onChange={e => { setIdGst(e.target.value.toUpperCase()); setIdPan(''); }} />
                    : <Input placeholder="ABCDE1234F" maxLength={10} value={idPan} onChange={e => { setIdPan(e.target.value.toUpperCase()); setIdGst(''); }} />}
                </div>
              )}

            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveIdentity} disabled={idSaving}>
                <ShieldCheck className="mr-2 h-4 w-4" />{idSaving ? 'Saving...' : 'Save Identity Details'}
              </Button>
            </CardFooter>
          </Card>
        )}

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
    </div>
  );
}
