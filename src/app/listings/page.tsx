
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, MapPin, Scaling, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

function ListingCard({ listing }: { listing: ListingSchema }) {
  const previewImage = listing.documents?.find(doc => doc.type === 'image')?.url || 'https://placehold.co/600x400.png';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="aspect-video relative mb-4">
          <Image
            src={previewImage}
            alt={listing.name}
            fill
            className="rounded-t-lg object-cover"
            data-ai-hint="modern warehouse"
          />
        </div>
        <CardTitle>{listing.name}</CardTitle>
        <CardDescription>{listing.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
         <div className="text-sm text-muted-foreground line-clamp-3">
          {listing.description}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-primary" />
                <span>{listing.sizeSqFt.toLocaleString()} sq. ft.</span>
            </div>
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{listing.buildingSpecifications.buildingType || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{listing.location}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{listing.availabilityDate}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/listings/${listing.listingId}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ListingsPage() {
  const { listings } = useData();
  const [filteredListings, setFilteredListings] = useState<ListingSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sizeRange, setSizeRange] = useState([0, 1000000]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(listings.map(l => l.location));
    return Array.from(locations);
  }, [listings]);

  useEffect(() => {
    const approved = listings.filter(l => l.status === 'approved');
    
    const results = approved.filter(listing => {
        const matchesSearch = searchTerm === '' || 
            listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAvailability = availability === 'all' || listing.availabilityDate === availability;
        
        const matchesSize = listing.sizeSqFt >= sizeRange[0] && listing.sizeSqFt <= sizeRange[1];

        return matchesSearch && matchesAvailability && matchesSize;
    });

    setFilteredListings(results);
  }, [listings, searchTerm, availability, sizeRange]);

  const resetFilters = () => {
    setSearchTerm('');
    setAvailability('all');
    setSizeRange([0, 1000000]);
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className='w-full'>
                        <h1 className="text-2xl font-bold font-headline tracking-tight">Search Warehouse Listings</h1>
                        <p className="text-muted-foreground mt-1">
                            Find the perfect property using our advanced filters.
                        </p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        {(searchTerm || availability !== 'all' || sizeRange[0] > 0 || sizeRange[1] < 1000000) && (
                            <Button variant="ghost" onClick={resetFilters}>
                                <X className="mr-2 h-4 w-4" /> Reset
                            </Button>
                        )}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Filters</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Adjust the filters to refine your search.
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <label htmlFor="availability" className="col-span-1">Availability</label>
                                            <Select value={availability} onValueChange={setAvailability}>
                                                <SelectTrigger className="col-span-2 h-8">
                                                    <SelectValue placeholder="Select availability" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
                                                    <SelectItem value="Available in 3 months">Available in 3 months</SelectItem>
                                                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-1 items-center gap-4">
                                             <label htmlFor="width">Size (sq. ft.)</label>
                                             <div className='text-sm text-center font-medium'>
                                                {sizeRange[0].toLocaleString()} - {sizeRange[1].toLocaleString()}
                                             </div>
                                            <Slider
                                                defaultValue={[0, 1000000]}
                                                min={0}
                                                max={1000000}
                                                step={50000}
                                                value={sizeRange}
                                                onValueChange={(value) => setSizeRange(value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or location (e.g., Prime Logistics, Oragadam)..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.map(listing => (
                        <ListingCard key={listing.listingId} listing={listing} />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-12 col-span-full">
                    <CardTitle>No Listings Found</CardTitle>
                    <CardDescription className="mt-2">
                        No listings match your current filters. Try adjusting your search criteria.
                    </CardDescription>
                </Card>
            )}
        </div>
    </main>
  );
}

    