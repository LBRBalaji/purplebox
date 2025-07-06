
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PropertyForm } from "@/components/property-form";
import { DemandForm } from "@/components/demand-form";
import { DemandList } from "@/components/demand-list";
import { MyDemands } from "@/components/my-demands";
import { MySubmissions } from "@/components/my-submissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // For SuperAdmin, to show the property form
  const propertySubmitDemandId = searchParams.get('demandId');
  
  // For User, to handle demand editing
  const editDemandId = searchParams.get('editDemandId');
  const [userActiveTab, setUserActiveTab] = React.useState(editDemandId ? 'log-demand' : 'log-demand');

  React.useEffect(() => {
    const editId = searchParams.get('editDemandId');
    if (editId) {
      setUserActiveTab('log-demand');
    }
  }, [searchParams]);

  const onDemandUpserted = () => {
    // This function's sole responsibility is now to switch the tab.
    // Navigation is handled within the form's dialog.
    setUserActiveTab('my-demands');
  };

  if (user?.role === 'User') {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={userActiveTab} onValueChange={setUserActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="log-demand">{editDemandId ? 'Edit Demand' : 'Log New Demand'}</TabsTrigger>
              <TabsTrigger value="my-demands">My Demands & Matches</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            </TabsList>
            <TabsContent value="log-demand">
              <div className="mt-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold font-headline tracking-tight">{editDemandId ? 'Edit Your Demand' : 'Log a Property Demand'}</h2>
                  <p className="text-muted-foreground mt-2">{editDemandId ? 'Modify your requirements and priorities below.' : 'Describe your property requirements to get the best matches.'}</p>
                </div>
                <DemandForm onDemandLogged={onDemandUpserted} />
              </div>
            </TabsContent>
            <TabsContent value="my-demands">
              <MyDemands onSwitchTab={setUserActiveTab} />
            </TabsContent>
            <TabsContent value="shortlisted">
              <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Shortlisted Properties</CardTitle>
                        <CardDescription>Properties you shortlist will appear here. This feature is coming soon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">No shortlisted properties yet.</p>
                    </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    );
  }

  if (user?.role === 'SuperAdmin') {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="view-demands" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view-demands">
                {propertySubmitDemandId ? 'Submit Match' : 'Active Demands'}
              </TabsTrigger>
              <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
            </TabsList>
            <TabsContent value="view-demands">
              {propertySubmitDemandId ? (
                 <div className="mt-8">
                    <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Submit a Matching Property</h2>
                        <p className="text-muted-foreground mt-2">
                          Submit against Demand ID: <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">{propertySubmitDemandId}</span>
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Demands
                      </Button>
                    </div>
                    <PropertyForm />
                  </div>
              ) : (
                <DemandList />
              )}
            </TabsContent>
            <TabsContent value="my-submissions">
              <MySubmissions />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    );
  }

  // Fallback for when user is not loaded yet, or has no role.
  return null;
}
