
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Settings, Trash2 } from 'lucide-react';
import locationCirclesData from '@/data/location-circles.json';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';


type LocationCircle = {
  name: string;
  locations: string[];
};

export default function PlatformSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [circles, setCircles] = React.useState<LocationCircle[]>(locationCirclesData);
  const [newCircleName, setNewCircleName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const hasAccess = user?.role === 'SuperAdmin';

  React.useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, hasAccess]);

  const handleAddCircle = () => {
    if (newCircleName && !circles.some(c => c.name.toLowerCase() === newCircleName.toLowerCase())) {
      setCircles([...circles, { name: newCircleName, locations: [] }]);
      setNewCircleName('');
    }
  };
  
  const handleRemoveCircle = (circleName: string) => {
    setCircles(circles.filter(c => c.name !== circleName));
  }

  const handleAddLocation = (circleIndex: number, location: string) => {
    if (location) {
      const newCircles = [...circles];
      if (!newCircles[circleIndex].locations.includes(location.toLowerCase())) {
        newCircles[circleIndex].locations.push(location.toLowerCase());
        setCircles(newCircles);
      }
    }
  };
  
  const handleRemoveLocation = (circleIndex: number, locationToRemove: string) => {
      const newCircles = [...circles];
      newCircles[circleIndex].locations = newCircles[circleIndex].locations.filter(loc => loc !== locationToRemove);
      setCircles(newCircles);
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/location-circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circles),
      });
      if (!response.ok) {
        throw new Error('Failed to save changes.');
      }
      toast({
        title: 'Settings Saved',
        description: 'Location circles have been updated successfully.',
      });
    } catch (error) {
        const e = error as Error;
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: e.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (isLoading || !hasAccess) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3">
            <Settings /> Platform Settings
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage global settings and configurations for the application.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Location Circles</CardTitle>
            <CardDescription>
              Group locations into circles to improve search relevance. A search for one location in a circle will show results from all locations in that circle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {circles.map((circle, circleIndex) => (
              <div key={circle.name} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-primary">{circle.name}</h4>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCircle(circle.name)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                </div>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a location (e.g., oragadam)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddLocation(circleIndex, e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                         {circle.locations.map(loc => (
                            <Badge key={loc} variant="secondary" className="gap-1">
                                {loc}
                                <button type="button" className="rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => handleRemoveLocation(circleIndex, loc)}>
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Input
                placeholder="New Circle Name (e.g., Mumbai North Circle)"
                value={newCircleName}
                onChange={e => setNewCircleName(e.target.value)}
              />
              <Button onClick={handleAddCircle}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Circle
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4"/> {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
