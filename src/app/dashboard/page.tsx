'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PropertyForm } from "@/components/property-form";
import { DemandForm } from "@/components/demand-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="demand" className="w-full">
              <TabsList className={cn("grid w-full", isSuperAdmin ? "grid-cols-2" : "grid-cols-1")}>
                <TabsTrigger value="demand">Log Demand</TabsTrigger>
                {isSuperAdmin && (
                  <TabsTrigger value="property">Submit Property</TabsTrigger>
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
              {isSuperAdmin && (
                <TabsContent value="property">
                    <div className="mt-8">
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Submit a Property</h2>
                        <p className="text-muted-foreground mt-2">Fill out the form below to submit a property and get an AI-generated description.</p>
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
