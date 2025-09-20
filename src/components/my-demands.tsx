
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Pencil, MapPin, CalendarCheck, Scaling, ClipboardList, FileText, ListChecks, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { type DemandSchema, type ListingSchema } from '@/lib/schema';
import { type Submission } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import type { ChatSubmission } from './chat-dialog';

const priorityLabels: { [key: string]: string } = {
  size: 'Size Range',
  location: 'Location & Radius',
  ceilingHeight: 'Ceiling Height',
  docks: 'Number of Docks',
  readiness: 'Readiness',
  approvals: 'Approvals Status',
  fireNoc: 'Fire NOC Status',
  power: 'Sufficient Power',
  fireSafety: 'Fire Safety Compliance',
  buildingType: 'Building Type',
  crane: 'Crane Details',
  operations: 'Operations Details'
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

export function MyDemands({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const { user, users } = useAuth();
  const { demands, submissions, listings, shortlistedItems, toggleShortlist, clearNewSubmissions, openChat } = useData();
  const [myDemandsWithMatches, setMyDemandsWithMatches] = React.useState<DemandWithMatches[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (user?.email) {
      const userDemands = demands.filter(d => d.userEmail === user.email);
      const demandsWithSubmissions = userDemands.map(demand => {
        const demandSubmissions = submissions
          .filter(sub => sub.demandId === demand.demandId && sub.status === 'Approved')
          .map(sub => ({ ...sub, listing: listings.find(l => l.listingId === sub.listingId) }));
        return { ...demand, matches: demandSubmissions };
      });
      setMyDemandsWithMatches(demandsWithSubmissions);
    }
  }, [demands, submissions, user, listings]);

  const handleAccordionChange = (demandId: string) => {
    const demand = myDemandsWithMatches.find(d => d.demandId === demandId);
    if (!demand) return;

    const newSubmissionIds = demand.matches
        .filter(m => m.isNew)
        .map(m => m.submissionId);
    
    if (newSubmissionIds.length > 0) {
        clearNewSubmissions(newSubmissionIds);
    }
  };
  
  type DemandWithMatches = DemandSchema & {
    matches: (Submission & { listing: ListingSchema | undefined })[];
  }
  
  const handleChatInit = (match: any) => {
    if (!user) return;
    const provider = users[match.providerEmail];
    const submissionForChat: ChatSubmission = {
      ...match,
      chatPartnerName: provider?.companyName || "Developer",
      customerName: user.userName,
      customerCompany: user.companyName,
    };
    openChat(submissionForChat);
  };


  return (
    <>
      <div className="mt-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
                <h2 className="text-3xl font-bold font-headline tracking-tight">My Demands & Matches</h2>
                <p className="text-muted-foreground mt-2">Review approved matches submitted for your active demands.</p>
            </div>
            <a href="https://wa.me/919841098170" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                  <WhatsAppIcon className="mr-2 h-5 w-5" />
                  Chat with O2O Team
              </Button>
            </a>
        </div>
        {myDemandsWithMatches.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleAccordionChange}>
            {myDemandsWithMatches.map((demand) => (
              <AccordionItem value={demand.demandId} key={demand.demandId} className="border rounded-lg bg-card">
                <div className="flex items-center p-6 data-[state=open]:border-b">
                  <AccordionTrigger className="p-0 hover:no-underline flex-grow">
                    <div className="text-left space-y-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-bold text-lg text-primary truncate" title={demand.demandId}>{demand.demandId}</h3>
                        <Badge variant="secondary">{demand.operationType}</Badge>
                        {demand.matches.some(m => m.isNew) && (
                            <Badge className="bg-accent text-accent-foreground animate-pulse">
                                {demand.matches.filter(m => m.isNew).length} New Match
                            </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                              <Scaling className="h-4 w-4" />
                              <span>{demand.size.toLocaleString()} sq. ft.</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate" title={`${demand.locationName || demand.location} (within ${demand.radius}km)`}>
                                  {demand.locationName || demand.location} ({demand.radius}km)
                              </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                              <CalendarCheck className="h-4 w-4" />
                              <span>{demand.readiness}</span>
                          </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          router.push(`/dashboard?editDemandId=${demand.demandId}`, { scroll: false });
                          onSwitchTab('log-demand');
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    <Badge variant={demand.matches.length > 0 ? 'default' : 'secondary'} className="w-[110px] justify-center">
                      {demand.matches.length} {demand.matches.length === 1 ? 'Match' : 'Matches'}
                    </Badge>
                  </div>
                </div>
                <AccordionContent className="p-6 pt-0 space-y-6">
                    <Card className="bg-secondary/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                Your Demand Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {demand.description && (
                                <div className="text-sm">
                                    <p className="font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> Description</p>
                                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{demand.description}</p>
                                </div>
                            )}
                            {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
                                <div className="text-sm">
                                    <p className="font-semibold flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Your Priorities (Non-Compromisable)</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {demand.preferences.nonCompromisable.map(item => (
                                            <Badge key={item} variant="outline" className="font-medium bg-background">
                                                {priorityLabels[item] || item}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {!demand.description && (!demand.preferences?.nonCompromisable || demand.preferences.nonCompromisable.length === 0) && (
                                <p className="text-sm text-muted-foreground">You did not provide any additional description or priorities for this demand.</p>
                             )}
                        </CardContent>
                    </Card>

                  {demand.matches.length > 0 ? (
                    <div>
                        <h4 className="font-semibold text-lg text-foreground mb-4">Approved Matches</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {demand.matches.map(match => {
                            if (!match.listing) return null;
                            const isShortlisted = shortlistedItems.some(item => item.submissionId === match.submissionId);
                            const listing = match.listing;
                            
                            return (
                            <Card key={match.submissionId} className={cn(match.isNew && "border-primary border-2")}>
                            <CardHeader>
                                <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                                <Image src={listing.documents?.[0]?.url || "https://placehold.co/600x400.png"} alt={`Property ${listing.listingId}`} data-ai-hint="warehouse industrial building" fill className="object-cover" />
                                    {match.isNew && <Badge className="absolute top-2 right-2 bg-primary animate-pulse">New</Badge>}
                                </div>
                                <CardTitle>{listing.name}</CardTitle>
                                <CardDescription>Listing ID: {listing.listingId}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                <div>
                                    <p className="text-muted-foreground">Size</p>
                                    <p className="font-medium">{listing.sizeSqFt} Sq. Ft.</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Rent</p>
                                    <p className="font-medium">₹{listing.rentPerSqFt}/sft</p>
                                </div>
                                </div>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button 
                                variant={isShortlisted ? "default" : "outline"}
                                className="w-full"
                                onClick={() => toggleShortlist(match)}
                                >
                                <Star className={cn("mr-2 h-4 w-4", isShortlisted && "fill-current text-yellow-400")} /> 
                                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                                </Button>
                                <Button className="w-full" onClick={() => handleChatInit(match)}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                </Button>
                            </CardFooter>
                            </Card>
                        )})}
                        </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      <p>No approved matches have been found for this demand yet.</p>
                      <p className="text-xs mt-1">Properties submitted by providers will appear here once they are approved by an admin.</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
           <Card className="text-center p-12">
              <CardTitle>No Active Demands</CardTitle>
              <CardDescription className="mt-2">Demands you log will appear here along with any matching properties.</CardDescription>
              <Button className="mt-4" onClick={() => onSwitchTab('log-demand')}>Log Your First Demand</Button>
          </Card>
        )}
      </div>
    </>
  );
}
