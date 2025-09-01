
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
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Eye, Download, BarChart2 } from 'lucide-react';
import Link from 'next/link';

function ProviderListingCard({ listing, analytics }: { listing: ListingSchema, analytics?: { views: number; downloads: number } }) {
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
            <Link href={`/listings/${listing.listingId}`} className="hover:underline">
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
      </CardContent>
    </Card>
  );
}

export function ProviderListings() {
  const { user } = useAuth();
  const { listings, listingAnalytics } = useData();
  const [myListings, setMyListings] = React.useState<ListingSchema[]>([]);

  React.useEffect(() => {
    if (user?.email) {
      setMyListings(listings.filter(l => l.developerId === user.email));
    }
  }, [listings, user]);

  return (
    <div className="mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <BarChart2 /> My Listings & Performance
        </h2>
        <p className="text-muted-foreground mt-2">
            Track the status and performance of your warehouse listings.
        </p>
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
            <CardDescription className="mt-2">You haven't created any listings yet. Contact the admin to get started.</CardDescription>
        </Card>
      )}
    </div>
  );
}
