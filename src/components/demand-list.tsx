
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
import { ArrowRight, Mail, Info, ListChecks, Building, Factory, Construction, Lightbulb, MapPin, Target } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import type { DemandSchema, ListingSchema } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const priorityLabels: { [key: string]: string } = {
  size: 'Size Range',
  location: 'Location & Radius',
  ceilingHeight: 'Ceiling Height',
  docks: 'Docks',
  readiness: 'Readiness',
  approvals: 'Approvals',
  fireNoc: 'Fire NOC',
  power: 'Power',
  fireSafety: 'Fire Safety',
  buildingType: 'Building Type',
};

const haversineDistance = (coords1: {lat: number, lon: number}, coords2: {lat: number, lon: number}) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
};


function DemandCard({ demand }: { demand: DemandSchema }) {
  const router = useRouter();
  const { user } = useAuth();
  const { listings } = useData();
  const { toast } = useToast();

  const [potentialMatches, setPotentialMatches] = React.useState<ListingSchema[]>([]);

  React.useEffect(() => {
      if (user?.role === 'Warehouse Developer' && user.email && demand.location) {
          const providerListings = listings.filter(l => l.developerId === user.email && l.status === 'approved');
          const [demandLat, demandLng] = demand.location.split(',').map(Number);
          
          if (!isNaN(demandLat) && !isNaN(demandLng)) {
              const matches = providerListings.filter(listing => {
                  if(!listing.latLng) return false;
                  const [listingLat, listingLng] = listing.latLng.split(',').map(Number);
                  if (!isNaN(listingLat) && !isNaN(listingLng)) {
                      const distance = haversineDistance(
                          { lat: demandLat, lon: demandLng },
                          { lat: listingLat, lon: listingLng }
                      );
                      return distance <= (demand.radius || 25); // Use demand radius or a default of 25km
                  }
                  return false;
              });
              setPotentialMatches(matches);
          }
      }
  }, [demand, listings, user]);

  const handleSubmitMatch = (demandId: string) => {
    router.push(`/dashboard?demandId=${demandId}`);
  };

  const handleCirculateDemand = (demandToCirculate: DemandSchema) => {
    const adminPhoneNumber = "919841098170";
    const whatsappMessage = `Circulating new property demand to providers. Demand ID: ${demandToCirculate.demandId}`;
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');

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
      .filter((u: any) => u.role === 'SuperAdmin')
      .map((u: any) => u.email)
      .join(',');

    if (!developerEmails) {
      toast({
        variant: "destructive",
        title: "No Providers Found",
        description: "There are no registered property providers to circulate this demand to.",
      });
      return;
    }
    
    const subject = `New Property Demand Alert: ${demandToCirculate.operationType} Required`;
    const submitUrl = `${window.location.origin}/dashboard?demandId=${demandToCirculate.demandId}`;
    const body = `A new property demand has been logged that may match your portfolio.

Demand ID: ${demandToCirculate.demandId}
Operation Type: ${demandToCirculate.operationType}
Size: ${demandToCirculate.size.toLocaleString()} Sq. Ft.
Location: Near ${demandToCirculate.locationName || demandToCirculate.location} (within a ${demandToCirculate.radius} km radius)
Readiness: ${demandToCirculate.readiness}
Description: ${demandToCirculate.description || 'No additional description provided.'}
${(demandToCirculate.preferences?.nonCompromisable && demandToCirculate.preferences.nonCompromisable.length > 0) ? `\nNon-Compromisable Items: ${demandToCirculate.preferences.nonCompromisable.map(item => priorityLabels[item] || item).join(', ')}` : ''}

If you have a suitable property, please submit it using the link below:
${submitUrl}

This demand has been circulated to multiple providers.

Thank you,
WareHouse Origin
    `;

    const mailtoLink = `mailto:?bcc=${developerEmails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    
    setTimeout(() => {
        window.location.href = mailtoLink;
    }, 500);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{demand.demandId}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              {demand.operationType === 'Manufacturing' ? <Factory className="h-3 w-3" /> : <Building className="h-3 w-3" />}
              {demand.operationType}
            </Badge>
            {demand.buildingType && <Badge variant="outline" className="flex items-center gap-1.5"><Building className="h-3 w-3" />{demand.buildingType}</Badge>}
            {demand.optionals?.crane?.required && <Badge variant="outline" className="flex items-center gap-1.5"><Construction className="h-3 w-3" />Crane</Badge>}
          </div>
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
        {potentialMatches.length > 0 && (
          <div className="text-sm space-y-2 pt-4 mt-4 border-t border-dashed">
              <p className="font-semibold flex items-center gap-1.5 text-green-700"><Target className="h-4 w-4"/> Potential Match Found in Your Listings!</p>
              <p className="text-xs text-muted-foreground pl-1">Your listing is within the location radius. Review and click to submit.</p>
              <div className="flex flex-wrap gap-1.5 pl-1 pt-2">
                <TooltipProvider>
                    {potentialMatches.map(match => (
                        <Tooltip key={match.listingId} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Badge variant="secondary" className="border-green-300 cursor-pointer text-green-800 bg-green-100 hover:bg-green-200" onClick={() => handleSubmitMatch(demand.demandId)}>
                                  <MapPin className="h-3 w-3 mr-1.5" />
                                  {match.name}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Click to submit your listing "{match.name}" against this demand.</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
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
  )
}


export function DemandList() {
  const { demands } = useData();

  return (
    <div className="mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">Active Demands</h2>
        <p className="text-muted-foreground mt-2">Review new demands, circulate them to providers, or submit a match directly.</p>
      </div>
      {demands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demands.map((demand) => <DemandCard key={demand.demandId} demand={demand}/> )}
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
