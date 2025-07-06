
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Percent } from 'lucide-react';
import Image from 'next/image';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { Submission } from '@/contexts/data-context';
import { ChatDialog } from './chat-dialog';

export function ShortlistedProperties() {
  const { user } = useAuth();
  const { shortlistedItems, toggleShortlist } = useData();
  const [selectedChat, setSelectedChat] = React.useState<Submission | null>(null);

  return (
    <>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Shortlisted Properties</CardTitle>
            <CardDescription>
              Properties you've shortlisted appear here. You can start a conversation or remove them from this list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shortlistedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlistedItems.map(match => (
                  <Card key={match.property.propertyId} className="flex flex-col">
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
                    <CardContent className="space-y-4 flex-grow">
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
                        variant="default"
                        className="w-full"
                        onClick={() => toggleShortlist(match)}
                      >
                        <Star className="mr-2 h-4 w-4 fill-current text-yellow-400" />
                        Remove
                      </Button>
                      <Button className="w-full" onClick={() => setSelectedChat(match)}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">
                <p>No shortlisted properties yet.</p>
                <p className="text-xs mt-1">Click the star icon on a matched property to add it to this list.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ChatDialog submission={selectedChat} isOpen={!!selectedChat} onOpenChange={() => setSelectedChat(null)} />
    </>
  );
}
