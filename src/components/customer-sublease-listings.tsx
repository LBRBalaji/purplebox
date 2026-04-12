'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ListingForm } from './listing-form';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PlusCircle, ArrowRightLeft, Edit, Eye, Clock, CheckCircle, XCircle, Archive } from 'lucide-react';
import type { ListingSchema, ListingStatus } from '@/lib/schema';
import Link from 'next/link';

export function CustomerSubleaseListings() {
  const { user } = useAuth();
  const { listings, addListing, updateListing, updateListingStatus, locationCircles } = useData();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);
  const [myListings, setMyListings] = React.useState<ListingSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load this customer's sublease listings
  React.useEffect(() => {
    if (!user?.email) return;
    setIsLoading(true);
    const mine = listings.filter(
      l => l.developerId === user.email && (l as any).listingType === 'Sublease'
    );
    setMyListings(mine);
    setIsLoading(false);
  }, [listings, user?.email]);

  // Open form from URL param
  React.useEffect(() => {
    if (searchParams.get('createNew') === 'true') {
      setSelectedListing(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const handleFormSubmit = (data: ListingSchema) => {
    if (selectedListing) {
      updateListing(data);
      setMyListings(prev => prev.map(l => l.listingId === data.listingId ? data : l));
    } else {
      addListing(data, user?.email);
      const newEntry = { ...data, status: 'pending' as const, listingType: 'Sublease' as const, createdAt: new Date().toISOString() };
      setMyListings(prev => [newEntry, ...prev]);
    }
    setIsFormOpen(false);
    setSelectedListing(null);
    if (searchParams.get('createNew') === 'true') {
      router.replace('/dashboard?tab=my-sublease');
    }
    toast({ title: selectedListing ? 'Listing updated' : 'Submitted for approval', description: selectedListing ? 'Your listing has been updated.' : 'Your sublease listing will go live after admin review.' });
  };

  const statusConfig: Record<ListingStatus, { text: string; className: string; icon: React.ElementType }> = {
    approved: { text: 'Live', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    pending: { text: 'Pending Approval', className: 'bg-amber-100 text-amber-800', icon: Clock },
    rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
    leased: { text: 'Leased Out', className: 'bg-blue-100 text-blue-800', icon: Archive },
    draft: { text: 'Draft', className: 'bg-gray-100 text-gray-700', icon: Clock },
    pending_consent: { text: 'Pending Consent', className: 'bg-amber-100 text-amber-800', icon: Clock },
  };

  return (
    <div className="space-y-5 mt-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-amber-600" /> My Sublease Listings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Excess warehouse space you've listed for sublease. Each listing goes through admin approval before going live.
          </p>
        </div>
        <Button onClick={() => { setSelectedListing(null); setIsFormOpen(true); }}
          className="bg-amber-600 hover:bg-amber-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> List Excess Space
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : myListings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ArrowRightLeft className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-foreground">No sublease listings yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              If you have excess warehouse space, you can list it here for other businesses to lease.
            </p>
            <Button onClick={() => { setSelectedListing(null); setIsFormOpen(true); }}
              className="bg-amber-600 hover:bg-amber-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> List Excess Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myListings.map(listing => {
            const sc = statusConfig[listing.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <Card key={listing.listingId} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold">
                        <Link href={`/listings/${listing.listingId}`} target="_blank" className="hover:underline">
                          {listing.warehouseBoxId || listing.listingId}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">{listing.location} · {listing.sizeSqFt?.toLocaleString()} sq.ft.</CardDescription>
                    </div>
                    <Badge className={`text-xs ${sc.className} flex-shrink-0`}>
                      <StatusIcon className="h-3 w-3 mr-1" />{sc.text}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 w-fit text-xs mt-1">
                    <ArrowRightLeft className="h-3 w-3 mr-1" /> Sublease
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 flex gap-2 mt-auto">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setSelectedListing(listing); setIsFormOpen(true); }}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Link href={`/listings/${listing.listingId}`} target="_blank" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ListingForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        listing={selectedListing}
        onSubmit={handleFormSubmit}
        locationCircles={locationCircles || []}
      />
    </div>
  );
}
