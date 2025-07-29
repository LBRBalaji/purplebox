
'use client';

import {
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Search, X, Building2, Scaling, CalendarCheck, CheckCircle, Info, ClipboardPlus, LogIn, FileText, Share2, MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from './login-dialog';


type RegionalSummary = {
    regionName: string;
    totalListings: number;
    sizeRange: string;
    readiness: { ready: number; soon: number; building: number };
    avgCeilingHeight: number;
    center: { lat: number; lng: number };
};

// Fictional data for different regions
const regionalDataStore: { [key: string]: RegionalSummary } = {
  'thiruvallur': {
    regionName: 'Thiruvallur Region',
    totalListings: 15,
    sizeRange: '45,000 - 300,000 sq. ft.',
    readiness: { ready: 8, soon: 3, building: 4 },
    avgCeilingHeight: 42,
    center: { lat: 13.13, lng: 79.91 },
  },
  'oragadam': {
    regionName: 'Oragadam Industrial Corridor',
    totalListings: 25,
    sizeRange: '100,000 - 500,000 sq. ft.',
    readiness: { ready: 15, soon: 5, building: 5 },
    avgCeilingHeight: 48,
    center: { lat: 12.83, lng: 79.95 },
  },
  'sriperumbudur': {
    regionName: 'Sriperumbudur',
    totalListings: 18,
    sizeRange: '80,000 - 400,000 sq. ft.',
    readiness: { ready: 10, soon: 6, building: 2 },
    avgCeilingHeight: 45,
    center: { lat: 12.96, lng: 79.95 },
  },
  'vallam': { // For Vallam-Vadagal
    regionName: 'Vallam-Vadagal',
    totalListings: 12,
    sizeRange: '150,000 - 600,000 sq. ft.',
    readiness: { ready: 4, soon: 3, building: 5 },
    avgCeilingHeight: 50,
    center: { lat: 12.92, lng: 79.93 },
  },
  'sunguvarchatram': {
    regionName: 'Sunguvarchatram',
    totalListings: 9,
    sizeRange: '50,000 - 250,000 sq. ft.',
    readiness: { ready: 5, soon: 2, building: 2 },
    avgCeilingHeight: 40,
    center: { lat: 12.97, lng: 79.84 },
  },
   'walajabad': {
    regionName: 'Walajabad',
    totalListings: 7,
    sizeRange: '30,000 - 150,000 sq. ft.',
    readiness: { ready: 4, soon: 1, building: 2 },
    avgCeilingHeight: 35,
    center: { lat: 12.80, lng: 79.83 },
  },
  'mappedu': {
    regionName: 'Mappedu',
    totalListings: 6,
    sizeRange: '60,000 - 200,000 sq. ft.',
    readiness: { ready: 3, soon: 2, building: 1 },
    avgCeilingHeight: 38,
    center: { lat: 13.09, lng: 79.95 },
  },
  'mannur': {
    regionName: 'Mannur',
    totalListings: 8,
    sizeRange: '75,000 - 180,000 sq. ft.',
    readiness: { ready: 5, soon: 3, building: 0 },
    avgCeilingHeight: 40,
    center: { lat: 13.04, lng: 79.99 },
  },
  'redhills': {
    regionName: 'Redhills',
    totalListings: 22,
    sizeRange: '25,000 - 220,000 sq. ft.',
    readiness: { ready: 12, soon: 7, building: 3 },
    avgCeilingHeight: 36,
    center: { lat: 13.17, lng: 80.20 },
  },
  'vengal': {
    regionName: 'Vengal',
    totalListings: 5,
    sizeRange: '100,000 - 250,000 sq. ft.',
    readiness: { ready: 1, soon: 1, building: 3 },
    avgCeilingHeight: 45,
    center: { lat: 13.21, lng: 79.98 },
  },
  'periyapalayam': {
    regionName: 'Periyapalayam',
    totalListings: 4,
    sizeRange: '50,000 - 100,000 sq. ft.',
    readiness: { ready: 2, soon: 2, building: 0 },
    avgCeilingHeight: 32,
    center: { lat: 13.31, lng: 80.09 },
  },
};

const LogDemandButton = ({ center, onLogDemand, variant = 'primary' }: { center: { lat: number; lng: number } | null, onLogDemand: (center?: { lat: number; lng: number } | null) => void, variant?: "primary" | "secondary" | "default" | "destructive" | "outline" | "ghost" | "link" | null }) => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-3">
             <Button 
                className="w-full" 
                onClick={() => onLogDemand(center)} 
                disabled={user?.role === 'SuperAdmin'}
                variant={variant}
            >
                {user && user.role === 'User' ? (
                    <>
                        <ClipboardPlus className="mr-2 h-4 w-4" /> Log New Demand
                    </>
                ) : (
                     <>
                        <LogIn className="mr-2 h-4 w-4" /> Login to Log Demand
                    </>
                )}
            </Button>
            <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Get Detailed and <strong className="font-semibold text-foreground">Downloadable</strong> Warehouse Proposals in 48 Hours on your Dashboard. Simple and Easy.</span>
            </p>
        </div>
    );
};


function RegionalSummaryCard({ data, onLogDemand }: { data: RegionalSummary; onLogDemand: (center: { lat: number; lng: number }) => void; }) {
    
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
                           <span className="font-semibold">BTS: <b className="text-blue-600">{data.readiness.building}</b></span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Avg. Ceiling Height</p>
                        <p className="font-semibold">~{data.avgCeilingHeight} ft.</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <LogDemandButton center={data.center} onLogDemand={onLogDemand} variant="default" />
            </CardFooter>
        </Card>
    )
}

function HowItWorks({ onLogDemand }: { onLogDemand: (center?: { lat: number; lng: number } | null) => void }) {
    const steps = [
        {
            title: "Search a Region",
            description: "Use the search bar to find a city or industrial area.",
        },
        {
            title: "View Supply Summary",
            description: "See an aggregated overview of listings in that zone.",
        },
        {
            title: "Log Your Demand",
            description: "Use the insights to log a specific, targeted demand.",
        }
    ];

    return (
        <Card className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-background to-background border-0 shadow-none">
            <CardHeader className="text-center">
                 <CardTitle className="text-2xl font-bold font-headline text-foreground">
                    How to Source Your Warehouse
                 </CardTitle>
                 <CardDescription>Log your demand directly, or do a quick search first to gain insights.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center">
                <div className="space-y-8 relative py-4">
                     <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-border -z-10" />
                    {steps.map((step, index) => {
                        return (
                            <div key={index} className="flex items-start gap-5">
                                <div className="flex-shrink-0 z-10">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                        0{index + 1}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground mt-0.5">{step.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
             <CardFooter className="pt-4 border-t">
                <LogDemandButton center={null} onLogDemand={onLogDemand} variant="default" />
            </CardFooter>
        </Card>
    );
}

function MapSearchContent({ mapId }: { mapId: string }) {
  const map = useMap();
  const places = useMapsLibrary('places');
  const router = useRouter();
  const { user } = useAuth();
  
  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [summaryData, setSummaryData] = React.useState<RegionalSummary | null>(null);
  const [lastSearchedCenter, setLastSearchedCenter] = React.useState<{ lat: number, lng: number } | null>(null);
  const [circle, setCircle] = React.useState<google.maps.Circle | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
  const [pendingRedirectCenter, setPendingRedirectCenter] = React.useState<{ lat: number; lng: number } | null>(null);
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
            const center = { lat: location.lat(), lng: location.lng() };
            setLastSearchedCenter(center);
            
            const placeName = place.name?.toLowerCase() || '';
            let foundData = null;
            for (const key in regionalDataStore) {
                if (placeName.includes(key)) {
                    foundData = regionalDataStore[key];
                    break;
                }
            }
            setSummaryData(foundData);
            
           if (circle) circle.setMap(null);
           
           const newCircle = new google.maps.Circle({
                strokeColor: 'hsl(210 60% 50%)',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: 'hsl(210 60% 50%)',
                fillOpacity: 0.2,
                map,
                center: location,
                radius: 5000, // 5km radius
            });
            setCircle(newCircle);
            
            const bounds = newCircle.getBounds();
            if (bounds) {
                map.fitBounds(bounds);
            } else {
                map.setCenter(location);
                map.setZoom(12);
            }
        }
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    }
  }, [searchBox, map, circle]);

  const handleLogDemandClick = (center?: { lat: number; lng: number } | null) => {
    if (user && user.role === 'User') {
      let url = '/dashboard?logNew=true';
      if (center) {
        const locationString = `${center.lat.toFixed(6)},${center.lng.toFixed(6)}`;
        url += `&location=${encodeURIComponent(locationString)}&radius=5`;
      }
      router.push(url);
    } else {
      setPendingRedirectCenter(center || null);
      setIsLoginDialogOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false);
    let url = '/dashboard?logNew=true';
    if (pendingRedirectCenter) {
      const locationString = `${pendingRedirectCenter.lat.toFixed(6)},${pendingRedirectCenter.lng.toFixed(6)}`;
      url += `&location=${encodeURIComponent(locationString)}&radius=5`;
    }
    router.push(url);
    setPendingRedirectCenter(null);
  };


  const clearSearch = () => {
    setSearchInput('');
    setSummaryData(null);
    setLastSearchedCenter(null);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
    if (inputRef.current) inputRef.current.value = '';
    map?.setCenter({ lat: 20.5937, lng: 78.9629 });
    map?.setZoom(5);
  };

  return (
    <>
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
                </Map>
            </div>
            <aside className="w-[400px] h-full border-l bg-card/80 backdrop-blur-sm p-8 flex flex-col justify-center">
                {summaryData ? (
                    <RegionalSummaryCard data={summaryData} onLogDemand={handleLogDemandClick} />
                ) : lastSearchedCenter ? (
                    <div className="text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">
                            This is an Untapped Opportunity!
                        </h3>
                        <p className="text-sm mt-2 mb-6 text-muted-foreground">
                           While we don't have aggregated supply data here yet, our sourcing network is always expanding. Log your demand, and we'll activate our network to find a match for you.
                        </p>
                        <LogDemandButton center={lastSearchedCenter} onLogDemand={handleLogDemandClick} variant="default"/>
                    </div>
                ) : (
                    <HowItWorks onLogDemand={handleLogDemandClick} />
                )}
            </aside>
        </div>
        <LoginDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} onLoginSuccess={handleLoginSuccess}/>
    </>
  );
}


export function MapSearch({ mapId }: { mapId: string }) {
  return (
    <div className="h-full w-full">
      <MapSearchContent mapId={mapId} />
    </div>
  );
}
