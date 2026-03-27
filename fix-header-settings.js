const fs = require('fs');

const newHeader = `'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, Map, LogIn, LayoutDashboard, BarChart, List, ChevronDown, Calculator, Settings, Bell, Info, BookOpen, Users, Briefcase, Search as SearchIcon, Sparkles, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/login-dialog';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useData } from '@/contexts/data-context';
import { Badge } from './ui/badge';

const WhatsAppIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"/>
  </svg>
);

const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap", isActive && "text-primary font-semibold")}>
      {children}
    </Link>
  );
};

const DropTrigger = React.forwardRef(({ children, isActive, ...props }, ref) => (
  <button ref={ref} {...props} className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap", isActive && "text-primary font-semibold")}>
    {children}
  </button>
));
DropTrigger.displayName = 'DropTrigger';

const ListingsDropdown = () => {
  const pathname = usePathname();
  const isActive = pathname === '/' || pathname.startsWith('/map-search') || pathname.startsWith('/listings');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><List className="h-3.5 w-3.5" /> Listings <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild><Link href="/"><List className="mr-2 h-4 w-4" /> Browse Listings</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/map-search"><Map className="mr-2 h-4 w-4" /> Map Search</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/listing-comparison"><Calculator className="mr-2 h-4 w-4" /> Compare Listings</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ToolsDropdown = () => {
  const pathname = usePathname();
  const isActive = ['/commercial-calculator','/registration-calculator','/roi-calculator'].some(p => pathname.startsWith(p));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><Calculator className="h-3.5 w-3.5" /> Tools <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild><Link href="/roi-calculator">Investment ROI Calculator</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/commercial-calculator">Area & Commercials Calculator</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/registration-calculator">Registration Charges Calculator</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AnalyticsDropdown = () => {
  const pathname = usePathname();
  const isActive = pathname.startsWith('/dashboard/analytics');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><BarChart className="h-3.5 w-3.5" /> Analytics <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/listings-performance">Listing Performance</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/customer">Customer Engagement</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/traffic">Platform Traffic</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/community">Community Analytics</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/predictive"><Sparkles className="mr-2 h-4 w-4" /> Predictive Analytics</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ManageDropdown = ({ isSuperAdmin }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith('/dashboard/manage') || pathname.startsWith('/dashboard/approval') || pathname.startsWith('/dashboard/settings') || pathname.startsWith('/dashboard/search');
  if (!isSuperAdmin) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><Settings className="h-3.5 w-3.5" /> Manage <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Approvals</DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/dashboard/approval"><ClipboardCheck className="mr-2 h-4 w-4" /> Approval Queue</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Administration</DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/dashboard/manage-users"><Users className="mr-2 h-4 w-4" /> Manage Users</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/search-console"><SearchIcon className="mr-2 h-4 w-4" /> Search Console</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Platform Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Operations</DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/dashboard/transactions"><Briefcase className="mr-2 h-4 w-4" /> Broking Transactions</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Platform Oversight</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationsBell = () => {
  const { user } = useAuth();
  const { unreadCount } = useData();
  if (!user) return null;
  return (
    <Button asChild variant="ghost" size="icon" className="relative h-8 w-8">
      <Link href="/dashboard/notifications">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">{unreadCount}</Badge>
        )}
      </Link>
    </Button>
  );
};

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isO2O = user?.role === 'O2O';
  const roleLabel = user?.role === 'Warehouse Developer' ? 'Property Provider' : user?.role === 'User' ? 'Customer' : user?.role;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 mr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-primary">ORS-ONE</span>
              <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50 py-0 px-1">Beta</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-none">Building Transaction Ready Assets</p>
          </Link>
          <nav className="hidden md:flex items-center gap-5 flex-1">
            {isLoading ? (
              <div className="flex items-center gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /></div>
            ) : (
              <>
                {user && !isSuperAdmin && (<NavLink href="/dashboard"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</NavLink>)}
                <ListingsDropdown />
                <ToolsDropdown />
                <NavLink href="/resources"><BookOpen className="h-3.5 w-3.5" /> Resources</NavLink>
                <NavLink href="/about-us"><Info className="h-3.5 w-3.5" /> About Us</NavLink>
                <NavLink href="/community"><Users className="h-3.5 w-3.5" /> Community</NavLink>
                {(isSuperAdmin || isO2O) && <AnalyticsDropdown />}
                {isSuperAdmin && <ManageDropdown isSuperAdmin={isSuperAdmin} />}
              </>
            )}
          </nav>
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {(!user || (!isSuperAdmin && !isO2O)) && (
              <Link href="https://wa.me/919841098170?text=need%20O2O%20support%20call%20me%20back%20please" target="_blank" rel="noopener noreferrer" className="hidden lg:block">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><WhatsAppIcon /> Ask a Call Back</Button>
              </Link>
            )}
            {isLoading ? (<Skeleton className="h-8 w-20" />) : user ? (
              <div className="flex items-center gap-2">
                <NotificationsBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 max-w-[180px]">
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-xs font-semibold truncate leading-none max-w-[120px]">{user.userName}</span>
                        <span className="text-xs text-muted-foreground leading-none mt-0.5">{roleLabel}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 flex-shrink-0 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Signed in as</DropdownMenuLabel>
                    <DropdownMenuLabel className="font-semibold text-sm py-0">{user.userName}</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-xs text-muted-foreground py-0 font-normal">{roleLabel}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button size="sm" className="h-8" onClick={() => setIsLoginOpen(true)}><LogIn className="mr-2 h-4 w-4" /> Login</Button>
            )}
          </div>
        </div>
      </header>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
`;

const newSettings = `'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Settings, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
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
  const hasAccess = user?.role === 'SuperAdmin';

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
`;

fs.writeFileSync('src/components/header.tsx', newHeader);
console.log('Header updated');
fs.writeFileSync('src/app/dashboard/settings/page.tsx', newSettings);
console.log('Settings updated');
