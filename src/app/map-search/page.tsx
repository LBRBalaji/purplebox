
'use client';

import { MapSearch } from '@/components/map-search';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function MapSearchPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // Use a fallback demo map ID to ensure map loads for demonstration.
  // Replace with your actual Map ID from the Google Cloud console when ready.
  const mapId = process.env.NEXT_PUBLIC_MAP_ID || 'DEMO_MAP_ID';

  if (!apiKey) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background text-foreground">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Map Feature Not Available</h1>
          <p className="mt-2 text-muted-foreground">
            The Google Maps API key is missing. Please add it to your environment variables to enable this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col">
      <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'geometry', 'visualization']}>
        <MapSearch mapId={mapId}/>
      </APIProvider>
    </div>
  );
}
