'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, startOfDay } from 'date-fns';
import { Rss, MessageCircle, Share2, BookOpen, Calendar, Briefcase, TrendingUp, Users, Star, Award } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ── Helpers ───────────────────────────────────────────────────
function groupByDay(items: any[], dateExtractor: (item: any) => Date) {
  const counts: Record<string, number> = {};
  const days = Array.from({ length: 30 }, (_, i) => startOfDay(subDays(new Date(), i))).reverse();
  days.forEach(d => { counts[format(d, 'MMM d')] = 0; });
  items.forEach(item => {
    try {
      const date = dateExtractor(item);
      if (date >= days[0]) { const k = format(date, 'MMM d'); if (k in counts) counts[k]++; }
    } catch {}
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

// ── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: React.ElementType }) => (
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
const SH = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Icon className="h-4 w-4 text-primary" /></div>
    <div><h3 className="font-bold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{sub}</p></div>
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────
const CT = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.value} {p.name}</p>)}
    </div>
  );
  return null;
};

// ── Top Post Card ─────────────────────────────────────────────
const TopPostCard = ({ post, rank, shares, maxScore }: { post: any; rank: number; shares: number; maxScore: number }) => {
  const comments = post.comments?.length || 0;
  const score = comments * 2 + shares;
  const excerpt = post.text.replace(/<[^>]+>/g, '').substring(0, 80) + '...';
  const catConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    Learn:   { icon: BookOpen,  color: '#6141ac', bg: 'hsl(259,44%,94%)' },
    Events:  { icon: Calendar,  color: '#7C3AED', bg: '#F3EEFF' },
    Stories: { icon: Briefcase, color: '#2D6A4F', bg: '#EDFFF4' },
  };
  const cat = catConfig[post.category] || catConfig.Learn;
  const CatIcon = cat.icon;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rank===1?'bg-amber-100 text-amber-700':rank===2?'bg-slate-100 text-slate-600':rank===3?'bg-orange-50 text-orange-600':'bg-secondary text-muted-foreground'}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <Link href={'/community/'+post.id} target="_blank" className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 block">{excerpt}</Link>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: cat.color, background: cat.bg }}><CatIcon className="h-3 w-3" />{post.category}</span>
          <span className="text-xs text-muted-foreground">{comments} comments · {shares} shares</span>
        </div>
        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: maxScore > 0 ? (score/maxScore*100)+'%' : '0%' }} />
        </div>
      </div>
      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">{score}pts</span>
    </div>
  );
};

// ── Author Row ────────────────────────────────────────────────
const AuthorRow = ({ rank, name, company, posts, comments }: { rank: number; name: string; company: string; posts: number; comments: number }) => (
  <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rank===1?'bg-amber-100 text-amber-700':rank===2?'bg-slate-100 text-slate-600':rank===3?'bg-orange-50 text-orange-600':'bg-secondary text-muted-foreground'}`}>{rank}</span>
    <Avatar className="h-8 w-8 flex-shrink-0"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{name.charAt(0)}</AvatarFallback></Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
      <p className="text-xs text-muted-foreground">{company} · {posts} posts · {comments} comments</p>
    </div>
    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">{posts*5+comments}pts</span>
  </div>
);

// ── Sharer Row ────────────────────────────────────────────────
const SharerRow = ({ rank, name, company, count, max }: { rank: number; name: string; company: string; count: number; max: number }) => (
  <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rank===1?'bg-amber-100 text-amber-700':rank===2?'bg-slate-100 text-slate-600':rank===3?'bg-orange-50 text-orange-600':'bg-secondary text-muted-foreground'}`}>{rank}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
      <p className="text-xs text-muted-foreground">{company}</p>
      <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: max>0?(count/max*100)+'%':'0%' }} /></div>
    </div>
    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">{count}</span>
  </div>
);

export default function CommunityAnalyticsPage() {
  const { user: currentUser, users } = useAuth();
  const { communityPosts, isLoading, shareHistory, fetchLazy } = useData();

  // Tier 2: lazy load community collections on mount
  React.useEffect(() => {
    fetchLazy('community-posts');
    fetchLazy('share-history');
  }, [fetchLazy]);
  const router = useRouter();
  const hasAccess = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'O2O';

  React.useEffect(() => { if (!isLoading && !hasAccess) router.push('/dashboard'); }, [currentUser, hasAccess, router, isLoading]);

  const safePosts = communityPosts ?? [];
  const safeShares = shareHistory ?? [];
  const safeUsers = users ?? {};

  const stats = React.useMemo(() => {
    const totalPosts = safePosts.length;
    const totalComments = safePosts.reduce((s, p) => s + (p.comments?.length || 0), 0);
    const totalShares = safeShares.length;
    const learnPosts = safePosts.filter(p => p.category === 'Learn').length;
    const storyPosts = safePosts.filter(p => p.category === 'Stories').length;
    const eventPosts = safePosts.filter(p => p.category === 'Events').length;

    const postActivity = groupByDay(safePosts, p => new Date(p.createdAt));

    const catColors = ['hsl(259,44%,46%)', 'hsl(259,44%,30%)', 'hsl(259,44%,66%)'];
    const categoryData = [
      { name: 'Stories', value: storyPosts, fill: catColors[0] },
      { name: 'Learn', value: learnPosts, fill: catColors[1] },
      { name: 'Events', value: eventPosts, fill: catColors[2] },
    ].filter(c => c.value > 0);

    const topPosts = [...safePosts].sort((a,b) => {
      const sa = (a.comments?.length||0)*2 + safeShares.filter(s=>s.postId===a.id).length;
      const sb = (b.comments?.length||0)*2 + safeShares.filter(s=>s.postId===b.id).length;
      return sb - sa;
    }).slice(0, 5);
    const maxScore = topPosts.length > 0 ? (topPosts[0].comments?.length||0)*2 + safeShares.filter(s=>s.postId===topPosts[0].id).length : 1;

    // Top authors
    const authorMap: Record<string, { name: string; company: string; posts: number; comments: number }> = {};
    safePosts.forEach(p => {
      if (!authorMap[p.authorEmail]) authorMap[p.authorEmail] = { name: p.authorName, company: p.authorCompanyName || safeUsers[p.authorEmail]?.companyName || 'N/A', posts: 0, comments: 0 };
      authorMap[p.authorEmail].posts++;
      authorMap[p.authorEmail].comments += p.comments?.length || 0;
    });
    const topAuthors = Object.values(authorMap).sort((a,b) => (b.posts*5+b.comments) - (a.posts*5+a.comments)).slice(0,5);

    // Top sharers
    const sharerMap: Record<string, { name: string; company: string; count: number }> = {};
    safeShares.forEach(s => {
      if (!sharerMap[s.sharedByEmail]) sharerMap[s.sharedByEmail] = { name: s.sharedByName, company: safeUsers[s.sharedByEmail]?.companyName || 'N/A', count: 0 };
      sharerMap[s.sharedByEmail].count++;
    });
    const topSharers = Object.values(sharerMap).sort((a,b) => b.count - a.count).slice(0,5);
    const maxShares = topSharers[0]?.count || 1;

    return { totalPosts, totalComments, totalShares, learnPosts, storyPosts, eventPosts, postActivity, categoryData, topPosts, maxScore, topAuthors, topSharers, maxShares };
  }, [safePosts, safeShares, safeUsers]);

  if (!hasAccess) return null;

  if (isLoading) return (
    <div className="container mx-auto p-8 space-y-6">
      <Skeleton className="h-10 w-64 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Community Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor post performance, author engagement and sharing trends.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Posts" value={stats.totalPosts} icon={Rss} />
          <KpiCard label="Total Comments" value={stats.totalComments} icon={MessageCircle} />
          <KpiCard label="Total Shares" value={stats.totalShares} icon={Share2} />
          <KpiCard label="Market Stories" value={stats.storyPosts} sub="Stories category" icon={Briefcase} />
          <KpiCard label="Learn Posts" value={stats.learnPosts} sub="Learn category" icon={BookOpen} />
          <KpiCard label="Events" value={stats.eventPosts} sub="Events category" icon={Calendar} />
        </div>

        {/* Post Activity + Category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
            <SH icon={TrendingUp} title="Post Activity" sub="New posts over last 30 days" />
            <ChartContainer config={{}} className="h-[220px] w-full">
              <AreaChart data={stats.postActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} interval={4} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<CT />} />
                <Area type="monotone" dataKey="count" name="Posts" stroke="hsl(259,44%,46%)" fill="hsl(259,44%,46%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <SH icon={Rss} title="Posts by Category" sub="Content distribution" />
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                    {stats.categoryData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CT />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {stats.categoryData.map((c,i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} /><span className="text-foreground font-medium">{c.name}</span></div>
                  <span className="font-bold text-primary">{c.value} posts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <SH icon={Star} title="Top Performing Posts" sub="Ranked by comments × 2 + shares" />
          {stats.topPosts.length > 0 ? stats.topPosts.map((post,i) => (
            <TopPostCard key={post.id} post={post} rank={i+1} shares={safeShares.filter(s=>s.postId===post.id).length} maxScore={stats.maxScore} />
          )) : <p className="text-sm text-muted-foreground text-center py-8">No posts yet.</p>}
        </div>

        {/* Top Authors + Top Sharers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <SH icon={Users} title="Top Authors" sub="Most active community contributors" />
            {stats.topAuthors.length > 0 ? stats.topAuthors.map((a,i) => <AuthorRow key={a.name} rank={i+1} name={a.name} company={a.company} posts={a.posts} comments={a.comments} />) : <p className="text-sm text-muted-foreground text-center py-8">No authors yet.</p>}
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <SH icon={Share2} title="Top Sharers" sub="Users who share content most" />
            {stats.topSharers.length > 0 ? stats.topSharers.map((s,i) => <SharerRow key={s.name} rank={i+1} name={s.name} company={s.company} count={s.count} max={stats.maxShares} />) : <p className="text-sm text-muted-foreground text-center py-8">No shares recorded yet.</p>}
          </div>
        </div>

      </div>
    </main>
  );
}