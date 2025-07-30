
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { Mail, Phone, Building, User, Linkedin } from 'lucide-react';

export function AgentWaitlist() {
  const { agentLeads } = useData();

  if (agentLeads.length === 0) {
      return (
        <Card className="mt-8 text-center p-12">
            <CardTitle>The Agent Waitlist is Empty</CardTitle>
            <CardDescription className="mt-2">New agent registrations will appear here for your review.</CardDescription>
        </Card>
      )
  }

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  return (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle>Agent Waitlist</CardTitle>
            <CardDescription>Review agents who have registered their interest in joining the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Social Profile</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentLeads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {lead.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {lead.companyName || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant={lead.agentType === 'Company' ? "secondary" : "outline"}>
                        {lead.agentType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm hover:underline">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {lead.email}
                        </a>
                         <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm hover:underline">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {lead.phone}
                        </a>
                    </div>
                  </TableCell>
                   <TableCell>
                    {lead.socialProfileId ? (
                         <a href={formatUrl(lead.socialProfileId)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                            <Linkedin className="h-4 w-4" />
                            View Profile
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                   </TableCell>
                  <TableCell>{lead.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
    </Card>
  );
}
