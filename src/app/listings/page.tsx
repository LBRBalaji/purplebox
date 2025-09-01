
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import type { WarehouseSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, Check, Download, MapPin, Scaling, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/auth-context';
import { Checkbox } from '@/components/ui/checkbox';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


function ListingCard({ listing, isSelected, onSelectionChange }: { listing: WarehouseSchema, isSelected: boolean, onSelectionChange: (listing: WarehouseSchema) => void }) {
  const previewImage = listing.imageUrls?.[0] || 'https://placehold.co/600x400.png';

  return (
    <Card className={cn("flex flex-col transition-all", isSelected && "ring-2 ring-primary")}>
       <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="aspect-video relative mb-4 flex-grow">
            <Image
              src={previewImage}
              alt={listing.locationName}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="modern warehouse"
            />
          </div>
           <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectionChange(listing)}
            aria-label={`Select warehouse ${listing.id}`}
            className="w-5 h-5"
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
        <Button asChild className="w-full">
            <Link href={`/listings/${listing.id}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function DownloadBar() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { selectedForDownload, logDownload, clearSelectedForDownload } = useData();

    if (selectedForDownload.length === 0) {
        return null;
    }

    const handleDownload = () => {
        let successfulDownloads: WarehouseSchema[] = [];
        let failedDownloadsCount = 0;

        selectedForDownload.forEach(listing => {
            const { success } = logDownload(user!.email!, listing);
            if (success) {
                successfulDownloads.push(listing);
            } else {
                failedDownloadsCount++;
            }
        });

        if (successfulDownloads.length > 0) {
            const dataToExport = successfulDownloads.map(l => ({
                'Property ID': l.id,
                'Size (Sq. Ft.)': l.size,
                'Readiness': l.readiness,
                'Docks': l.specifications.docks,
                'Ceiling Height (ft)': l.specifications.ceilingHeight,
                'Flooring Type': l.specifications.flooringType,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Listings");
            XLSX.writeFile(workbook, `selected_listings_${Date.now()}.csv`, { bookType: "csv" });

            toast({
                title: "Download Started",
                description: `${successfulDownloads.length} listing(s) have been exported.`
            });
        }

        if (failedDownloadsCount > 0) {
            toast({
                variant: 'destructive',
                title: 'Some Downloads Failed',
                description: `${failedDownloadsCount} listing(s) could not be downloaded due to daily limits.`
            });
        }
        
        clearSelectedForDownload();
    }

    return (
        <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center">
            <div className="flex items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-card border w-full max-w-2xl animate-in slide-in-from-bottom-5">
                <p className="font-semibold text-sm">
                    {selectedForDownload.length} listing{selectedForDownload.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={clearSelectedForDownload}>
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download Selected
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ListingsPage() {
  const { user } = useAuth();
  const [allWarehouses, setAllWarehouses] = useState<WarehouseSchema[]>([]);
  const [filteredListings, setFilteredListings] = useState<WarehouseSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sizeRange, setSizeRange] = useState([0, 1000000]);
  
  const { selectedForDownload, toggleSelectedForDownload } = useData();
  const selectedIds = useMemo(() => new Set(selectedForDownload.map(l => l.id)), [selectedForDownload]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(allWarehouses.map(l => l.locationName));
    return Array.from(locations);
  }, [allWarehouses]);
  
  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => {
          const activeWarehouses = data.filter((w: WarehouseSchema) => w.isActive);
          setAllWarehouses(activeWarehouses);
          setFilteredListings(activeWarehouses);
          
          const maxArea = Math.max(...activeWarehouses.map((w: WarehouseSchema) => w.size), 0);
          if (maxArea > 0) {
            setSizeRange([0, Math.ceil(maxArea / 100000) * 100000]);
          }
      });
  }, []);

  useEffect(() => {
    let results = allWarehouses;

    if (searchTerm) {
        results = results.filter(listing => {
            const searchHaystack = [
                listing.locationName,
                listing.id,
                listing.readiness,
                listing.specifications.flooringType,
                listing.size.toString(),
                listing.specifications.ceilingHeight.toString(),
                listing.specifications.docks.toString()
            ].join(' ').toLowerCase();
            return searchHaystack.includes(searchTerm.toLowerCase());
        });
    }

    if (availability !== 'all') {
        results = results.filter(l => l.readiness === availability);
    }
    
    results = results.filter(l => l.size >= sizeRange[0] && l.size <= sizeRange[1]);

    setFilteredListings(results);

    // Store search results in session storage for detail page navigation
    try {
        const resultIds = results.map(r => r.id);
        sessionStorage.setItem('warehouse_search_results', JSON.stringify(resultIds));
    } catch (e) {
        console.error("Could not write to sessionStorage", e);
    }
  }, [searchTerm, availability, sizeRange, allWarehouses]);


  const resetFilters = () => {
    setSearchTerm('');
    setAvailability('all');
    
    const maxArea = Math.max(...allWarehouses.map(w => w.size), 0);
    if (maxArea > 0) {
        setSizeRange([0, Math.ceil(maxArea / 100000) * 100000]);
    } else {
        setSizeRange([0, 1000000]);
    }
  }

  const maxSliderSize = useMemo(() => {
    const max = Math.max(...allWarehouses.map(w => w.size), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
  }, [allWarehouses]);


  return (
    <>
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className='w-full'>
                        <h1 className="text-2xl font-bold font-headline tracking-tight">Search Warehouse Listings</h1>
                        <p className="text-muted-foreground mt-1">
                           Use our advanced filters to find the perfect warehouse for your needs.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by location, ID, size, etc..." 
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            <span>Filters</span>
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                <h4 className="font-medium leading-none">Filters</h4>
                                <p className="text-sm text-muted-foreground">
                                    Adjust the filters to narrow down your search.
                                </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor="availability" className="col-span-1">Availability</label>
                                        <Select value={availability} onValueChange={setAvailability}>
                                            <SelectTrigger id="availability" className="col-span-2 h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
                                                <SelectItem value="Under Construction">Under Construction</SelectItem>
                                                <SelectItem value="Available in 3 months">Available in 3 months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 items-center gap-2">
                                        <label htmlFor="size" className="col-span-1">Size (sq. ft.)</label>
                                        <div className="col-span-3">
                                            <Slider
                                                id="size"
                                                min={0}
                                                max={maxSliderSize}
                                                step={10000}
                                                value={sizeRange}
                                                onValueChange={(value) => setSizeRange(value as [number, number])}
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                <span>{sizeRange[0].toLocaleString()}</span>
                                                <span>{sizeRange[1].toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                 <Button onClick={resetFilters} variant="ghost" className="w-full justify-center">Reset Filters</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.map(listing => (
                        <ListingCard 
                            key={listing.id} 
                            listing={listing} 
                            isSelected={selectedIds.has(listing.id)}
                            onSelectionChange={toggleSelectedForDownload}
                        />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-12 col-span-full">
                    <CardTitle>No Listings Found</CardTitle>
                    <CardDescription className="mt-2">
                        No active listings match your current filters. Try adjusting your search criteria.
                    </CardDescription>
                     <Button onClick={resetFilters} variant="outline" className="mt-4">
                        <X className="mr-2 h-4 w-4" /> Clear All Filters
                    </Button>
                </Card>
            )}
        </div>
    </main>
    {user?.role === 'User' && <DownloadBar />}
    </>
  );
}
