
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function GeneralShortlist() {
  const { listings, generalShortlist, toggleGeneralShortlist } = useData();

  const shortlistedListings = React.useMemo(() => {
    return listings.filter(l => generalShortlist.includes(l.listingId));
  }, [listings, generalShortlist]);

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>My Shortlist</CardTitle>
          <CardDescription>
            Properties you've saved for later. You can remove them from this list at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shortlistedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortlistedListings.map(listing => {
                  return (
                  <Card key={listing.listingId} className="flex flex-col">
                      <CardHeader>
                      <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                          <Image src={listing.documents?.[0]?.url || "https://placehold.co/600x400.png"} alt={listing.name} data-ai-hint="warehouse industrial building" fill className="object-cover" />
                      </div>
                      <CardTitle>{listing.name}</CardTitle>
                      <CardDescription>
                          {listing.location}
                      </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-grow">
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                          <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{listing.sizeSqFt.toLocaleString()} Sq. Ft.</p>
                          </div>
                          <div>
                          <p className="text-muted-foreground">Rent</p>
                          <p className="font-medium">₹{listing.rentPerSqFt || '??'}/sft</p>
                          </div>
                      </div>
                      </CardContent>
                      <CardFooter className="grid grid-cols-2 gap-2">
                         <Button asChild className="w-full" variant="outline">
                            <Link href={`/listings/${listing.listingId}`} target="_blank">View</Link>
                         </Button>
                         <Button
                            variant="default"
                            className="w-full"
                            onClick={() => toggleGeneralShortlist(listing.listingId)}
                          >
                            <Star className="mr-2 h-4 w-4 fill-current text-yellow-400" />
                            Remove
                          </Button>
                      </CardFooter>
                  </Card>
              )})}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8">
              <p>You haven't shortlisted any properties yet.</p>
              <p className="text-xs mt-1">Click the star icon on a property to add it to this list.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
