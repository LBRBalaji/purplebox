
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
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Archive, Building, CircleCheck, ClipboardList, Edit, Eye, History, PlusCircle, Truck, ArchiveRestore, Download, Users, ChevronDown, Clock, MoreHorizontal, CheckCircle, XCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ListingForm } from './listing-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AdminListings } from './admin-listings';


function ProviderListingCard({ listing, onStatusChange, onEdit, isAdmin }: { listing: ListingSchema, onStatusChange: (status: ListingStatus) => void, onEdit: (listing: ListingSchema) => void, isAdmin: boolean }) {
  const { listingAnalytics } = useData();
  const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
  const statusConfig: Record<ListingStatus, { text: string; className: string, icon: React.ElementType }> = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800", icon: CircleCheck },
    pending: { text: "Pending", className: "bg-amber-100 text-amber-800", icon: History },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800", icon: Eye },
    leased: { text: "Leased", className: "bg-blue-100 text-blue-800", icon: ClipboardList }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800', icon: Eye };
  const StatusIcon = status.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
              <CardTitle>
                <Link href={`/listings/${listing.listingId}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
                  {listing.listingId}
                </Link>
              </CardTitle>
              <CardDescription>{listing.location}</CardDescription>
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

export function ProviderListings() {
  const { user } = useAuth();
  const { listings, addListing, updateListing, updateListingStatus } = useData();
  const [myListings, setMyListings] = React.useState<ListingSchema[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);
  const { toast } = useToast();
  
  const isAdmin = user?.role === 'SuperAdmin';
  
  React.useEffect(() => {
    if (user?.email) {
      setMyListings(listings.filter(l => l.developerId === user.email));
    }
  }, [listings, user]);
  
  const handleStatusChange = (listingId: string, status: ListingStatus) => {
    updateListingStatus(listingId, status, user?.email);
    toast({
        title: 'Listing Status Updated',
        description: `The listing status has been changed.`,
    });
  };

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
    } else {
      addListing(data, user?.email);
    }
    setIsFormOpen(false);
    setSelectedListing(null);
  }
  
  if (isAdmin) {
      return <AdminListings />;
  }

  const activeListings = myListings.filter(l => l.status !== 'leased');
  const archivedListings = myListings.filter(l => l.status === 'leased');


  return (
    <>
      <div className="mt-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Building /> My Property Listings
            </h2>
            <p className="text-muted-foreground mt-2">
                Create new listings, manage active properties, and view your archived deals.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Listing
          </Button>
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
                        <CardDescription className="mt-2">Use the button above to create your first warehouse listing.</CardDescription>
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
