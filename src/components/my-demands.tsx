'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';


// Mock data for demands created by the user
const myDemands = [
  {
    demandId: 'TECHCORP-1689346',
    propertyType: 'Office Space',
    location: 'Bangalore, India',
    size: '25,000 Sq. Ft.',
    matches: [
      {
        propertyId: 'PS-12345',
        propertyName: 'Prestige Tech Park',
        size: '26,000 Sq. Ft.',
        rent: '₹85/sft',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'modern office',
      },
      {
        propertyId: 'PS-67890',
        propertyName: 'Global Tech Village',
        size: '24,500 Sq. Ft.',
        rent: '₹80/sft',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'corporate building',
      }
    ],
  },
  {
    demandId: 'MYCOMPANY-1689349',
    propertyType: 'Warehouse',
    location: 'Chennai, India',
    size: '50,000 Sq. Ft.',
    matches: [],
  },
];

export function MyDemands() {
  return (
    <div className="mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">My Demands & Matches</h2>
        <p className="text-muted-foreground mt-2">Review matches submitted for your active demands.</p>
      </div>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {myDemands.map((demand) => (
          <AccordionItem value={demand.demandId} key={demand.demandId} className="border rounded-lg bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex justify-between items-center w-full">
                <div className="text-left">
                  <h3 className="font-bold text-lg">{demand.demandId}</h3>
                  <p className="text-sm text-muted-foreground">{demand.propertyType} - {demand.location}</p>
                </div>
                <Badge variant={demand.matches.length > 0 ? 'default' : 'secondary'}>
                  {demand.matches.length} {demand.matches.length === 1 ? 'Match' : 'Matches'}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              {demand.matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demand.matches.map(match => (
                    <Card key={match.propertyId}>
                      <CardHeader>
                        <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                          <Image src={match.image} alt={match.propertyName} data-ai-hint={match.dataAiHint} fill className="object-cover" />
                        </div>
                        <CardTitle>{match.propertyName}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{match.size}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rent</p>
                          <p className="font-medium">{match.rent}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button variant="outline" className="w-full" disabled>
                          <Star className="mr-2 h-4 w-4" /> Shortlist (Soon)
                        </Button>
                        <Button className="w-full" disabled>
                          <MessageSquare className="mr-2 h-4 w-4" /> Chat (Soon)
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  <p>No matches have been submitted for this demand yet.</p>
                  <p className="text-xs mt-1">Matches from property providers will appear here once submitted.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
