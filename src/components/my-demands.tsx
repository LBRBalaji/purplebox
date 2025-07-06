
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
import { Star, MessageSquare, Percent, Pencil, MapPin, CalendarCheck, Scaling } from 'lucide-react';
import Image from 'next/image';
import { Progress } from './ui/progress';
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

export function MyDemands({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const { user } = useAuth();
  const { demands, submissions, shortlistedItems, toggleShortlist } = useData();
  const [myDemandsWithMatches, setMyDemandsWithMatches] = React.useState<DemandWithMatches[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<Submission | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (user?.email) {
      const userDemands = demands.filter(d => d.userEmail === user.email);
      const demandsWithSubmissions = userDemands.map(demand => {
        const demandSubmissions = submissions.filter(sub => sub.demandId === demand.demandId);
        return { ...demand, matches: demandSubmissions };
      });
      setMyDemandsWithMatches(demandsWithSubmissions);
    }
  }, [demands, submissions, user]);
  

  return (
    <>
      <div className="mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline tracking-tight">My Demands & Matches</h2>
          <p className="text-muted-foreground mt-2">Review matches submitted for your active demands.</p>
        </div>
        {myDemandsWithMatches.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {myDemandsWithMatches.map((demand) => (
              <AccordionItem value={demand.demandId} key={demand.demandId} className="border rounded-lg bg-card">
                <AccordionTrigger className="p-6 hover:no-underline data-[state=open]:border-b">
                  <div className="flex justify-between items-start w-full gap-4">
                    <div className="text-left space-y-3 flex-grow">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-bold text-lg text-primary truncate" title={demand.demandId}>{demand.demandId}</h3>
                        <Badge variant="secondary">{demand.propertyType}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                              <Scaling className="h-4 w-4" />
                              <span>{demand.size.toLocaleString()} sq. ft.</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate" title={`${demand.location} (within ${demand.radius}km)`}>
                                  {demand.location} ({demand.radius}km)
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
                <AccordionContent className="p-6 pt-4">
                  {demand.matches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {demand.matches.map(match => {
                        const isShortlisted = shortlistedItems.some(item => item.property.propertyId === match.property.propertyId);
                        return (
                        <Card key={match.property.propertyId}>
                          <CardHeader>
                            <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                              <Image src="https://placehold.co/600x400.png" alt={match.property.userCompanyName || 'Property'} data-ai-hint="modern office" fill className="object-cover" />
                            </div>
                            <CardTitle>{match.property.userCompanyName}</CardTitle>
                            <CardDescription>
                              <div className="inline-flex items-center gap-2 text-primary font-semibold border border-primary/50 bg-primary/10 px-2 py-1 rounded-md text-sm">
                                <Percent className="w-4 h-4" /> 
                                <span>{(match.matchResult.overallScore * 100).toFixed(0)}% Match</span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <Progress value={match.matchResult.overallScore * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground italic">{match.matchResult.justification}</p>
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
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      <p>No matches have been submitted for this demand yet.</p>
                      <p className="text-xs mt-1">Matches from property providers will appear here once submitted.</p>
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
