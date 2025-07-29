
'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, CheckCircle2, Clock, XCircle, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData, type SubmissionStatus } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { type Submission } from '@/contexts/data-context';

const StatusIndicator = ({ status }: { status: SubmissionStatus }) => {
    const statusConfig = {
        Approved: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Approved' },
        Pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', text: 'Pending Review' },
        Rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Rejected' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("border-0 font-medium w-32 justify-center", config.bgColor, config.color)}>
            <Icon className="mr-2 h-4 w-4" />
            {config.text}
        </Badge>
    );
};

type GroupedSubmission = {
    demandId: string;
    demandDetails: {
      propertyType: string;
      location: string;
    };
    properties: Submission[];
}

export function MySubmissions() {
    const { user } = useAuth();
    const { demands, submissions } = useData();
    const [groupedSubmissions, setGroupedSubmissions] = React.useState<GroupedSubmission[]>([]);

    React.useEffect(() => {
        if (user?.email) {
            // Providers see submissions they authored
            const mySubmissions = submissions.filter(sub => sub.property.userEmail === user.email);

            const grouped = mySubmissions.reduce((acc, submission) => {
                const demand = demands.find(d => d.demandId === submission.demandId);
                if (!demand) return acc;

                let group = acc.find(g => g.demandId === submission.demandId);
                if (!group) {
                    group = {
                        demandId: submission.demandId,
                        demandDetails: {
                            propertyType: demand.propertyType,
                            location: demand.locationName || demand.location,
                        },
                        properties: [],
                    };
                    acc.push(group);
                }

                group.properties.push(submission);
                return acc;

            }, [] as GroupedSubmission[]);

            setGroupedSubmissions(grouped);
        }
    }, [submissions, demands, user]);

  return (
    <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3"><Briefcase /> My Submissions</h2>
            <p className="text-muted-foreground mt-2">Track the status of properties you've submitted against demands.</p>
        </div>
        {groupedSubmissions.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {groupedSubmissions.map((submission) => (
                <AccordionItem value={submission.demandId} key={submission.demandId} className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-6 hover:no-underline data-[state=open]:border-b">
                        <div className="flex justify-between items-center w-full flex-wrap gap-4">
                            <div className="text-left">
                                <h3 className="font-bold text-lg">{submission.demandId}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {submission.demandDetails.propertyType} - {submission.demandDetails.location}
                                </p>
                            </div>
                            <Badge variant={submission.properties.length > 0 ? 'default' : 'secondary'} className="rounded-md">
                                {submission.properties.length} {submission.properties.length === 1 ? 'Submission' : 'Submissions'}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                        {submission.properties.length > 0 ? (
                            <div className="space-y-4">
                                {submission.properties.map(property => (
                                    <Card key={property.property.propertyId} className="flex items-center justify-between p-4 flex-wrap gap-2">
                                        <div>
                                            <p className="font-semibold">{property.property.userCompanyName}</p>
                                            <p className="text-sm text-muted-foreground">Property ID: {property.property.propertyId}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {property.matchResult && (
                                              <Badge variant="outline" className="border-primary/80 bg-primary/10 text-primary font-semibold">
                                                <Percent className="mr-1.5 h-4 w-4" />
                                                <span>{(property.matchResult.overallScore * 100).toFixed(0)}% Match</span>
                                              </Badge>
                                            )}
                                            <StatusIndicator status={property.status} />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-center py-8">
                                <p>You have not submitted any properties for this demand.</p>
                                <p className="text-xs mt-1">Use the "Active Demands" tab to submit a property.</p>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        ) : (
            <Card className="text-center p-12">
                <CardTitle>No Submissions Found</CardTitle>
                <CardDescription className="mt-2">Properties you submit against demands will appear here.</CardDescription>
            </Card>
        )}
    </div>
  );
}
