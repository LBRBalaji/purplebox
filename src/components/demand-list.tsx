
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
import { ArrowRight, Mail, Info, ListChecks } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import type { DemandSchema } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

const priorityLabels: { [key: string]: string } = {
  size: 'Size Range',
  location: 'Location',
  ceilingHeight: 'Ceiling Height',
  docks: 'Docks',
  readiness: 'Readiness',
  approvals: 'Approvals',
  fireNoc: 'Fire NOC',
  power: 'Power',
  fireSafety: 'Fire Safety',
  buildingType: 'Building Type',
};

export function DemandList() {
  const router = useRouter();
  const { user } = useAuth();
  const { demands } = useData();
  const { toast } = useToast();

  const handleSubmitMatch = (demandId: string) => {
    router.push(`/dashboard?demandId=${demandId}`);
  };
  
  const handleCirculateDemand = (demand: DemandSchema) => {
    // 1. Notify Admin on WhatsApp that a demand is being circulated
    const adminPhoneNumber = "919841098170";
    const whatsappMessage = `Circulating new property demand to providers. Demand ID: ${demand.demandId}`;
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');


    // 2. Prepare email for providers
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
Location: Near ${demand.locationName || demand.location} (within a ${demand.radius} km radius)
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
    
    // Use a small delay to ensure the WhatsApp tab opens first, then open the mail client.
    setTimeout(() => {
        window.location.href = mailtoLink;
    }, 500);
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
            <Card key={demand.demandId} className="flex flex-col">
              <CardHeader>
                <CardTitle>{demand.demandId}</CardTitle>
                <CardDescription asChild>
                  <div><Badge variant="secondary">{demand.propertyType}</Badge></div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div className="text-sm">
                  <p className="font-semibold">Location:</p>
                  <p>{demand.locationName || demand.location} (within {demand.radius}km)</p>
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
                {demand.description && (
                  <div className="text-sm space-y-1 pt-2">
                    <p className="font-semibold flex items-center gap-1.5"><Info className="h-4 w-4" /> Description:</p>
                    <p className="text-muted-foreground text-xs pl-1 line-clamp-3">{demand.description}</p>
                  </div>
                )}
                {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
                    <div className="text-sm space-y-2 pt-2">
                      <p className="font-semibold flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Priorities:</p>
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {demand.preferences.nonCompromisable.map(item => <Badge key={item} variant="outline" className="font-normal">{priorityLabels[item] || item}</Badge>)}
                      </div>
                    </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button onClick={() => handleSubmitMatch(demand.demandId)}>
                  Submit Match <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {user?.email === 'admin@example.com' && (
                  <Button onClick={() => handleCirculateDemand(demand)} variant="outline">
                      <Mail className="mr-2 h-4 w-4" /> Circulate to Providers
                  </Button>
                )}
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
