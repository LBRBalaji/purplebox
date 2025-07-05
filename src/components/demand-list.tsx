'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { List, MapPin, Box, ArrowRight } from 'lucide-react';

// Mock data until a database is connected
const mockDemands = [
  {
    demandId: 'ACME-1689345',
    propertyType: 'Warehouse',
    location: 'Mumbai, India',
    size: '100,000 Sq. Ft.',
    description: 'Urgent requirement for a large warehouse with high ceilings and 10+ docks near the port.',
  },
  {
    demandId: 'TECHCORP-1689346',
    propertyType: 'Office Space',
    location: 'Bangalore, India',
    size: '25,000 Sq. Ft.',
    description: 'A-grade office building with modern amenities, good connectivity, and parking for 50 cars.',
  },
  {
    demandId: 'RETAILCO-1689347',
    propertyType: 'Retail Showroom',
    location: 'Delhi, India',
    size: '5,000 Sq. Ft.',
    description: 'High-street retail location with heavy footfall, large glass frontage, and high visibility.',
  },
    {
    demandId: 'GLOBAL-1689348',
    propertyType: 'Industrial Building',
    location: 'Chennai, India',
    size: '250,000 Sq. Ft.',
    description: 'Industrial facility for manufacturing, requiring heavy power load and effluent treatment plant.',
  },
];

export function DemandList() {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const handleSubmitMatch = (demandId: string) => {
    // Navigate to the 'Submit Match' tab and pass the demandId as a query parameter
    router.push(`/dashboard?tab=property&demandId=${demandId}`);
  };

  return (
    <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Active Property Demands</h2>
            <p className="text-muted-foreground mt-2">Browse demands logged by users and submit a matching property.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDemands.map((demand) => (
                <Card key={demand.demandId} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                            <span>{demand.demandId}</span>
                            <Badge variant="secondary">{demand.propertyType}</Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-2">
                           <MapPin className="w-4 h-4" /> {demand.location}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-1"><Box className="w-4 h-4" /> Size</h4>
                                <p className="text-sm text-muted-foreground">{demand.size}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-1"><List className="w-4 h-4" /> Description</h4>
                                <p className="text-sm text-muted-foreground line-clamp-3">{demand.description}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {isSuperAdmin ? (
                            <Button onClick={() => handleSubmitMatch(demand.demandId)} className="w-full">
                                Submit Match <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                           <p className="text-xs text-muted-foreground text-center w-full">Only property providers can submit a match.</p>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
