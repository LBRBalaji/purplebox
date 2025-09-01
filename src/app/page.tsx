
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Building, Sparkles, Map, List } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-background">
        <div className="text-center p-8">
              <div className="mx-auto flex flex-col items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Building className="h-12 w-12 text-primary" />
                      <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-3" />
                    </div>
                    <h1 className="text-5xl font-bold font-headline text-primary">WareHouse Origin</h1>
                  </div>
                  <p className="text-lg text-muted-foreground mt-2">Sourcing Simplified</p>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4">
                  <Link href="/map-search">
                      <Button size="lg">
                          <Map className="mr-2 h-5 w-5" />
                          Browse on Map
                      </Button>
                  </Link>
                  <Link href="/listings">
                      <Button size="lg" variant="outline">
                          <List className="mr-2 h-5 w-5" />
                          View All Listings
                      </Button>
                  </Link>
              </div>
          </div>
    </div>
  );
}

    