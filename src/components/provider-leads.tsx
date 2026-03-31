'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, Mail, Phone, ThumbsUp, X, ArrowRight, UserCheck, Handshake, Building, Link2, Clock, HelpCircle, UserPlus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus, ListingSchema, RegisteredLeadProperty } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AcknowledgeLeadDialog } from './acknowledge-lead-dialog';
import { DeveloperEngagePath } from './developer-engage-path';
import { type AcknowledgmentDetails } from '@/lib/schema';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const statusConfig: { [key in RegisteredLeadStatus]: { text: string; color: string, icon: React.ElementType } } = {
  Pending: { text: 'Pending', color: 'text-amber-600', icon: Clock },
  Acknowledged: { text: 'Acknowledged', color: 'text-green-600', icon: Check },
  Rejected: { text: 'Rejected', color: 'text-red-600', icon: X },
};

function AdvancedSearch({ allProviders, allCustomers, onFilterChange }: { allProviders: User[], allCustomers: User[], onFilterChange: (filters: any) => void }) {
    const [keyword, setKeyword] = React.useState('');
    const [provider, setProvider] = React.useState('all');
    const [customer, setCustomer] = React.useState('all');
    const [status, setStatus] = React.useState<RegisteredLeadStatus | 'all'>('all');

    const handleFilter = () => {
        onFilterChange({ keyword, provider, customer, status });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Advanced Search</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input 
                    placeholder="Search Lead ID, Name, Summary..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="lg:col-span-2"
                />
                 <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger><SelectValue placeholder="Filter by Provider..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {allProviders.map(p => <SelectItem key={p.email} value={p.email}>{p.companyName}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={customer} onValueChange={setCustomer}>
                    <SelectTrigger><SelectValue placeholder="Filter by Customer..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {allCustomers.map(c => <SelectItem key={c.email} value={c.email}>{c.companyName}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Filter by Status..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                 <Button onClick={handleFilter} className="w-full">Apply Filters</Button>
            </CardContent>
        </Card>
    )
}

export function ProviderLeads({ view = 'default' }: { view?: 'default' | 'broking' }) {
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, acknowledgeLeadProperties } = useData();
  const router = useRouter();
  const { toast } = useToast();

  const [leadToAcknowledge, setLeadToAcknowledge] = React.useState<RegisteredLead | null>(null);
  const [expandedLeadId, setExpandedLeadId] = React.useState<string | null>(null);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<any>({});
  
  const isAgent = user?.role === 'Agent';
  const isAdminOrO2O = user?.role === 'O2O' || user?.role === 'SuperAdmin';
  const isProvider = user?.role === 'Warehouse Developer';

  const myLeads = React.useMemo(() => {
    if (!user) return [];

    let baseLeads: RegisteredLead[] = [];

    if (isAdminOrO2O) {
      if (view === 'broking') {
        baseLeads = registeredLeads.filter(lead => lead.isO2OCollaborator);
      } else {
        baseLeads = registeredLeads; 
      }
    } else if (isAgent) {
      baseLeads = registeredLeads.filter(lead => lead.registeredBy === user.email);
    } else {
      baseLeads = registeredLeads.filter(lead => 
        lead.providers.some(p => p.providerEmail === user.email)
      );
    }
    
    if (Object.keys(filters).length === 0) {
        return baseLeads;
    }
    
    return baseLeads.filter(lead => {
        if (filters.keyword) {
            const lowerKeyword = filters.keyword.toLowerCase();
            const toSearch = [lead.id, lead.leadName, lead.requirementsSummary].join(' ').toLowerCase();
            if (!toSearch.includes(lowerKeyword)) return false;
        }
        if (filters.provider && filters.provider !== 'all' && !lead.providers.some(p => p.providerEmail === filters.provider)) {
            return false;
        }
        if (filters.customer && filters.customer !== 'all' && lead.customerId !== filters.customer) {
            return false;
        }
        if (filters.status && filters.status !== 'all' && !lead.providers.some(p => p.properties.some(prop => prop.status === filters.status))) {
            return false;
        }
        return true;
    });

  }, [registeredLeads, user, isAgent, isAdminOrO2O, view, filters]);
  
  const handleRegisterWithProvider = (lead: RegisteredLead) => {
    const query = new URLSearchParams();
    query.set('tab', 'register');
    query.set('prefillFromLead', lead.id);
    router.push(`/dashboard/transactions?${query.toString()}`);
  };

  const handleAcknowledgeClick = (lead: RegisteredLead) => {
    setLeadToAcknowledge(lead);
    setIsAcknowledgeDialogOpen(true);
  };
  
  const handleAcknowledgeSubmit = (details: AcknowledgmentDetails) => {
    if (leadToAcknowledge && user?.email) {
      acknowledgeLeadProperties(leadToAcknowledge.id, user.email, details);
      toast({
        title: "Lead Acknowledged",
        description: `You have successfully acknowledged lead ${leadToAcknowledge.id}.`
      });
    }
    setIsAcknowledgeDialogOpen(false);
    setLeadToAcknowledge(null);
  }
  
  const allProviders = Object.values(users).filter(u => u.role === 'Warehouse Developer');
  const allCustomers = Object.values(users).filter(u => u.role === 'User');


  if (isAuthLoading) {
    return null; // Don't render until auth data is loaded
  }

  if (myLeads.length === 0 && Object.keys(filters).length === 0) {
    return (
      <div className="mt-8">
        <Card className="text-center p-12">
            <CardTitle>
                {view === 'broking'
                    ? 'No Broking Leads Found'
                    : isAgent
                    ? 'You Have Not Registered Any Leads'
                    : 'No Leads Found'}
            </CardTitle>
            <CardDescription className="mt-2">
                 {view === 'broking'
                    ? 'Leads from free listings will appear here.'
                    : isAgent 
                    ? 'Use the "Register New Lead" tab to get started.' 
                    : 'When a new lead is registered with you, it will appear here.'}
            </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <>
        <div className="mt-8">
             {isAdminOrO2O && <AdvancedSearch allProviders={allProviders} allCustomers={allCustomers} onFilterChange={setFilters} />}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lead Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Requirements Summary</TableHead>
                                {isAgent || isAdminOrO2O ? (
                                  <>
                                    <TableHead>Developers</TableHead>
                                    <TableHead>Acknowledgment Status</TableHead>
                                  </>
                                ) : (
                                  <>
                                    <TableHead>Registered By</TableHead>
                                    <TableHead className="text-center">Your Status</TableHead>
                                  </>
                                )}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myLeads.map(lead => {
                                const leadKey = lead.id;
                                const providerInfoForCurrentUser = lead.providers.find(p => p.providerEmail === user?.email);
                                const hasPending = isProvider && providerInfoForCurrentUser?.properties.some(p => p.status === 'Pending');
                                // Acknowledge button should only show for brokered deals that have pending items.
                                const shouldShowAcknowledgeButton = hasPending && lead.isO2OCollaborator;
                                const isAlreadyRegisteredWithProvider = lead.providers.some(p => p.providerEmail !== 'superadmin@o2o.com');
                                
                                const registeredByUser = users[lead.registeredBy];

                                let contactToShow: { name: string; email: string; };

                                if (isProvider && lead.isO2OCollaborator && registeredByUser) {
                                    // Brokered Deal: Developer sees the O2O agent as the contact.
                                    contactToShow = { name: registeredByUser.userName, email: registeredByUser.email };
                                } else {
                                    // Direct Deal or Admin/Agent view: Show the actual customer contact.
                                    contactToShow = { name: lead.leadContact, email: lead.leadEmail };
                                }
                                
                                const requirementsSummary = view === 'broking'
                                    ? lead.requirementsSummary
                                    : lead.requirementsSummary;


                                return (
                                    <React.Fragment key={lead.id}>
                                    <TableRow>
                                        <TableCell className="font-medium">{lead.isO2OCollaborator && isProvider ? lead.id : lead.leadName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{contactToShow.name}</span>
                                                <span className="text-xs text-muted-foreground">{contactToShow.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={cn("max-w-sm", !isAdminOrO2O && "truncate")}>{requirementsSummary}</TableCell>
                                        
                                        {isAgent || isAdminOrO2O ? (
                                          <>
                                            <TableCell>
                                              <div className="flex flex-col gap-2">
                                                {lead.providers.map(p => {
                                                  if (isAuthLoading) return null;
                                                  const providerDetails = users[p.providerEmail];
                                                  return <div key={p.providerEmail} className="text-sm">{providerDetails?.companyName || p.providerEmail}</div>
                                                })}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                               <TooltipProvider>
                                                <div className="flex flex-col gap-2">
                                                    {lead.providers.map(p => {
                                                        const properties = p.properties || [];
                                                        const total = properties.length;
                                                        const acknowledged = properties.filter(prop => prop.status === 'Acknowledged').length;
                                                        const rejected = properties.filter(prop => prop.status === 'Rejected').length;
                                                        const pending = total - acknowledged - rejected;
                                                        return (
                                                            <Tooltip key={p.providerEmail}>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Badge variant={pending > 0 ? "secondary" : "default"} className={cn(pending > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')}>{acknowledged}/{total} Ack.</Badge>
                                                                        {pending > 0 && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Acknowledged: {acknowledged}</p>
                                                                    <p>Pending: {pending}</p>
                                                                    <p>Rejected: {rejected}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    })}
                                                </div>
                                               </TooltipProvider>
                                            </TableCell>
                                          </>
                                        ) : (
                                          <>
                                            <TableCell>{users[lead.registeredBy]?.companyName || lead.registeredBy}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col gap-2 items-center">
                                                {(providerInfoForCurrentUser?.properties || []).map(prop => {
                                                    const statusInfo = statusConfig[prop.status];
                                                    return (
                                                         <Badge key={prop.listingId} variant="outline" className={cn("font-medium", statusInfo.color)}>
                                                            <statusInfo.icon className="mr-1.5 h-3 w-3" />
                                                            {statusInfo.text}
                                                        </Badge>
                                                    )
                                                })}
                                                </div>
                                            </TableCell>
                                          </>
                                        )}

                                        <TableCell className="text-right">
                                            <div className="flex flex-col gap-2 items-end">
                                              {shouldShowAcknowledgeButton ? (
                                                  <Button size="sm" onClick={() => handleAcknowledgeClick(lead)}>
                                                      <Handshake className="mr-2 h-4 w-4" /> Acknowledge Lead
                                                  </Button>
                                              ) : (
                                                  <Button asChild variant="outline" size="sm">
                                                      <Link href={`/dashboard/leads/${lead.id}`}>
                                                          View Activity <ArrowRight className="ml-2 h-4 w-4" />
                                                      </Link>
                                                  </Button>
                                              )}
                                            {isAdminOrO2O && lead.isO2OCollaborator && (
                                                <Button size="sm" onClick={() => handleRegisterWithProvider(lead)} disabled={isAlreadyRegisteredWithProvider}>
                                                    <UserPlus className="mr-2 h-4 w-4" /> 
                                                    {isAlreadyRegisteredWithProvider ? 'Provider Assigned' : 'Assign to Provider'}
                                                </Button>
                                            )}
                                            {isProvider && !lead.isO2OCollaborator && (
                                                <Button size="sm" variant={lead.developerEngagePath ? 'outline' : 'default'}
                                                  className={lead.developerEngagePath ? 'border-green-200 text-green-700 bg-green-50' : ''}
                                                  onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                                                  {lead.developerEngagePath ? '✓ Path Chosen' : 'Choose Engage Path'}
                                                </Button>
                                            )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {isProvider && !lead.isO2OCollaborator && expandedLeadId === lead.id && (
                                      <TableRow>
                                        <TableCell colSpan={5} className="bg-secondary/20 p-5">
                                          <DeveloperEngagePath leadId={lead.id} currentPath={lead.developerEngagePath} />
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {myLeads.length === 0 && (
                        <div className="text-center p-12 text-muted-foreground">
                            <p>No leads found matching your search criteria.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <AcknowledgeLeadDialog 
            isOpen={isAcknowledgeDialogOpen}
            onOpenChange={setIsAcknowledgeDialogOpen}
            lead={leadToAcknowledge}
            onSubmit={handleAcknowledgeSubmit}
        />
    </>
  )
}
