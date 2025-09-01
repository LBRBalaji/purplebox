
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useData } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Eye, Download, Users, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useAuth } from '@/contexts/auth-context';

function AdminListingCard({ listing, analytics, providerName }: { listing: ListingSchema, analytics?: { views: number; downloads: number; downloadedBy?: { name: string; company: string }[] }, providerName: string }) {
  
  const statusConfig = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800" },
    pending: { text: "Pending Review", className: "bg-amber-100 text-amber-800" },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800" }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };

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
        {analytics?.downloadedBy && analytics.downloadedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-medium text-primary py-2 px-3 bg-primary/5 rounded-md hover:bg-primary/10">
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Downloaded By</span>
              <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-3 space-y-2">
                {analytics.downloadedBy.map((customer, index) => (
                  <div key={index} className="text-xs p-2 bg-secondary rounded-md">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-muted-foreground">{customer.company}</p>
                  </div>
                ))}
              </div>
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

  const getProviderName = (developerId: string) => {
    const provider = Object.values(users).find(u => u.email === developerId);
    return provider?.companyName || 'Unknown Provider';
  };

  return (
      <div className="mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline tracking-tight">All Listings & Performance</h2>
          <p className="text-muted-foreground mt-2">
            An overview of all listings on the platform, their status, and performance metrics.
          </p>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => {
              const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
              const providerName = getProviderName(listing.developerId);
              return <AdminListingCard key={listing.listingId} listing={listing} analytics={analytics} providerName={providerName} />;
            })}
          </div>
        ) : (
          <Card className="text-center p-12">
              <CardTitle>No Listings Found</CardTitle>
              <CardDescription className="mt-2">When providers create listings, they will appear here.</CardDescription>
          </Card>
        )}
      </div>
  );
}
