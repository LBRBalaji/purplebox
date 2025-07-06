
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import type { DemandSchema } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';

export function DemandList() {
  const router = useRouter();
  const { demands } = useData();
  const { toast } = useToast();

  const handleSubmitMatch = (demandId: string) => {
    router.push(`/dashboard?demandId=${demandId}`);
  };

  const handleCirculateDemand = (demand: DemandSchema) => {
    let usersFromStorage;
    try {
      usersFromStorage = localStorage.getItem('warehouseorigin_users');
    } catch (error) {
       console.error("Could not read from local storage", error);
       toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "Could not retrieve provider list.",
      });
      return;
    }
    
    const allUsers = usersFromStorage ? JSON.parse(usersFromStorage) : {};

    const developerEmails = Object.values(allUsers)
      .filter((user: any) => user.role === 'SuperAdmin')
      .map((user: any) => user.email)
      .join(',');

    if (!developerEmails) {
      toast({
        variant: "destructive",
        title: "No Providers Found",
        description: "There are no registered property providers to circulate this demand to.",
      });
      return;
    }
    
    const subject = `New Property Demand Alert: ${demand.propertyType} Required`;
    const submitUrl = `${window.location.origin}/dashboard?demandId=${demand.demandId}`;
    const body = `A new property demand has been logged that may match your portfolio.

Demand ID: ${demand.demandId}
Property Type: ${demand.propertyType}
Size: ${demand.size.toLocaleString()} Sq. Ft.
Location: Near ${demand.location} (within a ${demand.radius} km radius)
Readiness: ${demand.readiness}
Description: ${demand.description || 'No additional description provided.'}
${(demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0) ? `\nNon-Compromisable Items: ${demand.preferences.nonCompromisable.join(', ')}` : ''}

If you have a suitable property, please submit it using the link below:
${submitUrl}

This demand has been circulated to multiple providers.

Thank you,
WareHouse Origin
    `;

    const mailtoLink = `mailto:?bcc=${developerEmails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Active Demands</CardTitle>
                <CardDescription>Review new demands, circulate them to providers, or submit a match directly.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Demand ID</TableHead>
                            <TableHead>Property Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Size (Sq. Ft.)</TableHead>
                            <TableHead>Readiness</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {demands.length > 0 ? (
                            demands.map((demand) => (
                                <TableRow key={demand.demandId}>
                                    <TableCell className="font-medium">{demand.demandId}</TableCell>
                                    <TableCell><Badge variant="secondary">{demand.propertyType}</Badge></TableCell>
                                    <TableCell>{demand.location}</TableCell>
                                    <TableCell>{demand.size.toLocaleString()}</TableCell>
                                    <TableCell>{demand.readiness}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button onClick={() => handleCirculateDemand(demand)} variant="outline" size="sm">
                                            <Mail className="mr-2 h-4 w-4" /> Circulate
                                        </Button>
                                        <Button onClick={() => handleSubmitMatch(demand.demandId)} size="sm">
                                            Submit Match <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No active demands.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
