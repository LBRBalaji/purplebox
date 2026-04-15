
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, Download, MapPin, Scaling, Search, SlidersHorizontal, X } from 'lucide-react';
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
import { LoginDialog } from '../login-dialog';
import { LimitExceededDialog } from '../limit-exceeded-dialog';
import { Badge } from '../ui/badge';
import { type ListingSchema } from '@/lib/schema';
import { Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function ListingCard({ listing, isSelected, onSelectionChange }: { listing: ListingSchema, isSelected: boolean, onSelectionChange: (listing: ListingSchema) => void }) {
  const previewImage = listing.documents?.find(d => d.type === 'image')?.url || 'https://placehold.co/600x400/210D42/FFFFFF?text=Image+Not+Available';

  return (
    <Card className={cn("flex flex-col transition-all", isSelected && "ring-2 ring-primary")}>
       <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="aspect-video relative mb-4 flex-grow">
            <Image
              src={previewImage}
              alt={listing.name || 'Warehouse image'}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="warehouse industrial building"
            />
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectionChange(listing)}
            aria-label={`Select warehouse ${listing.listingId}`}
            className="w-5 h-5"
          />
        </div>
        <div className="flex items-center justify-between">
            <CardTitle>{listing.name}</CardTitle>
            {(listing.serviceModel === '3PL' || listing.serviceModel === 'Both') && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border border-accent/20">
                    <Star className="mr-1.5 h-3 w-3" />
                    3PL Operated
                </Badge>
            )}
        </div>
        <CardDescription>ID: {listing.listingId}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
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

function DownloadBar() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { selectedForDownload, logDownload, clearSelectedForDownload, addTransactionActivity, addRegisteredLead, registeredLeads } = useData();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [showRfqNudge, setShowRfqNudge] = useState(false);

    if (selectedForDownload.length === 0 && !showRfqNudge) {
        return null;
    }
    
    const handleLoginSuccess = () => {
        setIsLoginOpen(false);
        toast({
            title: "Logged In Successfully",
            description: "You can now proceed with your download."
        })
    }

    const executeBulkDownload = () => {
        const dataToExport = selectedForDownload.map(l => ({
            'Property ID': l.listingId,
            'Name': l.name,
            'Location': l.location,
            'Size (Sq. Ft.)': l.sizeSqFt,
            'Availability': l.availabilityDate,
            'Commercials': 'Request for Quote',
            'Click to Request Quote': `=HYPERLINK("https://lease.orsone.app/listings/${l.listingId}","Request for Quote")`,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.sheet_add_aoa(worksheet, [[], ["Powered by ORS-ONE | Building Transaction Ready Assets"]], { origin: -1 });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Listings");
        const now = new Date();
        const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
        XLSX.writeFile(workbook, `ORS-ONE_Listings_${ts}.csv`, { bookType: 'csv' });
        toast({ title: 'Specs Downloaded', description: `${selectedForDownload.length} listing${selectedForDownload.length > 1 ? 's' : ''} exported. Use the links in the file to send a Request for Quote.` });
        clearSelectedForDownload();
        setShowRfqNudge(false);
    };

    const sendBulkRFQ = () => {
        if (!user) return;
        const ORS_ADMIN = 'balaji@lakshmibalajio2o.com';
        selectedForDownload.forEach(listing => {
            const dealId = `LDR-QUOTE-${Date.now()}-${listing.listingId}`;
            const devEmail = listing.developerId || ORS_ADMIN;
            addRegisteredLead({
                id: dealId,
                customerId: user.email,
                leadName: user.companyName,
                leadContact: user.userName,
                leadEmail: user.email,
                leadPhone: user.phone || '',
                requirementsSummary: `Request for Quote: ${listing.listingId} — ${listing.name || listing.location?.split(',')[0]}`,
                registeredBy: user.email,
                providers: [{ providerEmail: devEmail, properties: [{ listingId: listing.listingId, status: 'Pending' as const }] }],
                isO2OCollaborator: true,
            } as any, user.email);
            addTransactionActivity({
                leadId: dealId,
                activityType: 'Quote Requested',
                details: { message: `${user.companyName} submitted a Request for Quote for listing ${listing.listingId} at ${listing.location?.split(',')[0] || listing.location}.` },
                createdBy: user.email,
            });
            if (devEmail !== ORS_ADMIN) {
                fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([{
                        id: `notif-rfq-bulk-${dealId}`,
                        type: 'new_lead_for_provider',
                        title: `Request for Quote: ${listing.listingId}`,
                        message: `${user.companyName} submitted a Request for Quote for ${listing.listingId} at ${listing.location?.split(',')[0]}. Please respond with commercial terms.`,
                        href: `/dashboard/leads/${dealId}?tab=activity`,
                        recipientEmail: devEmail,
                        timestamp: new Date().toISOString(),
                        triggeredBy: user.email,
                        isRead: false,
                    }]),
                }).catch(() => {});
            }
        });
    };

    const handleDownload = () => {
        if (!user) {
            setIsLoginOpen(true);
            return;
        }
        if (user.role !== 'User') {
            toast({ variant: 'destructive', title: 'Download Not Available', description: 'Only Customer accounts can download listings.' });
            return;
        }
        const { success, limitReached } = logDownload(user, selectedForDownload);
        if (success) {
            // Intercept — show RFQ nudge BEFORE file delivery
            setShowRfqNudge(true);
            return;
        }
        if (limitReached) {
            toast({ variant: 'destructive', title: 'Download Limit Reached', description: `You've reached your daily download limit. Your access refreshes tomorrow.` });
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
        </>
    )
}

export function ListingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { listings: allListings, selectedForDownload, toggleSelectedForDownload } = useData();
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
                (listing.serviceModel === '3PL' || listing.serviceModel === 'Both') ? "3pl operated" : ""
            ].join(' ').toLowerCase();
            return searchHaystack.includes(searchTerm.toLowerCase());
        });
    }

    if (availability !== 'all') {
        results = results.filter(l => l.availabilityDate === availability);
    }
    
    results = results.filter(l => l.sizeSqFt >= sizeRange[0] && l.sizeSqFt <= sizeRange[1]);

    setFilteredListings(results);

    // Store search results in session storage for detail page navigation
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

  const handleLoginSuccess = () => {
      setIsLoginOpen(false);
      toast({
          title: "Logged In Successfully",
          description: "You can now select properties to download."
      });
  }

  return (
    <>
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <Alert className="mb-8">
                <AlertTitle>Ready to find your perfect space?</AlertTitle>
                <AlertDescription>
                    Select up to 3 of your favorite listings to instantly download their details as a single file. For more tailored options, our demand logging service is always available.
                </AlertDescription>
            </Alert>
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
                            placeholder="Search by location, ID, size, or '3PL'..." 
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
    <DownloadBar />
     <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} onLoginSuccess={handleLoginSuccess} />
     <LimitExceededDialog 
        isOpen={isLimitExceededDialogOpen} 
        onOpenChange={setIsLimitExceededDialogOpen}
        location={limitExceededLocation || ''}
      />
    </>
  );
}
