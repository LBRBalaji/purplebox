'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/contexts/data-context';
import AdminDashboard from './admin/page';
import CustomerDashboard from './customer/page';
import AgentDashboard from './agent/page';


// ── Staff / Internal dashboard (unchanged) ───────────────────────────────────
import { StaffDashboard } from '@/components/staff-dashboard';
import { ListingForm } from '@/components/listing-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApprovalQueue } from '@/components/approval-queue';
import { DemandList } from '@/components/demand-list';
import { ProviderLeads } from '@/components/provider-leads';
import { ProviderListings } from '@/components/provider-listings';
import { GeneralShortlist } from '@/components/general-shortlist';

function O2ODashboard() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'approval-queue';
  const { submissions } = useData();
  const hasPending = submissions.some(s => s.status === 'Pending');
  const [tab, setTab] = React.useState(defaultTab);
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="approval-queue">Approval Queue {hasPending && <span className="ml-2 h-2 w-2 rounded-full bg-destructive animate-ping"/>}</TabsTrigger>
        <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
        <TabsTrigger value="registered-leads">All Leads</TabsTrigger>
        <TabsTrigger value="my-shortlist">My Shortlist</TabsTrigger>
      </TabsList>
      <TabsContent value="approval-queue"><ApprovalQueue /></TabsContent>
      <TabsContent value="active-demands"><DemandList /></TabsContent>
      <TabsContent value="registered-leads"><ProviderLeads /></TabsContent>
      <TabsContent value="my-shortlist"><GeneralShortlist /></TabsContent>
    </Tabs>
  );
}

function InternalStaffDashboard() {
  const { user } = useAuth();
  const { addListing, locationCircles } = useData();
  const [open, setOpen] = React.useState(false);
  const privileges: string[] = (user as any)?.privileges || [];
  const has = (p: string) => privileges.includes(p);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-foreground">Staff Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.userName}.</p>
        </div>
        {has('create_listings') && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl">+ Create New Listing</button>}
      </div>
      <StaffDashboard />
      {has('create_listings') && (
        <ListingForm isOpen={open} onOpenChange={setOpen} listing={null}
          onSubmit={(data) => { addListing(data, user?.email); setOpen(false); }}
          locationCircles={locationCircles || []} />
      )}
    </div>
  );
}

// ── Main router ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  if (!user) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const isInternalStaff = (user as any)?.isInternalStaff === true;
  const role = user.role;

  const renderDashboard = () => {
    if (isInternalStaff)           return <InternalStaffDashboard />;
    if (role === 'SuperAdmin')     return <AdminDashboard />;
    if (role === 'O2O')            return <O2ODashboard />;
    if (role === 'Agent')          return <AgentDashboard />;
    if (role === 'Warehouse Developer') return <ProviderListings />;
    if (role === 'User')           return <CustomerDashboard />;
    return <p className="text-muted-foreground text-sm p-8">Dashboard not available for your role.</p>;
  };

  const isAdminLayout = role === 'SuperAdmin';

  if (isAdminLayout) {
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-48 p-8"><p className="text-muted-foreground text-sm">Loading...</p></div>}>
        <AdminDashboard />
      </React.Suspense>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <React.Suspense fallback={<div className="flex items-center justify-center h-48"><p className="text-muted-foreground text-sm">Loading...</p></div>}>
          {renderDashboard()}
        </React.Suspense>
      </div>
    </main>
  );
}
