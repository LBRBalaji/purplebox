
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useData, type ListingStatus } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';
import { Badge } from './ui/badge';
import { Archive, BarChart2, Building, CircleCheck, ClipboardList, Edit, Eye, History, PlusCircle, Repeat, Truck, Unarchive } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ListingForm } from './listing-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';


function ProviderListingCard({ listing, onStatusChange }: { listing: ListingSchema, onStatusChange: (status: ListingStatus) => void }) {
  const statusConfig: Record<ListingStatus, { text: string; className: string, icon: React.ElementType }> = {
    approved: { text: "Approved", className: "bg-green-100 text-green-800", icon: CircleCheck },
    pending: { text: "Pending", className: "bg-amber-100 text-amber-800", icon: History },
    rejected: { text: "Rejected", className: "bg-red-100 text-red-800", icon: Eye },
    leased: { text: "Leased", className: "bg-blue-100 text-blue-800", icon: ClipboardList }
  };
  const status = statusConfig[listing.status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800', icon: Eye };
  const StatusIcon = status.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
              <CardTitle>
                <Link href={`/listings/${listing.listingId}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
                  {listing.name}
                </Link>
              </CardTitle>
              <CardDescription>{listing.location} - {listing.sizeSqFt.toLocaleString()} sq. ft.</CardDescription>
            </div>
             <Badge className={status.className}><StatusIcon className="mr-1.5 h-3 w-3" /> {status.text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
      </CardContent>
       <CardFooter className="flex-col items-stretch gap-2">
            {listing.status === 'leased' ? (
                <Button onClick={() => onStatusChange('pending')}>
                    <Unarchive className="mr-2 h-4 w-4" /> Re-list Property
                </Button>
            ) : (
                 <Button onClick={() => onStatusChange('leased')}>
                    <Archive className="mr-2 h-4 w-4" /> Mark as Leased
                </Button>
            )}
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Listing
            </Button>
       </CardFooter>
    </Card>
  );
}

export function ProviderListings() {
  const { user } = useAuth();
  const { listings, listingAnalytics, addListing, updateListingStatus } = useData();
  const [myListings, setMyListings] = React.useState<ListingSchema[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user?.email) {
      setMyListings(listings.filter(l => l.developerId === user.email));
    }
  }, [listings, user]);
  
  const handleStatusChange = (listingId: string, status: ListingStatus) => {
    updateListingStatus(listingId, status, user?.email);
    toast({
        title: 'Listing Status Updated',
        description: `The listing has been moved to ${status === 'leased' ? 'Archived' : 'Active'}.`,
    });
  };

  const handleFormSubmit = (data: ListingSchema) => {
    addListing(data, user?.email);
    setIsFormOpen(false);
  }

  const activeListings = myListings.filter(l => l.status !== 'leased');
  const archivedListings = myListings.filter(l => l.status === 'leased');

  return (
    <>
      <div className="mt-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Building /> My Property Listings
            </h2>
            <p className="text-muted-foreground mt-2">
                Create new listings, manage active properties, and view your archived deals.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Listing
          </Button>
        </div>
        <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">
                    <Truck className="mr-2 h-4 w-4" />
                    Active Listings ({activeListings.length})
                </TabsTrigger>
                <TabsTrigger value="archived">
                    <Archive className="mr-2 h-4 w-4" />
                    Archived (Leased) ({archivedListings.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-6">
                {activeListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeListings.map(listing => (
                        <ProviderListingCard 
                            key={listing.listingId} 
                            listing={listing} 
                            onStatusChange={(newStatus) => handleStatusChange(listing.listingId, newStatus)}
                        />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                        <CardTitle>No Active Listings Found</CardTitle>
                        <CardDescription className="mt-2">Use the button above to create your first warehouse listing.</CardDescription>
                    </Card>
                )}
            </TabsContent>
             <TabsContent value="archived" className="mt-6">
                {archivedListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archivedListings.map(listing => (
                        <ProviderListingCard 
                            key={listing.listingId} 
                            listing={listing} 
                            onStatusChange={(newStatus) => handleStatusChange(listing.listingId, newStatus)}
                        />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                        <CardTitle>No Archived Listings</CardTitle>
                        <CardDescription className="mt-2">When you mark a property as "Leased", it will appear here.</CardDescription>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
      </div>
      <ListingForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
