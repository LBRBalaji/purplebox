
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
import { Building2, Calendar, HardHat, MapPin, DollarSign, ShieldCheck, Download, Lock, FileText, Image as ImageIcon, Video, Layout, Scaling, ArrowLeft, ArrowRight, EyeOff, Construction, Building, Wind, Thermometer, ChevronsUp, Waves, ClipboardPlus } from 'lucide-react';
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


const InfoPill = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => (
    <div className="flex flex-col items-center justify-center p-3 text-center rounded-lg bg-secondary/50 border">
        <Icon className="h-6 w-6 text-primary mb-2" />
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold text-sm text-foreground">{value || 'N/A'}</p>
    </div>
);

const DetailRow = ({ label, value, isBlurred }: { label: string, value: string | number | boolean | undefined, isBlurred?: boolean }) => {
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'Not specified');
    return (
        <div className="flex justify-between items-center py-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("text-sm font-medium text-right", isBlurred && "blur-sm")}>{String(displayValue)}</p>
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

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const { listings, logDownload, logListingView, isLoading } = useData();
    const [listing, setListing] = React.useState<ListingSchema | null>(null);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
    const [isLayoutRequestOpen, setIsLayoutRequestOpen] = React.useState(false);
    const [navigationList, setNavigationList] = React.useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(-1);

    React.useEffect(() => {
        if (isLoading) return;
        
        const listingId = params.listingId as string;
        
        if (user && listingId) {
            logListingView(user, listingId);
        }

        if (listings.length > 0) {
            const activeListings = listings.filter(l => l.status === 'approved');
            const foundListing = activeListings.find(l => l.listingId === listingId);

            if (foundListing) {
                setListing(foundListing);
            } else {
                // If not found in approved, maybe it's a preview for an admin/provider
                const foundAnyStatus = listings.find(l => l.listingId === listingId);
                if (foundAnyStatus && (user?.email === foundAnyStatus.developerId || user?.role === 'SuperAdmin' || user?.email === 'admin@example.com')) {
                    setListing(foundAnyStatus);
                } else {
                    router.push('/listings');
                    return;
                }
            }

            // Logic for previous/next navigation
            try {
                const storedResultIds = sessionStorage.getItem('warehouse_search_results');
                let listToNavigate: string[];

                if (storedResultIds) {
                    listToNavigate = JSON.parse(storedResultIds);
                } else {
                    listToNavigate = activeListings.map(w => w.listingId).sort((a,b) => a.localeCompare(b));
                }
                
                setNavigationList(listToNavigate);
                const foundIndex = listToNavigate.findIndex(id => id === listingId);
                setCurrentIndex(foundIndex);
            } catch (e) {
                console.error("Could not access sessionStorage for navigation", e);
                 const listToNavigate = activeListings.map(w => w.listingId).sort((a,b) => a.localeCompare(b));
                 setNavigationList(listToNavigate);
                 const foundIndex = listToNavigate.findIndex(id => id === listingId);
                 setCurrentIndex(foundIndex);
            }
        } else if (!isLoading) {
            router.push('/listings');
        }

    }, [params.listingId, router, user, logListingView, listings, isLoading]);

    const prevListingId = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
    const nextListingId = currentIndex < navigationList.length - 1 ? navigationList[currentIndex + 1] : null;

    if (isLoading || !listing) {
        return <DetailPageSkeleton />;
    }
    
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

        const { success, limitReached } = logDownload(user.email);
        
        if (success) {
            const dataToExport = [{
                'Property ID': listing.listingId,
                'Name': listing.name,
                'Location': listing.location,
                'Total Area (Sq. Ft.)': listing.sizeSqFt,
                'Building Type': listing.buildingSpecifications.buildingType,
                'Availability': listing.availabilityDate,
                'Docks': listing.buildingSpecifications.numberOfDocksAndShutters,
                'Shop Floor Dimension': listing.buildingSpecifications.shopFloorLevelDimension,
                'Natural Light/Ventilation': listing.buildingSpecifications.naturalLightingAndVentilation,
                'Inside Flooring': listing.siteSpecifications.typeOfFlooringInside,
                'Outside Flooring': listing.siteSpecifications.typeOfFlooringOutside,
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
            }];

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Add branding and contact details
            const footer = [
                [], // Empty row for spacing
                ["For Leasing, Contact"],
                ["Lakshmi Balaji Realty"],
                ["Email: balaji@lakshmibalajio2o.com"],
                ["Mobile: +91 98410 98170"],
                [],
                ["Powered by Lakshmi Balaji O2O | Sourcing & Leasing Simplified"]
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
                description: `Details for ${listing.name} are being downloaded.`,
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
    
    const imageDocuments = listing.documents?.filter(doc => doc.type === 'image') || [];

    const handleLayoutRequest = () => {
        if (!user) {
            setIsLoginDialogOpen(true);
            return;
        }
        setIsLayoutRequestOpen(true);
    };

    const handleLogDemandClick = () => {
      if (!user) {
        setIsLoginDialogOpen(true);
        return;
      }
      router.push('/dashboard?logNew=true');
    }

    return (
        <>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header with Navigation */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <Badge variant="secondary">{listing.listingId}</Badge>
                            <h1 className="text-4xl font-bold font-headline tracking-tight mt-2">{listing.name}</h1>
                            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                                <MapPin className="h-5 w-5" /> {listing.location}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
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
                                        <InfoPill icon={Building2} label="Building Type" value={listing.buildingSpecifications.buildingType} />
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
                                            {user && <DetailRow label="Natural Light/Ventilation" value={listing.buildingSpecifications.naturalLightingAndVentilation} />}
                                            {user && <DetailRow label="Internal Lighting" value={listing.buildingSpecifications.internalLighting} />}
                                            {user && <DetailRow label="Mezzanine Details" value={listing.buildingSpecifications.mezzanineFloorLevelHeightAndDimension} />}
                                            <DetailRow label="Crane Support Structure" value={listing.buildingSpecifications.craneSupportStructureAvailable} />
                                            <DetailRow label="Crane Available" value={listing.buildingSpecifications.craneAvailable} />
                                            <DetailRow label="Warehouse Layout Available" value={listing.buildingSpecifications.warehouseLayoutAvailable} />
                                        </div>
                                         <div>
                                            <h4 className="font-semibold mb-2">Site</h4>
                                            <Separator />
                                            <DetailRow label="Inside Flooring" value={listing.siteSpecifications.typeOfFlooringInside} />
                                            <DetailRow label="Outside Flooring" value={listing.siteSpecifications.typeOfFlooringOutside} />
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
                                        {user ? "You have access to download media files." : "Log in to download layouts and other sensitive documents."}
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
                                        <p className="text-muted-foreground text-sm">No documents have been uploaded for this listing.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Sticky Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Commercials</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {user ? (
                                            <div className="space-y-4">
                                                <div className="flex items-baseline justify-center text-center">
                                                    <span className="text-4xl font-bold">₹{listing.rentPerSqFt || '??'}</span>
                                                    <span className="text-sm text-muted-foreground">/sq.ft./month</span>
                                                </div>
                                                <Separator/>
                                                <DetailRow label="Security Deposit" value={`${listing.rentalSecurityDeposit || 'N/A'} months`} />
                                                <DetailRow label="Construction Progress" value={listing.constructionProgress} />
                                            </div>
                                        ) : (
                                            <Alert>
                                                <Lock className="h-4 w-4" />
                                                <AlertTitle>Login Required</AlertTitle>
                                                <AlertDescription>
                                                    Please log in or sign up to view detailed commercial terms and other sensitive data.
                                                </AlertDescription>
                                                <Button className="w-full mt-4" onClick={() => setIsLoginDialogOpen(true)}>Login</Button>
                                            </Alert>
                                        )}
                                    </CardContent>
                                    {user && user.role === 'User' && (
                                        <CardFooter>
                                            <Button className="w-full" onClick={handleDownloadRequest}>
                                                <Download className="mr-2 h-4 w-4" /> Download Details as CSV
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Certificates & Approvals</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {user ? (
                                            <div className="space-y-1">
                                                <DetailRow label="Park Approval" value={listing.certificatesAndApprovals.parkApproval} />
                                                <DetailRow label="Building Approval" value={listing.certificatesAndApprovals.buildingApproval} />
                                                <DetailRow label="Fire License" value={listing.certificatesAndApprovals.fireLicense} />
                                                <DetailRow label="Fire NOC" value={listing.certificatesAndApprovals.fireNOC} />
                                                <DetailRow label="Building Insurance" value={listing.certificatesAndApprovals.buildingInsurance} />
                                                <DetailRow label="Property Tax Paid" value={listing.certificatesAndApprovals.propertyTax} />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center p-4">
                                                Login to view compliance details.
                                            </p>
                                        )}
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
                                        <Button className="w-full" onClick={handleLogDemandClick}>
                                            <ClipboardPlus className="mr-2 h-4 w-4" /> Log Demand
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <LoginDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} onLoginSuccess={() => setIsLoginDialogOpen(false)} />
            {listing && <LayoutRequestDialog isOpen={isLayoutRequestOpen} onOpenChange={setIsLayoutRequestOpen} listingId={listing.listingId} listingName={listing.name}/>}
        </>
    );
}

    
