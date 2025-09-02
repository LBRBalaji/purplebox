
'use client';

import * as React from 'react';
import { useData, type Submission } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ListingSchema, DemandSchema } from '@/lib/schema';
import Link from 'next/link';


export function ApprovalQueue() {
    const { demands, submissions, listings, updateSubmissionStatus } = useData();
    const { toast } = useToast();
    const [pendingSubmissions, setPendingSubmissions] = React.useState<(Submission & { listing?: ListingSchema, demand?: DemandSchema })[]>([]);

    React.useEffect(() => {
        const pending = submissions
            .filter(s => s.status === 'Pending')
            .map(s => ({
                ...s,
                listing: listings.find(l => l.listingId === s.listingId),
                demand: demands.find(d => d.demandId === s.demandId)
            }));
        setPendingSubmissions(pending);
    }, [submissions, listings, demands]);

    const handleApproval = (submissionId: string, isApproved: boolean) => {
        const newStatus = isApproved ? 'Approved' : 'Rejected';
        updateSubmissionStatus(submissionId, newStatus);
        toast({
            title: `Submission ${isApproved ? 'Approved' : 'Rejected'}`,
            description: `The property match ${submissionId} has been updated.`,
        });
    };

    if (pendingSubmissions.length === 0) {
        return (
            <Card className="mt-8 text-center p-12">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Check className="h-6 w-6 text-green-500" />
                    Approval Queue is Empty
                </CardTitle>
                <CardDescription className="mt-2">There are no pending property submissions to review.</CardDescription>
            </Card>
        );
    }
    
    return (
        <div className="mt-8 space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline tracking-tight">Submissions for Approval</h2>
                <p className="text-muted-foreground mt-2">
                    Review property submissions from providers and approve or reject them.
                </p>
            </div>
            {pendingSubmissions.map(submission => {
                if (!submission.demand || !submission.listing) return null;
                const { demand, listing } = submission;

                const scoreItems = [
                    {
                        criterion: "Location",
                        demand: `${demand.locationName} (within ${demand.radius}km)`,
                        property: listing.location,
                    },
                    {
                        criterion: "Size (Sq. Ft.)",
                        demand: `${demand.size.toLocaleString()}`,
                        property: `${listing.sizeSqFt.toLocaleString()}`,
                    },
                    {
                        criterion: "Building Type",
                        demand: `${demand.buildingType || 'Any'}`,
                        property: `${listing.buildingSpecifications.buildingType}`,
                    },
                    {
                        criterion: "Ceiling Height",
                        demand: `${demand.ceilingHeight || 'N/A'} ${demand.ceilingHeightUnit || 'ft'}`,
                        property: `~${listing.area.plinthArea} ft`, // Mismatch in schema, using docks as placeholder
                    },
                    {
                        criterion: "Docks",
                        demand: `${demand.docks || 'N/A'}`,
                        property: `${listing.buildingSpecifications.numberOfDocksAndShutters}`,
                    },
                    {
                        criterion: "Approvals",
                        demand: demand.preferences.approvals || 'Good to have',
                        property: listing.certificatesAndApprovals.buildingApproval ? 'Obtained' : 'Not Obtained',
                    },
                    {
                        criterion: "Fire Safety (NOC)",
                        demand: demand.preferences.fireNoc || 'Good to have',
                        property: listing.certificatesAndApprovals.fireNOC ? 'Obtained' : 'Not Obtained',
                    },
                ];


                return (
                    <Card key={submission.submissionId}>
                        <CardHeader>
                             <CardTitle>Review Submission for Demand: <span className="text-primary">{submission.demandId}</span></CardTitle>
                             <CardDescription>
                                Submitted by: <span className="font-medium">{listing.developerName || submission.providerEmail}</span> for Listing: <Link href={`/listings/${listing.listingId}`} className="font-medium text-primary hover:underline" target='_blank'>{listing.name} ({listing.listingId})</Link>
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 border rounded-md bg-primary/5 space-y-4">
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/4">Criterion</TableHead>
                                        <TableHead>Customer Requirement</TableHead>
                                        <TableHead>Property Specification</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scoreItems.map(item => (
                                        <TableRow key={item.criterion}>
                                            <TableCell className="font-semibold">{item.criterion}</TableCell>
                                            <TableCell>{item.demand}</TableCell>
                                            <TableCell>{item.property}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => handleApproval(submission.submissionId, false)}>
                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button onClick={() => handleApproval(submission.submissionId, true)}>
                                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    );
}
