
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Building, Sparkles, Map, List, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { APIProvider, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useData } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { ListingsPage } from '@/components/listings-page-component';

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
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                className="w-full h-full"
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
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-[40%_60%]">
        <div className="h-full w-full hidden lg:block">
          <LandingMap />
        </div>
        <div className="flex flex-col h-full overflow-y-auto">
          <ListingsPage />
        </div>
    </div>
  );
}
