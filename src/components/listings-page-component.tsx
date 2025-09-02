
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, Calculator, ClipboardPlus, Download, Info, MapPin, Scaling, Search, SlidersHorizontal, Star, X, Zap, Award, Users } from 'lucide-react';
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
import { LoginDialog } from './login-dialog';
import { LimitExceededDialog } from './limit-exceeded-dialog';
import { Badge } from '@/components/ui/badge';
import { type ListingSchema, type Document } from '@/lib/schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DownloadTermsDialog } from './download-terms-dialog';
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


function ListingCard({ listing, isSelected, onSelectionChange }: { listing: ListingSchema, isSelected: boolean, onSelectionChange: (listing: ListingSchema) => void }) {
  const previewImage = listing.documents?.find(d => d.type === 'image')?.url || 'https://placehold.co/600x400/210D42/FFFFFF?text=Image+Not+Available';

  return (
    <Card className={cn("flex flex-col transition-all overflow-hidden group", isSelected && "ring-2 ring-primary")}>
       <CardHeader className="p-0">
        <div className="relative">
            <div className="absolute top-2 right-2 z-10 bg-background/50 backdrop-blur-sm rounded-full">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelectionChange(listing)}
                    aria-label={`Select warehouse ${listing.listingId}`}
                    className="w-6 h-6"
                />
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {listing.documents && listing.documents.filter(d => d.type === 'image').length > 0 ? listing.documents.filter(d => d.type === 'image').map((doc, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <Image
                        src={doc.url}
                        alt={doc.name || listing.name}
                        fill
                        className="object-cover"
                        data-ai-hint="warehouse industrial building"
                      />
                    </div>
                  </CarouselItem>
                )) : (
                   <CarouselItem>
                    <div className="aspect-video relative">
                      <Image
                        src="https://placehold.co/800x600/210D42/FFFFFF?text=No+Image"
                        alt="Placeholder"
                        fill
                        className="object-cover"
                        data-ai-hint="warehouse industrial building"
                      />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {listing.documents && listing.documents.filter(d => d.type === 'image').length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
              )}
            </Carousel>
        </div>
       </CardHeader>
       <CardContent className="flex-grow p-6 space-y-4">
        {(listing.serviceModel === '3PL' || listing.serviceModel === 'Both') && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 mb-2">
                <Star className="mr-1.5 h-3 w-3" />
                3PL Operated
            </Badge>
        )}
        <div className="space-y-2">
            <CardTitle className="leading-tight">{listing.name}</CardTitle>
            <CardDescription className="flex items-center gap-1.5 pt-1">
                <MapPin className="h-4 w-4" /> {listing.location}
            </CardDescription>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.sizeSqFt.toLocaleString()} sq. ft.</span>
            </div>
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.buildingSpecifications.buildingType || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.availabilityDate}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 grid grid-cols-2 gap-2">
        <Button asChild className="w-full" variant="outline">
            <Link href={`/commercial-calculator?compare=${listing.listingId}`}>
                <Calculator className="mr-2 h-4 w-4" /> Calculate
            </Link>
        </Button>
         <Button asChild className="w-full col-span-2">
            <Link href={`/listings/${listing.listingId}`} target="_blank">
                View Full Details <ArrowRight className="ml-2 h-4 w-4" />
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
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    if (selectedForDownload.length === 0) {
        return null;
    }
    
    const handleLoginSuccess = () => {
        setIsLoginOpen(false);
        toast({
            title: "Logged In Successfully",
            description: "You can now proceed with your download."
        })
    }
    
    const onTermsAccept = () => {
        sessionStorage.setItem('warehouse_download_terms_accepted', 'true');
        setIsTermsOpen(false);
        proceedWithDownload();
    };

    const proceedWithDownload = () => {
        const { success } = logDownload(user!.email!);
        if (success) {
            const dataToExport = selectedForDownload.map(l => ({
                'Property ID': l.listingId,
                'Name': l.name,
                'Location': l.location,
                'Size (Sq. Ft.)': l.sizeSqFt,
                'Availability': l.availabilityDate,
                'Rent (per Sq. Ft.)': l.rentPerSqFt || 'Contact for details',
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            
            const footer = [
                [],
                ["Powered by Lakshmi Balaji O2O | Sourcing & Leasing Simplified"]
            ];
            XLSX.utils.sheet_add_aoa(worksheet, footer, { origin: -1 });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Listings");

            const now = new Date();
            const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
            const filename = `Lakshmi_Balaji_O2O_Selected_Listings_${timestamp}.csv`;
            
            XLSX.writeFile(workbook, filename, { bookType: "csv" });

            toast({
                title: "Download Started",
                description: `${selectedForDownload.length} listing(s) have been exported. This counts as one download for today.`
            });
             clearSelectedForDownload();
        } else {
             toast({
                variant: 'destructive',
                title: 'Daily Download Limit Reached',
                description: `You have already downloaded twice today. Please try again tomorrow.`
            });
        }
    }


    const handleDownload = () => {
        if (!user) {
            setIsLoginOpen(true);
            return;
        }

        if (user.role !== 'User') {
            toast({
                variant: 'destructive',
                title: 'Download Not Available',
                description: 'Only Customer accounts can download listings.'
            });
            return;
        }

        const hasAcceptedTerms = sessionStorage.getItem('warehouse_download_terms_accepted');
        if (hasAcceptedTerms) {
            proceedWithDownload();
        } else {
            setIsTermsOpen(true);
        }
    }

    return (
        <>
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
            <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} onLoginSuccess={handleLoginSuccess}/>
            <DownloadTermsDialog isOpen={isTermsOpen} onOpenChange={setIsTermsOpen} onAccept={onTermsAccept} />
        </>
    )
}

export function ListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { listings: allListings, isLoading: isDataLoading, selectedForDownload, toggleSelectedForDownload } = useData();
  const { toast } = useToast();
  const [filteredListings, setFilteredListings] = useState<ListingSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sizeRange, setSizeRange] = useState([0, 1000000]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLimitExceededDialogOpen, setIsLimitExceededDialogOpen] = useState(false);
  const [limitExceededLocation, setLimitExceededLocation] = useState<string | null>(null);
  
  const approvedListings = useMemo(() => allListings.filter(l => l.status === 'approved'), [allListings]);

  const selectedIds = useMemo(() => new Set(selectedForDownload.map(l => l.listingId)), [selectedForDownload]);

  useEffect(() => {
    let results = approvedListings;

    if (searchTerm) {
        results = results.filter(listing => {
            const searchHaystack = [
                listing.name,
                listing.location,
                listing.listingId,
                listing.availabilityDate,
                listing.buildingSpecifications.buildingType,
                listing.sizeSqFt.toString(),
                listing.serviceModel
            ].join(' ').toLowerCase();
            return searchHaystack.includes(searchTerm.toLowerCase());
        });
    }

    if (availability !== 'all') {
        results = results.filter(l => l.availabilityDate === availability);
    }
    
    results = results.filter(l => l.sizeSqFt >= sizeRange[0] && l.sizeSqFt <= sizeRange[1]);

    setFilteredListings(results);

    try {
        const resultIds = results.map(r => r.listingId);
        sessionStorage.setItem('warehouse_search_results', JSON.stringify(resultIds));
    } catch (e) {
        console.error("Could not write to sessionStorage", e);
    }
  }, [searchTerm, availability, sizeRange, approvedListings]);


  const resetFilters = () => {
    setSearchTerm('');
    setAvailability('all');
    
    const maxArea = Math.max(...approvedListings.map(w => w.sizeSqFt), 0);
    if (maxArea > 0) {
        setSizeRange([0, Math.ceil(maxArea / 100000) * 100000]);
    } else {
        setSizeRange([0, 1000000]);
    }
  }

  const maxSliderSize = useMemo(() => {
    const max = Math.max(...approvedListings.map(w => w.sizeSqFt), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
  }, [approvedListings]);
  
  const handleLogDemandClick = () => {
      if (!user) {
        setIsLoginOpen(true);
        return;
      }
      router.push('/dashboard?logNew=true');
  }

    const handleSelectionChange = (listing: ListingSchema) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (user.role !== 'User') {
      toast({
        variant: 'destructive',
        title: 'Selection Not Available',
        description:
          'While you can browse, only Customer accounts can select properties for download.',
      });
      return;
    }
    
    const { limitReached } = toggleSelectedForDownload(listing);
    if (limitReached) {
      setLimitExceededLocation(listing.location); // Use locationName for the dialog
      setIsLimitExceededDialogOpen(true);
    }
  };

  return (
    <>
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
             <Alert className="mb-8 bg-primary/5 border-primary/20 p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <AlertTitle className="font-semibold text-primary/90 text-lg flex items-center gap-3">
                        <Download className="h-5 w-5 text-primary/80" />
                        Download up to 5 listings at once!
                    </AlertTitle>
                    <AlertDescription className="text-primary/80 mt-2 space-y-3">
                        <p>Select your favorite listings to instantly download their key details as a single CSV file. For more tailored options, our demand logging service is always available.</p>
                    </AlertDescription>
                </div>
                <div className="space-y-3 p-4 rounded-md bg-primary/10 border border-primary/20">
                     <h4 className="font-bold text-primary flex items-center gap-2"><Award className="h-4 w-4"/> Zero Service Charge</h4>
                     <ul className="text-xs text-primary/80 list-disc pl-5 space-y-1">
                        <li>For <strong className="font-semibold">Startups</strong> on their first transaction.</li>
                        <li>For <strong className="font-semibold">Logistics Companies</strong> on all transactions.</li>
                     </ul>
                </div>
            </Alert>
            <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="w-full">
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Search Listings</h1>
                    <p className="text-muted-foreground mt-1">
                        Use our advanced filters to find the perfect Warehouse, 3PL Operated Warehouse and Industrial Buildings for your needs.
                    </p>
                </div>
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, location, ID, size, or type (e.g. '3PL', 'Industrial')" 
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

            {!isDataLoading && filteredListings.length === 0 ? (
                <Card className="text-center p-12 col-span-full">
                    <CardTitle>No Listings Match Your Search</CardTitle>
                    <CardDescription className="mt-2 max-w-md mx-auto">
                        We couldn't find any properties matching your current filters. You can adjust your search, or log a detailed demand and let our team find the perfect match for you.
                    </CardDescription>
                    <div className="mt-6 flex justify-center items-center gap-4">
                        <Button onClick={resetFilters} variant="outline">
                            <X className="mr-2 h-4 w-4" /> Clear All Filters
                        </Button>
                        <Button onClick={handleLogDemandClick}>
                            <ClipboardPlus className="mr-2 h-4 w-4" /> Log New Demand
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map(listing => (
                        <ListingCard 
                            key={listing.listingId} 
                            listing={listing} 
                            isSelected={selectedIds.has(listing.listingId)}
                            onSelectionChange={handleSelectionChange}
                        />
                    ))}
                </div>
            )}
        </div>
    </main>
     <DownloadBar />
     <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
     <LimitExceededDialog 
        isOpen={isLimitExceededDialogOpen} 
        onOpenChange={setIsLimitExceededDialogOpen}
        location={limitExceededLocation || ''}
      />
    </>
  );
}

    
