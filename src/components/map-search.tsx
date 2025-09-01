
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
import { Search, X, Building2, Scaling, CalendarCheck, CheckCircle, Info, ClipboardPlus, LogIn, ArrowLeft, Star, Ruler, ZoomIn, ZoomOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from './login-dialog';
import type { WarehouseSchema } from '@/lib/schema';
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
            <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Get Detailed and <strong className="font-semibold text-foreground">Downloadable</strong> Warehouse Proposals in 72 Hours (excluding holidays) on your Dashboard. Simple and Easy.</span>
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

function WarehouseDetailCard({ warehouse, onBack, onLogDemand }: { warehouse: WarehouseSchema, onBack: () => void, onLogDemand: (center: { lat: number; lng: number }) => void }) {
    const mainImage = warehouse.imageUrls?.[0] || 'https://placehold.co/600x400.png';
    return (
        <Card className="shadow-none border-0 h-full flex flex-col bg-transparent">
            <CardHeader>
                <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 w-fit -ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Summary
                </Button>
                <div className="aspect-video relative mb-2">
                    <Image
                        src={mainImage}
                        alt={warehouse.locationName}
                        fill
                        className="rounded-lg object-cover"
                        data-ai-hint="warehouse exterior"
                    />
                </div>
                 <CardTitle className="flex items-center gap-2 pt-2">
                    <Building2 className="h-6 w-6 text-primary"/>
                    {warehouse.locationName}
                </CardTitle>
                <CardDescription>ID: {warehouse.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                {warehouse.is3pl && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent border border-accent/20 text-sm">
                        <Star className="mr-1.5 h-4 w-4" />
                        3PL Operated
                    </Badge>
                )}
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><Scaling className="h-4 w-4"/> Size</p>
                        <p className="font-semibold">{warehouse.size.toLocaleString()} sq. ft.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><CalendarCheck className="h-4 w-4"/> Readiness</p>
                        <p className="font-semibold">{warehouse.readiness}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Ceiling Height</p>
                        <p className="font-semibold">{warehouse.specifications.ceilingHeight} ft</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Docks</p>
                        <p className="font-semibold">{warehouse.specifications.docks}</p>
                    </div>
                </div>
                <div className="pt-4">
                    <Button asChild className="w-full">
                        <Link href={`/listings/${warehouse.id}`} target="_blank">
                            View Full Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                 <LogDemandButton center={warehouse.generalizedLocation} onLogDemand={onLogDemand} variant="outline" />
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
  const markerLibrary = useMapsLibrary('marker');
  const geometry = useMapsLibrary('geometry');
  const router = useRouter();
  const { user } = useAuth();
  const { listings } = useData(); // Use live data from context
  
  const [warehouses, setWarehouses] = React.useState<WarehouseSchema[]>([]);
  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [summaryData, setSummaryData] = React.useState<RegionalSummary | null>(null);
  const [lastSearchedCenter, setLastSearchedCenter] = React.useState<{ lat: number; lng: number } | null>(null);
  const [circle, setCircle] = React.useState<google.maps.Circle | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
  const [pendingRedirectCenter, setPendingRedirectCenter] = React.useState<{ lat: number; lng: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [markers, setMarkers] = React.useState<google.maps.Marker[]>([]);
  const [markerClusterer, setMarkerClusterer] = React.useState<MarkerClusterer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<WarehouseSchema | null>(null);
  
  // States for Distance Calculator
  const [isMeasuring, setIsMeasuring] = React.useState(false);
  const [measurePoints, setMeasurePoints] = React.useState<google.maps.LatLng[]>([]);
  const [measurePolyline, setMeasurePolyline] = React.useState<google.maps.Polyline | null>(null);
  const [measureMarkers, setMeasureMarkers] = React.useState<google.maps.Marker[]>([]);
  const [totalDistance, setTotalDistance] = React.useState(0);

  // Filter listings to only show approved ones
  React.useEffect(() => {
    const approvedListings = listings
        .filter(l => l.status === 'approved')
        .map(l => ({
            id: l.listingId,
            locationName: l.location,
            isActive: true, // Only approved are considered active for the map
            is3pl: l.serviceModel === '3PL' || l.serviceModel === 'Both',
            generalizedLocation: {
                lat: parseFloat(l.latLng?.split(',')[0] || '0'),
                lng: parseFloat(l.latLng?.split(',')[1] || '0')
            },
            size: l.sizeSqFt,
            readiness: l.availabilityDate,
            specifications: {
                ceilingHeight: l.buildingSpecifications.numberOfDocksAndShutters, // Placeholder
                docks: l.buildingSpecifications.numberOfDocksAndShutters, // Placeholder
                officeSpace: true, // Placeholder
                flooringType: l.siteSpecifications.typeOfFlooringInside
            },
            imageUrls: l.documents?.filter(d => d.type === 'image').map(d => d.url) || []
        }));

    setWarehouses(approvedListings);
  }, [listings]);

  // Init marker clusterer
  React.useEffect(() => {
    if (!map || !markerLibrary || warehouses.length === 0) return;

    if (markerClusterer) {
        markerClusterer.clearMarkers();
    }
    
    const newMarkers = warehouses.map(warehouse => {
        const marker = new google.maps.Marker({
            position: warehouse.generalizedLocation,
        });
        marker.addListener('click', () => {
            setSelectedWarehouse(warehouse);
        });
        return marker;
    });

    setMarkers(newMarkers);
    const newClusterer = new MarkerClusterer({ map, markers: newMarkers });
    setMarkerClusterer(newClusterer);

    return () => {
        if (newClusterer) {
            newClusterer.clearMarkers();
        }
    };
  }, [map, markerLibrary, warehouses]);

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
      
      // Dynamic summary calculation
      const searchRadius = 25000; // 25km
      const searchCenterLatLng = new google.maps.LatLng(center.lat, center.lng);

      const nearbyWarehouses = warehouses.filter(w => {
          if (!w.isActive) return false;
          const warehouseLatLng = new google.maps.LatLng(w.generalizedLocation.lat, w.generalizedLocation.lng);
          return geometry.spherical.computeDistanceBetween(searchCenterLatLng, warehouseLatLng) <= searchRadius;
      });

      if (nearbyWarehouses.length > 0) {
        const sizes = nearbyWarehouses.map(w => w.size);
        const heights = nearbyWarehouses.map(w => w.specifications.ceilingHeight).filter(h => h > 0);
        
        const readinessCounts = nearbyWarehouses.reduce((acc, w) => {
            if (w.readiness === 'Ready for Occupancy') acc.ready++;
            else if (w.readiness === 'Available in 3 months') acc.soon++;
            else if (w.readiness === 'Under Construction' || w.readiness === '2025-Q1') acc.underConstruction++;
            return acc;
        }, { ready: 0, soon: 0, underConstruction: 0 });

        const newSummary: RegionalSummary = {
            regionName: place.name || 'Searched Area',
            totalListings: nearbyWarehouses.length,
            sizeRange: `${Math.min(...sizes).toLocaleString()} - ${Math.max(...sizes).toLocaleString()} sq. ft.`,
            readiness: readinessCounts,
            avgCeilingHeight: heights.length > 0 ? Math.round(heights.reduce((a, b) => a + b, 0) / heights.length) : 0,
            center: center,
        };
        setSummaryData(newSummary);
      } else {
        setSummaryData(null);
      }
            
      if (circle) circle.setMap(null);
      
      const newCircle = new google.maps.Circle({
            strokeColor: 'hsl(210 60% 50%)',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: 'hsl(210 60% 50%)',
            fillOpacity: 0.15,
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
    setSelectedWarehouse(null);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
    if (inputRef.current) inputRef.current.value = '';
    map?.setCenter({ lat: 20.5937, lng: 78.9629 });
    map?.setZoom(5);
  };

  const handleBackToSummary = () => {
      setSelectedWarehouse(null);
  }

  // --- Distance Calculator Logic ---

    // Toggle measurement mode
    const toggleMeasurement = () => {
        clearMeasurement();
        setIsMeasuring(prev => !prev);
    };

    // Clear measurement data
    const clearMeasurement = () => {
        measurePolyline?.setMap(null);
        measureMarkers.forEach(marker => marker.setMap(null));
        setMeasurePoints([]);
        setMeasurePolyline(null);
        setMeasureMarkers([]);
        setTotalDistance(0);
    };

    // Effect to handle map clicks for measurement
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

    // Effect to update polyline and distance
    React.useEffect(() => {
        if (!map || !geometry || !isMeasuring) return;

        // Draw markers
        measureMarkers.forEach(marker => marker.setMap(null)); // Clear old markers
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

        // Draw polyline
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
        
        // Calculate distance
        if (measurePoints.length > 1) {
            const distance = google.maps.geometry.spherical.computeLength(measurePoints);
            setTotalDistance(distance / 1000); // convert meters to kilometers
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
                    <Button variant="outline" size="icon" className="bg-background shadow-md" onClick={() => map?.setZoom((map.getZoom() || 10) + 1)}><ZoomIn/></Button>
                    <Button variant="outline" size="icon" className="bg-background shadow-md" onClick={() => map?.setZoom((map.getZoom() || 10) - 1)}><ZoomOut/></Button>
                    <Button variant={isMeasuring ? "default" : "outline"} size="icon" className="bg-background shadow-md" onClick={toggleMeasurement} title="Measure distance"><Ruler/></Button>
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
                        onBack={handleBackToSummary} 
                        onLogDemand={handleLogDemandClick} 
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
