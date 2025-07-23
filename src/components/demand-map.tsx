
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { useFormContext } from 'react-hook-form';
import type { DemandSchema } from '@/lib/schema';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem',
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 };

function AutocompleteAndMap() {
    const map = useMap();
    const { watch, setValue } = useFormContext<DemandSchema>();
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
    const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
    const [circle, setCircle] = useState<google.maps.Circle | null>(null);
    const locationValue = watch('location');
    const radiusValue = watch('radius');
    const autocompleteInputRef = useRef<HTMLInputElement>(null);

    // Init Autocomplete
    useEffect(() => {
        if (!map || !autocompleteInputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
            fields: ["geometry.location", "formatted_address"],
        });
        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                setSelectedPlace(place);
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setValue('location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`, { shouldValidate: true, shouldDirty: true });
            }
        });
        return () => { google.maps.event.removeListener(listener); };
    }, [map, setValue]);

    // Handle map clicks
    useEffect(() => {
        if (!map) return;
        const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setValue('location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`, { shouldValidate: true, shouldDirty: true });
                setSelectedPlace(null); // Clear place selection to use lat/lng directly
            }
        });
        return () => { google.maps.event.removeListener(clickListener); };
    }, [map, setValue]);

    // Update marker and map view
    useEffect(() => {
        let position: {lat: number, lng: number} | null = null;
        if (locationValue) {
            const parts = locationValue.split(',').map(s => parseFloat(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                position = { lat: parts[0], lng: parts[1] };
            }
        }
        setMarkerPosition(position);

        if (position && map) {
            if (circle) circle.setMap(null); // Remove old circle before creating a new one

            const radiusInMeters = (radiusValue ? Number(radiusValue) : 0) * 1000;
            
            if (radiusInMeters > 0) {
                const newCircle = new google.maps.Circle({
                    strokeColor: 'hsl(var(--primary))',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: 'hsl(var(--primary))',
                    fillOpacity: 0.2,
                    map,
                    center: position,
                    radius: radiusInMeters,
                });
                setCircle(newCircle);
                const bounds = newCircle.getBounds();
                if (bounds) map.fitBounds(bounds);
            } else {
                 map.panTo(position);
                 map.setZoom(12);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationValue, radiusValue, map, setValue]);


    const handleGetLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setValue("location", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, { shouldValidate: true, shouldDirty: true });
                    setSelectedPlace(null);
                },
                (error) => alert("Could not retrieve your location.")
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }, [setValue]);

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="autocomplete">Search Location</Label>
                <div className="flex gap-2">
                    <Input id="autocomplete" ref={autocompleteInputRef} placeholder="Search or click the map" />
                    <Button type="button" variant="outline" size="icon" onClick={handleGetLocation} aria-label="Get current location"><MapPin className="w-4 h-4"/></Button>
                </div>
            </div>
            <div style={{height: '300px', width: '100%'}}>
                <Map
                    defaultCenter={defaultCenter}
                    defaultZoom={5}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId="demand-map"
                    style={containerStyle}
                >
                    {markerPosition && <AdvancedMarker position={markerPosition} />}
                </Map>
            </div>
        </div>
    );
}

export default function DemandMapWrapper() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center h-full aspect-[2/1] w-full rounded-md bg-muted text-muted-foreground p-4 text-center">
                <p className="font-semibold">Map not configured</p>
                <p className="text-sm">A Google Maps API key is required to enable this feature.</p>
            </div>
        );
    }
    
    return (
        <APIProvider apiKey={apiKey} libraries={['places']}>
            <AutocompleteAndMap />
        </APIProvider>
    );
}
