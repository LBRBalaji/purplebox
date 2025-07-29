
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


type RegionalSummary = {
    regionName: string;
    totalListings: number;
    sizeRange: string;
    readiness: { ready: number; soon: number; building: number };
    avgCeilingHeight: number;
};

// Fictional data for different regions
const regionalDataStore: { [key: string]: RegionalSummary } = {
  'thiruvallur': {
    regionName: 'Thiruvallur Region',
    totalListings: 15,
    sizeRange: '45,000 - 300,000 sq. ft.',
    readiness: { ready: 8, soon: 3, building: 4 },
    avgCeilingHeight: 42,
  },
  'oragadam': {
    regionName: 'Oragadam Industrial Corridor',
    totalListings: 25,
    sizeRange: '100,000 - 500,000 sq. ft.',
    readiness: { ready: 15, soon: 5, building: 5 },
    avgCeilingHeight: 48,
  },
  'sriperumbudur': {
    regionName: 'Sriperumbudur',
    totalListings: 18,
    sizeRange: '80,000 - 400,000 sq. ft.',
    readiness: { ready: 10, soon: 6, building: 2 },
    avgCeilingHeight: 45,
  },
  'vallam': { // For Vallam-Vadagal
    regionName: 'Vallam-Vadagal',
    totalListings: 12,
    sizeRange: '150,000 - 600,000 sq. ft.',
    readiness: { ready: 4, soon: 3, building: 5 },
    avgCeilingHeight: 50,
  },
  'sunguvarchatram': {
    regionName: 'Sunguvarchatram',
    totalListings: 9,
    sizeRange: '50,000 - 250,000 sq. ft.',
    readiness: { ready: 5, soon: 2, building: 2 },
    avgCeilingHeight: 40,
  },
   'walajabad': {
    regionName: 'Walajabad',
    totalListings: 7,
    sizeRange: '30,000 - 150,000 sq. ft.',
    readiness: { ready: 4, soon: 1, building: 2 },
    avgCeilingHeight: 35,
  },
  'mappedu': {
    regionName: 'Mappedu',
    totalListings: 6,
    sizeRange: '60,000 - 200,000 sq. ft.',
    readiness: { ready: 3, soon: 2, building: 1 },
    avgCeilingHeight: 38,
  },
  'mannur': {
    regionName: 'Mannur',
    totalListings: 8,
    sizeRange: '75,000 - 180,000 sq. ft.',
    readiness: { ready: 5, soon: 3, building: 0 },
    avgCeilingHeight: 40,
  },
  'redhills': {
    regionName: 'Redhills',
    totalListings: 22,
    sizeRange: '25,000 - 220,000 sq. ft.',
    readiness: { ready: 12, soon: 7, building: 3 },
    avgCeilingHeight: 36,
  },
  'vengal': {
    regionName: 'Vengal',
    totalListings: 5,
    sizeRange: '100,000 - 250,000 sq. ft.',
    readiness: { ready: 1, soon: 1, building: 3 },
    avgCeilingHeight: 45,
  },
  'periyapalayam': {
    regionName: 'Periyapalayam',
    totalListings: 4,
    sizeRange: '50,000 - 100,000 sq. ft.',
    readiness: { ready: 2, soon: 2, building: 0 },
    avgCeilingHeight: 32,
  },
};


function RegionalSummaryCard({ data }: { data: RegionalSummary }) {
    return (
        <Card className="shadow-none border-0 h-full flex flex-col bg-transparent">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Building2 className="h-6 w-6 text-primary"/>
                           {data.regionName}
                        </CardTitle>
                        <CardDescription>Aggregated Warehouse Supply</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div className="flex justify-between items-center p-3 rounded-md bg-primary/10">
                    <p className="font-bold text-primary">Total Listings</p>
                    <p className="text-2xl font-bold text-primary">{data.totalListings}</p>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><Scaling className="h-4 w-4" /> Size Range</p>
                        <p className="font-semibold">{data.sizeRange}</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Readiness</p>
                        <div className="flex gap-3 text-xs">
                           <span className="font-semibold">Ready: <b className="text-green-600">{data.readiness.ready}</b></span>
                           <span className="font-semibold">Soon: <b className="text-amber-600">{data.readiness.soon}</b></span>
                           <span className="font-semibold">Building: <b className="text-blue-600">{data.readiness.building}</b></span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Avg. Ceiling Height</p>
                        <p className="font-semibold">~{data.avgCeilingHeight} ft.</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>This is a fictional aggregated summary. Zoom in to browse individual listings if needed.</span>
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
  const [summaryData, setSummaryData] = React.useState<RegionalSummary | null>(null);
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
        const location = place.geometry.location;
        if (location) {
           if (circle) circle.setMap(null); // Remove old circle
           
           const fixedRadius = 5000; // 5km radius

           const newCircle = new google.maps.Circle({
                strokeColor: 'hsl(210 60% 50%)',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: 'hsl(210 60% 50%)',
                fillOpacity: 0.2,
                map,
                center: location,
                radius: fixedRadius
            });
            setCircle(newCircle);
            
            const bounds = newCircle.getBounds();
            if (bounds) {
                map.fitBounds(bounds);
            } else {
                map.setCenter(location);
                map.setZoom(12); // Fallback zoom
            }
        }
        
        // Find matching summary data
        const placeName = place.name?.toLowerCase() || '';
        let foundData = null;
        for (const key in regionalDataStore) {
            if (placeName.includes(key)) {
                foundData = regionalDataStore[key];
                break;
            }
        }
        setSummaryData(foundData);
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    }
  }, [searchBox, map, circle]);


  const clearSearch = () => {
    setSearchInput('');
    setSummaryData(null);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
    // Reset to a wider view of India
    if (inputRef.current) inputRef.current.value = '';
    map?.setCenter({ lat: 20.5937, lng: 78.9629 });
    map?.setZoom(5);
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
                defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
                defaultZoom={5}
                mapId={mapId}
                disableDefaultUI={true}
                gestureHandling="greedy"
                className="h-full w-full"
            >
                {/* Intentionally left blank to keep the map clean unless browsing */}
            </Map>
        </div>
        <aside className="w-[400px] h-full border-l bg-card/80 backdrop-blur-sm">
            {summaryData ? (
                <RegionalSummaryCard data={summaryData} />
            ) : (
                <div className="p-8 text-center text-muted-foreground h-full flex flex-col justify-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Explore Warehouse Supply</h3>
                    <p className="text-sm mt-2">Search for a city or region (e.g., Oragadam, Sriperumbudur) to see an aggregated summary of available warehouse listings.</p>
                </div>
            )}
        </aside>
    </div>
  );
}


export function MapSearch({ mapId }: { mapId: string }) {
  return (
    <div className="h-full w-full">
      <MapSearchContent mapId={mapId} />
    </div>
  );
}
