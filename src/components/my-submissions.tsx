'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SubmissionStatus = "Pending" | "Shortlisted" | "Rejected";

const mockSubmissions = [
    {
        demandId: 'TECHCORP-1689346',
        demandDetails: {
          propertyType: 'Office Space',
          location: 'Bangalore, India',
        },
        properties: [
          {
            propertyId: 'PS-12345',
            propertyName: 'Prestige Tech Park',
            status: 'Shortlisted' as SubmissionStatus,
          },
          {
            propertyId: 'PS-67890',
            propertyName: 'Global Tech Village',
            status: 'Pending' as SubmissionStatus,
          },
        ],
    },
    {
        demandId: 'ACME-1689345',
        demandDetails: {
          propertyType: 'Warehouse',
          location: 'Mumbai, India',
        },
        properties: [
          {
            propertyId: 'PS-ABCDE',
            propertyName: 'Industrial Unit, Guindy',
            status: 'Rejected' as SubmissionStatus,
          },
        ],
    },
    {
        demandId: 'RETAILCO-1689347',
        demandDetails: {
            propertyType: 'Retail Showroom',
            location: 'Delhi, India',
        },
        properties: [],
    }
];

const StatusIndicator = ({ status }: { status: SubmissionStatus }) => {
    const statusConfig = {
        Shortlisted: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Shortlisted' },
        Pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', text: 'Pending Review' },
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
        <Accordion type="single" collapsible className="w-full space-y-4">
            {mockSubmissions.map((submission) => (
                <AccordionItem value={submission.demandId} key={submission.demandId} className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                                <h3 className="font-bold text-lg">{submission.demandId}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {submission.demandDetails.propertyType} - {submission.demandDetails.location}
                                </p>
                            </div>
                            <Badge variant={submission.properties.length > 0 ? 'default' : 'secondary'}>
                                {submission.properties.length} {submission.properties.length === 1 ? 'Submission' : 'Submissions'}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                        {submission.properties.length > 0 ? (
                            <div className="space-y-4">
                                {submission.properties.map(property => (
                                    <Card key={property.propertyId} className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-semibold">{property.propertyName}</p>
                                            <p className="text-sm text-muted-foreground">Property ID: {property.propertyId}</p>
                                        </div>
                                        <StatusIndicator status={property.status} />
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
    </div>
  );
}