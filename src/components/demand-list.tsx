
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { List, MapPin, Box, ArrowRight, Mail } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import type { DemandSchema } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';


export function DemandList() {
  const router = useRouter();
  const { demands } = useData();
  const { toast } = useToast();

  const handleSubmitMatch = (demandId: string) => {
    router.push(`/dashboard?demandId=${demandId}`);
  };

  const handleCirculateDemand = (demand: DemandSchema) => {
    let usersFromStorage;
    try {
      usersFromStorage = localStorage.getItem('warehouseorigin_users');
    } catch (error) {
       console.error("Could not read from local storage", error);
       toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "Could not retrieve provider list.",
      });
      return;
    }
    
    const allUsers = usersFromStorage ? JSON.parse(usersFromStorage) : {};

    const developerEmails = Object.values(allUsers)
      .filter((user: any) => user.role === 'SuperAdmin')
      .map((user: any) => user.email)
      .join(',');

    if (!developerEmails) {
      toast({
        variant: "destructive",
        title: "No Providers Found",
        description: "There are no registered property providers to circulate this demand to.",
      });
      return;
    }
    
    const subject = `New Property Demand Alert: ${demand.propertyType} Required`;
    const submitUrl = `${window.location.origin}/dashboard?demandId=${demand.demandId}`;
    const body = `A new property demand has been logged that may match your portfolio.

Demand ID: ${demand.demandId}
Property Type: ${demand.propertyType}
Size: ${demand.size} Sq. Ft.
Location: Near ${demand.location} (within a ${demand.radius} km radius)
Description: ${demand.description || 'No additional description provided.'}

If you have a suitable property, please submit it using the link below:
${submitUrl}

This demand has been circulated to multiple providers.

Thank you,
WareHouse Origin
    `;

    const mailtoLink = `mailto:?bcc=${developerEmails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    
    window.location.href = mailtoLink;
  };


  return (
    <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Review & Circulate Demands</h2>
            <p className="text-muted-foreground mt-2">Review new demands, circulate them to providers, or submit a match directly.</p>
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
                                <p className="text-sm text-muted-foreground line-clamp-3">{demand.description || "No additional description provided."}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-2 items-stretch">
                        <Button onClick={() => handleCirculateDemand(demand)} variant="outline" className="w-full">
                            <Mail className="mr-2 h-4 w-4" /> Circulate
                        </Button>
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
