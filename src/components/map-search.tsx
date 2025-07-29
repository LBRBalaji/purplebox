
'use client';

import {
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import * as React from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';


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
      
      <Map
        defaultCenter={{ lat: 13.13, lng: 79.91 }}
        defaultZoom={10}
        mapId={mapId}
        disableDefaultUI={true}
        gestureHandling="greedy"
        className="h-full w-full"
      >
        {/* Markers have been removed to provide a clean slate */}
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
