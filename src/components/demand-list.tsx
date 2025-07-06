
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail } from 'lucide-react';
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
Size: ${demand.size.toLocaleString()} Sq. Ft.
Location: Near ${demand.location} (within a ${demand.radius} km radius)
Readiness: ${demand.readiness}
Description: ${demand.description || 'No additional description provided.'}
${(demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0) ? `\nNon-Compromisable Items: ${demand.preferences.nonCompromisable.join(', ')}` : ''}

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
        <h2 className="text-3xl font-bold font-headline tracking-tight">Active Demands</h2>
        <p className="text-muted-foreground mt-2">Review new demands, circulate them to providers, or submit a match directly.</p>
      </div>
      {demands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demands.map((demand) => (
            <Card key={demand.demandId}>
              <CardHeader>
                <CardTitle>{demand.demandId}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{demand.propertyType}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-semibold">Location:</p>
                  <p>{demand.location} (within {demand.radius}km)</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Size:</p>
                    <p>{demand.size.toLocaleString()} sq. ft.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Readiness:</p>
                    <p>{demand.readiness}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button onClick={() => handleSubmitMatch(demand.demandId)}>
                  Submit Match <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => handleCirculateDemand(demand)} variant="outline">
                    <Mail className="mr-2 h-4 w-4" /> Circulate to Providers
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12">
            <CardTitle>No Active Demands</CardTitle>
            <CardDescription className="mt-2">New demands from customers will appear here.</CardDescription>
        </Card>
      )}
    </div>
  );
}
