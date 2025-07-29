
'use client';

import {
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
  AdvancedMarker
} from '@vis.gl/react-google-maps';
import * as React from 'react';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { getWarehousesAction } from '@/lib/actions';
import { type WarehouseSchema } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Building, MapPin, Search, Scaling, HardHat, CheckCircle, Truck, Info, Star, Hash, CalendarDays, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type WarehouseMarkerProps = {
    warehouse: WarehouseSchema;
    onClick: () => void;
};

const WarehouseMarker = ({ warehouse, onClick }: WarehouseMarkerProps) => {
    const [ref, marker] = useAdvancedMarkerRef();

    React.useEffect(() => {
        if (!marker) return;
        const listener = marker.addListener('gmp-click', onClick);
        return () => listener.remove();
    }, [marker, onClick]);

    return (
        <AdvancedMarker ref={ref} position={warehouse.generalizedLocation}>
            <div className="w-6 h-6 rounded-full bg-primary/80 border-2 border-primary-foreground ring-2 ring-primary shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Building className="w-3 h-3 text-primary-foreground" />
            </div>
        </AdvancedMarker>
    );
}

type RegionSummary = {
    name: string;
    total: number;
    minSize: number;
    maxSize: number;
    readiness: { [key: string]: number };
}

function MapSearchContent({ mapId }: { mapId: string }) {
  const map = useMap();
  const places = useMapsLibrary('places');
  const { toast } = useToast();

  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [warehouses, setWarehouses] = React.useState<WarehouseSchema[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<WarehouseSchema | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [regionSummary, setRegionSummary] = React.useState<RegionSummary | null>(null);
  
  const markersRef = React.useRef<{[key: string]: google.maps.marker.AdvancedMarkerElement}>({});
  const clustererRef = React.useRef<MarkerClusterer | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const idleListenerRef = React.useRef<google.maps.MapsEventListener | null>(null);

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
  
  // Initialize MarkerClusterer
  React.useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
        clustererRef.current = new MarkerClusterer({ map });
    }
  }, [map]);

  const calculateRegionSummary = (warehousesInView: WarehouseSchema[], placeName: string) => {
    if (warehousesInView.length === 0) {
        setRegionSummary(null);
        return;
    }

    const total = warehousesInView.length;
    const sizes = warehousesInView.map(w => w.size);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const readiness = warehousesInView.reduce((acc, w) => {
        acc[w.readiness] = (acc[w.readiness] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});

    setRegionSummary({ name: placeName, total, minSize, maxSize, readiness });
  }

  // Handle search box places changing
  React.useEffect(() => {
    if (!searchBox || !map) return;
    const listener = searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places && places.length > 0 && places[0].geometry) {
        const place = places[0];
        map.fitBounds(place.geometry.viewport!);
        // We need to wait for the map to be idle after fitting bounds to get the correct warehouses
        const idleListener = map.addListener('idle', async () => {
            const bounds = map.getBounds();
            if (!bounds) return;
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const warehousesInView = await getWarehousesAction({
                sw_lat: sw.lat(), sw_lng: sw.lng(), ne_lat: ne.lat(), ne_lng: ne.lng()
            });
            if (warehousesInView.warehouses) {
                calculateRegionSummary(warehousesInView.warehouses, place.formatted_address || 'Selected Area');
            }
            google.maps.event.removeListener(idleListener);
        });
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    }
  }, [searchBox, map]);

  const fetchAndSetWarehouses = React.useCallback(async () => {
    if (!map) return;
    setIsLoading(true);

    const bounds = map.getBounds();
    if (!bounds) {
        setIsLoading(false);
        return;
    };

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    try {
      const result = await getWarehousesAction({
        sw_lat: sw.lat(),
        sw_lng: sw.lng(),
        ne_lat: ne.lat(),
        ne_lng: ne.lng(),
      });

      if (result.error) throw new Error(result.error);
      
      setWarehouses(result.warehouses || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load warehouses',
        description: (error as Error).message,
      });
    } finally {
        setIsLoading(false);
    }
  }, [map, toast]);

  // Fetch warehouses on map idle
  React.useEffect(() => {
    if (!map) return;
    if (idleListenerRef.current) {
        google.maps.event.removeListener(idleListenerRef.current);
    }
    idleListenerRef.current = map.addListener('idle', fetchAndSetWarehouses);
    fetchAndSetWarehouses();

    return () => {
        if (idleListenerRef.current) {
            google.maps.event.removeListener(idleListenerRef.current);
        }
    }
  }, [map, fetchAndSetWarehouses]);

  const handleMarkerClick = React.useCallback((warehouse: WarehouseSchema) => {
    setSelectedWarehouse(warehouse);
    setIsSheetOpen(true);
    if(map) {
        map.panTo(warehouse.generalizedLocation);
        map.setZoom(14);
    }
  }, [map]);
  
  // Update clusters when warehouses change
  React.useEffect(() => {
    clustererRef.current?.clearMarkers();
    const markers = warehouses.map(warehouse => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: warehouse.generalizedLocation,
            gmpClickable: true
        });
        marker.addEventListener('gmp-click', () => handleMarkerClick(warehouse));
        return marker;
    });
    clustererRef.current?.addMarkers(markers);
  }, [warehouses, handleMarkerClick]);


  return (
    <>
      <div className="absolute top-4 left-1/2 z-10 w-full max-w-sm -translate-x-1/2 rounded-lg bg-background p-2 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search for a city or region..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {isLoading && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <Badge variant="secondary" className="gap-2 p-2 shadow-md">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </Badge>
        </div>
      )}
      <Map
        defaultCenter={{ lat: 13.13, lng: 79.91 }}
        defaultZoom={10}
        mapId={mapId}
        disableDefaultUI={true}
        gestureHandling="greedy"
        className="h-full w-full"
      >
        {/* Markers are now managed by the MarkerClusterer so we don't render them here */}
      </Map>
      
      {regionSummary && (
        <Card className="absolute bottom-4 left-1/2 z-10 w-full max-w-md -translate-x-1/2 shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">Supply Summary</CardTitle>
                        <p className="text-sm text-primary font-medium">{regionSummary.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRegionSummary(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full"><Hash className="h-5 w-5 text-primary" /></div>
                    <div>
                        <p className="text-muted-foreground">Total Listings</p>
                        <p className="font-semibold">{regionSummary.total}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full"><Scaling className="h-5 w-5 text-primary" /></div>
                    <div>
                        <p className="text-muted-foreground">Size Range (sq. ft.)</p>
                        <p className="font-semibold">{regionSummary.minSize.toLocaleString()} - {regionSummary.maxSize.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 col-span-full">
                    <div className="p-2 bg-primary/10 rounded-full mt-1"><CalendarDays className="h-5 w-5 text-primary" /></div>
                    <div>
                        <p className="text-muted-foreground">Readiness Status</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            {Object.entries(regionSummary.readiness).map(([status, count]) => (
                                <p key={status} className="font-semibold">
                                    {count} <span className="font-normal text-muted-foreground">{status}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {selectedWarehouse && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-full sm:max-w-md p-0">
                <ScrollArea className="h-full">
                    <div className="pb-6">
                        <SheetHeader className="p-6 space-y-2">
                           <Carousel className="w-full">
                                <CarouselContent>
                                    {selectedWarehouse.imageUrls.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <div className="aspect-video relative rounded-lg overflow-hidden">
                                            <Image src={url} alt={`${selectedWarehouse.title} - image ${index + 1}`} fill className="object-cover" data-ai-hint="warehouse interior" />
                                        </div>
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="-left-2"/>
                                <CarouselNext className="-right-2" />
                            </Carousel>

                            <SheetTitle className="text-2xl pt-4">{selectedWarehouse.title}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> {selectedWarehouse.address.city}, {selectedWarehouse.address.state} (Generalized Location)
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-6 space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                               <CardItem icon={Scaling} label="Size" value={`${selectedWarehouse.size.toLocaleString()} sq. ft.`} />
                               <CardItem icon={HardHat} label="Readiness" value={selectedWarehouse.readiness} badgeColor={getReadinessBadgeColor(selectedWarehouse.readiness)} />
                           </div>
                           
                           <div className="space-y-4 pt-4">
                               <h4 className="font-semibold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Specifications</h4>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <SpecItem icon={Building} label="Ceiling Height" value={`${selectedWarehouse.specifications.ceilingHeight} ft`} />
                                   <SpecItem icon={Truck} label="Docks" value={String(selectedWarehouse.specifications.docks)} />
                                   <SpecItem icon={CheckCircle} label="Office Space" value={selectedWarehouse.specifications.officeSpace ? 'Included' : 'Not Included'} />
                                   <SpecItem icon={Star} label="Flooring" value={selectedWarehouse.specifications.flooringType} />
                               </div>
                           </div>
                           <div className="flex flex-col gap-2 pt-4">
                                <Button size="lg">I'm Interested</Button>
                                <Button variant="outline">Contact Provider</Button>
                           </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
      )}
    </>
  );
}

const CardItem = ({ icon: Icon, label, value, badgeColor }: { icon: React.ElementType, label: string, value: string, badgeColor?: string }) => (
    <div className="p-4 rounded-lg bg-secondary">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Icon className="h-4 w-4"/>
            <span className="text-sm">{label}</span>
        </div>
        {badgeColor ? (
             <Badge className={badgeColor}>{value}</Badge>
        ) : (
            <p className="font-bold text-lg">{value}</p>
        )}
    </div>
);

const SpecItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);

const getReadinessBadgeColor = (readiness: string) => {
    switch (readiness) {
        case 'Ready for Occupancy': return 'bg-green-500 hover:bg-green-600 text-white';
        case 'Under Construction': return 'bg-amber-500 hover:bg-amber-600 text-white';
        default: return 'bg-secondary text-secondary-foreground';
    }
}


export function MapSearch({ mapId }: { mapId: string }) {
  return (
    <div className="h-screen w-screen relative">
      <MapSearchContent mapId={mapId} />
    </div>
  );
}

    