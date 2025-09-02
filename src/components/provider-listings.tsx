
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useData, type DownloadedByRecord, type ViewedByRecord } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Eye, Download, BarChart2, PlusCircle, Users, ChevronDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ListingForm } from './listing-form';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';


function ProviderListingCard({ listing, analytics }: { listing: ListingSchema, analytics?: { views: number; downloads: number; downloadedBy?: DownloadedByRecord[], viewedBy?: ViewedByRecord[] } }) {
  const previewImage = listing.documents?.find(doc => doc.type === 'image')?.url || 'https://placehold.co/600x400.png';

  const statusConfig = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800" },
    pending: { text: "Pending Review", className: "bg-amber-100 text-amber-800" },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800" }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>
            <Link href={`/listings/${listing.listingId}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
              {listing.name}
            </Link>
          </CardTitle>
          <CardDescription>{listing.location} - {listing.sizeSqFt.toLocaleString()} sq. ft.</CardDescription>
        </div>
        <Badge className={status.className}>{status.text}</Badge>
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

export function ProviderListings() {
  const { user } = useAuth();
  const { listings, listingAnalytics, addListing } = useData();
  const [myListings, setMyListings] = React.useState<ListingSchema[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  React.useEffect(() => {
    if (user?.email) {
      setMyListings(listings.filter(l => l.developerId === user.email));
    }
  }, [listings, user]);

  const handleFormSubmit = (data: ListingSchema) => {
    addListing(data, user?.email);
    setIsFormOpen(false);
  }

  return (
    <>
      <div className="mt-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <BarChart2 /> My Listings & Performance
            </h2>
            <p className="text-muted-foreground mt-2">
                Track the status and performance of your warehouse listings.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Listing
          </Button>
        </div>
        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map(listing => {
              const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
              return <ProviderListingCard key={listing.listingId} listing={listing} analytics={analytics} />;
            })}
          </div>
        ) : (
          <Card className="text-center p-12">
              <CardTitle>No Listings Found</CardTitle>
              <CardDescription className="mt-2">Use the button above to create your first warehouse listing.</CardDescription>
          </Card>
        )}
      </div>
      <ListingForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
