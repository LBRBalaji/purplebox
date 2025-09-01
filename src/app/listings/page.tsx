
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, MapPin, Scaling, Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { findSimilarWarehouses } from '@/ai/flows/find-similar-warehouses';
import { useToast } from '@/hooks/use-toast';
import { type WarehouseSchema } from '@/lib/schema';

function ListingCard({ listing }: { listing: WarehouseSchema }) {
  const previewImage = listing.imageUrls?.[0] || 'https://placehold.co/600x400.png';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="aspect-video relative mb-4">
          <Image
            src={previewImage}
            alt={listing.locationName}
            fill
            className="rounded-t-lg object-cover"
            data-ai-hint="modern warehouse"
          />
        </div>
        <CardTitle>{listing.locationName}</CardTitle>
        <CardDescription>ID: {listing.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-primary" />
                <span>{listing.size.toLocaleString()} sq. ft.</span>
            </div>
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{listing.specifications.flooringType || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{listing.locationName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{listing.readiness}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled>
            <Link href={`/listings/`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ListingsPage() {
  const { listings: allApiListings } = useData(); // This is the old listings data, which we might not need anymore
  const [allWarehouses, setAllWarehouses] = useState<WarehouseSchema[]>([]);
  const [filteredListings, setFilteredListings] = useState<WarehouseSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sizeRange, setSizeRange] = useState([0, 1000000]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const uniqueLocations = useMemo(() => {
    const locations = new Set(allWarehouses.map(l => l.locationName));
    return Array.from(locations);
  }, [allWarehouses]);
  
  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => {
          setAllWarehouses(data);
          setFilteredListings(data.filter((w: WarehouseSchema) => w.isActive));
      });
  }, []);
  
  const handleSearch = useCallback(async () => {
    if (!searchTerm) {
        // If search term is cleared, reset to all active warehouses
        setFilteredListings(allWarehouses.filter(w => w.isActive));
        return;
    }

    setIsSearching(true);
    try {
        const results = await findSimilarWarehouses({ query: searchTerm });
        setFilteredListings(results.warehouses || []);
    } catch (error) {
        console.error("Semantic search failed:", error);
        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: 'Could not perform the search. Please try again.'
        });
    } finally {
        setIsSearching(false);
    }
  }, [searchTerm, allWarehouses, toast]);


  const resetFilters = () => {
    setSearchTerm('');
    setAvailability('all');
    setSizeRange([0, 1000000]);
    setFilteredListings(allWarehouses.filter(w => w.isActive));
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className='w-full'>
                        <h1 className="text-2xl font-bold font-headline tracking-tight">Search Warehouse Listings</h1>
                        <p className="text-muted-foreground mt-1">
                           Use our AI-powered search to find warehouses by features, location, size, or any other criteria.
                        </p>
                    </div>
                </div>
                 <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mt-6 relative flex gap-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by any keyword (e.g., 'large PEB warehouse near Chennai port with high ceilings')..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" disabled={isSearching} className="min-w-[100px]">
                        {isSearching ? <Loader2 className="animate-spin" /> : 'Search'}
                    </Button>
                     {(searchTerm) && (
                        <Button variant="ghost" onClick={resetFilters} type="button">
                            <X className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    )}
                </form>
            </div>

            {isSearching ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}><CardHeader><div className="aspect-video relative mb-4 bg-muted animate-pulse rounded-t-lg"></div><div className="h-6 w-3/4 bg-muted animate-pulse rounded-md"></div><div className="h-4 mt-2 w-1/2 bg-muted animate-pulse rounded-md"></div></CardHeader><CardContent className="space-y-4"><div className="h-16 bg-muted animate-pulse rounded-md"></div></CardContent><CardFooter><div className="h-10 w-full bg-muted animate-pulse rounded-md"></div></CardFooter></Card>
                    ))}
                </div>
            ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-12 col-span-full">
                    <CardTitle>No Listings Found</CardTitle>
                    <CardDescription className="mt-2">
                        No listings match your current search. Try different keywords or reset the search.
                    </CardDescription>
                </Card>
            )}
        </div>
    </main>
  );
}
