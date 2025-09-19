// src/app/api/provider-summary/route.ts
import { NextResponse } from 'next/server';
import users from '@/data/users.json';
import listings from '@/data/listings.json';
import type { User } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';

type UserData = { [email: string]: User };

// Set up CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    const providerUsers = Object.values(users as UserData).filter(
      u => u.role === 'Warehouse Developer'
    );

    const summary: { [email: string]: { listingCount: number; totalSize: number } } = {};

    providerUsers.forEach(provider => {
      const providerListings = (listings as ListingSchema[]).filter(
        l => l.developerId === provider.email && l.status === 'approved'
      );
      
      const totalSize = providerListings.reduce(
        (sum, l) => sum + l.sizeSqFt,
        0
      );

      summary[provider.email] = {
        listingCount: providerListings.length,
        totalSize: totalSize,
      };
    });

    return NextResponse.json(summary, { headers });
  } catch (error) {
    console.error('Failed to generate provider summary:', error);
    return NextResponse.json(
      { message: 'Failed to generate provider summary' },
      { status: 500, headers }
    );
  }
}
