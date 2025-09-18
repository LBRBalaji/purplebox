
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, Calculator, ClipboardPlus, Download, Info, MapPin, Scaling, Search, SlidersHorizontal, Star, X, Zap, Award, Users, Truck, ChevronsUp, CheckSquare, Smile, Share, Mail, Linkedin, Twitter, Facebook } from 'lucide-react';
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
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"
      />
    </svg>
);


function ShareDropdown({ listing }: { listing: ListingSchema }) {
    const [currentUrl, setCurrentUrl] = React.useState('');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(`${window.location.origin}/listings/${listing.listingId}`);
        }
    }, [listing.listingId]);

    if (!currentUrl) return null;

    const text = encodeURIComponent(`Check out this property: ${listing.listingId}`);
    const emailSubject = encodeURIComponent(`Property Listing: ${listing.listingId}`);
    const emailBody = encodeURIComponent(`I thought you might be interested in this property listing:\n\nListing ID: ${listing.listingId}\n${listing.location}\n\nView more details here: ${currentUrl}`);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Share className="mr-2 h-4 w-4" /> Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                    <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`} target="_blank" rel="noopener noreferrer">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </a>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${text}`} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </a>
                 </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="mr-2 h-4 w-4" /> X / Twitter
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="mr-2 h-4 w-4" /> Facebook
                    </a>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <a href={`https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp
                    </a>
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ListingCard({ listing, isSelected, onSelectionChange, onShortlist, isShortlisted }: { listing: ListingSchema, isSelected: boolean, onSelectionChange: (listing: ListingSchema) => void, onShortlist: (listingId: string) => void, isShortlisted: boolean }) {

  return (
    <Card className={cn("flex flex-col transition-all overflow-hidden group", isSelected && "ring-2 ring-primary")}>
       <CardHeader className="p-0">
        <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.documents && listing.documents.filter(d => d.type === 'image').length > 0 ? listing.documents.filter(d => d.type === 'image').map((doc, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <Image
                        src={doc.url}
                        alt={doc.name || listing.listingId}
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
                        src="https://placehold.co/800x600/7e32ca/FFFFFF?text=No+Image"
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
        <div className="flex justify-between items-start gap-4">
            <div className="flex-grow space-y-2">
                {(listing.serviceModel === '3PL' || listing.serviceModel === 'Both') && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-2">
                        <Star className="mr-1.5 h-3 w-3" />
                        3PL Operated Warehouse
                    </Badge>
                )}
                <div className="flex items-center gap-3">
                    <div className="flex-grow">
                        <CardTitle className="leading-tight">{listing.listingId}</CardTitle>
                        <CardDescription>{listing.location}</CardDescription>
                    </div>
                </div>
            </div>
             <div className="flex items-center space-x-2 shrink-0 pt-1">
                <Button variant="ghost" size="icon" onClick={() => onShortlist(listing.listingId)}>
                    <Star className={cn("h-5 w-5 text-muted-foreground", isShortlisted && "fill-amber-400 text-amber-500")} />
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.sizeSqFt.toLocaleString()} sq. ft.</span>
            </div>
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{Array.isArray(listing.buildingSpecifications.buildingType) ? listing.buildingSpecifications.buildingType.join(' / ') : 'N/A'}</span>
            </div>
             <div className="flex items-center gap-2">
                <ChevronsUp className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {listing.buildingSpecifications.eveHeightMeters ? `${listing.buildingSpecifications.eveHeightMeters}m Eve Height` : 'N/A'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.availabilityDate}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 grid grid-cols-2 gap-2">
        <div className="col-span-2">
             <Button className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" variant="secondary" onClick={() => onSelectionChange(listing)}>
              <div className={cn("mr-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary/50", isSelected && "bg-primary border-primary")}>
                  <Smile className={cn("h-4 w-4 text-primary transition-transform duration-300", isSelected ? 'scale-100 rotate-0 text-amber-400' : 'scale-0 -rotate-90')} />
              </div>
              <span className="font-semibold text-base">{isSelected ? "I’m Humbled" : "Select Me"}</span>
            </Button>
        </div>
        <ShareDropdown listing={listing} />
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
        const { success } = logDownload(user!.email!, selectedForDownload);
        if (success) {
            const dataToExport = selectedForDownload.map(l => ({
                'Property ID': l.listingId,
                'Name': l.name,
                'Location': l.location,
                'Size (Sq. Ft.)': l.sizeSqFt,
                'Availability': l.availabilityDate,
                'Rent (per Sq. Ft.)': l.rentPerSqFt || 'Contact for details',
                 // Approvals
                'Park Approval': l.certificatesAndApprovals.parkApproval ? 'Yes' : 'No',
                'Building Approval': l.certificatesAndApprovals.buildingApproval ? 'Yes' : 'No',
                'Fire License': l.certificatesAndApprovals.fireLicense ? 'Yes' : 'No',
                'Fire NOC': l.certificatesAndApprovals.fireNOC ? 'Yes' : 'No',
                'Building Insurance': l.certificatesAndApprovals.buildingInsurance ? 'Yes' : 'No',
                'Property Tax Paid': l.certificatesAndApprovals.propertyTax ? 'Yes' : 'No',
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            
            const footer = [
                [], // Empty row for spacing
                ["Zero Brokerage Charges"],
                ["For Startups on their first transaction."],
                ["For Logistics Companies on all transactions."],
                [],
                ["Your growth is our growth. Come back tomorrow and download another set of O2O warehouse listings to serve your next customer", "www.LakshmiBalajiO2O.com"],
                [],
                ["Powered by Lakshmi Balaji O2O | Warehouse-Technical-Compliance-Commercials, in a single CSV"]
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

const searchPlaceholders = [
    'e.g., search "12m eve height"',
    'e.g., search "crane available"',
    'e.g., search "3PL operated warehouse"',
    'e.g., search "RCC building"',
    'e.g., search "fire NOC approved"',
    'e.g., search "FM2 grade flooring"',
    'e.g., search "Galvalume roof"',
    'e.g., search "Insulated roof"',
    'e.g., search "Turbo ventilation"',
];

type LocationCircle = {
  name: string;
  locations: string[];
};

export function ListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { listings: allListings, isLoading: isDataLoading, selectedForDownload, toggleSelectedForDownload, generalShortlist, toggleGeneralShortlist } = useData();
  const { toast } = useToast();
  const [filteredListings, setFilteredListings] = useState<ListingSchema[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sizeRange, setSizeRange] = useState([0, 1000000]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLimitExceededDialogOpen, setIsLimitExceededDialogOpen] = useState(false);
  const [limitExceededLocation, setLimitExceededLocation] = useState<string | null>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [locationCircles, setLocationCircles] = useState<LocationCircle[]>([]);

  useEffect(() => {
    async function fetchCircles() {
      try {
        const response = await fetch('/api/location-circles');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLocationCircles(data);
      } catch (error) {
        console.error("Could not fetch location circles", error);
      }
    }
    fetchCircles();
  }, []);
  
  const approvedListings = useMemo(() => allListings.filter(l => l.status === 'approved'), [allListings]);

  const inventoryCount = approvedListings.length;
  const totalInventorySize = useMemo(() =>
      approvedListings.reduce((sum, listing) => sum + listing.sizeSqFt, 0),
    [approvedListings]
  );
  
  // Function to format large numbers into a more readable format (e.g., 1.5M)
  const formatSize = (size: number) => {
    if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}M`;
    }
    if (size >= 1000) {
      return `${(size / 1000).toFixed(0)}K`;
    }
    return size.toString();
  };

  const selectedIds = useMemo(() => new Set(selectedForDownload.map(l => l.listingId)), [selectedForDownload]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPlaceholderIndex((prevIndex) => (prevIndex + 1) % searchPlaceholders.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);


 useEffect(() => {
    let results = approvedListings;

    // Keyword search
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      
      const heightMatch = lowerCaseSearchTerm.match(/(\d+)\s*m/);

      if (heightMatch && heightMatch[1]) {
        const minHeight = parseInt(heightMatch[1], 10);
        if (!isNaN(minHeight)) {
          results = results.filter(listing => 
            listing.buildingSpecifications.eveHeightMeters && listing.buildingSpecifications.eveHeightMeters >= minHeight
          );
        }
      } else {
        results = results.filter(listing => {
            const searchHaystack = [
                listing.name,
                listing.listingId,
                Array.isArray(listing.buildingSpecifications.buildingType) ? listing.buildingSpecifications.buildingType.join(' ') : '',
                listing.serviceModel,
                listing.buildingSpecifications.roofType,
                listing.buildingSpecifications.ventilation,
                listing.buildingSpecifications.roofInsulation,
                listing.buildingSpecifications.craneAvailable ? "crane available" : "",
                listing.siteSpecifications.typeOfFlooringInside,
                listing.certificatesAndApprovals.fireNOC ? "fire NOC approved" : "",
                listing.certificatesAndApprovals.buildingApproval ? "building approval" : ""
            ].join(' ').toLowerCase();
            return searchHaystack.includes(lowerCaseSearchTerm);
        });
      }
    }

    // Location search (with circle logic)
    if (locationFilter) {
        const lowerLocation = locationFilter.toLowerCase();
        const matchedCircle = locationCircles.find(c => 
            c.name.toLowerCase().includes(lowerLocation) ||
            c.locations.some(loc => lowerLocation.includes(loc))
        );

        if (matchedCircle) {
            results = results.filter(listing => listing.locationCircle === matchedCircle.name);
        } else {
            results = results.filter(listing => listing.location.toLowerCase().includes(lowerLocation));
        }
    }
    
    // Availability filter
    if (availability !== 'all') {
        results = results.filter(l => l.availabilityDate === availability);
    }
    
    // Size range filter
    results = results.filter(l => l.sizeSqFt >= sizeRange[0] && l.sizeSqFt <= sizeRange[1]);

    setFilteredListings(results);

    try {
        const resultIds = results.map(r => r.listingId);
        sessionStorage.setItem('warehouse_search_results', JSON.stringify(resultIds));
    } catch (e) {
        console.error("Could not write to sessionStorage", e);
    }
  }, [searchTerm, locationFilter, availability, sizeRange, approvedListings, locationCircles]);


  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setAvailability('all');
    
    const maxArea = Math.max(...approvedListings.map(w => w.sizeSqFt), 0);
    if (maxArea > 0) {
        setSizeRange([0, Math.ceil(maxArea / 100000) * 100000]);
    } else {
        setSizeRange([0, 1000000]);
    }
  }

  const maxSliderSize = useMemo(() => {
    const max = Math.max(...allListings.map(w => w.sizeSqFt), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
  }, [allListings]);
  
  const handleLogDemandClick = () => {
      if (!user) {
        setIsLoginOpen(true);
        return;
      }
      router.push('/dashboard?logNew=true');
  }

  const handleShortlistClick = (listingId: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    const canShortlist = user.role === 'User' || user.role === 'Agent' || user.role === 'O2O';
    if (!canShortlist) {
      toast({
        variant: 'destructive',
        title: 'Action Not Available',
        description: 'Shortlisting is available for Customers, Agents, and O2O Managers.',
      });
      return;
    }
    toggleGeneralShortlist(listingId);
  };

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

  const renderContent = () => {
    if (isDataLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="w-full aspect-video" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredListings.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <ListingCard 
              key={listing.listingId} 
              listing={listing} 
              isSelected={selectedIds.has(listing.listingId)}
              onSelectionChange={handleSelectionChange}
              onShortlist={handleShortlistClick}
              isShortlisted={generalShortlist.includes(listing.listingId)}
            />
          ))}
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <>
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
             <div className="text-center py-8 md:py-12">
                <div className="flex items-center justify-center gap-4 text-primary mb-4">
                    <Search className="w-6 h-6"/>
                    <div className="w-8 h-px bg-border"/>
                    <CheckSquare className="w-6 h-6"/>
                    <div className="w-8 h-px bg-border"/>
                    <Download className="w-6 h-6"/>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">Search-Select-Download</h1>
                <p className="mt-4 text-lg text-accent">Warehouse-Technical-Compliance-Commercials, in a single CSV</p>
                
                 <div className="mt-8 flex items-center justify-center gap-4 md:gap-8 text-center animate-in fade-in-0 duration-1000">
                    <div className="text-center">
                        {isDataLoading ? <Skeleton className="h-9 w-12 mx-auto" /> : <p className="text-2xl md:text-3xl font-bold text-primary">{inventoryCount}</p>}
                        <p className="text-xs text-muted-foreground tracking-wider">WAREHOUSES</p>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="text-center">
                         {isDataLoading ? <Skeleton className="h-9 w-20 mx-auto" /> : <p className="text-2xl md:text-3xl font-bold text-primary">{formatSize(totalInventorySize)}</p>}
                        <p className="text-xs text-muted-foreground tracking-wider">SQ. FT. LISTED</p>
                    </div>
                </div>

            </div>
             <Alert className="mb-8 bg-primary/5 border-primary/20 p-6 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8">
                    <AlertTitle className="font-bold text-primary/90 text-xl flex items-center gap-3">
                        <Info className="h-6 w-6 text-primary/80" />
                        Download up to 5 listings at once!
                    </AlertTitle>
                    <AlertDescription className="text-primary/80 mt-2 space-y-3">
                        <p>Select your favorite listings to instantly <strong className="text-primary">download</strong> their key details. For more tailored options, our demand specific warehouse sourcing service is always available.</p>
                        <Button onClick={handleLogDemandClick}>
                            <ClipboardPlus className="mr-2 h-4 w-4" /> Log Your Demand
                        </Button>
                    </AlertDescription>
                </div>
                <div className="md:col-span-4 space-y-4 p-4 rounded-md bg-accent/10 border-accent/20">
                     <h4 className="font-bold text-accent-foreground/90 flex items-center gap-2"><Award className="h-5 w-5 text-accent"/> Zero Brokerage Charges</h4>
                     <ul className="text-xs text-accent-foreground/80 list-none space-y-2">
                        <li className="flex items-start gap-2">
                            <Smile className="h-4 w-4 shrink-0 mt-0.5 text-accent/90"/>
                            <div>
                                <strong className="font-semibold text-accent-foreground">For Startups</strong> on their first transaction.
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                             <Truck className="h-4 w-4 shrink-0 mt-0.5 text-accent/90"/>
                            <div>
                                <strong className="font-semibold text-accent-foreground">For Logistics Companies</strong> on all transactions.
                            </div>
                        </li>
                     </ul>
                </div>
            </Alert>
            <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="w-full">
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Filter Listings</h2>
                    <p className="text-muted-foreground mt-1">
                        Use our advanced filters to find the perfect Warehouse, 3PL Operated Warehouse and Industrial Buildings for your needs.
                    </p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-sm font-medium">Keyword Search</label>
                        <Input 
                            placeholder={searchPlaceholders[currentPlaceholderIndex]}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input 
                            placeholder="e.g. Chennai, Oragadam"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Availability</label>
                        <Select value={availability} onValueChange={setAvailability}>
                            <SelectTrigger>
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
                    <div className="lg:col-span-3 space-y-2">
                         <label className="text-sm font-medium">Size (sq. ft.) - from {sizeRange[0].toLocaleString()} to {sizeRange[1].toLocaleString()}</label>
                         <Slider
                            min={0}
                            max={maxSliderSize}
                            step={10000}
                            value={sizeRange}
                            onValueChange={(value) => setSizeRange(value as [number, number])}
                        />
                    </div>
                    <div>
                         <Button onClick={resetFilters} variant="ghost" className="w-full">Reset Filters</Button>
                    </div>
                </div>
            </div>
            {renderContent()}
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

    