
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useData, type ListingStatus } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Archive, Building, CircleCheck, ClipboardList, Edit, Eye, History, PlusCircle, Truck, ArchiveRestore, Download, Users, ChevronDown, Clock, MoreHorizontal, CheckCircle, XCircle, PauseCircle, BarChart2, Scaling, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ListingForm } from './listing-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AdminListings } from './admin-listings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns';
import { Input } from './ui/input';


function ProviderListingCard({ listing, onStatusChange, onEdit, isAdmin }: { listing: ListingSchema, onStatusChange: (status: ListingStatus) => void, onEdit: (listing: ListingSchema) => void, isAdmin: boolean }) {
  const { listingAnalytics } = useData();
  const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
  const statusConfig: Record<ListingStatus, { text: string; className: string, icon: React.ElementType }> = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800", icon: CircleCheck },
    pending: { text: "Pending", className: "bg-amber-100 text-amber-800", icon: History },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800", icon: XCircle },
    leased: { text: "Leased", className: "bg-blue-100 text-blue-800", icon: Archive }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800', icon: Eye };
  const StatusIcon = status.icon;

  const summaryStats = React.useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = startOfWeek(now).getTime();
    const monthStart = startOfMonth(now).getTime();

    const views = analytics?.viewedBy || [];
    const downloads = analytics?.downloadedBy?.flatMap(d => d.timestamps) || [];

    return {
        today: {
            views: views.filter(v => v.timestamp >= todayStart).length,
            downloads: downloads.filter(ts => ts >= todayStart).length,
        },
        week: {
            views: views.filter(v => v.timestamp >= weekStart).length,
            downloads: downloads.filter(ts => ts >= weekStart).length,
        },
        month: {
            views: views.filter(v => v.timestamp >= monthStart).length,
            downloads: downloads.filter(ts => ts >= monthStart).length,
        },
    };
  }, [analytics]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
              <CardTitle>
                <Link href={`/listings/${listing.listingId}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
                  {listing.warehouseBoxId || listing.listingId}
                </Link>
              </CardTitle>
              <CardDescription>{listing.location} - {(listing.actualSizeSqFt || listing.sizeSqFt).toLocaleString()} sq. ft.</CardDescription>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(listing)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Listing
                </DropdownMenuItem>
                {isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onStatusChange('approved')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('rejected')}>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => onStatusChange('pending')}>
                          <PauseCircle className="mr-2 h-4 w-4 text-amber-500" /> Set to Pending
                        </DropdownMenuItem>
                    </>
                )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => onStatusChange('leased')}>
                    <Archive className="mr-2 h-4 w-4" /> Mark as Leased
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="mt-2">
          <Badge className={status.className}><StatusIcon className="mr-1.5 h-3 w-3" /> {status.text}</Badge>
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

        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-medium text-primary py-2 px-3 bg-primary/5 rounded-md hover:bg-primary/10">
            <span className="flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Performance Summary</span>
            <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Downloads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Today</TableCell>
                    <TableCell className="text-center font-medium">{summaryStats.today.views}</TableCell>
                    <TableCell className="text-center font-medium">{summaryStats.today.downloads}</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>This Week</TableCell>
                    <TableCell className="text-center font-medium">{summaryStats.week.views}</TableCell>
                    <TableCell className="text-center font-medium">{summaryStats.week.downloads}</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>This Month</TableCell>
                    <TableCell className="text-center font-medium">{summaryStats.month.views}</TableCell>
                    <TableCell className="text-center font-medium">{summaryStats.month.downloads}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
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
       <CardFooter className="flex-col items-stretch gap-2">
            {listing.status === 'leased' && (
                <Button onClick={() => onStatusChange('pending')}>
                    <ArchiveRestore className="mr-2 h-4 w-4" /> Re-list Property
                </Button>
            )}
       </CardFooter>
    </Card>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) {
    return (
        <div className="bg-primary/5 p-4 rounded-lg text-center">
            <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        </div>
    )
}

export function ProviderListings() {
  const { user } = useAuth();
  const { listings, addListing, updateListing, updateListingStatus, listingAnalytics } = useData();
  const [myListings, setMyListings] = React.useState<ListingSchema[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const isAdmin = user?.role === 'SuperAdmin';
  const searchParams = useSearchParams();
  const router = useRouter();
  React.useEffect(() => {
    if (searchParams.get('createNew') === 'true') {
      setSelectedListing(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);
  
  React.useEffect(() => {
    async function fetchProviderListings() {
      if (!user?.email) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/provider-listings/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setMyListings(data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch your listings.',
          });
        }
      } catch (error) {
        console.error('Failed to fetch provider listings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if(user?.email && !isAdmin) {
        fetchProviderListings();
    } else if (isAdmin) {
        setMyListings(listings);
        setIsLoading(false);
    }
  }, [user, toast, isAdmin]);
  
  const filteredMyListings = React.useMemo(() => {
    if (!searchTerm) return myListings;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return myListings.filter(l => 
        (l.warehouseBoxId || '').toLowerCase().includes(lowerCaseSearch) ||
        (l.listingId || '').toLowerCase().includes(lowerCaseSearch) ||
        (l.location || '').toLowerCase().includes(lowerCaseSearch)
    );
  }, [myListings, searchTerm]);


  const handleStatusChange = (listingId: string, status: ListingStatus) => {
    updateListingStatus(listingId, status, user?.email);
    toast({
        title: 'Listing Status Updated',
        description: `The listing status has been changed.`,
    });
  };

  const handleConsent = async (listing: ListingSchema) => {
    await updateListing({
      ...listing,
      status: 'pending',
      consentStatus: 'consented',
      consentTimestamp: Date.now(),
    });
    toast({ title: 'Authorisation Confirmed', description: 'Thank you. Your listing has been submitted for final approval and will go live shortly.' });
  };

  const pendingConsentListings = myListings.filter((l: any) => l.status === 'pending_consent');

  const handleEdit = (listing: ListingSchema) => {
    setSelectedListing(listing);
    setIsFormOpen(true);
  }

  const handleCreateNew = () => {
    setSelectedListing(null);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (data: ListingSchema) => {
    if (selectedListing) {
      updateListing(data);
      setMyListings(prev => prev.map(l => l.listingId === data.listingId ? data : l));
    } else {
      addListing(data, user?.email);
      const newEntry = { ...data, status: 'pending' as const, createdAt: new Date().toISOString() };
      setMyListings(prev => [newEntry, ...prev]);
    }
    setIsFormOpen(false);
    setSelectedListing(null);
    if (searchParams.get('createNew') === 'true') {
      router.replace('/dashboard?tab=my-listings');
    }
  }
  
  if (isAdmin) {
      return <AdminListings />;
  }

  const activeListings = filteredMyListings.filter(l => l.status !== 'leased');
  const archivedListings = filteredMyListings.filter(l => l.status === 'leased');

  const portfolioStats = React.useMemo(() => {
    const totalListings = activeListings.length;
    const totalSize = activeListings.reduce((sum, l) => sum + (l.actualSizeSqFt || l.sizeSqFt), 0);
    const totalViews = activeListings.reduce((sum, l) => {
        const analytics = listingAnalytics.find(a => a.listingId === l.listingId);
        return sum + (analytics?.views || 0);
    }, 0);
    const totalDownloads = activeListings.reduce((sum, l) => {
        const analytics = listingAnalytics.find(a => a.listingId === l.listingId);
        return sum + (analytics?.downloads || 0);
    }, 0);

    return { totalListings, totalSize, totalViews, totalDownloads };
  }, [activeListings, listingAnalytics]);

  if (isLoading) {
      return <div className="mt-8 text-center">Loading your listings...</div>
  }

  return (
    <>
      {pendingConsentListings.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
            <p className="text-sm font-bold text-amber-800 mb-1">Action Required — Developer Consent</p>
            <p className="text-xs text-amber-700">ORS-ONE has prepared the following listing(s) on your behalf. Please review and authorise to publish.</p>
          </div>
          {pendingConsentListings.map((listing: any) => (
            <div key={listing.listingId} className="bg-card border-2 border-amber-300 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold text-foreground mb-1">{listing.name || listing.listingId}</p>
                  <p className="text-xs text-muted-foreground">{listing.location} · {listing.sizeSqFt?.toLocaleString()} sq ft</p>
                  <p className="text-xs text-muted-foreground mt-1">Prepared by ORS-ONE team on your behalf</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setSelectedListing(listing); setIsFormOpen(true); }}
                    className="text-xs font-bold text-primary border border-primary/30 bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors">
                    Review Details
                  </button>
                  <button
                    onClick={() => handleConsent(listing)}
                    className="text-xs font-bold text-white bg-primary px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                    I confirm this information is accurate — Authorise to Publish Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Building /> My Property Listings
            </h2>
            <p className="text-muted-foreground mt-2">
                Manage active properties and view your archived deals.
            </p>
          </div>
        </div>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Portfolio Snapshot</CardTitle>
                <CardDescription>An overview of your active listings' performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Active Listings" value={portfolioStats.totalListings.toString()} icon={Building} />
                    <StatCard title="Total Size (SFT)" value={portfolioStats.totalSize.toLocaleString()} icon={Scaling} />
                    <StatCard title="Total Views" value={portfolioStats.totalViews.toLocaleString()} icon={Eye} />
                    <StatCard title="Total Downloads" value={portfolioStats.totalDownloads.toLocaleString()} icon={Download} />
                </div>
            </CardContent>
        </Card>
        
        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by Listing ID, Box ID, or Location..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">
                    <Truck className="mr-2 h-4 w-4" />
                    Active Listings ({activeListings.length})
                </TabsTrigger>
                <TabsTrigger value="archived">
                    <Archive className="mr-2 h-4 w-4" />
                    Archived (Leased) ({archivedListings.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-6">
                {activeListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeListings.map(listing => (
                        <ProviderListingCard 
                            key={listing.listingId} 
                            listing={listing} 
                            onStatusChange={(newStatus) => handleStatusChange(listing.listingId, newStatus)}
                            onEdit={handleEdit}
                            isAdmin={isAdmin || false}
                        />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                        <CardTitle>No Active Listings Found</CardTitle>
                        <CardDescription className="mt-2">Use the 'New Listing' button on the home screen to create your first warehouse listing.</CardDescription>
                    </Card>
                )}
            </TabsContent>
             <TabsContent value="archived" className="mt-6">
                {archivedListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archivedListings.map(listing => (
                        <ProviderListingCard 
                            key={listing.listingId} 
                            listing={listing} 
                            onStatusChange={(newStatus) => handleStatusChange(listing.listingId, newStatus)}
                             onEdit={handleEdit}
                             isAdmin={isAdmin || false}
                        />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                        <CardTitle>No Archived Listings</CardTitle>
                        <CardDescription className="mt-2">When you mark a property as "Leased", it will appear here.</CardDescription>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
      </div>
      <ListingForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        listing={selectedListing}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
