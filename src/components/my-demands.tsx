
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
import { Star, MessageSquare, Percent, Pencil } from 'lucide-react';
import Image from 'next/image';
import { Progress } from './ui/progress';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { type DemandSchema } from '@/lib/schema';
import { type Submission } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';


type DemandWithMatches = DemandSchema & {
  matches: Submission[];
}

export function MyDemands({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const { user } = useAuth();
  const { demands, submissions } = useData();
  const [myDemandsWithMatches, setMyDemandsWithMatches] = React.useState<DemandWithMatches[]>([]);
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
    <div className="mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">My Demands & Matches</h2>
        <p className="text-muted-foreground mt-2">Review matches submitted for your active demands.</p>
      </div>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {myDemandsWithMatches.map((demand) => (
          <AccordionItem value={demand.demandId} key={demand.demandId} className="border rounded-lg bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="flex justify-between items-center w-full">
                <div className="text-left">
                  <h3 className="font-bold text-lg">{demand.demandId}</h3>
                  <p className="text-sm text-muted-foreground">{demand.propertyType} - {demand.location}</p>
                </div>
                <div className="flex items-center gap-2">
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
                  <Badge variant={demand.matches.length > 0 ? 'default' : 'secondary'}>
                    {demand.matches.length} {demand.matches.length === 1 ? 'Match' : 'Matches'}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              {demand.matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demand.matches.map(match => (
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
                        <Button variant="outline" className="w-full" disabled>
                          <Star className="mr-2 h-4 w-4" /> Shortlist (Soon)
                        </Button>
                        <Button className="w-full" disabled>
                          <MessageSquare className="mr-2 h-4 w-4" /> Chat (Soon)
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
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
    </div>
  );
}
