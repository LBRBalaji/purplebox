const fs = require('fs');
const p1 = `'use client';

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
    <span className={\`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 \${rank === 1 ? 'bg-amber-100 text-amber-700' : rank === 2 ? 'bg-slate-100 text-slate-600' : rank === 3 ? 'bg-orange-50 text-orange-600' : 'bg-secondary text-muted-foreground'}\`}>{rank}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{company}</p>
      <p className="text-xs text-muted-foreground">{views}v · {downloads}d · {demands} demands</p>
    </div>
    <div className="flex-shrink-0">
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{score} pts</span>
    </div>
  </div>
);`;
fs.writeFileSync('/tmp/cust-part1.txt', p1);
console.log('Part 1 done');
