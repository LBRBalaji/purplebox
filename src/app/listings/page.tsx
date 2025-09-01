
'use client';
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, MapPin, Scaling } from 'lucide-react';
import Link from 'next/link';

function ListingCard({ listing }: { listing: ListingSchema }) {
  const previewImage = listing.documents?.find(doc => doc.type === 'image')?.url || 'https://placehold.co/600x400.png';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="aspect-video relative mb-4">
          <Image
            src={previewImage}
            alt={listing.name}
            fill
            className="rounded-t-lg object-cover"
            data-ai-hint="modern warehouse"
          />
        </div>
        <CardTitle>{listing.name}</CardTitle>
        <CardDescription>{listing.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
         <div className="text-sm text-muted-foreground line-clamp-3">
          {listing.description}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-primary" />
                <span>{listing.area.totalChargeableArea.toLocaleString()} sq. ft.</span>
            </div>
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{listing.buildingSpecifications.buildingType}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{listing.location}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{listing.availabilityDate}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/listings/${listing.listingId}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ListingsPage() {
  const { listings } = useData();
  const [approvedListings, setApprovedListings] = useState<ListingSchema[]>([]);

  useEffect(() => {
    setApprovedListings(listings.filter(l => l.status === 'approved'));
  }, [listings]);

  return (
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tight">Warehouse Listings</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Browse our curated selection of approved warehouse and industrial properties. Log in to view detailed specifications and commercial terms.
                </p>
            </div>

            {approvedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {approvedListings.map(listing => (
                        <ListingCard key={listing.listingId} listing={listing} />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-12 col-span-full">
                    <CardTitle>No Listings Available</CardTitle>
                    <CardDescription className="mt-2">
                        There are currently no approved warehouse listings. Please check back later.
                    </CardDescription>
                </Card>
            )}
        </div>
    </main>
  );
}

    