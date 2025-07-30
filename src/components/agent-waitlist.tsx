
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { useData, type AgentLead, type AgentStatus } from '@/contexts/data-context';
import { Mail, Phone, Building, User, Linkedin, MoreHorizontal, CheckCircle, XCircle, PauseCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusConfig: { [key in AgentStatus]: { icon: React.ElementType, color: string, text: string } } = {
    Pending: { icon: PauseCircle, color: 'text-amber-600', text: 'Pending' },
    Approved: { icon: CheckCircle, color: 'text-green-600', text: 'Approved' },
    Rejected: { icon: XCircle, color: 'text-red-600', text: 'Rejected' },
    Hold: { icon: PauseCircle, color: 'text-gray-500', text: 'On Hold' },
};


export function AgentWaitlist() {
  const { agentLeads, updateAgentLeadStatus } = useData();
  const { toast } = useToast();

  const handleStatusChange = (leadId: string, status: AgentStatus) => {
    updateAgentLeadStatus(leadId, status);
    toast({
      title: 'Agent Status Updated',
      description: `The agent's status has been set to ${status}.`,
    });
  };

  if (agentLeads.length === 0) {
      return (
        <div className="text-center p-12 border rounded-lg">
            <h3 className="text-xl font-semibold">The Agent Waitlist is Empty</h3>
            <p className="text-muted-foreground mt-2">New agent registrations will appear here for your review.</p>
        </div>
      )
  }

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  return (
    <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Social Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentLeads.map(lead => {
                const statusInfo = statusConfig[lead.status];

                return (
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
                    <TableCell>
                         <Badge variant="outline" className={cn("font-medium", statusInfo.color)}>
                            <statusInfo.icon className="mr-2 h-4 w-4" />
                            {statusInfo.text}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Approved')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Rejected')}>
                                    <XCircle className="mr-2 h-4 w-4" />Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Hold')}>
                                    <PauseCircle className="mr-2 h-4 w-4" />Place on Hold
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
    </Card>
  );
}
