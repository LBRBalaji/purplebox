
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
import { Star, MessageSquare, Pencil, MapPin, CalendarCheck, Scaling, ClipboardList, FileText, ListChecks } from 'lucide-react';
import Image from 'next/image';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { type DemandSchema } from '@/lib/schema';
import { type Submission } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChatDialog } from './chat-dialog';


type DemandWithMatches = DemandSchema & {
  matches: Submission[];
}

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
};

export function MyDemands({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const { user } = useAuth();
  const { demands, submissions, shortlistedItems, toggleShortlist, clearNewSubmissions } = useData();
  const [myDemandsWithMatches, setMyDemandsWithMatches] = React.useState<DemandWithMatches[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<Submission | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (user?.email) {
      const userDemands = demands.filter(d => d.userEmail === user.email);
      const demandsWithSubmissions = userDemands.map(demand => {
        // Customers only see APPROVED submissions
        const demandSubmissions = submissions.filter(sub => sub.demandId === demand.demandId && sub.status === 'Approved');
        return { ...demand, matches: demandSubmissions };
      });
      setMyDemandsWithMatches(demandsWithSubmissions);
    }
  }, [demands, submissions, user]);

  const handleAccordionChange = (demandId: string) => {
    // When the user opens an accordion, mark all submissions for that demand as "not new"
    const submissionIdsToClear = myDemandsWithMatches
        .find(d => d.demandId === demandId)
        ?.matches.map(s => s.property.propertyId) || [];
    
    if (submissionIdsToClear.length > 0) {
        clearNewSubmissions(submissionIdsToClear);
    }
  };
  

  return (
    <>
      <div className="mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline tracking-tight">My Demands & Matches</h2>
          <p className="text-muted-foreground mt-2">Review approved matches submitted for your active demands.</p>
        </div>
        {myDemandsWithMatches.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleAccordionChange}>
            {myDemandsWithMatches.map((demand) => (
              <AccordionItem value={demand.demandId} key={demand.demandId} className="border rounded-lg bg-card">
                <AccordionTrigger className="p-6 hover:no-underline data-[state=open]:border-b">
                  <div className="flex justify-between items-start w-full gap-4">
                    <div className="text-left space-y-3 flex-grow">
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
                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <div
                          role="button"
                          aria-label={`Edit demand ${demand.demandId}`}
                          tabIndex={0}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard?editDemandId=${demand.demandId}`, { scroll: false });
                            onSwitchTab('log-demand');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/dashboard?editDemandId=${demand.demandId}`, { scroll: false });
                              onSwitchTab('log-demand');
                            }
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </div>
                      <Badge variant={demand.matches.length > 0 ? 'default' : 'secondary'} className="w-[110px] justify-center">
                        {demand.matches.length} {demand.matches.length === 1 ? 'Match' : 'Matches'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-4 space-y-6">
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
                            const isShortlisted = shortlistedItems.some(item => item.property.propertyId === match.property.propertyId);
                            return (
                            <Card key={match.property.propertyId} className={cn(match.isNew && "border-primary border-2")}>
                            <CardHeader>
                                <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                                <Image src="https://placehold.co/600x400.png" alt={`Property ${match.property.propertyId}`} data-ai-hint="modern office" fill className="object-cover" />
                                    {match.isNew && <Badge className="absolute top-2 right-2 bg-primary animate-pulse">New</Badge>}
                                </div>
                                <CardTitle>Property ID: {match.property.propertyId}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                <div>
                                    <p className="text-muted-foreground">Size</p>
                                    <p className="font-medium">{match.property.size} Sq. Ft.</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Rent</p>
                                    <p className="font-medium">₹{match.property.rentPerSft}/sft</p>
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
                                <Button className="w-full" onClick={() => setSelectedChat(match)}>
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
      <ChatDialog submission={selectedChat} isOpen={!!selectedChat} onOpenChange={() => setSelectedChat(null)} />
    </>
  );
}
