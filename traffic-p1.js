const fs = require('fs');
const content = `'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Users, Building, List, CheckSquare, Eye, Download, Clock, UserPlus, ClipboardList, PackagePlus, TrendingUp, ShieldCheck, AlertCircle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// ── Helpers ───────────────────────────────────────────────────
function groupByDay(items: any[], dateExtractor: (item: any) => Date, days = 30) {
  const counts: Record<string, number> = {};
  const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
  interval.forEach(day => { counts[format(day, 'MMM d')] = 0; });
  items.forEach(item => {
    try {
      const date = dateExtractor(item);
      if (date >= interval[0] && date <= interval[interval.length - 1]) {
        const key = format(date, 'MMM d');
        counts[key] = (counts[key] || 0) + 1;
      }
    } catch {}
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

// ── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string }) => (
  <div className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4">
    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-foreground leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div><h3 className="font-bold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{sub}</p></div>
  </div>
);

// ── Status Bar ────────────────────────────────────────────────
const StatusBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold text-foreground">{label}</span>
      <span className="font-bold text-primary">{value} <span className="text-muted-foreground font-normal">({total > 0 ? ((value/total)*100).toFixed(0) : 0}%)</span></span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: total > 0 ? (value/total*100)+'%' : '0%', background: color }} />
    </div>
  </div>
);

// ── Activity Item ─────────────────────────────────────────────
const activityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'New User':    { icon: UserPlus,      color: '#6141ac', bg: 'hsl(259,44%,94%)' },
  'New Demand':  { icon: ClipboardList, color: '#2D6A4F', bg: '#EDFFF4' },
  'New Listing': { icon: PackagePlus,   color: '#065A82', bg: '#EBF5FF' },
};

const ActivityItem = ({ type, subject, timestamp }: { type: string; subject: string; timestamp: Date }) => {
  const config = activityConfig[type] || { icon: Activity, color: '#6141ac', bg: 'hsl(259,44%,94%)' };
  const Icon = config.icon;
  const timeAgo = (d: Date) => {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff/60000); const hrs = Math.floor(mins/60); const days = Math.floor(hrs/24);
    if (days > 0) return days+'d ago'; if (hrs > 0) return hrs+'h ago'; return mins+'m ago';
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: config.bg }}>
        <Icon className="h-4 w-4" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{subject}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(timestamp)}</span>
    </div>
  );
};

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.value} {p.name}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrafficAnalyticsPage() {
  const { user, users, isLoading: authLoading } = useAuth();
  const { demands, listings, submissions, viewHistory, downloadHistory, isLoading: dataLoading } = useData();
  const router = useRouter();
  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const [activityLimit, setActivityLimit] = React.useState(10);

  React.useEffect(() => { if (!authLoading && !hasAccess) router.push('/dashboard'); }, [user, authLoading, router, hasAccess]);

  const safeUsers = users ?? {};
  const safeListings = listings ?? [];
  const safeDemands = demands ?? [];
  const safeSubmissions = submissions ?? [];
  const safeViews = viewHistory ?? [];
  const safeDownloads = downloadHistory ?? [];

  const kpis = React.useMemo(() => {
    const allUsers = Object.values(safeUsers);
    const approved = safeListings.filter(l => l.status === 'approved').length;
    const pending = safeListings.filter(l => l.status === 'pending').length;
    const rejected = safeListings.filter(l => l.status === 'rejected').length;
    const leased = safeListings.filter(l => l.status === 'leased').length;
    const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
    return {
      totalUsers: allUsers.length, pendingUsers,
      totalListings: safeListings.length, approved, pending, rejected, leased,
      totalDemands: safeDemands.length,
      totalViews: safeViews.length,
      totalDownloads: safeDownloads.length,
      totalSubmissions: safeSubmissions.length,
    };
  }, [safeUsers, safeListings, safeDemands, safeViews, safeDownloads, safeSubmissions]);

  const userGrowthData = React.useMemo(() => groupByDay(Object.values(safeUsers).filter(u => u.createdAt), u => new Date(u.createdAt)), [safeUsers]);
  const demandData = React.useMemo(() => groupByDay(safeDemands.filter(d => d.createdAt), d => new Date(d.createdAt!)), [safeDemands]);

  const roleData = React.useMemo(() => {
    const counts = Object.values(safeUsers).reduce((acc, u) => {
      const role = u.role === 'Warehouse Developer' ? 'Provider' : u.role === 'User' ? 'Customer' : u.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colors = ['hsl(259,44%,46%)', 'hsl(259,44%,66%)', 'hsl(259,44%,30%)', 'hsl(259,44%,78%)', 'hsl(259,44%,20%)'];
    return Object.entries(counts).map(([name, value], i) => ({ name, value, fill: colors[i % colors.length] }));
  }, [safeUsers]);

  const listingStatusData = React.useMemo(() => [
    { name: 'Approved', value: kpis.approved, fill: '#16a34a' },
    { name: 'Pending', value: kpis.pending, fill: '#d97706' },
    { name: 'Rejected', value: kpis.rejected, fill: '#dc2626' },
    { name: 'Leased', value: kpis.leased, fill: '#2563eb' },
  ], [kpis]);

  const recentActivity = React.useMemo(() => {
    const userEvents = Object.values(safeUsers).filter(u => u.createdAt).map(u => ({ type: 'New User', subject: u.userName + ' (' + (u.role === 'Warehouse Developer' ? 'Provider' : u.role === 'User' ? 'Customer' : u.role) + ')', timestamp: new Date(u.createdAt) }));
    const demandEvents = safeDemands.filter(d => d.createdAt).map(d => ({ type: 'New Demand', subject: d.demandId + ' — ' + d.location, timestamp: new Date(d.createdAt!) }));
    const listingEvents = safeListings.filter(l => l.createdAt).map(l => ({ type: 'New Listing', subject: l.listingId + ' — ' + l.location, timestamp: new Date(l.createdAt!) }));
    return [...userEvents, ...demandEvents, ...listingEvents].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [safeUsers, safeDemands, safeListings]);

  if (authLoading || dataLoading || !hasAccess) return (
    <div className="container mx-auto p-8 space-y-6">
      <Skeleton className="h-10 w-64 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Platform Traffic & Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of user growth, listing health and platform engagement.</p>
        </div>

        {/* KPI Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Users" value={kpis.totalUsers} sub={kpis.pendingUsers + ' pending approval'} icon={Users} />
          <KpiCard label="Total Listings" value={kpis.totalListings} sub={kpis.approved + ' approved'} icon={Building} />
          <KpiCard label="Total Demands" value={kpis.totalDemands} sub="All time" icon={List} />
          <KpiCard label="Total Views" value={kpis.totalViews.toLocaleString()} sub="All listings" icon={Eye} />
          <KpiCard label="Total Downloads" value={kpis.totalDownloads.toLocaleString()} sub="All time" icon={Download} />
          <KpiCard label="Submissions" value={kpis.totalSubmissions} sub="Matched leads" icon={CheckSquare} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
            <SectionHeader icon={TrendingUp} title="User Growth" sub="New signups over last 30 days" />
            <ChartContainer config={{}} className="h-[220px] w-full">
              <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} interval={4} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="New Users" stroke="hsl(259,44%,46%)" fill="hsl(259,44%,46%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* User Role Breakdown */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <SectionHeader icon={Users} title="Users by Role" sub="All registered accounts" />
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                    {roleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {roleData.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: r.fill }} /><span className="text-foreground font-medium">{r.name}</span></div>
                  <span className="font-bold text-primary">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demand Activity */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
            <SectionHeader icon={ClipboardList} title="Demand Activity" sub="New demands logged over last 30 days" />
            <ChartContainer config={{}} className="h-[220px] w-full">
              <AreaChart data={demandData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} interval={4} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="New Demands" stroke="hsl(259,44%,30%)" fill="hsl(259,44%,30%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Listing Health */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <SectionHeader icon={ShieldCheck} title="Listing Health" sub="Current status breakdown" />
            <div className="space-y-4 mt-2">
              <StatusBar label="Approved" value={kpis.approved} total={kpis.totalListings} color="#16a34a" />
              <StatusBar label="Pending Review" value={kpis.pending} total={kpis.totalListings} color="#d97706" />
              <StatusBar label="Rejected" value={kpis.rejected} total={kpis.totalListings} color="#dc2626" />
              <StatusBar label="Leased" value={kpis.leased} total={kpis.totalListings} color="#2563eb" />
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Approval Rate</span>
                <span className="font-bold text-green-600">{kpis.totalListings > 0 ? ((kpis.approved/kpis.totalListings)*100).toFixed(0) : 0}%</span>
              </div>
              {kpis.pendingUsers > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs bg-amber-50 text-amber-700 rounded-xl px-3 py-2 border border-amber-200">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{kpis.pendingUsers} user{kpis.pendingUsers > 1 ? 's' : ''} awaiting approval</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Activity} title="Recent Platform Activity" sub="Latest events across the platform" />
            <span className="text-xs text-muted-foreground">{recentActivity.length} total events</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {recentActivity.slice(0, activityLimit).map((act, i) => <ActivityItem key={i} type={act.type} subject={act.subject} timestamp={act.timestamp} />)}
          </div>
          {recentActivity.length > activityLimit && (
            <button onClick={() => setActivityLimit(l => l + 10)} className="w-full mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2">
              Show more ({recentActivity.length - activityLimit} remaining)
            </button>
          )}
          {recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No activity to display.</p>}
        </div>

      </div>
    </main>
  );
}`;
fs.writeFileSync('src/app/dashboard/analytics/traffic/page.tsx', content);
console.log('Done!');
