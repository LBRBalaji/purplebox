
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List } from 'lucide-react';
import Link from 'next/link';

// Placeholder components that will be built out later
const MyListings = () => (
    <Card className="mt-6">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>My Listings</CardTitle>
                <Button asChild>
                    <Link href="/dashboard/create-listing">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Listing
                    </Link>
                </Button>
            </div>
            <CardDescription>View and manage the status of your warehouse listings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center p-8 text-muted-foreground">
                <p>Listing management interface will be displayed here.</p>
            </div>
        </CardContent>
    </Card>
);

const TenantDashboard = () => (
     <Card>
        <CardHeader>
            <CardTitle>Welcome, Tenant</CardTitle>
            <CardDescription>
                You can browse all available public listings.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Button asChild>
                <Link href="/listings">
                    <List className="mr-2 h-4 w-4" /> Browse Listings
                </Link>
            </Button>
        </CardContent>
     </Card>
)

const AdminDashboard = () => (
    <Card>
       <CardHeader>
           <CardTitle>Admin Dashboard</CardTitle>
           <CardDescription>
               Manage listings, users, and platform settings from here.
           </CardDescription>
       </CardHeader>
       <CardContent>
           <div className="text-center p-8 text-muted-foreground">
               <p>Admin-specific dashboard components will be displayed here.</p>
               <p className="text-xs">(e.g., Approval Queue, User Management)</p>
           </div>
       </CardContent>
    </Card>
)

export default function DashboardPage() {
  const { user } = useAuth();
  
  const isDeveloper = user?.role === 'SuperAdmin' && user.email !== 'admin@example.com';
  const isAdmin = user?.role === 'SuperAdmin' && user.email === 'admin@example.com';
  const isTenant = user?.role === 'User';
  const isO2O = user?.role === 'O2O';

  const renderContent = () => {
    if (isDeveloper) {
      return <MyListings />;
    }
    if (isTenant) {
      return <TenantDashboard />;
    }
    if (isAdmin || isO2O) {
      return <AdminDashboard />;
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>Please wait while we load your dashboard.</CardDescription>
            </CardHeader>
        </Card>
    );
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </main>
  );
}

    