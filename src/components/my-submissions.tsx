
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
import { Button } from './ui/button';

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

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"
      />
    </svg>
  );


export function MySubmissions() {
    const { user } = useAuth();
    const { submissions, listings } = useData();
    const [mySubmissions, setMySubmissions] = React.useState<(Submission & {listing?: ListingSchema})[]>([]);

    React.useEffect(() => {
        if (user?.email) {
            const isAdmin = user.email === 'balaji@lakshmibalajio2o.com';
            
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
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
                <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3"><Briefcase /> Submissions</h2>
                <p className="text-muted-foreground mt-2">Track the status of properties submitted against demands.</p>
            </div>
            <a href="https://wa.me/919841098170" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                  <WhatsAppIcon className="mr-2 h-5 w-5" />
                  Chat with O2O Team
              </Button>
            </a>
        </div>
         <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Demand ID</TableHead>
                        <TableHead>Property ID</TableHead>
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
                                        {listing.listingId}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{listing.name}</p>
                                </TableCell>
                                <TableCell>{listing.location}</TableCell>
                                <TableCell>
                                    {user?.email === 'balaji@lakshmibalajio2o.com' 
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
