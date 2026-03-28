const fs = require('fs');
let c = `'use client';

import * as React from 'react';
import { useData, type DownloadedByRecord, type ViewedByRecord, type ListingStatus } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ListingForm } from './listing-form';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { Eye, Download, Users, ChevronDown, Clock, MoreHorizontal, CheckCircle, XCircle, PauseCircle, X, Edit, Calendar as CalendarIcon, Building, Scaling, Check, Warehouse, Sparkles, TrendingUp, TrendingDown, Filter, FileDown, ArrowUpRight, AlertCircle, Search } from 'lucide-react';

type ProviderSummary = { [email: string]: { listingCount: number; totalSize: number } };

const KpiCard = ({ label, value, sub, icon: Icon, trend }: { label: string; value: string | number; sub?: string; icon: React.ElementType; trend?: 'up' | 'down' | 'neutral' }) => (
  <div className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4">
    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-foreground leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
    {trend && (
      <div className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg', trend === 'up' ? 'bg-green-50 text-green-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-secondary text-muted-foreground')}>
        {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
      </div>
    )}
  </div>
);

const EngagementBar = ({ views, downloads, maxViews }: { views: number; downloads: number; maxViews: number }) => {
  const viewPct = maxViews > 0 ? (views / maxViews) * 100 : 0;
  const dlPct = views > 0 ? (downloads / views) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {views} views</span>
        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {downloads} downloads</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary/40 rounded-full" style={{ width: viewPct + '%' }} />
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: Math.min(dlPct, 100) + '%' }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>View reach</span>
        <span>Conversion: {views > 0 ? ((downloads / views) * 100).toFixed(1) : 0}%</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = { approved: 'bg-green-50 text-green-700 border-green-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', rejected: 'bg-red-50 text-red-700 border-red-200', leased: 'bg-blue-50 text-blue-700 border-blue-200' };
  const labels: Record<string, string> = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected', leased: 'Leased' };
  return <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border \${map[status] || 'bg-secondary text-foreground'}\`}>{labels[status] || status}</span>;
};`;
fs.writeFileSync('/tmp/admin-part1.txt', c);
console.log('Part 1 done');
