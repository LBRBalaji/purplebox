'use client';

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


const RejectedListingsTab = ({ listings, onDelete }: { listings: any[], onDelete: (ids: string[]) => Promise<void> }) => {
  const rejected = listings.filter(l => l.status === 'rejected');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [confirming, setConfirming] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  const byDeveloper = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    rejected.forEach(l => {
      if (!map[l.developerId]) map[l.developerId] = [];
      map[l.developerId].push(l);
    });
    return map;
  }, [rejected]);

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rejected.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rejected.map(l => l.listingId)));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete([...selected]);
    setSelected(new Set());
    setConfirming(false);
    setIsDeleting(false);
  };

  if (rejected.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-foreground text-lg mb-1">All Clean</h3>
        <p className="text-muted-foreground text-sm">No rejected listings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="select-all" checked={selected.size === rejected.length && rejected.length > 0} onChange={toggleAll} className="h-4 w-4 accent-primary cursor-pointer" />
            <label htmlFor="select-all" className="text-sm font-semibold text-foreground cursor-pointer">Select All</label>
          </div>
          <span className="text-xs text-muted-foreground">{rejected.length} rejected listings · {selected.size} selected</span>
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" className="rounded-xl gap-2" onClick={() => setConfirming(true)}>
            <XCircle className="h-4 w-4" /> Delete Selected ({selected.size})
          </Button>
        )}
      </div>

      {confirming && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-800 text-sm mb-1">Permanently delete {selected.size} listing{selected.size > 1 ? 's' : ''}?</p>
            <p className="text-red-600 text-xs mb-4">This cannot be undone. The listings will be permanently removed from Firestore.</p>
            <div className="flex gap-3">
              <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {Object.entries(byDeveloper).map(([dev, devListings]) => (
        <div key={dev} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox"
                checked={devListings.every(l => selected.has(l.listingId))}
                onChange={() => {
                  const allSelected = devListings.every(l => selected.has(l.listingId));
                  setSelected(prev => {
                    const next = new Set(prev);
                    devListings.forEach(l => allSelected ? next.delete(l.listingId) : next.add(l.listingId));
                    return next;
                  });
                }}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <span className="text-sm font-bold text-foreground">{dev}</span>
            </div>
            <Badge variant="outline" className="text-xs">{devListings.length} listings</Badge>
          </div>
          <div className="divide-y divide-border">
            {devListings.map(l => (
              <div key={l.listingId} className="px-5 py-3 flex items-center gap-4">
                <input type="checkbox" checked={selected.has(l.listingId)} onChange={() => toggleOne(l.listingId)} className="h-4 w-4 accent-primary cursor-pointer flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-primary">{l.listingId}</span>
                    <span className="text-xs text-muted-foreground">{l.location}</span>
                    {l.name && <span className="text-xs text-foreground">{l.name}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{l.sizeSqFt?.toLocaleString()} sq ft</div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs" onClick={() => { setSelected(new Set([l.listingId])); setConfirming(true); }}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

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
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-secondary text-foreground'}`}>{labels[status] || status}</span>;
};
function AdminListingCard({ listing, analytics, providerName, maxViews, onStatusChange, onEdit }: { listing: ListingSchema; analytics?: { views: number; downloads: number; downloadedBy?: DownloadedByRecord[]; viewedBy?: ViewedByRecord[] }; providerName: string; maxViews: number; onStatusChange: (status: ListingStatus) => void; onEdit: (listing: ListingSchema, intent?: 'approve') => void }) {
  const { toast } = useToast();
  const views = analytics?.views || 0;
  const downloads = analytics?.downloads || 0;
  const handleApproveClick = () => {
    if (!listing.locationCircle) { toast({ variant: 'destructive', title: 'Action Required', description: 'Please assign a Location Circle before approving.' }); onEdit(listing, 'approve'); return; }
    onStatusChange('approved');
  };
  return (
    <div className="bg-card rounded-2xl border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/listings/${listing.listingId}`} target="_blank" className="font-bold text-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group">
              {listing.listingId} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">{listing.location} · {providerName}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusBadge status={listing.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(listing)} className="rounded-lg"><Edit className="mr-2 h-4 w-4" /> Edit Listing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleApproveClick} className="rounded-lg text-green-600"><CheckCircle className="mr-2 h-4 w-4" /> Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('rejected')} className="rounded-lg text-red-500"><XCircle className="mr-2 h-4 w-4" /> Reject</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('pending')} className="rounded-lg text-amber-600"><PauseCircle className="mr-2 h-4 w-4" /> Set Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('leased')} className="rounded-lg text-blue-500"><PauseCircle className="mr-2 h-4 w-4" /> Mark Leased</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Scaling className="h-3 w-3" /> {listing.sizeSqFt?.toLocaleString()} sqft</span>
          {listing.plan === 'Paid_Premium' && (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FDD017', color: '#333' }}><Sparkles className="h-3 w-3" /> Premium</span>)}
        </div>
      </div>
      <div className="px-5 pb-4"><EngagementBar views={views} downloads={downloads} maxViews={maxViews} /></div>
      <div className="px-5 pb-5 space-y-2 flex-1">
        {analytics?.viewedBy && analytics.viewedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-xs font-semibold text-primary py-2 px-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Viewed By ({analytics.viewedBy.length})</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 space-y-1.5">
                {analytics.viewedBy.map((viewer, i) => (
                  <div key={i} className="text-xs p-2.5 bg-secondary/50 rounded-xl">
                    <p className="font-semibold text-foreground">{viewer.name}</p>
                    <p className="text-muted-foreground">{viewer.company}</p>
                    <p className="text-muted-foreground/70 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(viewer.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        {analytics?.downloadedBy && analytics.downloadedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-xs font-semibold text-primary py-2 px-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Downloaded By ({analytics.downloadedBy.length})</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <TooltipProvider>
                <div className="pt-2 space-y-1.5">
                  {analytics.downloadedBy.map((customer, i) => {
                    const count = customer.timestamps.length;
                    const last = Math.max(...customer.timestamps);
                    return (
                      <div key={i} className="text-xs p-2.5 bg-secondary/50 rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div><p className="font-semibold text-foreground">{customer.name}</p><p className="text-muted-foreground">{customer.company}</p></div>
                          <Tooltip>
                            <TooltipTrigger asChild><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary cursor-help">{count}x</span></TooltipTrigger>
                            <TooltipContent><div className="p-1"><p className="font-bold mb-1 text-xs">Downloads:</p>{customer.timestamps.sort((a,b)=>b-a).map((ts,j)=><p key={j} className="text-xs">{new Date(ts).toLocaleString()}</p>)}</div></TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-muted-foreground/70 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />Last: {new Date(last).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

const TopListingsChart = ({ listings, analytics, label }: { listings: ListingSchema[]; analytics: any[]; label: string }) => {
  const top5 = React.useMemo(() => {
    return [...listings].map(l => ({ ...l, count: analytics.find(a => a.listingId === l.listingId)?.[label === 'Views' ? 'views' : 'downloads'] || 0 })).sort((a,b) => b.count - a.count).slice(0,5);
  }, [listings, analytics, label]);
  const max = top5[0]?.count || 1;
  return (
    <div className="space-y-3">
      {top5.map((l,i) => (
        <div key={l.listingId} className="flex items-center gap-3">
          <span className="text-xs font-black text-muted-foreground w-4">{i+1}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground truncate max-w-[160px]">{l.listingId}</span>
              <span className="text-xs font-bold text-primary">{l.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: (l.count/max*100)+'%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{l.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

function ProviderSummaryTable({ allDevelopers, providerSummary }: { allDevelopers: any[]; providerSummary: ProviderSummary }) {
  const total = Object.values(providerSummary).reduce((s,c) => s+c.listingCount, 0);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-bold text-foreground">Provider Supply Summary</h3>
        <p className="text-xs text-muted-foreground mt-1">{allDevelopers.length} developers · {total} active listings</p>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Developer</TableHead><TableHead className="text-right">Active Listings</TableHead><TableHead className="text-right">Total Size (Sq. Ft.)</TableHead><TableHead className="text-right">Share</TableHead></TableRow></TableHeader>
        <TableBody>
          {allDevelopers.sort((a,b) => (providerSummary[b.email]?.listingCount||0)-(providerSummary[a.email]?.listingCount||0)).map(dev => {
            const s = providerSummary[dev.email];
            const share = total > 0 ? ((s?.listingCount||0)/total*100).toFixed(1) : '0';
            return (
              <TableRow key={dev.email}>
                <TableCell className="font-medium">{dev.companyName}</TableCell>
                <TableCell className="text-right">{s?.listingCount||0}</TableCell>
                <TableCell className="text-right">{s?.totalSize?.toLocaleString()||0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:share+'%'}} /></div>
                    <span className="text-xs text-muted-foreground">{share}%</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
export function AdminListings() {
  const { listings, listingAnalytics, updateListing, updateListingStatus, locationCircles } = useData();
  const { users } = useAuth();
  const { toast } = useToast();
  const [filteredListings, setFilteredListings] = React.useState<ListingSchema[]>([]);
  const [keywordFilter, setKeywordFilter] = React.useState('');
  const [developerFilter, setDeveloperFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [circleFilter, setCircleFilter] = React.useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = React.useState('all');
  const [sizeRange, setSizeRange] = React.useState([0, 1000000]);
  const [premiumOnly, setPremiumOnly] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() });
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);
  const [editIntent, setEditIntent] = React.useState<'approve' | undefined>(undefined);
  const [providerSummary, setProviderSummary] = React.useState<ProviderSummary>({});
  const [openCirclePopover, setOpenCirclePopover] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const allDevelopers = React.useMemo(() => Object.values(users).filter(u => u.role === 'Warehouse Developer'), [users]);
  React.useEffect(() => { fetch('/api/provider-summary').then(r=>r.json()).then(setProviderSummary).catch(console.error); }, [users]);
  const maxSliderSize = React.useMemo(() => { const max = Math.max(...listings.map(w=>w.sizeSqFt),0); return max>0?Math.ceil(max/100000)*100000:1000000; }, [listings]);
  React.useEffect(() => {
    let results = [...listings];
    if (premiumOnly) results = results.filter(l=>l.plan==='Paid_Premium');
    if (keywordFilter) { const q=keywordFilter.toLowerCase(); results=results.filter(l=>l.location.toLowerCase().includes(q)||l.listingId.toLowerCase().includes(q)); }
    if (developerFilter!=='all') results=results.filter(l=>l.developerId===developerFilter);
    if (statusFilter!=='all') results=results.filter(l=>l.status===statusFilter);
    if (circleFilter.length>0) { const s=new Set(circleFilter); results=results.filter(l=>l.locationCircle&&s.has(l.locationCircle)); }
    if (availabilityFilter!=='all') results=results.filter(l=>l.availabilityDate===availabilityFilter);
    results=results.filter(l=>l.sizeSqFt>=sizeRange[0]&&l.sizeSqFt<=sizeRange[1]);
    setFilteredListings(results);
  }, [listings,keywordFilter,developerFilter,statusFilter,circleFilter,availabilityFilter,sizeRange,premiumOnly]);
  const kpis = React.useMemo(() => {
    const totalViews=listingAnalytics.reduce((s,a)=>s+a.views,0);
    const totalDownloads=listingAnalytics.reduce((s,a)=>s+a.downloads,0);
    const approved=listings.filter(l=>l.status==='approved').length;
    const pending=listings.filter(l=>l.status==='pending').length;
    const convRate=totalViews>0?((totalDownloads/totalViews)*100).toFixed(1)+'%':'0%';
    return {totalViews,totalDownloads,approved,pending,convRate,total:listings.length};
  }, [listings,listingAnalytics]);
  const maxViews = React.useMemo(() => Math.max(...listingAnalytics.map(a=>a.views),1), [listingAnalytics]);
  const getProviderName = (id: string) => Object.values(users).find(u=>u.email===id)?.companyName||'Unknown';
  const resetFilters = () => { setKeywordFilter('');setDeveloperFilter('all');setStatusFilter('all');setCircleFilter([]);setAvailabilityFilter('all');setSizeRange([0,maxSliderSize]);setPremiumOnly(false);setDateRange({from:subDays(new Date(),29),to:new Date()}); };
  const handleEdit = (listing: ListingSchema, intent?: 'approve') => { setSelectedListing(listing);setEditIntent(intent);setIsFormOpen(true); };
  const handleFormSubmit = (data: ListingSchema) => {
    if (data.isAdmin&&editIntent==='approve'&&data.locationCircle) { data.status='approved'; toast({title:'Listing Approved',description:`"${data.listingId}" approved.`}); }
    else { toast({title:selectedListing?'Listing Updated':'Listing Submitted',description:`"${data.listingId}" saved.`}); }
    if (selectedListing) updateListing(data);
    setIsFormOpen(false);setSelectedListing(null);setEditIntent(undefined);
  };
  const handleStatusChange = (listingId: string, status: ListingStatus) => { updateListingStatus(listingId,status); toast({title:'Status Updated',description:`"${listingId}" → ${status}`}); };
  const handleDownloadReport = () => {
    const from=dateRange?.from; const to=dateRange?.to;
    if(!from||!to){alert('Please select a valid date range.');return;}
    const locationStats: Record<string,{totalViews:number;totalDownloads:number;count:number}> = {};
    listings.forEach(listing => {
      const analytics=listingAnalytics.find(a=>a.listingId===listing.listingId); if(!analytics)return;
      const key=listing.location.split(',')[0].trim();
      if(!locationStats[key])locationStats[key]={totalViews:0,totalDownloads:0,count:0};
      locationStats[key].totalViews+=analytics.views;locationStats[key].totalDownloads+=analytics.downloads;locationStats[key].count++;
    });
    const locAvg: Record<string,{avgViews:number;avgDownloads:number}> = {};
    for(const loc in locationStats){locAvg[loc]={avgViews:locationStats[loc].totalViews/locationStats[loc].count,avgDownloads:locationStats[loc].totalDownloads/locationStats[loc].count};}
    const reportData=filteredListings.map(listing=>{
      const analytics=listingAnalytics.find(a=>a.listingId===listing.listingId);
      const viewsInPeriod=analytics?.viewedBy?.filter(v=>new Date(v.timestamp)>=from&&new Date(v.timestamp)<=to)||[];
      const downloadsInPeriod=analytics?.downloadedBy?.flatMap(d=>d.timestamps.filter(ts=>ts>=from&&new Date(ts)<=to))||[];
      const viewCount=viewsInPeriod.length;const downloadCount=downloadsInPeriod.length;
      const conversionRate=viewCount>0?((downloadCount/viewCount)*100).toFixed(2)+'%':'0.00%';
      const daysOnMarket=listing.createdAt?Math.ceil((new Date().getTime()-new Date(listing.createdAt).getTime())/(1000*3600*24)):'N/A';
      const key=listing.location.split(',')[0].trim();
      const viewPerformance=locAvg[key]&&locAvg[key].avgViews>0?((viewCount/locAvg[key].avgViews)*100).toFixed(0)+'%':'N/A';
      const topViewer=viewsInPeriod.reduce((acc,v)=>{acc[v.company]=(acc[v.company]||0)+1;return acc;},{} as Record<string,number>);
      const mostEngaged=Object.keys(topViewer).sort((a,b)=>topViewer[b]-topViewer[a])[0]||'N/A';
      return {'Listing ID':listing.listingId,'Name':listing.name,'Location':listing.location,'Developer':getProviderName(listing.developerId),'Status':listing.status,'Days on Market':daysOnMarket,'Views (Period)':viewCount,'Downloads (Period)':downloadCount,'Conversion Rate':conversionRate,'Most Engaged Company':mostEngaged,'Performance vs Avg':viewPerformance};
    });
    const ws=XLSX.utils.json_to_sheet(reportData);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Listings Performance');XLSX.writeFile(wb,`LBR_O2O_Performance_Report_${format(new Date(),'yyyy-MM-dd')}.xlsx`);
  };
  const activeFilterCount=[keywordFilter,developerFilter!=='all',statusFilter!=='all',circleFilter.length>0,availabilityFilter!=='all',premiumOnly].filter(Boolean).length;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Listings Performance</h2>
            <p className="text-sm text-muted-foreground mt-1">Monitor, manage and analyse all platform listings in real time.</p>
          </div>
          <Button onClick={handleDownloadReport} className="gap-2 rounded-xl flex-shrink-0"><FileDown className="h-4 w-4" /> Export Report</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Listings" value={kpis.total} icon={Warehouse} />
          <KpiCard label="Approved" value={kpis.approved} icon={CheckCircle} trend="up" />
          <KpiCard label="Pending Review" value={kpis.pending} icon={AlertCircle} trend={kpis.pending>0?'down':'neutral'} />
          <KpiCard label="Total Views" value={kpis.totalViews.toLocaleString()} icon={Eye} trend="up" />
          <KpiCard label="Total Downloads" value={kpis.totalDownloads.toLocaleString()} icon={Download} trend="up" />
          <KpiCard label="Conversion Rate" value={kpis.convRate} icon={TrendingUp} trend="up" />
        </div>
        <Tabs defaultValue="listings">
          <TabsList className="grid w-full grid-cols-4 rounded-xl">
            <TabsTrigger value="listings" className="rounded-lg">All Listings</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg">Top Performers</TabsTrigger>
            <TabsTrigger value="providers" className="rounded-lg">Provider Summary</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg">Rejected Listings</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="space-y-5 mt-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by location or listing ID..." value={keywordFilter} onChange={e=>setKeywordFilter(e.target.value)} className="pl-9 rounded-xl" />
              </div>
              <Button variant="outline" onClick={()=>setShowFilters(!showFilters)} className="gap-2 rounded-xl flex-shrink-0">
                <Filter className="h-4 w-4" /> Filters
                {activeFilterCount>0&&<span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </Button>
              {activeFilterCount>0&&<Button variant="ghost" onClick={resetFilters} className="gap-1 rounded-xl text-muted-foreground flex-shrink-0"><X className="h-4 w-4" /> Reset</Button>}
            </div>
            {showFilters && (
              <div className="bg-card rounded-2xl border border-border p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Developer</label>
                  <Select value={developerFilter} onValueChange={setDeveloperFilter}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Developers</SelectItem>{allDevelopers.map(dev=><SelectItem key={dev.email} value={dev.email}>{dev.companyName}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="leased">Leased</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location Circle</label>
                  <Popover open={openCirclePopover} onOpenChange={setOpenCirclePopover}>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start rounded-xl">{circleFilter.length>0?<>{circleFilter.slice(0,2).map(c=><Badge key={c} variant="secondary" className="mr-1">{c}</Badge>)}{circleFilter.length>2&&<Badge variant="secondary">+{circleFilter.length-2}</Badge>}</>:'Select circles...'}</Button></PopoverTrigger>
                    <PopoverContent className="w-56 p-0 rounded-xl"><Command><CommandInput placeholder="Search circles..." /><CommandList><CommandEmpty>No circles found.</CommandEmpty><CommandGroup>{locationCircles.map(circle=>(<CommandItem key={circle.name} value={circle.name} onSelect={()=>setCircleFilter(prev=>prev.includes(circle.name)?prev.filter(c=>c!==circle.name):[...prev,circle.name])}><Check className={cn('mr-2 h-4 w-4',circleFilter.includes(circle.name)?'opacity-100':'opacity-0')} />{circle.name}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Availability</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem><SelectItem value="Under Construction">Under Construction</SelectItem></SelectContent></Select>
                </div>
                <div className="lg:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Size: {sizeRange[0].toLocaleString()} – {sizeRange[1].toLocaleString()} sqft</label><Slider min={0} max={maxSliderSize} step={10000} value={sizeRange} onValueChange={v=>setSizeRange(v as [number,number])} /></div>
                <div className="lg:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</label>
                  <Popover><PopoverTrigger asChild><Button variant="outline" className={cn('w-full justify-start text-left font-normal rounded-xl',!dateRange&&'text-muted-foreground')}><CalendarIcon className="mr-2 h-4 w-4" />{dateRange?.from?(dateRange.to?<>{format(dateRange.from,'LLL dd, y')} – {format(dateRange.to,'LLL dd, y')}</>:format(dateRange.from,'LLL dd, y')):'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-xl" align="end"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/></PopoverContent></Popover>
                </div>
                <div className="flex items-center gap-2 pt-4"><Switch id="premium" checked={premiumOnly} onCheckedChange={setPremiumOnly} /><Label htmlFor="premium" className="text-sm">Premium Only</Label></div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{filteredListings.length} listing{filteredListings.length!==1?'s':''} {activeFilterCount>0?'matching filters':'total'}</p>
            {filteredListings.length>0?(
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredListings.map(listing=>{const analytics=listingAnalytics.find(a=>a.listingId===listing.listingId);return <AdminListingCard key={listing.listingId} listing={listing} analytics={analytics} providerName={getProviderName(listing.developerId)} maxViews={maxViews} onStatusChange={s=>handleStatusChange(listing.listingId,s)} onEdit={handleEdit} />;})}
              </div>
            ):(
              <div className="bg-card rounded-2xl border border-border p-16 text-center"><Warehouse className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><h3 className="font-semibold text-foreground mb-1">No listings match your filters</h3><p className="text-sm text-muted-foreground">Try adjusting or resetting your search criteria.</p></div>
            )}
          </TabsContent>
          <TabsContent value="insights" className="mt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-5"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Eye className="h-4 w-4 text-primary" /></div><div><h3 className="font-bold text-foreground text-sm">Top 5 by Views</h3><p className="text-xs text-muted-foreground">Most viewed listings</p></div></div>
                <TopListingsChart listings={filteredListings.length>0?filteredListings:listings} analytics={listingAnalytics} label="Views" />
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-5"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Download className="h-4 w-4 text-primary" /></div><div><h3 className="font-bold text-foreground text-sm">Top 5 by Downloads</h3><p className="text-xs text-muted-foreground">Most downloaded listings</p></div></div>
                <TopListingsChart listings={filteredListings.length>0?filteredListings:listings} analytics={listingAnalytics} label="Downloads" />
              </div>
              <div className="md:col-span-2 bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-4">Platform Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{label:'Premium Listings',value:listings.filter(l=>l.plan==='Paid_Premium').length,sub:'Active on platform',icon:Sparkles},{label:'Non-Premium',value:listings.filter(l=>l.plan!=='Paid_Premium').length,sub:'Standard listings',icon:Building},{label:'Premium Size',value:listings.filter(l=>l.plan==='Paid_Premium').reduce((s,l)=>s+l.sizeSqFt,0).toLocaleString(),sub:'Sq. ft.',icon:Scaling},{label:'Unique Developers',value:new Set(listings.map(l=>l.developerId)).size,sub:'Contributing',icon:Users}].map((item,i)=>(
                    <div key={i} className="bg-secondary/30 rounded-xl p-4"><item.icon className="h-5 w-5 text-primary mb-2" /><p className="text-xl font-black text-foreground">{item.value}</p><p className="text-xs font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="rejected" className="mt-5"><RejectedListingsTab listings={listings} onDelete={async (ids) => { const idSet = new Set(ids); const remaining = listings.filter(l => !idSet.has(l.listingId)); const res = await fetch("/api/listings", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(remaining)}); if(res.ok){ toast({title: "Deleted", description: ids.length + " listings permanently deleted."}); window.location.reload(); } else { toast({variant:"destructive", title:"Error", description:"Delete failed. Please try again."}); } }} />
          <TabsContent value="providers" className="mt-5">
            <ProviderSummaryTable allDevelopers={allDevelopers} providerSummary={providerSummary} />
          </TabsContent>
        </Tabs>
      </div>
      <ListingForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} listing={selectedListing} onSubmit={handleFormSubmit} locationCircles={locationCircles} initialIntent={editIntent} />
    </>
  );
}