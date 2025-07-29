
'use client';

import {
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import * as React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Search, X, Building2, Scaling, CalendarCheck, CheckCircle, Info } from 'lucide-react';


function RegionalSummaryCard() {
    return (
        <Card className="shadow-none border-0 h-full flex flex-col">
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
            <CardContent className="space-y-4 flex-grow">
                <div className="flex justify-between items-center p-3 rounded-md bg-primary/10">
                    <p className="font-bold text-primary">Total Listings</p>
                    <p className="text-2xl font-bold text-primary">15</p>
                </div>
                <div className="space-y-3 text-sm">
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
            <CardFooter>
                 <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>This is an aggregated summary. You can zoom in to browse individual listings if needed.</span>
                </p>
            </CardFooter>
        </Card>
    )
}


function MapSearchContent({ mapId }: { mapId: string }) {
  const map = useMap();
  const places = useMapsLibrary('places');
  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [showSummary, setShowSummary] = React.useState(false);
  const [circle, setCircle] = React.useState<google.maps.Circle | null>(null);
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
        const viewport = place.geometry.viewport;
        if (viewport) {
           map.fitBounds(viewport);

           if (circle) circle.setMap(null); // Remove old circle

           const newCircle = new google.maps.Circle({
                strokeColor: 'hsl(210 60% 50%)',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: 'hsl(210 60% 50%)',
                fillOpacity: 0.2,
                map,
                center: place.geometry.location,
                radius: viewport.getNorthEast().lat() > viewport.getSouthWest().lat() ?
                  google.maps.geometry.spherical.computeDistanceBetween(viewport.getCenter(), viewport.getNorthEast()) :
                  10000 // default radius for point locations
            });
            setCircle(newCircle);
        } else if (place.geometry.location) {
            map.setCenter(place.geometry.location);
            map.setZoom(12);
        }
        setShowSummary(true); // Show the summary card on search
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    }
  }, [searchBox, map, circle]);


  const clearSearch = () => {
    setSearchInput('');
    setShowSummary(false);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
  };

  return (
    <div className="flex h-full w-full">
        <div className="flex-grow h-full relative">
            <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    placeholder="Search for a region..."
                    className="pl-9 shadow-md bg-background"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                />
                {searchInput && (
                    <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={clearSearch}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                )}
                </div>
            </div>

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
        </div>
        <aside className="w-[400px] h-full border-l bg-background">
            {showSummary ? (
                <RegionalSummaryCard />
            ) : (
                <div className="p-8 text-center text-muted-foreground h-full flex flex-col justify-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Explore Warehouse Supply</h3>
                    <p className="text-sm mt-2">Search for a city or region to see an aggregated summary of available warehouse listings.</p>
                </div>
            )}
        </aside>
    </div>
  );
}


export function MapSearch({ mapId }: { mapId: string }) {
  return (
    <div className="h-screen w-screen">
      <MapSearchContent mapId={mapId} />
    </div>
  );
}
