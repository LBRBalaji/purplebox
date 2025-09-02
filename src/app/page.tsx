
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Building, Sparkles, Map, List, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { APIProvider, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useData } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';

function LandingMap() {
    const { listings } = useData();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_MAP_ID || 'DEMO_MAP_ID';
    
    const approvedListings = React.useMemo(() => listings.filter(l => l.status === 'approved' && l.latLng), [listings]);

    if (!apiKey) {
        return (
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center text-center p-4">
                <p className="text-sm text-muted-foreground">Map view is currently unavailable.</p>
            </div>
        )
    }

    return (
        <APIProvider apiKey={apiKey}>
            <GoogleMap
                defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
                defaultZoom={4.5}
                mapId={mapId}
                gestureHandling={'none'}
                disableDefaultUI={true}
                className="w-full h-full rounded-lg"
            >
              {approvedListings.map(listing => {
                  const [lat, lng] = listing.latLng!.split(',').map(Number);
                  // Add a small random offset to protect exact location
                  const fuzzFactor = 0.02;
                  const fuzzedLat = lat + (Math.random() - 0.5) * fuzzFactor;
                  const fuzzedLng = lng + (Math.random() - 0.5) * fuzzFactor;
                  
                  if (isNaN(fuzzedLat) || isNaN(fuzzedLng)) return null;

                  return <AdvancedMarker key={listing.listingId} position={{ lat: fuzzedLat, lng: fuzzedLng }} />
              })}
            </GoogleMap>
        </APIProvider>
    )
}


export default function LandingPage() {
  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="h-full w-full max-h-[80vh] lg:max-h-full pr-0 lg:pr-12 pb-8 lg:pb-0">
          <LandingMap />
        </div>
        <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Building className="h-12 w-12 text-primary" />
                    <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-3" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">WareHouse Origin</h1>
                    <p className="text-lg text-muted-foreground mt-1">Sourcing & Leasing Simplified</p>
                </div>
            </div>

            <p className="mt-6 text-base md:text-lg max-w-xl text-foreground/80">
                Discover your next industrial or warehouse property with unparalleled ease. Choose your path to find the perfect space for your business needs.
            </p>

            <div className="mt-10 w-full max-w-md space-y-6">
                <div className="p-6 rounded-lg border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <List className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Browse Listings</h3>
                            <p className="text-sm text-muted-foreground">Explore our curated list of available properties and download details instantly.</p>
                        </div>
                    </div>
                     <Button asChild size="lg" className="w-full mt-4">
                        <Link href="/listings">Browse All Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>

                 <div className="p-6 rounded-lg border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                             <Map className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Interactive Map Search</h3>
                            <p className="text-sm text-muted-foreground">Visualize supply heatmaps and log a specific demand for tailored proposals.</p>
                        </div>
                    </div>
                    <Button asChild size="lg" variant="outline" className="w-full mt-4">
                        <Link href="/map-search">Explore the Interactive Map <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
