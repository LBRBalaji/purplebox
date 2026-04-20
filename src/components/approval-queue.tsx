'use client';

import * as React from 'react';
import { useData, type ListingStatus } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check, CheckCircle, Eye, Pencil, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ListingSchema } from '@/lib/schema';
import Link from 'next/link';
import { ListingForm } from './listing-form';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function ApprovalQueue() {
    const { listings, updateListingStatus, updateListing } = useData();
    const { users, fetchUsers } = useAuth();
    const { toast } = useToast();
    const [pendingListings, setPendingListings] = React.useState<ListingSchema[]>([]);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);

    React.useEffect(() => {
        const pending = listings.filter(l => l.status === 'pending');
        setPendingListings(pending);
    }, [listings]);

    const pendingUsers = Object.values(users).filter(u => u.status === 'pending');

    const handleListingStatus = (listingId: string, newStatus: ListingStatus) => {
        updateListingStatus(listingId, newStatus);
        toast({ title: `Listing ${newStatus}`, description: `The listing has been updated.` });
    };

    const handleUserApproval = async (email: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, 'users', email), { status });
            toast({ title: `User ${status}`, description: `${email} has been ${status}.` });
            if (fetchUsers) fetchUsers();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user status.' });
        }
    };

    const handleEdit = (listing: ListingSchema) => {
        setSelectedListing(listing);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: ListingSchema) => {
        updateListing(data);
        setIsFormOpen(false);
        setSelectedListing(null);
    };

    return (
      <>
        <div className="mt-8 space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline tracking-tight">Approval Queue</h2>
                <p className="text-muted-foreground mt-2">Review and approve pending listings and user registrations.</p>
            </div>
            <Tabs defaultValue="users">
                <TabsList>
                    <TabsTrigger value="users">User Approvals {pendingUsers.length > 0 && `(${pendingUsers.length})`}</TabsTrigger>
                    <TabsTrigger value="listings">Listing Approvals {pendingListings.length > 0 && `(${pendingListings.length})`}</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    {pendingUsers.length === 0 ? (
                        <Card className="mt-4 text-center p-12">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Check className="h-6 w-6 text-green-500" />
                                No Pending Users
                            </CardTitle>
                            <CardDescription className="mt-2">All user registrations have been reviewed.</CardDescription>
                        </Card>
                    ) : (
                        <Card className="mt-4">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingUsers.map(u => (
                                            <TableRow key={u.email}>
                                                <TableCell>{u.userName}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>{u.companyName}</TableCell>
                                                <TableCell>{u.role}</TableCell>
                                                <TableCell>{u.phone}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="destructive" size="sm" onClick={() => handleUserApproval(u.email, 'rejected')}>
                                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                                        </Button>
                                                        <Button variant="default" size="sm" onClick={() => handleUserApproval(u.email, 'approved')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="listings">
                    {pendingListings.length === 0 ? (
                        <Card className="mt-4 text-center p-12">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Check className="h-6 w-6 text-green-500" />
                                No Pending Listings
                            </CardTitle>
                            <CardDescription className="mt-2">All listings have been reviewed.</CardDescription>
                        </Card>
                    ) : (
                        <Card className="mt-4">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Listing Name</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Size (Sq. Ft.)</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingListings.map(listing => {
                                            const provider = users[listing.developerId];
                                            return (
                                            <TableRow key={listing.listingId}>
                                                <TableCell className="font-medium">{listing.name}</TableCell>
                                                <TableCell>{listing.location}</TableCell>
                                                <TableCell>{(listing.sizeSqFt ?? 0).toLocaleString()}</TableCell>
                                                <TableCell>{provider?.companyName || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/listings/${listing.listingId}`} target="_blank"><Eye className="mr-2 h-4 w-4"/> View</Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(listing)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleListingStatus(listing.listingId, 'rejected')}>
                                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                                        </Button>
                                                        <Button variant="default" size="sm" onClick={() => handleListingStatus(listing.listingId, 'approved')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
        <ListingForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            listing={selectedListing}
            onSubmit={handleFormSubmit}
        />
      </>
    );
}