
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema, Document } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building2, Calendar, HardHat, MapPin, DollarSign, ShieldCheck, Download, Lock, FileText, Image as ImageIcon, Video, Layout, Scaling, ArrowLeft, ArrowRight, EyeOff, Construction, Building, Wind, Thermometer, ChevronsUp, Waves, ClipboardPlus, Share, Linkedin, Twitter, Facebook, Mail, Star, Info, MessageCircle, FileQuestion, HelpCircle, Check, NotepadText, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LoginDialog } from '@/components/login-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { LayoutRequestDialog } from '@/components/layout-request-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RegisteredLead } from '@/contexts/data-context';


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


const InfoPill = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => (
    <div className="flex flex-col items-center justify-center p-3 text-center rounded-lg bg-secondary/50 border">
        <Icon className="h-6 w-6 text-primary mb-2" />
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold text-sm text-foreground">{value || 'N/A'}</p>
    </div>
);

const DetailRow = ({ label, value }: { label: string, value: string | number | boolean | undefined }) => {
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'Not specified');
    return (
        <div className="flex justify-between items-center py-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("text-sm font-medium text-right")}>{String(displayValue)}</p>
        </div>
    );
};

const DocumentRow = ({ doc, onDownload }: { doc: Document, onDownload: () => void }) => {
    const getIcon = () => {
        switch (doc.type) {
            case 'image': return <ImageIcon className="h-5 w-5 text-primary" />;
            case 'video': return <Video className="h-5 w-5 text-primary" />;
            case 'layout': return <Layout className="h-5 w-5 text-primary" />;
            default: return <FileText className="h-5 w-5 text-primary" />;
        }
    }
    
    return (
        <TableRow>
            <TableCell className="font-medium flex items-center gap-3">
                {getIcon()}
                {doc.name}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={onDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </TableCell>
        </TableRow>
    );
}

const DetailPageSkeleton = () => (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
        <div className="flex justify-between items-center">
            <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-10 w-96" />
                <Skeleton className="h-6 w-64 mt-2" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardContent className="p-4">
                        <Skeleton className="aspect-video w-full" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card className="sticky top-8">
                     <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
                     <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                     <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            </div>
        </div>
    </div>
);

function ShareDropdown({ listing }: { listing: ListingSchema }) {
    const [currentUrl, setCurrentUrl] = React.useState('');

    React.useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    if (!currentUrl) return null;

    const text = encodeURIComponent(`Check out this property: ${listing.listingId}`);
    const emailSubject = encodeURIComponent(`Property Listing: ${listing.listingId}`);
    const emailBody = encodeURIComponent(`I thought you might be interested in this property listing:\n\nListing ID: ${listing.listingId}\n${listing.location}\n\nView more details here: ${currentUrl}`);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
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

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, users, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const { listings, logDownload, logListingView, isLoading: isDataLoading, generalShortlist, toggleGeneralShortlist, isShortlistLoading, addLayoutRequest, addRegisteredLead, registeredLeads } = useData();
    const [listing, setListing] = React.useState<ListingSchema | null>(null);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
    const [isLayoutRequestOpen, setIsLayoutRequestOpen] = React.useState(false);
    const [navigationList, setNavigationList] = React.useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(-1);
    const [justRequestedQuote, setJustRequestedQuote] = React.useState(false);

    const isLoading = isAuthLoading || isDataLoading;

    React.useEffect(() => {
        if (isDataLoading) return;
        
        const listingId = params.listingId as string;
        const foundListing = listings.find(l => l.listingId === listingId);

        if (!foundListing || foundListing.status !== 'approved') {
            router.push('/listings');
            return;
        }

        setListing(foundListing);
        setJustRequestedQuote(false); // Reset on new page load
        
        if (user) { // Only log view if a user is logged in
             logListingView(user, listingId);
        }
        
        try {
            const storedResultIds = sessionStorage.getItem('warehouse_search_results');
            let listToNavigate: string[];

            if (storedResultIds) {
                listToNavigate = JSON.parse(storedResultIds);
            } else {
                listToNavigate = listings.filter(l => l.status === 'approved').map(w => w.listingId).sort((a,b) => a.localeCompare(b));
            }
            
            setNavigationList(listToNavigate);
            const foundIndex = listToNavigate.findIndex(id => id === listingId);
            setCurrentIndex(foundIndex);
        } catch (e) {
            console.error("Could not access sessionStorage for navigation", e);
             const listToNavigate = listings.filter(l => l.status === 'approved').map(w => w.listingId).sort((a,b) => a.localeCompare(b));
             setNavigationList(listToNavigate);
             const foundIndex = listToNavigate.findIndex(id => id === listingId);
             setCurrentIndex(foundIndex);
        }

    }, [params.listingId, listings, isDataLoading, user, router, logListingView]);

    const prevListingId = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
    const nextListingId = currentIndex < navigationList.length - 1 ? navigationList[currentIndex + 1] : null;

    const handleGetQuote = (isBrokered = false) => {
        if (!user) {
            setIsLoginDialogOpen(true);
            return;
        }
        if (!listing) return;

        const providerEmail = isBrokered ? 'superadmin@o2o.com' : listing.developerId;

        const newLead: Omit<RegisteredLead, 'registeredAt'> = {
            id: `LDR-QUOTE-${Date.now()}`,
            customerId: user.email,
            leadName: user.companyName,
            leadContact: user.userName,
            leadEmail: user.email,
            leadPhone: user.phone,
            requirementsSummary: `Quote requested for Property ID: ${listing.warehouseBoxId || listing.listingId}`,
            registeredBy: user.email,
            providers: [{
                providerEmail: providerEmail,
                properties: [{ listingId: listing.listingId, status: 'Pending' }]
            }],
            isO2OCollaborator: true, // Mark as a direct inquiry
        };

        addRegisteredLead(newLead, user.email);
        setJustRequestedQuote(true); // Update local state immediately
        
        const partnerName = isBrokered ? "the O2O team" : "the developer";
        
        toast({
            title: 'Quote Request Sent!',
            description: `You have been connected with ${partnerName} for listing "${listing.warehouseBoxId || listing.listingId}". Your interaction begins on the 'My Transactions' page, where you can track all communications.`,
        });
    };

    const quoteRequestLead = React.useMemo(() => {
        if (!user || !listing) return null;
        return registeredLeads.find(lead => 
            lead.customerId === user.email &&
            lead.providers?.some(p => p.properties?.some(prop => prop.listingId === listing.listingId))
        );
    }, [user, listing, registeredLeads]);

    const hasRequestedQuote = justRequestedQuote || !!quoteRequestLead;

    const handleDownloadRequest = () => {
        if (!user) {
            setIsLoginDialogOpen(true);
            return;
        }

        if (user.role !== 'User') {
             toast({
                title: "Download Not Applicable",
                description: "Only customer accounts can download listing details.",
                variant: 'destructive',
            });
            return;
        }

        if (!listing) return;
        const { success, limitReached } = logDownload(user, [listing]);
        
        if (success) {
            const dataToExport = [{
                'Property ID': listing.listingId,
                'Name': listing.name,
                'Location': listing.location,
                'Total Area (Sq. Ft.)': listing.sizeSqFt,
                'Building Type': Array.isArray(listing.buildingSpecifications.buildingType) ? listing.buildingSpecifications.buildingType.join(', ') : listing.buildingSpecifications.buildingType,
                'Availability': listing.availabilityDate,
                'Docks': listing.buildingSpecifications.numberOfDocksAndShutters,
                'Shop Floor Dimension': listing.buildingSpecifications.shopFloorLevelDimension,
                'Natural Light/Ventilation': listing.buildingSpecifications.naturalLightingAndVentilation,
                'Internal Lighting': listing.buildingSpecifications.internalLighting,
                'Access Road': listing.siteSpecifications.typeOfRoad,
                'Rent (per Sq. Ft.)': listing.rentPerSqFt || 'Contact for details',
                'Security Deposit (Months)': listing.rentalSecurityDeposit || 'Contact for details',
                'Crane Support Structure': listing.buildingSpecifications.craneSupportStructureAvailable ? 'Yes' : 'No',
                'Crane Available': listing.buildingSpecifications.craneAvailable ? 'Yes' : 'No',
                'Roof Type': listing.buildingSpecifications.roofType,
                'Eve Height (M)': listing.buildingSpecifications.eveHeightMeters,
                'Roof Insulation': listing.buildingSpecifications.roofInsulation,
                'Ventilation': listing.buildingSpecifications.ventilation,
                'Louvers': listing.buildingSpecifications.louvers ? 'Yes' : 'No',
                // Approvals
                'Park Approval': listing.certificatesAndApprovals.parkApproval ? 'Yes' : 'No',
                'Building Approval': listing.certificatesAndApprovals.buildingApproval ? 'Yes' : 'No',
                'Fire License': listing.certificatesAndApprovals.fireLicense ? 'Yes' : 'No',
                'Fire NOC': listing.certificatesAndApprovals.fireNOC ? 'Yes' : 'No',
                'Building Insurance': listing.certificatesAndApprovals.buildingInsurance ? 'Yes' : 'No',
                'Property Tax Paid': listing.certificatesAndApprovals.propertyTax ? 'Yes' : 'No',
            }];

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Add branding and contact details
            const footer = [
                [], // Empty row for spacing
                ["For Leasing, Contact"],
                ["Lakshmi Balaji Realty"],
                ["Email: balaji@lakshmibalajio2o.com"],
                ["Mobile: +91 9841098170"],
                [],
                ["Zero Brokerage Charges"],
                ["For Startups on their first transaction."],
                ["For Logistics Companies on all transactions."],
                [],
                ["Your growth is our growth. Come back tomorrow and download another set of O2O warehouse listings to serve your next customer", "www.LakshmiBalajiO2O.com"],
                [],
                ["Powered by Lakshmi Balaji O2O | Warehouse-Technical-Commercials, in a single CSV"]
            ];
            XLSX.utils.sheet_add_aoa(worksheet, footer, { origin: -1 });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Listing Details");

            const now = new Date();
            const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
            const filename = `Lakshmi_Balaji_O2O_Listing_${listing.listingId}_${timestamp}.csv`;
            
            XLSX.writeFile(workbook, filename, { bookType: "csv" });

            toast({
                title: "Download Started",
                description: `Details for listing ${listing.listingId} are being downloaded.`,
            });
        }

        if (limitReached) {
             toast({
                variant: 'destructive',
                title: "Download Limit Reached",
                description: `You have reached your daily download limit.`,
            });
        }
    };

    if (isLoading || !listing) {
        return <DetailPageSkeleton />;
    }

    const isShortlisted = !!user && generalShortlist.includes(listing.listingId);
    
    const imageDocuments = listing.documents?.filter(doc => doc.type === 'image') || [];

    const handleLayoutRequest = () => {
        if (!user) {
            setIsLoginDialogOpen(true);
            return;
        }
        setIsLayoutRequestOpen(true);
    };

    const handleShortlistClick = () => {
        if (!user) {
            setIsLoginDialogOpen(true);
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
        toggleGeneralShortlist(listing.id);
    };
    
    const isPremiumListing = listing.plan === 'Paid_Premium';

    return (
        <>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header with Navigation */}
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Badge variant="secondary">{listing.listingId}</Badge>
                                {isPremiumListing && (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                        <Sparkles className="mr-1.5 h-3 w-3"/>
                                        Premium Listing
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold font-headline tracking-tight mt-2">{listing.name || `Warehouse in ${listing.location}`}</h1>
                            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                                <MapPin className="h-5 w-5" /> {listing.location}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShareDropdown listing={listing} />
                            <Button asChild variant="outline" disabled={!prevListingId}>
                                <Link href={prevListingId ? `/listings/${prevListingId}` : '#'}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Link>
                            </Button>
                             <Button asChild variant="outline" disabled={!nextListingId}>
                                <Link href={nextListingId ? `/listings/${nextListingId}` : '#'}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image and High-level stats */}
                            <Card>
                                <CardContent className="p-4">
                                     <Carousel className="rounded-lg overflow-hidden">
                                        <CarouselContent>
                                            {imageDocuments.length > 0 ? imageDocuments.map((doc, index) => (
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
                                                            src="https://placehold.co/1200x600.png"
                                                            alt="Placeholder image"
                                                            fill
                                                            className="object-cover"
                                                            data-ai-hint="warehouse building"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            )}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-4" />
                                        <CarouselNext className="right-4" />
                                    </Carousel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        <InfoPill icon={Scaling} label="Total Area" value={`${listing.sizeSqFt.toLocaleString()} sft`} />
                                        <InfoPill icon={Building2} label="Building Type" value={Array.isArray(listing.buildingSpecifications.buildingType) ? listing.buildingSpecifications.buildingType.join(' / ') : 'N/A'} />
                                        <InfoPill icon={Calendar} label="Availability" value={listing.availabilityDate} />
                                        <InfoPill icon={HardHat} label="Docks" value={listing.buildingSpecifications.numberOfDocksAndShutters} />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Property Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{listing.description}</p>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            {listing.additionalInformation && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Additional Information</CardTitle>
                                        <CardDescription>Notes provided by the developer.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{listing.additionalInformation}</p>
                                    </CardContent>
                                </Card>
                            )}

                             {/* Building and Site Specifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Specifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Building</h4>
                                            <Separator />
                                            <DetailRow label="Shop Floor Dimension" value={listing.buildingSpecifications.shopFloorLevelDimension} />
                                            <DetailRow label="Internal Lighting" value={listing.buildingSpecifications.internalLighting} />
                                            <DetailRow label="Mezzanine Details" value={listing.buildingSpecifications.mezzanineFloorLevelHeightAndDimension} />
                                            <DetailRow label="Crane Support Structure" value={listing.buildingSpecifications.craneSupportStructureAvailable} />
                                            <DetailRow label="Crane Available" value={listing.buildingSpecifications.craneAvailable} />
                                            <DetailRow label="Warehouse Layout Available" value={listing.buildingSpecifications.warehouseLayoutAvailable} />
                                        </div>
                                         <div>
                                            <h4 className="font-semibold mb-2">Site</h4>
                                            <Separator />
                                            <DetailRow label="Inside Flooring" value={listing.siteSpecifications.typeOfFlooringInside} />
                                            <DetailRow label="Access Road" value={listing.siteSpecifications.typeOfRoad} />
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                             <h4 className="font-semibold mb-2">Roof</h4>
                                            <Separator />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                                <DetailRow label="Roof Type" value={listing.buildingSpecifications.roofType} />
                                                <DetailRow label="Eve Height" value={listing.buildingSpecifications.eveHeightMeters ? `${listing.buildingSpecifications.eveHeightMeters} m` : 'N/A'} />
                                                <DetailRow label="Roof Insulation" value={listing.buildingSpecifications.roofInsulation} />
                                                <DetailRow label="Ventilation" value={listing.buildingSpecifications.ventilation} />
                                                <DetailRow label="Louvers" value={listing.buildingSpecifications.louvers} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents */}
                             <Card>
                                <CardHeader>
                                    <CardTitle>Documents & Media</CardTitle>
                                    <CardDescription>
                                        Download available media files and layouts.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {listing.buildingSpecifications.warehouseLayoutAvailable && (
                                        <div className="mb-6">
                                            <Button className="w-full" onClick={handleLayoutRequest}>
                                                <Layout className="mr-2 h-4 w-4" />
                                                Request a copy of the layout
                                            </Button>
                                        </div>
                                    )}
                                    {listing.documents && listing.documents.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>File Name</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {listing.documents.map((doc, index) => (
                                                     <DocumentRow key={index} doc={doc} onDownload={handleDownloadRequest} />
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No documents have been uploaded for this listing.</p>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Final Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Save or Download</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Button
                                            variant={isShortlisted ? 'default' : 'outline'}
                                            className="w-full h-12"
                                            onClick={handleShortlistClick}
                                            disabled={isShortlistLoading}
                                        >
                                            <Star className={cn("mr-2 h-4 w-4", isShortlisted && "fill-amber-400 text-amber-500")} />
                                            {isShortlistLoading ? 'Loading...' : isShortlisted ? 'Shortlisted' : 'Shortlist this Property'}
                                        </Button>
                                        <Button className="w-full h-12" onClick={handleDownloadRequest}>
                                            <Download className="mr-2 h-4 w-4" /> Download Details as CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Sticky Sidebar */}
                        <div className="lg:col-span-1 space-y-6 sticky top-24">
                           <Card>
                                <CardHeader>
                                    <CardTitle>Commercials</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-baseline justify-center text-center">
                                            {listing.rentPerSqFt === 'Get Quote' || isPremiumListing ? (
                                                <span className="text-2xl font-bold">Price on Request</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-bold">₹{listing.rentPerSqFt}</span>
                                                    <span className="text-sm text-muted-foreground">/sq.ft./month</span>
                                                </>
                                            )}
                                        </div>
                                        <Separator/>
                                        <DetailRow label="Security Deposit" value={typeof listing.rentalSecurityDeposit === 'number' ? `${listing.rentalSecurityDeposit} months` : (listing.rentalSecurityDeposit || 'N/A')} />
                                        <DetailRow label="Construction Progress" value={listing.constructionProgress} />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2">
                                     {hasRequestedQuote ? (
                                        <div className="w-full text-center space-y-2">
                                            <p className="text-sm font-semibold text-green-600 flex items-center justify-center gap-2">
                                                <Check className="h-4 w-4" /> Commercials Requested
                                            </p>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={`/dashboard/leads/${quoteRequestLead?.id}`}>
                                                    Go to Transactions <ArrowRight className="ml-2 h-4 w-4"/>
                                                </Link>
                                            </Button>
                                            <p className="text-xs text-muted-foreground px-2">Your interaction begins here. Track all communication, site visits, and negotiations for this property on the 'My Transactions' page.</p>
                                        </div>
                                     ) : isPremiumListing ? (
                                        <Button onClick={() => handleGetQuote(false)} className="w-full">
                                            Get Commercials Quote
                                        </Button>
                                     ) : (
                                        <Alert variant="default" className="text-center p-4">
                                            <Sparkles className="h-4 w-4" />
                                            <AlertTitle>Engage Directly!</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                Look for the <Badge className="bg-amber-100 text-amber-800 border-amber-200">Premium</Badge> badge on listings to connect directly with providers.
                                            </AlertDescription>
                                            <Button size="sm" className="w-full mt-4 h-auto py-2" onClick={() => handleGetQuote(true)}>
                                                <div className="flex flex-col text-center">
                                                    <span>Available on Broking Model</span>
                                                    <span className="font-normal text-xs">- Connect with O2O -</span>
                                                </div>
                                            </Button>
                                        </Alert>
                                     )}
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Certificates & Approvals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <DetailRow label="Park Approval" value={listing.certificatesAndApprovals.parkApproval} />
                                        <DetailRow label="Building Approval" value={listing.certificatesAndApprovals.buildingApproval} />
                                        <DetailRow label="Fire License" value={listing.certificatesAndApprovals.fireLicense} />
                                        <DetailRow label="Fire NOC" value={listing.certificatesAndApprovals.fireNOC} />
                                        <DetailRow label="Building Insurance" value={listing.certificatesAndApprovals.buildingInsurance} />
                                        <DetailRow label="Property Tax Paid" value={listing.certificatesAndApprovals.propertyTax} />
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <CardTitle>Need Something Different?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        For more tailored options, our demand specific warehouse sourcing service is always available.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => handleGetQuote(true)}>
                                        <ClipboardPlus className="mr-2 h-4 w-4" /> Log Demand
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <LoginDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} onLoginSuccess={() => setIsLoginDialogOpen(false)} />
            {listing && <LayoutRequestDialog isOpen={isLayoutRequestOpen} onOpenChange={setIsLayoutRequestOpen} listingId={listing.listingId} listingName={listing.name || `Warehouse in ${listing.location}`} onSubmit={addLayoutRequest} />}
        </>
    );

}
