'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PropertyForm } from "@/components/property-form";
import { DemandForm } from "@/components/demand-form";
import { DemandList } from "@/components/demand-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  
  const defaultTab = searchParams.get('tab') || 'demand';

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
          <Tabs defaultValue={defaultTab} key={defaultTab} className="w-full">
              <TabsList className={cn("grid w-full", isSuperAdmin ? "grid-cols-3" : "grid-cols-2")}>
                <TabsTrigger value="demand">Log Demand</TabsTrigger>
                <TabsTrigger value="demands">View Demands</TabsTrigger>
                {isSuperAdmin && (
                  <TabsTrigger value="property">Submit Match</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="demand">
                <div className="mt-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Log a Property Demand</h2>
                    <p className="text-muted-foreground mt-2">Describe your property requirements to find the best matches.</p>
                  </div>
                  <DemandForm />
                </div>
              </TabsContent>
               <TabsContent value="demands">
                  <DemandList />
              </TabsContent>
              {isSuperAdmin && (
                <TabsContent value="property">
                    <div className="mt-8">
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Submit a Matching Property</h2>
                        <p className="text-muted-foreground mt-2">Fill out the form below to submit a property against a specific demand.</p>
                      </div>
                      <PropertyForm />
                    </div>
                </TabsContent>
              )}
          </Tabs>
      </div>
    </main>
  );
}
