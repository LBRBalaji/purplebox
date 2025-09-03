
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData, type SubmissionStatus } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { type Submission } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import Link from 'next/link';

const StatusIndicator = ({ status }: { status: SubmissionStatus }) => {
    const statusConfig = {
        Approved: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100/60', text: 'Approved' },
        Pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100/60', text: 'Pending' },
        Rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100/60', text: 'Rejected' },
    };

    const config = statusConfig[status];
    if (!config) return null;

    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("border-0 font-medium w-32 justify-center", config.bgColor, config.color)}>
            <Icon className="mr-2 h-4 w-4" />
            {config.text}
        </Badge>
    );
};


export function MySubmissions() {
    const { user } = useAuth();
    const { submissions, listings } = useData();
    const [mySubmissions, setMySubmissions] = React.useState<(Submission & {listing?: ListingSchema})[]>([]);

    React.useEffect(() => {
        if (user?.email) {
            const isAdmin = user.email === 'admin@example.com';
            
            const relevantSubmissions = isAdmin
                ? submissions
                : submissions.filter(sub => sub.providerEmail === user.email);
            
            const submissionsWithListing = relevantSubmissions.map(sub => ({
                ...sub,
                listing: listings.find(l => l.listingId === sub.listingId),
            }));

            setMySubmissions(submissionsWithListing);
        }
    }, [submissions, listings, user]);

  return (
    <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3"><Briefcase /> Submissions</h2>
            <p className="text-muted-foreground mt-2">Track the status of properties submitted against demands.</p>
        </div>
         <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Demand ID</TableHead>
                        <TableHead>Property Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {mySubmissions.map(submission => {
                        if (!submission.listing) return null;
                        const listing = submission.listing;
                        return (
                            <TableRow key={submission.submissionId}>
                                <TableCell className="font-medium">{submission.demandId}</TableCell>
                                <TableCell>
                                    <Link href={`/listings/${listing.listingId}`} target="_blank" className="font-medium text-primary hover:underline">
                                        {listing.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{listing.listingId}</p>
                                </TableCell>
                                <TableCell>{listing.location}</TableCell>
                                <TableCell>
                                    {user?.email === 'admin@example.com' 
                                        ? listing.developerName || submission.providerEmail 
                                        : 'Me'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <StatusIndicator status={submission.status} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    </TableBody>
                </Table>
                 {mySubmissions.length === 0 && (
                    <div className="text-center p-12 text-muted-foreground">
                        <p>You have not made any submissions yet.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
