
'use client';

import {
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import * as React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Search, X, Building2, Scaling, CalendarCheck, CheckCircle } from 'lucide-react';


function RegionalSummaryCard() {
    return (
        <Card className="absolute top-4 left-1/2 z-10 w-full max-w-sm -translate-x-1/2 shadow-lg bg-background/90 backdrop-blur-sm">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Building2 className="h-6 w-6 text-primary"/>
                           Thiruvallur Region
                        </CardTitle>
                        <CardDescription>Aggregated Warehouse Supply</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-md bg-primary/10">
                    <p className="font-bold text-primary">Total Listings</p>
                    <p className="text-2xl font-bold text-primary">15</p>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><Scaling className="h-4 w-4" /> Size Range</p>
                        <p className="font-semibold">45,000 - 300,000 sq. ft.</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Readiness</p>
                        <div className="flex gap-3 text-xs">
                           <span className="font-semibold">Ready: <b className="text-green-600">8</b></span>
                           <span className="font-semibold">Soon: <b className="text-amber-600">3</b></span>
                           <span className="font-semibold">Building: <b className="text-blue-600">4</b></span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Avg. Ceiling Height</p>
                        <p className="font-semibold">~42 ft.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


function MapSearchContent({ mapId }: { mapId: string }) {
  const map = useMap();
  const places = useMapsLibrary('places');
  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Initialize SearchBox
  React.useEffect(() => {
    if (!places || !inputRef.current) return;
    const newSearchBox = new places.SearchBox(inputRef.current);
    setSearchBox(newSearchBox);

    return () => {
      if (newSearchBox) {
        google.maps.event.clearInstanceListeners(newSearchBox);
      }
    };
  }, [places]);

  // Handle search box places changing
  React.useEffect(() => {
    if (!searchBox || !map) return;
    const listener = searchBox.addListener('places_changed', async () => {
      const places = searchBox.getPlaces();
      if (places && places.length > 0 && places[0].geometry) {
        const place = places[0];
        map.fitBounds(place.geometry.viewport!);
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    }
  }, [searchBox, map]);


  return (
    <>
      <RegionalSummaryCard />

      <Map
        defaultCenter={{ lat: 13.13, lng: 79.91 }}
        defaultZoom={10}
        mapId={mapId}
        disableDefaultUI={true}
        gestureHandling="greedy"
        className="h-full w-full"
      >
        {/* Intentionally left blank to keep the map clean */}
      </Map>
    </>
  );
}


export function MapSearch({ mapId }: { mapId: string }) {
  return (
    <div className="h-screen w-screen relative">
      <MapSearchContent mapId={mapId} />
    </div>
  );
}
