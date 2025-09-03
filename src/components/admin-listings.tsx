
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useData, type DownloadedByRecord, type ViewedByRecord, type ListingStatus } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Eye, Download, Users, ChevronDown, Clock, MoreHorizontal, CheckCircle, XCircle, PauseCircle, SlidersHorizontal, Search, X } from 'lucide-react';
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


function AdminListingCard({ listing, analytics, providerName }: { listing: ListingSchema, analytics?: { views: number; downloads: number; downloadedBy?: DownloadedByRecord[], viewedBy?: ViewedByRecord[] }, providerName: string }) {
  const { updateListingStatus } = useData();
  const { toast } = useToast();

  const statusConfig = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800" },
    pending: { text: "Pending Review", className: "bg-amber-100 text-amber-800" },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800" }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };

  const handleStatusChange = (newStatus: ListingStatus) => {
    updateListingStatus(listing.listingId, newStatus);
    toast({
      title: 'Listing Status Updated',
      description: `Listing "${listing.name}" has been set to ${newStatus}.`,
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
              <CardTitle>
                <Link href={`/listings/${listing.listingId}`} className="hover:underline" target="_blank">
                  {listing.name}
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
                <DropdownMenuLabel>Manage Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('rejected')}>
                  <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  <PauseCircle className="mr-2 h-4 w-4 text-amber-500" /> Set to Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="mt-2">
           <Badge className={status.className}>{status.text}</Badge>
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

export function AdminListings() {
  const { listings, listingAnalytics } = useData();
  const { users } = useAuth();
  
  const [filteredListings, setFilteredListings] = React.useState<ListingSchema[]>([]);
  const [locationFilter, setLocationFilter] = React.useState('');
  const [developerFilter, setDeveloperFilter] = React.useState('all');
  const [availabilityFilter, setAvailabilityFilter] = React.useState('all');
  const [sizeRange, setSizeRange] = React.useState([0, 1000000]);

  const allDevelopers = React.useMemo(() => {
    const developerIds = new Set(listings.map(l => l.developerId));
    return Object.values(users).filter(u => developerIds.has(u.email));
  }, [listings, users]);

  const maxSliderSize = React.useMemo(() => {
    const max = Math.max(...listings.map(w => w.sizeSqFt), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
  }, [listings]);

  React.useEffect(() => {
     let results = [...listings];

     if (locationFilter) {
       results = results.filter(l => l.location.toLowerCase().includes(locationFilter.toLowerCase()));
     }

     if (developerFilter !== 'all') {
       results = results.filter(l => l.developerId === developerFilter);
     }
     
     if (availabilityFilter !== 'all') {
       results = results.filter(l => l.availabilityDate === availabilityFilter);
     }

     results = results.filter(l => l.sizeSqFt >= sizeRange[0] && l.sizeSqFt <= sizeRange[1]);

     setFilteredListings(results);

  }, [listings, locationFilter, developerFilter, availabilityFilter, sizeRange]);

  const getProviderName = (developerId: string) => {
    const provider = Object.values(users).find(u => u.email === developerId);
    return provider?.companyName || 'Unknown Provider';
  };
  
  const resetFilters = () => {
    setLocationFilter('');
    setDeveloperFilter('all');
    setAvailabilityFilter('all');
    setSizeRange([0, maxSliderSize]);
  }

  return (
      <div className="mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline tracking-tight">All Listings &amp; Performance</h2>
          <p className="text-muted-foreground mt-2">
            Filter and analyze all listings on the platform. Use the actions menu on each card to approve or reject them.
          </p>
        </div>
        
         <Card className="mb-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                        placeholder="Search by city or area..."
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
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
                <div className="lg:col-span-2 flex justify-end">
                    <Button onClick={resetFilters} variant="ghost" className="w-full lg:w-auto">
                        <X className="mr-2 h-4 w-4" /> Reset Filters
                    </Button>
                </div>
            </div>
        </Card>


        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => {
              const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
              const providerName = getProviderName(listing.developerId);
              return <AdminListingCard key={listing.listingId} listing={listing} analytics={analytics} providerName={providerName} />;
            })}
          </div>
        ) : (
          <Card className="text-center p-12">
              <CardTitle>No Listings Match Your Filters</CardTitle>
              <CardDescription className="mt-2">Try adjusting or resetting your search criteria.</CardDescription>
          </Card>
        )}
      </div>
  );
}
