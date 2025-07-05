'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { List, MapPin, Box, ArrowRight } from 'lucide-react';
import { useData } from '@/contexts/data-context';


export function DemandList() {
  const router = useRouter();
  const { demands } = useData();

  const handleSubmitMatch = (demandId: string) => {
    // Navigate to the same page but with a query param to trigger the form view
    router.push(`/dashboard?demandId=${demandId}`);
  };

  return (
    <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Active Property Demands</h2>
            <p className="text-muted-foreground mt-2">Browse demands logged by users and submit a matching property.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demands.map((demand) => (
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
                                <p className="text-sm text-muted-foreground">{demand.size} Sq. Ft.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-1"><List className="w-4 h-4" /> Description</h4>
                                <p className="text-sm text-muted-foreground line-clamp-3">{demand.description}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => handleSubmitMatch(demand.demandId)} className="w-full">
                            Submit Match <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
