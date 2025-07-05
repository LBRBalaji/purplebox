'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Tag, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SubmissionStatus = "Pending" | "Shortlisted" | "Rejected";

const mockSubmissions = [
    {
        propertyId: 'PS-12345',
        propertyName: 'Prestige Tech Park',
        submittedForDemand: 'TECHCORP-1689346',
        status: 'Shortlisted' as SubmissionStatus,
    },
    {
        propertyId: 'PS-67890',
        propertyName: 'Global Tech Village',
        submittedForDemand: 'TECHCORP-1689346',
        status: 'Pending' as SubmissionStatus,
    },
    {
        propertyId: 'PS-ABCDE',
        propertyName: 'Industrial Unit, Guindy',
        submittedForDemand: 'ACME-1689345',
        status: 'Rejected' as SubmissionStatus,
    }
];

const StatusIndicator = ({ status }: { status: SubmissionStatus }) => {
    const statusConfig = {
        Shortlisted: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Shortlisted' },
        Pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', text: 'Pending Customer Review' },
        Rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Not Shortlisted' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("border-0 font-medium", config.bgColor, config.color)}>
            <Icon className="mr-2 h-4 w-4" />
            {config.text}
        </Badge>
    );
};


export function MySubmissions() {
  return (
    <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3"><Briefcase /> My Submissions</h2>
            <p className="text-muted-foreground mt-2">Track the status of properties you've submitted against demands.</p>
        </div>
        <div className="space-y-4">
            {mockSubmissions.map((submission) => (
                <Card key={submission.propertyId}>
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-primary" />
                                    {submission.propertyName}
                                </CardTitle>
                                <CardDescription className="mt-1">Property ID: {submission.propertyId}</CardDescription>
                            </div>
                            <div className="flex-shrink-0">
                                <StatusIndicator status={submission.status} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                           <Tag className="w-4 h-4" /> Submitted for demand: <span className="font-mono text-foreground">{submission.submittedForDemand}</span>
                        </p>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
