
'use client';

import * as React from 'react';
import { useData, type ListingStatus } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check, CheckCircle, Edit, Eye, MoreHorizontal, PauseCircle, Pencil, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ListingSchema } from '@/lib/schema';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ListingForm } from './listing-form';

export function ApprovalQueue() {
    const { listings, updateListingStatus, updateListing } = useData();
    const { toast } = useToast();
    const [pendingListings, setPendingListings] = React.useState<ListingSchema[]>([]);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);

    React.useEffect(() => {
        const pending = listings.filter(l => l.status === 'pending');
        setPendingListings(pending);
    }, [listings]);

    const handleStatusChange = (listingId: string, newStatus: ListingStatus) => {
        updateListingStatus(listingId, newStatus);
        toast({
            title: `Listing ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            description: `The listing has been updated.`,
        });
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


    if (pendingListings.length === 0) {
        return (
            <Card className="mt-8 text-center p-12">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Check className="h-6 w-6 text-green-500" />
                    Approval Queue is Empty
                </CardTitle>
                <CardDescription className="mt-2">There are no pending listings to review.</CardDescription>
            </Card>
        );
    }
    
    return (
      <>
        <div className="mt-8 space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline tracking-tight">Listings for Approval</h2>
                <p className="text-muted-foreground mt-2">
                    Review new listings from providers and approve or reject them.
                </p>
            </div>
             <Card>
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
                            {pendingListings.map(listing => (
                                <TableRow key={listing.listingId}>
                                    <TableCell className="font-medium">{listing.name}</TableCell>
                                    <TableCell>{listing.location}</TableCell>
                                    <TableCell>{listing.sizeSqFt.toLocaleString()}</TableCell>
                                    <TableCell>{listing.developerName || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/listings/${listing.listingId}`} target="_blank"><Eye className="mr-2 h-4 w-4"/> View</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(listing)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(listing.listingId, 'approved')}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(listing.listingId, 'rejected')}>
                                                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(listing.listingId, 'pending')}>
                                                        <PauseCircle className="mr-2 h-4 w-4 text-amber-500" /> Hold (Set to Pending)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
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

