
// src/app/api/provider-listings/[email]/route.ts
import { NextResponse } from 'next/server';
import allListings from '@/data/listings.json';
import type { ListingSchema } from '@/lib/schema';

// Set up CORS headers - this is important for cross-origin requests
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const developerEmail = decodeURIComponent(params.email);

    if (!developerEmail) {
      return NextResponse.json(
        { message: 'Developer email is required.' },
        { status: 400, headers }
      );
    }
    
    // In a real application, this would be a database query.
    // Here, we filter the JSON data.
    const providerListings = (allListings as ListingSchema[]).filter(
      (listing) => listing.developerId === developerEmail
    );

    return NextResponse.json(providerListings, { headers });
  } catch (error) {
    console.error('Failed to fetch provider listings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch provider listings.' },
      { status: 500, headers }
    );
  }
}
