
'use server';
/**
 * @fileOverview An AI agent that retrieves warehouse listings based on geographic boundaries.
 *
 * - getWarehouses - A function that fetches warehouse data.
 * - GetWarehousesInput - The input type for the getWarehouses function.
 * - GetWarehousesOutput - The return type for the getWarehouses function.
 */

import {z} from 'zod';
import { listingSchema } from '@/lib/schema';
import allListings from '@/data/listings.json';
import { type ListingSchema } from '@/lib/schema';

const GetWarehousesInputSchema = z.object({
  sw_lat: z.number().describe('The southwest latitude of the map boundary.'),
  sw_lng: z.number().describe('The southwest longitude of the map boundary.'),
  ne_lat: z.number().describe('The northeast latitude of the map boundary.'),
  ne_lng: z.number().describe('The northeast longitude of the map boundary.'),
});
export type GetWarehousesInput = z.infer<typeof GetWarehousesInputSchema>;

const GetWarehousesOutputSchema = z.object({
  warehouses: z.array(listingSchema).describe('A list of warehouses within the specified boundaries.'),
});
export type GetWarehousesOutput = z.infer<typeof GetWarehousesOutputSchema>;

export async function getWarehouses(input: GetWarehousesInput): Promise<GetWarehousesOutput> {
    // This function simulates a database query to find warehouses within the given map bounds.
    // In a real application, this would be a query to a geospatial database like PostGIS or Firestore with Geo-queries.
    const listings = allListings as ListingSchema[];

    const visibleWarehouses = listings.filter(listing => {
        if (listing.status !== 'approved' || !listing.latLng) {
            return false;
        }
        const [lat, lng] = listing.latLng.split(',').map(Number);
        if(isNaN(lat) || isNaN(lng)) return false;

        const isInLatitude = lat >= input.sw_lat && lat <= input.ne_lat;
        const isInLongitude = lng >= input.sw_lng && lng <= input.ne_lng;
        return isInLatitude && isInLongitude;
    });

    return { warehouses: visibleWarehouses };
}
