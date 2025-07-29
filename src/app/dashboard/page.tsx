
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { PropertyForm } from "@/components/property-form";
import { DemandForm } from "@/components/demand-form";
import { DemandList } from "@/components/demand-list";
import { MyDemands } from "@/components/my-demands";
import { MySubmissions } from "@/components/my-submissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ShortlistedProperties } from '@/components/shortlisted-properties';
import { Badge } from '@/components/ui/badge';
import { AdminNotifier } from '@/components/admin-notifier';
import { ApprovalQueue } from '@/components/approval-queue';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const { submissions } = useData();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // For SuperAdmin (Property Provider)
  const propertySubmitDemandId = searchParams.get('demandId');
  
  // For User (Customer)
  const editDemandId = searchParams.get('editDemandId');
  const logNewFromMap = searchParams.get('logNew');

  const initialUserTab = editDemandId || logNewFromMap ? 'log-demand' : 'my-demands';
  const [userActiveTab, setUserActiveTab] = React.useState(initialUserTab);

  const newMatchCount = React.useMemo(() => {
    if (!user) return 0;
    // Customer only sees new matches that are APPROVED
    return submissions.filter(s => s.isNew && s.demandUserEmail === user.email && s.status === 'Approved').length;
  }, [submissions, user]);


  React.useEffect(() => {
    const editId = searchParams.get('editDemandId');
    const newFromMap = searchParams.get('logNew');
    if (editId || newFromMap) {
      setUserActiveTab('log-demand');
    }
  }, [searchParams]);

  const onDemandUpserted = () => {
    setUserActiveTab('my-demands');
  };

  if (user?.email === 'admin@example.com') {
    return (
      <>
        <AdminNotifier />
        <main className="container mx-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>
                        Welcome, Admin. Your primary role is to circulate new demands and approve/reject property submissions.
                    </CardDescription>
                </CardHeader>
             </Card>
             <Tabs defaultValue="demands" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="demands">Circulate Demands</TabsTrigger>
                    <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
                </TabsList>
                <TabsContent value="demands">
                    <DemandList />
                </TabsContent>
                <TabsContent value="approvals">
                    <ApprovalQueue />
                </TabsContent>
             </Tabs>
          </div>
        </main>
      </>
    );
  }

  if (user?.role === 'User') {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={userActiveTab} onValueChange={setUserActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="log-demand">{editDemandId ? 'Edit Demand' : 'Log New Demand'}</TabsTrigger>
              <TabsTrigger value="my-demands" className="relative">
                My Demands & Matches
                {newMatchCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0 animate-pulse">{newMatchCount}</Badge>
                )}
              </TabsTrigger>
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
              <MyDemands onSwitchTab={setUserActiveTab} newMatchCount={newMatchCount} />
            </TabsContent>
            <TabsContent value="shortlisted">
              <ShortlistedProperties />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    );
  }

  if (user?.role === 'SuperAdmin') { // This now correctly handles Property Providers who are not the main admin
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
