'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Building2, Users, Download, Eye, TrendingUp, DollarSign,
  MessageSquare, Zap, ArrowUpRight, Activity, MapPin,
  ShieldCheck, Crown, FileText, BarChart2
} from 'lucide-react';

const COLORS = ['#6141ac', '#8b68d4', '#ede9fb', '#3C3489', '#9b7ee0', '#c5b8e8'];

const KPI = ({ label, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-card rounded-2xl border border-border p-5">
    <div className="flex items-start justify-between">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <ArrowUpRight className="h-3 w-3" />{Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-black text-foreground mt-3">{value}</p>
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const SectionTitle = ({ children }: any) => (
  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
    <div className="h-1 w-4 bg-primary rounded-full" />{children}
  </h3>
);

function groupByDay(items: any[], getDate: (i: any) => Date, days = 30) {
  const counts: Record<string, number> = {};
  eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() })
    .forEach(d => { counts[format(d, 'MMM d')] = 0; });
  items.forEach(i => {
    try {
      const d = getDate(i);
      const k = format(d, 'MMM d');
      if (k in counts) counts[k]++;
    } catch {}
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export default function AnalyticsHubPage() {
  const { user, users } = useAuth();
  const { listings, listingAnalytics, demands, registeredLeads, downloadHistory, communityPosts } = useData();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.role !== 'SuperAdmin' && user.role !== 'O2O') router.push('/dashboard');
  }, [user, router]);

  const allUsers = React.useMemo(() => Object.values(users || {}), [users]);
  const todayStart = startOfDay(new Date()).getTime();

  // ── Overview KPIs ──
  const totalListings = listings.length;
  const approvedListings = listings.filter(l => l.status === 'approved').length;
  const totalViews = (listingAnalytics || []).reduce((s, a) => s + (a.views || 0), 0);
  const totalDownloads = (listingAnalytics || []).reduce((s, a) => s + (a.downloads || 0), 0);
  const totalLeads = registeredLeads.length;
  const totalDemands = demands.length;
  const totalUsers = allUsers.length;
  const customers = allUsers.filter((u: any) => u.role === 'User').length;
  const developers = allUsers.filter((u: any) => u.role === 'Warehouse Developer').length;

  // ── Conversion Funnel ──
  const funnel = [
    { stage: 'Listings Live', value: approvedListings, color: '#6141ac' },
    { stage: 'Total Views', value: totalViews, color: '#8b68d4' },
    { stage: 'Downloads', value: totalDownloads, color: '#9b7ee0' },
    { stage: 'Leads Created', value: totalLeads, color: '#3C3489' },
  ];

  // ── Industry breakdown from downloads ──
  const industryMap: Record<string, number> = {};
  (listingAnalytics || []).forEach(a => {
    (a.downloadedBy || []).forEach((d: any) => {
      if (d.industryType) industryMap[d.industryType] = (industryMap[d.industryType] || 0) + 1;
    });
  });
  const industryData = Object.entries(industryMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

  // ── Location breakdown ──
  const locationMap: Record<string, number> = {};
  (downloadHistory || []).forEach(d => {
    if (d.location) locationMap[d.location] = (locationMap[d.location] || 0) + 1;
  });
  const locationData = Object.entries(locationMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  // ── User growth chart ──
  const userGrowth = groupByDay((allUsers || []) as any[], (u: any) => new Date(u.createdAt || Date.now()));
  const downloadTrend = groupByDay(downloadHistory || [], d => new Date(d.timestamp));
  const leadTrend = groupByDay(registeredLeads || [], l => new Date(l.registeredAt));

  // ── Top listings ──
  const topListings = [...(listingAnalytics || [])]
    .sort((a, b) => (b.downloads + b.views) - (a.downloads + a.views))
    .slice(0, 5)
    .map(a => ({
      ...a,
      listing: listings.find(l => l.listingId === a.listingId),
    }));

  // ── Revenue pipeline ──
  const todayDownloads = (downloadHistory || []).filter(d => d.timestamp >= todayStart).length;
  const totalSqFt = (listings || []).filter(l => l.status === 'approved').reduce((s, l) => s + (l.sizeSqFt || 0), 0);

  if (!user) return null;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Hub</h2>
          <p className="text-muted-foreground mt-1">Comprehensive platform performance — all data in one place.</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-6 rounded-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="prospects">Prospects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="predictive">AI Insights</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Active Listings" value={approvedListings} sub={totalListings + ' total'} icon={Building2} />
              <KPI label="Total Views" value={totalViews.toLocaleString()} sub="All time" icon={Eye} />
              <KPI label="Total Downloads" value={totalDownloads.toLocaleString()} sub="All time" icon={Download} />
              <KPI label="Active Leads" value={totalLeads} sub="Registered transactions" icon={TrendingUp} />
              <KPI label="Platform Users" value={totalUsers} sub={customers + ' customers · ' + developers + ' developers'} icon={Users} />
              <KPI label="Active Demands" value={totalDemands} sub="Customer requirements" icon={FileText} />
              <KPI label="Total Area" value={(totalSqFt/1000000).toFixed(1) + 'M'} sub="sq ft available" icon={Building2} />
              <KPI label="Downloads Today" value={todayDownloads} sub="Across all listings" icon={Activity} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Conversion Funnel</SectionTitle>
                <div className="space-y-3">
                  {funnel.map((f, i) => (
                    <div key={f.stage}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-foreground">{f.stage}</span>
                        <span className="font-bold text-primary">{f.value.toLocaleString()}</span>
                      </div>
                      <div className="h-6 bg-secondary rounded-lg overflow-hidden">
                        <div className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
                          style={{ width: funnel[0].value > 0 ? Math.max(5, (f.value/funnel[0].value)*100)+'%' : '5%', background: f.color }}>
                          <span className="text-white text-xs font-bold">
                            {i > 0 && funnel[i-1].value > 0 ? ((f.value/funnel[i-1].value)*100).toFixed(0)+'%' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Download Trend (30 days)</SectionTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={downloadTrend}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#6141ac" fill="#ede9fb" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <SectionTitle>Top Performing Listings</SectionTitle>
              <div className="space-y-3">
                {topListings.map((a, i) => (
                  <div key={a.listingId} className="flex items-center gap-3">
                    <span className="text-xs font-black text-primary w-5">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{a.listing?.name || a.listingId}</p>
                      <p className="text-xs text-muted-foreground">{a.listing?.location} · {a.listing?.sizeSqFt?.toLocaleString()} sq ft</p>
                    </div>
                    <div className="text-right flex-shrink-0 text-xs">
                      <p className="font-bold text-primary">{a.views} views</p>
                      <p className="text-muted-foreground">{a.downloads} downloads</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── LISTINGS ── */}
          <TabsContent value="listings" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Total Listings" value={totalListings} icon={Building2} />
              <KPI label="Approved" value={approvedListings} icon={ShieldCheck} />
              <KPI label="Pending Review" value={listings.filter(l=>l.status==='pending').length} icon={Activity} />
              <KPI label="Leased" value={listings.filter(l=>l.status==='leased').length} icon={Crown} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Downloads by Location</SectionTitle>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={locationData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6141ac" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>All Listings Performance</SectionTitle>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {topListings.map(a => (
                    <div key={a.listingId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{a.listingId}</p>
                        <p className="text-xs text-muted-foreground">{a.listing?.location}</p>
                      </div>
                      <div className="flex gap-3 text-xs flex-shrink-0">
                        <span className="text-primary font-bold">{a.views} 👁</span>
                        <span className="text-primary font-bold">{a.downloads} ⬇</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── PROSPECTS ── */}
          <TabsContent value="prospects" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Total Downloads" value={totalDownloads} icon={Download} />
              <KPI label="Unique Prospects" value={new Set(downloadHistory.map(d=>d.userId)).size} icon={Users} />
              <KPI label="Leads Created" value={totalLeads} icon={TrendingUp} />
              <KPI label="Active Demands" value={totalDemands} icon={FileText} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Prospects by Industry</SectionTitle>
                {industryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={industryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => name.split(' ')[0] + ' ' + (percent*100).toFixed(0)+'%'} labelLine={false} fontSize={10}>
                        {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No prospect data yet</p>}
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Lead Creation Trend (30 days)</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={leadTrend}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3C3489" fill="#ede9fb" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Total Users" value={totalUsers} icon={Users} />
              <KPI label="Customers" value={customers} icon={Users} />
              <KPI label="Developers" value={developers} icon={Building2} />
              <KPI label="Agents" value={allUsers.filter((u:any)=>u.role==='Agent').length} icon={Crown} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>User Growth (30 days)</SectionTitle>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={userGrowth}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#6141ac" fill="#ede9fb" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>User Distribution</SectionTitle>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Customers', value: customers },
                      { name: 'Developers', value: developers },
                      { name: 'Agents', value: allUsers.filter((u:any)=>u.role==='Agent').length },
                      { name: 'O2O Team', value: allUsers.filter((u:any)=>u.role==='O2O'||u.role==='SuperAdmin').length },
                    ]} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => name + ' ' + (percent*100).toFixed(0)+'%'} labelLine={false} fontSize={10}>
                      {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <SectionTitle>Recent User Registrations</SectionTitle>
              <div className="space-y-2">
                {[...allUsers].sort((a:any,b:any) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()).slice(0,8).map((u:any) => (
                  <div key={u.email} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                      {u.userName?.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">{u.userName}</p>
                      <p className="text-xs text-muted-foreground">{u.companyName} · {u.email}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs font-bold text-primary">{u.role === 'Warehouse Developer' ? 'Developer' : u.role === 'User' ? 'Customer' : u.role}</span>
                      <p className="text-xs text-muted-foreground">{u.createdAt ? format(new Date(u.createdAt), 'dd MMM') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── COMMUNITY ── */}
          <TabsContent value="community" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Total Posts" value={communityPosts.length} icon={MessageSquare} />
              <KPI label="Total Comments" value={communityPosts.reduce((s,p:any)=>s+(p.comments?.length||0),0)} icon={MessageSquare} />
              <KPI label="Total Likes" value={communityPosts.reduce((s,p:any)=>s+(p.likes||0),0)} icon={TrendingUp} />
              <KPI label="Active Authors" value={new Set(communityPosts.map((p:any)=>p.authorId)).size} icon={Users} />
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <SectionTitle>Recent Posts</SectionTitle>
              <div className="space-y-3">
                {[...communityPosts].sort((a:any,b:any)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()).slice(0,5).map((p:any) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{p.title || p.content?.substring(0,50)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.authorName} · {p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy') : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0 text-xs">
                      <p className="font-bold text-primary">{p.likes || 0} likes</p>
                      <p className="text-muted-foreground">{p.comments?.length || 0} comments</p>
                    </div>
                  </div>
                ))}
                {communityPosts.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No community posts yet</p>}
              </div>
            </div>
          </TabsContent>

          {/* ── PREDICTIVE ── */}
          <TabsContent value="predictive" className="space-y-6 mt-6">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2">AI-Powered Demand Insights</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Leverage platform data to forecast demand hotspots, predict which listings will perform best, and identify emerging industry trends.</p>
              <a href="/dashboard/analytics/predictive" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                <Zap className="h-4 w-4" /> Open AI Insights
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Top Demand Locations</SectionTitle>
                {locationData.slice(0,5).map((l,i) => (
                  <div key={l.name} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-primary w-4">{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold truncate">{l.name}</span>
                        <span className="font-bold text-primary">{l.value}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{width: locationData[0]?.value ? (l.value/locationData[0].value*100)+'%' : '0%'}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Top Industries</SectionTitle>
                {industryData.slice(0,5).map((ind,i) => (
                  <div key={ind.name} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-primary w-4">{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold truncate">{ind.name.split(' ')[0]}</span>
                        <span className="font-bold text-primary">{ind.value}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{width: industryData[0]?.value ? (ind.value/industryData[0].value*100)+'%' : '0%'}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <SectionTitle>Platform Health</SectionTitle>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Listing Approval Rate', value: totalListings > 0 ? ((approvedListings/totalListings)*100).toFixed(0)+'%' : '0%' },
                    { label: 'View to Download Rate', value: totalViews > 0 ? ((totalDownloads/totalViews)*100).toFixed(1)+'%' : '0%' },
                    { label: 'Download to Lead Rate', value: totalDownloads > 0 ? ((totalLeads/totalDownloads)*100).toFixed(1)+'%' : '0%' },
                    { label: 'Avg Downloads/Listing', value: approvedListings > 0 ? (totalDownloads/approvedListings).toFixed(1) : '0' },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center p-2 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-black text-primary">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </main>
  );
}