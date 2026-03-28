'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import Link from 'next/link';
import {
  Users, List, Download, Eye, MapPin, Building, Activity, FileQuestion,
  MessageCircle, HardHat, Notebook, Calendar as CalendarIcon, TrendingUp,
  ArrowUpRight, ChevronRight, Filter, Star, Clock
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────
function groupAndSort<T>(items: T[], keyExtractor: (item: T) => string | undefined, limit = 5) {
  if (!items) return [];
  const counts = items.reduce((acc, item) => {
    const key = keyExtractor(item);
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, limit);
}

const activityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'View':                    { icon: Eye,            color: '#6141ac', bg: 'hsl(259,44%,94%)' },
  'Download':                { icon: Download,       color: '#2D6A4F', bg: '#EDFFF4' },
  'Quote Request':           { icon: MessageCircle,  color: '#065A82', bg: '#EBF5FF' },
  'New Demand':              { icon: List,           color: '#F18F01', bg: '#FFF8ED' },
  'Layout Request':          { icon: FileQuestion,   color: '#7C3AED', bg: '#F3EEFF' },
  'Tenant Improvements':     { icon: HardHat,        color: '#B45309', bg: '#FFFBEB' },
  'Negotiation Board Update':{ icon: Notebook,       color: '#0369A1', bg: '#F0F9FF' },
};

// ── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) => (
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

// ── Funnel Step ───────────────────────────────────────────────
const FunnelStep = ({ label, value, pct, icon: Icon, isLast }: { label: string; value: number; pct: number; icon: React.ElementType; isLast?: boolean }) => (
  <div className="flex-1 flex flex-col items-center gap-2">
    <div className="w-full bg-secondary/50 rounded-xl p-4 text-center border border-border">
      <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {pct < 100 && <p className="text-xs font-bold text-primary mt-1">{pct.toFixed(0)}%</p>}
    </div>
    {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />}
  </div>
);

// ── Bar Chart Row ─────────────────────────────────────────────
const BarRow = ({ name, count, max, rank }: { name: string; count: number; max: number; rank: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs font-black text-muted-foreground w-4 flex-shrink-0">{rank}</span>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-foreground truncate max-w-[180px]">{name}</span>
        <span className="text-xs font-bold text-primary ml-2">{count}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: (count / max * 100) + '%' }} />
      </div>
    </div>
  </div>
);

// ── Activity Item ─────────────────────────────────────────────
const ActivityItem = ({ type, subject, userName, timestamp, link }: { type: string; subject: string; userName: string; timestamp: string; link: string }) => {
  const config = activityConfig[type] || { icon: Activity, color: '#6141ac', bg: 'hsl(259,44%,94%)' };
  const Icon = config.icon;
  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return days + 'd ago';
    if (hrs > 0) return hrs + 'h ago';
    return mins + 'm ago';
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: config.bg }}>
        <Icon className="h-4 w-4" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={link} target="_blank" className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block">{subject}</Link>
            <p className="text-xs text-muted-foreground mt-0.5">{userName}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border" style={{ color: config.color, background: config.bg, borderColor: config.color + '30' }}>{type}</span>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo(timestamp)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Customer Leaderboard Row ──────────────────────────────────
const LeaderRow = ({ rank, company, views, downloads, demands, score }: { rank: number; company: string; views: number; downloads: number; demands: number; score: number }) => (
  <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rank === 1 ? 'bg-amber-100 text-amber-700' : rank === 2 ? 'bg-slate-100 text-slate-600' : rank === 3 ? 'bg-orange-50 text-orange-600' : 'bg-secondary text-muted-foreground'}`}>{rank}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{company}</p>
      <p className="text-xs text-muted-foreground">{views}v · {downloads}d · {demands} demands</p>
    </div>
    <div className="flex-shrink-0">
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{score} pts</span>
    </div>
  </div>
);
export default function CustomerAnalyticsPage() {
  const { user: currentUser, users } = useAuth();
  const { demands, viewHistory, downloadHistory, listings, isLoading, registeredLeads, layoutRequests, transactionActivities, negotiationBoards } = useData();
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = React.useState('all');
  const [activityLimit, setActivityLimit] = React.useState(10);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() });
  const hasAccess = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'O2O';

  React.useEffect(() => { if (!isLoading && !hasAccess) router.push('/dashboard'); }, [currentUser, hasAccess, router, isLoading]);

  const customerCompanies = React.useMemo(() => {
    const companies = new Set(Object.values(users || {}).filter(u => u.role === 'User').map(u => u.companyName));
    return Array.from(companies).sort();
  }, [users]);

  const data = React.useMemo(() => {
    if (isLoading) { return null; }
    const from = dateRange?.from || new Date(0);
    const to = new Date(dateRange?.to || new Date()); to.setHours(23,59,59,999);
    const isAll = selectedCompany === 'all';
    const companyEmails = new Set<string>();
    Object.values(users).forEach(u => { if (u.role === 'User' && (isAll || u.companyName === selectedCompany)) companyEmails.add(u.email); });
    const dateFilter = (ts: string | number | Date) => { const d = new Date(ts); return d >= from && d <= to; };

    const relViews = viewHistory.filter(v => companyEmails.has(v.userId) && dateFilter(v.timestamp));
    const relDownloads = downloadHistory.filter(d => companyEmails.has(d.userId) && dateFilter(d.timestamp));
    const relDemands = demands.filter(d => companyEmails.has(d.userEmail) && d.createdAt && dateFilter(d.createdAt));
    const relQuotes = registeredLeads.filter(l => companyEmails.has(l.customerId) && dateFilter(l.registeredAt));
    const relLayouts = layoutRequests.filter(r => { const u = Object.values(users).find(u => u.email === r.userEmail); return u && companyEmails.has(u.email) && dateFilter(r.requestedAt); });
    const relLeadsSet = new Set(registeredLeads.filter(l => companyEmails.has(l.customerId)).map(l => l.id));
    const relTI = transactionActivities.filter(a => a.activityType === 'Tenant Improvements' && relLeadsSet.has(a.leadId) && dateFilter(a.createdAt));
    const relNeg = negotiationBoards.flatMap(n => n.sessions.filter(s => relLeadsSet.has(n.leadId) && dateFilter(s.date))).length;

    // Funnel
    const uniqueViewers = new Set(relViews.map(v => v.userId)).size;
    const uniqueDownloaders = new Set(relDownloads.map(d => d.userId)).size;
    const uniqueQuoters = new Set(relQuotes.map(q => q.customerId)).size;
    const uniqueActive = new Set(relTI.map(a => registeredLeads.find(l => l.id === a.leadId)?.customerId).filter(Boolean)).size;

    // Top lists
    const topLocations = groupAndSort(relViews, v => listings.find(l => l.listingId === v.listingId)?.location?.split(',')[0]?.trim());
    const topDevelopers = groupAndSort(relViews, v => { const l = listings.find(x => x.listingId === v.listingId); return l ? Object.values(users).find(u => u.email === l.developerId)?.companyName : undefined; });

    // Customer leaderboard
    const customerScores: Record<string, { company: string; views: number; downloads: number; demands: number }> = {};
    Object.values(users).filter(u => u.role === 'User' && companyEmails.has(u.email)).forEach(u => {
      if (!customerScores[u.companyName]) customerScores[u.companyName] = { company: u.companyName, views: 0, downloads: 0, demands: 0 };
    });
    relViews.forEach(v => { const u = users[v.userId]; if (u && customerScores[u.companyName]) customerScores[u.companyName].views++; });
    relDownloads.forEach(d => { const u = users[d.userId]; if (u && customerScores[u.companyName]) customerScores[u.companyName].downloads++; });
    relDemands.forEach(d => { const u = Object.values(users).find(u => u.email === d.userEmail); if (u && customerScores[u.companyName]) customerScores[u.companyName].demands++; });
    const leaderboard = Object.values(customerScores)
      .map(c => ({ ...c, score: c.views * 1 + c.downloads * 3 + c.demands * 5 }))
      .sort((a,b) => b.score - a.score).slice(0, 8);

    // Activity feed
    const activities = [
      ...relViews.map(item => ({ type: 'View' as const, subject: listings.find(l => l.listingId === item.listingId)?.name || item.listingId, timestamp: new Date(item.timestamp).toISOString(), link: `/listings/${item.listingId}`, userName: users[item.userId]?.userName || item.companyName })),
      ...relDownloads.map(item => ({ type: 'Download' as const, subject: 'Downloaded listing ' + item.listingId, timestamp: new Date(item.timestamp).toISOString(), link: `/listings/${item.listingId}`, userName: users[item.userId]?.userName || item.companyName })),
      ...relQuotes.map(item => ({ type: 'Quote Request' as const, subject: item.requirementsSummary, timestamp: item.registeredAt, link: `/dashboard/leads/${item.id}`, userName: item.leadContact })),
      ...relDemands.map(item => ({ type: 'New Demand' as const, subject: item.demandId, timestamp: item.createdAt!, link: `/dashboard?editDemandId=${item.demandId}`, userName: item.userName })),
      ...relLayouts.map(item => ({ type: 'Layout Request' as const, subject: item.listingName, timestamp: item.requestedAt, link: `/listings/${item.listingId}`, userName: item.userName })),
      ...relTI.map(item => ({ type: 'Tenant Improvements' as const, subject: `Update for Lead ${item.leadId}`, timestamp: item.createdAt, link: `/dashboard/leads/${item.leadId}?tab=improvements`, userName: registeredLeads.find(l => l.id === item.leadId)?.leadContact || 'N/A' })),
      ...negotiationBoards.filter(n => relLeadsSet.has(n.leadId)).flatMap(n => n.sessions.filter(s => dateFilter(s.date)).map(s => ({ type: 'Negotiation Board Update' as const, subject: `Session for Lead ${n.leadId}`, timestamp: s.date, link: `/dashboard/leads/${n.leadId}?tab=negotiation-board`, userName: registeredLeads.find(l => l.id === n.leadId)?.leadContact || 'N/A' }))),
    ].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      totalViews: relViews.length, totalDownloads: relDownloads.length, totalDemands: relDemands.length,
      totalQuotes: relQuotes.length, totalLayouts: relLayouts.length, totalTI: relTI.length, totalNeg: relNeg,
      totalCustomers: companyEmails.size,
      funnel: { uniqueViewers, uniqueDownloaders, uniqueQuoters, uniqueActive },
      topLocations, topDevelopers, leaderboard, activities,
    };
  }, [selectedCompany, dateRange, demands, viewHistory, downloadHistory, listings, users, registeredLeads, layoutRequests, transactionActivities, negotiationBoards, isLoading]);

  if (!hasAccess) return null;

  if (isLoading || !data) return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <Skeleton className="h-10 w-64 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1,2].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
    </div>
  );

  const maxLocation = data.topLocations[0]?.count || 1;
  const maxDeveloper = data.topDevelopers[0]?.count || 1;
  const funnelBase = data.funnel.uniqueViewers || 1;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Customer Engagement</h2>
            <p className="text-sm text-muted-foreground mt-1">Analyse demand trends, platform usage and customer behaviour.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-52 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customer Companies</SelectItem>
                {customerCompanies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('rounded-xl justify-start text-left font-normal w-64', !dateRange && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? <>{format(dateRange.from,'LLL dd, y')} – {format(dateRange.to,'LLL dd, y')}</> : format(dateRange.from,'LLL dd, y')) : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="end">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Active Customers" value={data.totalCustomers} icon={Users} />
          <KpiCard label="Listings Viewed" value={data.totalViews} icon={Eye} />
          <KpiCard label="Listings Downloaded" value={data.totalDownloads} icon={Download} />
          <KpiCard label="Demands Raised" value={data.totalDemands} icon={List} />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Quote Requests" value={data.totalQuotes} icon={MessageCircle} />
          <KpiCard label="Layout Requests" value={data.totalLayouts} icon={FileQuestion} />
          <KpiCard label="TI Requests" value={data.totalTI} icon={HardHat} />
          <KpiCard label="Negotiation Sessions" value={data.totalNeg} icon={Notebook} />
        </div>

        {/* Engagement Funnel */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>
            <div><h3 className="font-bold text-foreground">Engagement Funnel</h3><p className="text-xs text-muted-foreground">Unique customers at each stage</p></div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <FunnelStep label="Viewed" value={data.funnel.uniqueViewers} pct={100} icon={Eye} />
            <div className="flex items-center justify-center"><ChevronRight className="h-5 w-5 text-muted-foreground hidden md:block rotate-0" /></div>
            <FunnelStep label="Downloaded" value={data.funnel.uniqueDownloaders} pct={data.funnel.uniqueViewers > 0 ? data.funnel.uniqueDownloaders/funnelBase*100 : 0} icon={Download} />
            <div className="flex items-center justify-center"><ChevronRight className="h-5 w-5 text-muted-foreground hidden md:block" /></div>
            <FunnelStep label="Quoted" value={data.funnel.uniqueQuoters} pct={data.funnel.uniqueViewers > 0 ? data.funnel.uniqueQuoters/funnelBase*100 : 0} icon={MessageCircle} />
            <div className="flex items-center justify-center"><ChevronRight className="h-5 w-5 text-muted-foreground hidden md:block" /></div>
            <FunnelStep label="Active Deal" value={data.funnel.uniqueActive} pct={data.funnel.uniqueViewers > 0 ? data.funnel.uniqueActive/funnelBase*100 : 0} icon={HardHat} isLast />
          </div>
        </div>

        {/* Top Locations + Developers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><MapPin className="h-4 w-4 text-primary" /></div>
              <div><h3 className="font-bold text-foreground">Top Viewed Locations</h3><p className="text-xs text-muted-foreground">By customer view count</p></div>
            </div>
            <div className="space-y-3">
              {data.topLocations.length > 0 ? data.topLocations.map((loc,i) => <BarRow key={loc.name} name={loc.name} count={loc.count} max={maxLocation} rank={i+1} />) : <p className="text-sm text-muted-foreground text-center py-8">No data for this period.</p>}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Building className="h-4 w-4 text-primary" /></div>
              <div><h3 className="font-bold text-foreground">Top Viewed Developers</h3><p className="text-xs text-muted-foreground">By customer view count</p></div>
            </div>
            <div className="space-y-3">
              {data.topDevelopers.length > 0 ? data.topDevelopers.map((dev,i) => <BarRow key={dev.name} name={dev.name} count={dev.count} max={maxDeveloper} rank={i+1} />) : <p className="text-sm text-muted-foreground text-center py-8">No data for this period.</p>}
            </div>
          </div>
        </div>

        {/* Leaderboard + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Star className="h-4 w-4 text-primary" /></div>
              <div><h3 className="font-bold text-foreground">Customer Leaderboard</h3><p className="text-xs text-muted-foreground">Score: views×1 + downloads×3 + demands×5</p></div>
            </div>
            {data.leaderboard.length > 0 ? data.leaderboard.map((c,i) => <LeaderRow key={c.company} rank={i+1} company={c.company} views={c.views} downloads={c.downloads} demands={c.demands} score={c.score} />) : <p className="text-sm text-muted-foreground text-center py-8">No customer activity found.</p>}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="h-4 w-4 text-primary" /></div>
                <div><h3 className="font-bold text-foreground">Activity Feed</h3><p className="text-xs text-muted-foreground">Latest customer actions</p></div>
              </div>
              <span className="text-xs text-muted-foreground">{data.activities.length} total</span>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {data.activities.slice(0, activityLimit).map((act, i) => <ActivityItem key={i} type={act.type} subject={act.subject} userName={act.userName} timestamp={act.timestamp} link={act.link} />)}
            </div>
            {data.activities.length > activityLimit && (
              <button onClick={() => setActivityLimit(l => l + 10)} className="w-full mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2">
                Show more ({data.activities.length - activityLimit} remaining)
              </button>
            )}
            {data.activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No activity for this period.</p>}
          </div>
        </div>

      </div>
    </main>
  );
}