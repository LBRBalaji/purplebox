
'use client';

import {
  Map,
  useMap,
  useMapsLibrary,
  Marker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Search, X, Building2, Scaling, CalendarCheck, CheckCircle, Info, ClipboardPlus, LogIn, ArrowLeft, Star, Ruler, ZoomIn, ZoomOut, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from './login-dialog';
import type { ListingSchema } from '@/lib/schema';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Badge } from './ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useData } from '@/contexts/data-context';

type RegionalSummary = {
    regionName: string;
    totalListings: number;
    sizeRange: string;
    readiness: { ready: number; soon: number; underConstruction: number };
    avgCeilingHeight: number;
    center: { lat: number; lng: number };
};

const LogDemandButton = ({ center, onLogDemand, variant = "default" }: { center: { lat: number; lng: number } | null, onLogDemand: (center?: { lat: number; lng: number } | null) => void, variant?: "primary" | "secondary" | "default" | "destructive" | "outline" | "ghost" | "link" | null }) => {
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
            <div className="text-xs text-muted-foreground space-y-3">
                <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Get Detailed and <strong className="font-semibold text-foreground">Downloadable</strong> Warehouse Proposals in 72 Hours (excluding holidays) on your Dashboard.</span>
                </div>
                 <div className='text-center pt-2'>
                    <p className="mb-2">Download Listings Instantly</p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/">Search-Select-Download <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                 </div>
            </div>
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
                           <span className="font-semibold">BTS: <b className="text-blue-600">{data.readiness.underConstruction}</b></span>
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

function WarehouseDetailCard({ warehouse }: { warehouse: ListingSchema }) {
    const mainImage = warehouse.documents?.find(doc => doc.type === 'image')?.url || 'https://placehold.co/600x400.png';
    const latLngParts = warehouse.latLng?.split(',').map(s => parseFloat(s.trim()));
    const center = latLngParts && latLngParts.length === 2 && !isNaN(latLngParts[0]) && !isNaN(latLngParts[1]) 
        ? { lat: latLngParts[0], lng: latLngParts[1] } 
        : { lat: 0, lng: 0 };

    return (
        <Card className="shadow-none border-0 h-full flex flex-col bg-transparent">
            <CardHeader>
                <div className="aspect-video relative mb-4">
                    <Image
                        src={mainImage}
                        alt={warehouse.name}
                        fill
                        className="rounded-lg object-cover"
                        data-ai-hint="warehouse exterior"
                    />
                </div>
                 <CardTitle className="flex items-center gap-2 pt-2">
                    {warehouse.name}
                </CardTitle>
                <CardDescription asChild>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {warehouse.location}
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                {(warehouse.serviceModel === '3PL' || warehouse.serviceModel === 'Both') && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent border border-accent/20 text-sm">
                        <Star className="mr-1.5 h-4 w-4" />
                        3PL Operated
                    </Badge>
                )}
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><Scaling className="h-4 w-4"/> Size</p>
                        <p className="font-semibold">{warehouse.sizeSqFt.toLocaleString()} sq. ft.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><CalendarCheck className="h-4 w-4"/> Readiness</p>
                        <p className="font-semibold">{warehouse.availabilityDate}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><Building2 className="h-4 w-4"/> Building Type</p>
                        <p className="font-semibold">{Array.isArray(warehouse.buildingSpecifications.buildingType) ? warehouse.buildingSpecifications.buildingType.join(' / ') : 'N/A'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Docks</p>
                        <p className="font-semibold">{warehouse.buildingSpecifications.numberOfDocksAndShutters || 'N/A'}</p>
                    </div>
                </div>
                <div className="pt-4">
                    <Button asChild className="w-full">
                        <Link href={`/listings/${warehouse.listingId}`} target="_blank">
                            View Full Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
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
  const markerLibrary = useMapsLibrary('marker');
  const geometry = useMapsLibrary('geometry');
  const router = useRouter();
  const { user } = useAuth();
  const { listings } = useData();
  
  const [warehouses, setWarehouses] = React.useState<ListingSchema[]>([]);
  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [summaryData, setSummaryData] = React.useState<RegionalSummary | null>(null);
  const [lastSearchedCenter, setLastSearchedCenter] = React.useState<{ lat: number; lng: number } | null>(null);
  const [circle, setCircle] = React.useState<google.maps.Circle | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
  const [pendingRedirectCenter, setPendingRedirectCenter] = React.useState<{ lat: number; lng: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [markers, setMarkers] = React.useState<google.maps.Marker[]>([]);
  const markerClustererRef = React.useRef<MarkerClusterer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<ListingSchema | null>(null);
  
  // States for Distance Calculator
  const [isMeasuring, setIsMeasuring] = React.useState(false);
  const [measurePoints, setMeasurePoints] = React.useState<google.maps.LatLng[]>([]);
  const [measurePolyline, setMeasurePolyline] = React.useState<google.maps.Polyline | null>(null);
  const [measureMarkers, setMeasureMarkers] = React.useState<google.maps.Marker[]>([]);
  const [totalDistance, setTotalDistance] = React.useState(0);

  // Filter listings to only show approved ones and keep it up to date
  React.useEffect(() => {
    const activeListings = listings.filter(l => l.status === 'approved' && l.latLng);
    setWarehouses(activeListings);
  }, [listings]);

  // Init marker clusterer
  React.useEffect(() => {
    if (!map || !markerLibrary || !geometry) return;

    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
    
    if (warehouses.length > 0) {
        const newMarkers = warehouses.map(warehouse => {
            const latLngParts = warehouse.latLng?.split(',').map(s => parseFloat(s.trim()));
            if (!latLngParts || latLngParts.length !== 2 || isNaN(latLngParts[0]) || isNaN(latLngParts[1])) {
                return null;
            }
            
            const position = { 
                lat: latLngParts[0], 
                lng: latLngParts[1]
            };
            
            const marker = new google.maps.Marker({
                position,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 15,
                  fillColor: '#FFC107',
                  fillOpacity: 0.7,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                },
            });
            marker.addListener('click', () => {
                setSelectedWarehouse(warehouse);
                setSummaryData(null);
            });
            return marker;
        }).filter((m): m is google.maps.Marker => m !== null);

        setMarkers(newMarkers);
        markerClustererRef.current = new MarkerClusterer({ map, markers: newMarkers });
    }

    return () => {
        if (markerClustererRef.current) {
            markerClustererRef.current.clearMarkers();
        }
    };
  }, [map, markerLibrary, warehouses, geometry]);

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
    if (!searchBox || !map || !geometry || warehouses.length === 0) return;

    const listener = searchBox.addListener('places_changed', async () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0 || !places[0].geometry || !places[0].geometry.location) {
        return;
      }
      
      const place = places[0];
      const location = place.geometry.location;
      const center = { lat: location.lat(), lng: location.lng() };
      setLastSearchedCenter(center);
      setSelectedWarehouse(null);
      
      const searchRadius = 25000;
      const searchCenterLatLng = new google.maps.LatLng(center.lat, center.lng);

      const nearbyWarehouses = warehouses.filter(w => {
          const latLngParts = w.latLng?.split(',').map(s => parseFloat(s.trim()));
          if (!latLngParts || latLngParts.length !== 2 || isNaN(latLngParts[0]) || isNaN(latLngParts[1])) {
            return false;
          }
          const warehouseLatLng = new google.maps.LatLng(latLngParts[0], latLngParts[1]);
          return geometry.spherical.computeDistanceBetween(searchCenterLatLng, warehouseLatLng) <= searchRadius;
      });

      if (nearbyWarehouses.length > 0) {
        const sizes = nearbyWarehouses.map(w => w.sizeSqFt);
        const ceilingHeights = nearbyWarehouses.map(w => w.buildingSpecifications.eveHeightMeters).filter((h): h is number => h !== undefined && h > 0);
        
        const readinessCounts = nearbyWarehouses.reduce((acc, w) => {
            if (w.availabilityDate === 'Ready for Occupancy') acc.ready++;
            else if (w.availabilityDate === 'Available in 3 months') acc.soon++;
            else if (w.availabilityDate === 'Under Construction' || (w.constructionProgress && parseInt(w.constructionProgress) < 100)) acc.underConstruction++;
            return acc;
        }, { ready: 0, soon: 0, underConstruction: 0 });

        const newSummary: RegionalSummary = {
            regionName: place.name || 'Searched Area',
            totalListings: nearbyWarehouses.length,
            sizeRange: `${Math.min(...sizes).toLocaleString()} - ${Math.max(...sizes).toLocaleString()} sq. ft.`,
            readiness: readinessCounts,
            avgCeilingHeight: ceilingHeights.length > 0 ? Math.round(ceilingHeights.reduce((a, b) => a + (b || 0), 0) / ceilingHeights.length * 3.28084) : 0, // convert meters to feet for display
            center: center,
        };
        setSummaryData(newSummary);
      } else {
        setSummaryData(null);
      }
            
      if (circle) circle.setMap(null);
      
      const newCircle = new google.maps.Circle({
            strokeColor: '#FFC107',
            strokeOpacity: 1,
            strokeWeight: 4,
            fillColor: '#FFC107',
            fillOpacity: 0.25,
            map,
            center: location,
            radius: searchRadius, 
        });
      setCircle(newCircle);
      
      const bounds = newCircle.getBounds();
      if (bounds) {
          map.fitBounds(bounds);
      } else {
          map.setCenter(location);
          map.setZoom(10);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    }
  }, [searchBox, map, circle, geometry, warehouses]);

  const handleLogDemandClick = (center?: { lat: number; lng: number } | null) => {
    if (user && user.role === 'User') {
      let url = '/dashboard?logNew=true';
      if (center) {
        const locationString = `${center.lat.toFixed(6)},${center.lng.toFixed(6)}`;
        url += `&location=${encodeURIComponent(locationString)}&radius=5`;
      }
      if (summaryData) {
        url += `&locationName=${encodeURIComponent(summaryData.regionName)}`;
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
     if (summaryData) {
        url += `&locationName=${encodeURIComponent(summaryData.regionName)}`;
      }
    router.push(url);
    setPendingRedirectCenter(null);
  };


  const clearSearch = () => {
    setSearchInput('');
    setSummaryData(null);
    setLastSearchedCenter(null);
    setSelectedWarehouse(null);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
    if (inputRef.current) inputRef.current.value = '';
    map?.setCenter({ lat: 20.5937, lng: 78.9629 });
    map?.setZoom(5);
  };

  const toggleMeasurement = () => {
      clearMeasurement();
      setIsMeasuring(prev => !prev);
  };

  const clearMeasurement = () => {
      measurePolyline?.setMap(null);
      measureMarkers.forEach(marker => marker.setMap(null));
      setMeasurePoints([]);
      setMeasurePolyline(null);
      setMeasureMarkers([]);
      setTotalDistance(0);
  };

  React.useEffect(() => {
      if (!map || !isMeasuring) return;

      map.setOptions({ draggableCursor: 'crosshair' });
      const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
              setMeasurePoints(prev => [...prev, e.latLng!]);
          }
      });

      return () => {
          map.setOptions({ draggableCursor: 'grab' });
          google.maps.event.removeListener(clickListener);
      };
  }, [map, isMeasuring]);

  React.useEffect(() => {
      if (!map || !geometry || !isMeasuring) return;

      measureMarkers.forEach(marker => marker.setMap(null));
      const newMarkers = measurePoints.map(point => new google.maps.Marker({
          position: point,
          map: map,
          icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 4,
              fillColor: 'hsl(var(--primary))',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
          },
      }));
      setMeasureMarkers(newMarkers);

      if (!measurePolyline) {
          const newPolyline = new google.maps.Polyline({
              path: measurePoints,
              geodesic: true,
              strokeColor: 'hsl(var(--primary))',
              strokeOpacity: 1.0,
              strokeWeight: 2,
              map: map,
          });
          setMeasurePolyline(newPolyline);
      } else {
          measurePolyline.setPath(measurePoints);
      }
      
      if (measurePoints.length > 1) {
          const distance = google.maps.geometry.spherical.computeLength(measurePoints);
          setTotalDistance(distance / 1000);
      } else {
          setTotalDistance(0);
      }

  }, [measurePoints, map, geometry, isMeasuring, measurePolyline]);


  return (
    <>
        <div className="flex h-full w-full">
            <div className="flex-grow h-full relative">
                <div className="absolute top-4 left-4 z-10 w-full max-w-sm flex items-center gap-2">
                    <div className="relative flex-grow">
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
                 <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <Button variant="outline" size="icon" className="bg-background shadow-md" onClick={() => map?.setZoom((map.getZoom() || 10) + 1)}><ZoomIn className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon" className="bg-background shadow-md" onClick={() => map?.setZoom((map.getZoom() || 10) - 1)}><ZoomOut className="h-4 w-4"/></Button>
                    <Button variant={isMeasuring ? "default" : "outline"} size="icon" className="bg-background shadow-md" onClick={toggleMeasurement} title="Measure distance"><Ruler className="h-4 w-4"/></Button>
                </div>
                {isMeasuring && (
                    <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md border">
                        <div className="flex items-center gap-4">
                             <div>
                                <p className="text-xs text-muted-foreground">Total Distance</p>
                                <p className="text-lg font-bold text-primary">{totalDistance.toFixed(2)} km</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearMeasurement}>Clear</Button>
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Click points on the map to measure.</p>
                    </div>
                )}
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
                 {selectedWarehouse ? (
                    <WarehouseDetailCard 
                        warehouse={selectedWarehouse} 
                    />
                ) : summaryData ? (
                    <RegionalSummaryCard data={summaryData} onLogDemand={handleLogDemandClick} />
                ) : lastSearchedCenter ? (
                    <div className="text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">
                            This is an Untapped Opportunity!
                        </h3>
                        <p className="text-sm mt-2 mb-6 text-muted-foreground">
                           While we don't have aggregated supply data here yet, our sourcing network is always expanding. Log your demand through our demand specific warehouse sourcing service, and we'll activate our network to find a match for you.
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
