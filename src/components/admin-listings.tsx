
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useData, type DownloadedByRecord, type ViewedByRecord, type ListingStatus, type LocationCircle } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Eye, Download, Users, ChevronDown, Clock, MoreHorizontal, CheckCircle, XCircle, PauseCircle, SlidersHorizontal, Search, X, Edit, Calendar as CalendarIcon, AlertTriangle, Building, Scaling, Circle, Check, Warehouse, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useAuth } from '@/contexts/auth-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { ListingForm } from './listing-form';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type ProviderSummary = {
  [email: string]: {
    listingCount: number;
    totalSize: number;
  };
};

function FilterStatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium">{title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    );
}

function AdminListingCard({ listing, analytics, providerName, onStatusChange, onEdit }: { listing: ListingSchema, analytics?: { views: number; downloads: number; downloadedBy?: DownloadedByRecord[], viewedBy?: ViewedByRecord[] }, providerName: string, onStatusChange: (status: ListingStatus) => void, onEdit: (listing: ListingSchema, intent?: 'approve') => void }) {
  const { toast } = useToast();

  const statusConfig = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800" },
    pending: { text: "Pending Review", className: "bg-amber-100 text-amber-800" },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800" },
    leased: { text: "Leased", className: "bg-blue-100 text-blue-800" }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };

  const handleApproveClick = () => {
    if (!listing.locationCircle) {
      toast({
        variant: 'destructive',
        title: 'Action Required',
        description: 'Please assign a Location Circle before approving this listing.',
      });
      onEdit(listing, 'approve'); // Open the edit form with intent to approve
      return;
    }
    onStatusChange('approved');
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
              <CardTitle>
                <Link href={`/listings/${listing.listingId}`} className="hover:underline" target="_blank">
                  {listing.listingId}
                </Link>
              </CardTitle>
              <CardDescription>{listing.location} - {providerName}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                 <DropdownMenuItem onClick={() => onEdit(listing)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Listing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Manage Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleApproveClick}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('rejected')}>
                  <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('pending')}>
                  <PauseCircle className="mr-2 h-4 w-4 text-amber-500" /> Set to Pending
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onStatusChange('leased')}>
                  <PauseCircle className="mr-2 h-4 w-4 text-blue-500" /> Mark as Leased
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="mt-2 flex gap-2">
           <Badge className={status.className}>{status.text}</Badge>
           {listing.plan === 'Paid_Premium' && (
             <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Sparkles className="mr-1.5 h-3 w-3"/>
                Premium Listing
             </Badge>
           )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4 text-primary" />
                <span>{analytics?.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Download className="h-4 w-4 text-primary" />
                <span>{analytics?.downloads || 0} downloads</span>
            </div>
        </div>
        {analytics?.viewedBy && analytics.viewedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-medium text-primary py-2 px-3 bg-primary/5 rounded-md hover:bg-primary/10">
              <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> Viewed By ({analytics.viewedBy.length})</span>
              <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-3 space-y-2">
                {analytics.viewedBy.map((viewer, index) => (
                    <div key={index} className="text-xs p-2 bg-secondary rounded-md">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="font-semibold text-sm">{viewer.name}</p>
                              <p className="text-muted-foreground">{viewer.company}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>Viewed: {new Date(viewer.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        {analytics?.downloadedBy && analytics.downloadedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-medium text-primary py-2 px-3 bg-primary/5 rounded-md hover:bg-primary/10">
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Downloaded By ({analytics.downloadedBy.length})</span>
              <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <TooltipProvider>
              <div className="pt-3 space-y-2">
                {analytics.downloadedBy.map((customer, index) => {
                  const downloadCount = customer.timestamps.length;
                  const lastDownload = Math.max(...customer.timestamps);
                  return (
                    <div key={index} className="text-xs p-2 bg-secondary rounded-md">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="font-semibold text-sm">{customer.name}</p>
                              <p className="text-muted-foreground">{customer.company}</p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">
                                {downloadCount} Download{downloadCount > 1 ? 's' : ''}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="p-1">
                                <p className="font-bold mb-2">Download History:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {customer.timestamps
                                    .sort((a, b) => b - a) // Sort descending
                                    .map((ts, i) => (
                                      <li key={i}>{new Date(ts).toLocaleString()}</li>
                                  ))}
                                </ul>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>Last: {new Date(lastDownload).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

function ProviderSummaryTable({ allDevelopers, providerSummary }: { allDevelopers: any[], providerSummary: ProviderSummary }) {
    const totalActiveListings = React.useMemo(() => {
        return Object.values(providerSummary).reduce((sum, current) => sum + current.listingCount, 0);
    }, [providerSummary]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Provider Supply Summary</CardTitle>
                <CardDescription>
                    An overview of active listings from {allDevelopers.length} developers, totaling {totalActiveListings} active properties.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Developer Company</TableHead>
                            <TableHead className="text-right">Active Listings</TableHead>
                            <TableHead className="text-right">Total Size (Sq. Ft.)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allDevelopers.map(dev => {
                            const summary = providerSummary[dev.email];
                            return (
                                <TableRow key={dev.email}>
                                    <TableCell className="font-medium">{dev.companyName}</TableCell>
                                    <TableCell className="text-right">{summary?.listingCount || 0}</TableCell>
                                    <TableCell className="text-right">{summary?.totalSize.toLocaleString() || 0}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export function AdminListings() {
  const { listings, listingAnalytics, updateListing, updateListingStatus, locationCircles } = useData();
  const { users } = useAuth();
  const { toast } = useToast();
  
  const [filteredListings, setFilteredListings] = React.useState<ListingSchema[]>([]);
  const [keywordFilter, setKeywordFilter] = React.useState('');
  const [developerFilter, setDeveloperFilter] = React.useState('all');
  const [circleFilter, setCircleFilter] = React.useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = React.useState('all');
  const [sizeRange, setSizeRange] = React.useState([0, 1000000]);
  const [premiumOnly, setPremiumOnly] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);
  const [editIntent, setEditIntent] = React.useState<'approve' | undefined>(undefined);
  const [providerSummary, setProviderSummary] = React.useState<ProviderSummary>({});
  const [openCirclePopover, setOpenCirclePopover] = React.useState(false);

  const allDevelopers = React.useMemo(() => {
    return Object.values(users).filter(u => u.role === 'Warehouse Developer');
  }, [users]);
  
  React.useEffect(() => {
    async function fetchProviderSummary() {
      try {
        const response = await fetch('/api/provider-summary');
        if (response.ok) {
          const data = await response.json();
          setProviderSummary(data);
        }
      } catch (error) {
        console.error("Failed to fetch provider summary:", error);
      }
    }
    fetchProviderSummary();
  }, [users]);


  const maxSliderSize = React.useMemo(() => {
    const max = Math.max(...listings.map(w => w.sizeSqFt), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
  }, [listings]);

  React.useEffect(() => {
     let results = [...listings];

     if (premiumOnly) {
         results = results.filter(l => l.plan === 'Paid_Premium');
     }

     if (keywordFilter) {
       const lowerCaseFilter = keywordFilter.toLowerCase();
       results = results.filter(l => 
          l.location.toLowerCase().includes(lowerCaseFilter) ||
          l.listingId.toLowerCase().includes(lowerCaseFilter)
        );
     }

     if (developerFilter !== 'all') {
       results = results.filter(l => l.developerId === developerFilter);
     }

     if (circleFilter.length > 0) {
       const circleSet = new Set(circleFilter);
       results = results.filter(l => l.locationCircle && circleSet.has(l.locationCircle));
     }
     
     if (availabilityFilter !== 'all') {
       results = results.filter(l => l.availabilityDate === availabilityFilter);
     }

     results = results.filter(l => l.sizeSqFt >= sizeRange[0] && l.sizeSqFt <= sizeRange[1]);

     setFilteredListings(results);

  }, [listings, keywordFilter, developerFilter, circleFilter, availabilityFilter, sizeRange, premiumOnly]);
  
  const filteredStats = React.useMemo(() => {
    const premiumListings = filteredListings.filter(l => l.plan === 'Paid_Premium');
    const nonPremiumListings = filteredListings.filter(l => l.plan !== 'Paid_Premium');
    
    return {
        total: {
            listingCount: filteredListings.length,
            developerCount: new Set(filteredListings.map(l => l.developerId)).size,
            totalSize: filteredListings.reduce((acc, l) => acc + l.sizeSqFt, 0).toLocaleString(),
        },
        premium: {
            listingCount: premiumListings.length,
            developerCount: new Set(premiumListings.map(l => l.developerId)).size,
            totalSize: premiumListings.reduce((acc, l) => acc + l.sizeSqFt, 0).toLocaleString(),
        },
        nonPremium: {
            listingCount: nonPremiumListings.length,
            developerCount: new Set(nonPremiumListings.map(l => l.developerId)).size,
            totalSize: nonPremiumListings.reduce((acc, l) => acc + l.sizeSqFt, 0).toLocaleString(),
        }
    };
  }, [filteredListings]);

  const getProviderName = (developerId: string) => {
    const provider = Object.values(users).find(u => u.email === developerId);
    return provider?.companyName || 'Unknown Provider';
  };
  
  const resetFilters = () => {
    setKeywordFilter('');
    setDeveloperFilter('all');
    setCircleFilter([]);
    setAvailabilityFilter('all');
    setSizeRange([0, maxSliderSize]);
    setPremiumOnly(false);
    setDateRange({ from: subDays(new Date(), 29), to: new Date() });
  }

  const handleEdit = (listing: ListingSchema, intent?: 'approve') => {
    setSelectedListing(listing);
    setEditIntent(intent);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ListingSchema) => {
    if (data.isAdmin && editIntent === 'approve' && data.locationCircle) {
      data.status = 'approved';
      toast({
        title: 'Listing Approved',
        description: `Listing "${data.listingId}" has been assigned a circle and approved.`
      });
    } else {
        toast({
            title: selectedListing ? "Listing Updated" : "Listing Submitted",
            description: `Your listing for "${data.listingId}" has been saved.`
        });
    }

    if (selectedListing) {
      updateListing(data);
    }
    
    setIsFormOpen(false);
    setSelectedListing(null);
    setEditIntent(undefined);
  };

  const handleStatusChange = (listingId: string, status: ListingStatus) => {
    updateListingStatus(listingId, status);
    toast({
      title: 'Listing Status Updated',
      description: `Listing "${listingId}" has been set to ${status}.`,
    });
  }
  
  const handleDownloadReport = () => {
    const from = dateRange?.from;
    const to = dateRange?.to;

    if (!from || !to) {
        alert("Please select a valid date range.");
        return;
    }
    
    // Create location-based averages first
    const locationStats: Record<string, { totalViews: number; totalDownloads: number; count: number }> = {};
    listings.forEach(listing => {
        const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
        if(!analytics) return;

        const locationKey = listing.location.split(',')[0].trim();
        if (!locationStats[locationKey]) {
            locationStats[locationKey] = { totalViews: 0, totalDownloads: 0, count: 0 };
        }
        locationStats[locationKey].totalViews += analytics.views;
        locationStats[locationKey].totalDownloads += analytics.downloads;
        locationStats[locationKey].count++;
    });

    const locationAverages: Record<string, { avgViews: number; avgDownloads: number }> = {};
    for (const loc in locationStats) {
        locationAverages[loc] = {
            avgViews: locationStats[loc].totalViews / locationStats[loc].count,
            avgDownloads: locationStats[loc].totalDownloads / locationStats[loc].count,
        };
    }


    const reportData = filteredListings.map(listing => {
        const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);

        const viewsInPeriod = analytics?.viewedBy?.filter(v => new Date(v.timestamp) >= from && new Date(v.timestamp) <= to) || [];
        const downloadsInPeriod = analytics?.downloadedBy?.flatMap(d => d.timestamps.filter(ts => ts >= from && new Date(ts) <= to)) || [];

        const viewCount = viewsInPeriod.length;
        const downloadCount = downloadsInPeriod.length;
        const conversionRate = viewCount > 0 ? ((downloadCount / viewCount) * 100).toFixed(2) + '%' : '0.00%';
        
        const daysOnMarket = listing.createdAt ? Math.ceil((new Date().getTime() - new Date(listing.createdAt).getTime()) / (1000 * 3600 * 24)) : 'N/A';
        
        const locationKey = listing.location.split(',')[0].trim();
        const locAvg = locationAverages[locationKey];
        const viewPerformance = locAvg && locAvg.avgViews > 0 ? ((viewCount / locAvg.avgViews) * 100).toFixed(0) + '%' : 'N/A';

        const topViewer = viewsInPeriod.reduce((acc, v) => {
            acc[v.company] = (acc[v.company] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const mostEngagedCompany = Object.keys(topViewer).sort((a, b) => topViewer[b] - topViewer[a])[0] || 'N/A';

        return {
            'Listing ID': listing.listingId,
            'Name': listing.name,
            'Location': listing.location,
            'Developer': getProviderName(listing.developerId),
            'Status': listing.status,
            'Days on Market': daysOnMarket,
            'Views (Period)': viewCount,
            'Downloads (Period)': downloadCount,
            'View-to-Download Rate': conversionRate,
            'Most Engaged Company (Views)': mostEngagedCompany,
            'Performance vs. Location Avg (Views)': viewPerformance
        };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Listings Performance');
    XLSX.writeFile(workbook, `LBR_O2O_Performance_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <>
      <div className="mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline tracking-tight">Listings Performance Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Filter and analyze all listings on the platform. Use the actions menu on each card to approve or reject them.
          </p>
        </div>

        <Tabs defaultValue="all-listings">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="all-listings">All Listings</TabsTrigger>
                <TabsTrigger value="provider-summary">Provider Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="all-listings">
                 <Card className="mb-8 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location or Listing ID</label>
                            <Input 
                                placeholder="Search by city, area, or ID..."
                                value={keywordFilter}
                                onChange={e => setKeywordFilter(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Developer</label>
                            <Select value={developerFilter} onValueChange={setDeveloperFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Developers</SelectItem>
                                    {allDevelopers.map(dev => (
                                        <SelectItem key={dev.email} value={dev.email}>
                                            {dev.companyName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Location Circle</label>
                            <Popover open={openCirclePopover} onOpenChange={setOpenCirclePopover}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        {circleFilter.length > 0 ? (
                                            <div className="flex gap-1 flex-wrap">
                                                {circleFilter.slice(0, 2).map(circle => (
                                                    <Badge variant="secondary" key={circle}>{circle}</Badge>
                                                ))}
                                                {circleFilter.length > 2 && <Badge variant="secondary">+{circleFilter.length - 2}</Badge>}
                                            </div>
                                        ) : "Select circles..."}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search circles..." />
                                        <CommandList>
                                            <CommandEmpty>No circles found.</CommandEmpty>
                                            <CommandGroup>
                                                {locationCircles.map((circle) => (
                                                    <CommandItem
                                                        key={circle.name}
                                                        value={circle.name}
                                                        onSelect={() => {
                                                            setCircleFilter(prev => 
                                                                prev.includes(circle.name)
                                                                ? prev.filter(c => c !== circle.name)
                                                                : [...prev, circle.name]
                                                            )
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", circleFilter.includes(circle.name) ? "opacity-100" : "opacity-0")} />
                                                        <span>{circle.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Availability</label>
                            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
                                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                                    <SelectItem value="Available in 3 months">Available in 3 months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Size (sq. ft.) - {sizeRange[0].toLocaleString()} to {sizeRange[1].toLocaleString()}</label>
                            <Slider
                                min={0}
                                max={maxSliderSize}
                                step={10000}
                                value={sizeRange}
                                onValueChange={newRange => setSizeRange(newRange as [number, number])}
                            />
                        </div>
                         <div className="lg:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Date Range (for engagement stats)</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!dateRange && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/>
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="flex items-center space-x-2 pt-5">
                          <Switch id="premium-filter" checked={premiumOnly} onCheckedChange={setPremiumOnly} />
                          <Label htmlFor="premium-filter">Show Premium Only</Label>
                        </div>
                        <div className="flex gap-2 items-end">
                            <Button onClick={resetFilters} variant="ghost" className="w-full">
                                <X className="mr-2 h-4 w-4" /> Reset
                            </Button>
                            <Button onClick={handleDownloadReport} className="w-full">
                                <Download className="mr-2 h-4 w-4" /> Report
                            </Button>
                        </div>
                    </div>
                </Card>

                 <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Filtered Results</CardTitle>
                        <CardDescription>A summary of the listings matching your current filters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                Premium Listings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FilterStatCard title="Listings" value={filteredStats.premium.listingCount} icon={Warehouse} />
                                <FilterStatCard title="Unique Developers" value={filteredStats.premium.developerCount} icon={Users} />
                                <FilterStatCard title="Total Size (Sq. Ft.)" value={filteredStats.premium.totalSize} icon={Scaling} />
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                             <h3 className="font-semibold flex items-center gap-2">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                Non-Premium Listings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FilterStatCard title="Listings" value={filteredStats.nonPremium.listingCount} icon={Warehouse} />
                                <FilterStatCard title="Unique Developers" value={filteredStats.nonPremium.developerCount} icon={Users} />
                                <FilterStatCard title="Total Size (Sq. Ft.)" value={filteredStats.nonPremium.totalSize} icon={Scaling} />
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map(listing => {
                    const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
                    const providerName = getProviderName(listing.developerId);
                    return <AdminListingCard key={listing.listingId} listing={listing} analytics={analytics} providerName={providerName} onStatusChange={(newStatus) => handleStatusChange(listing.listingId, newStatus)} onEdit={handleEdit} />;
                    })}
                </div>
                ) : (
                <Card className="text-center p-12">
                    <CardTitle>No Listings Match Your Filters</CardTitle>
                    <CardDescription className="mt-2">Try adjusting or resetting your search criteria.</CardDescription>
                </Card>
                )}
            </TabsContent>
            <TabsContent value="provider-summary">
                <ProviderSummaryTable allDevelopers={allDevelopers} providerSummary={providerSummary} />
            </TabsContent>
        </Tabs>
      </div>
      <ListingForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        listing={selectedListing}
        onSubmit={handleFormSubmit}
        locationCircles={locationCircles}
        initialIntent={editIntent}
      />
    </>
  );
}

    
    




    

    