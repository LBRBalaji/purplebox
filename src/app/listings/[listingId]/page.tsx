
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema, Document, WarehouseSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building2, Calendar, HardHat, MapPin, Milestone, DollarSign, ShieldCheck, Download, Lock, FileText, Image as ImageIcon, Video, Layout, Scaling, ArrowLeft, ArrowRight, EyeOff, AlertCircle } from 'lucide-react';
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

function mapWarehouseToListing(warehouse: WarehouseSchema): ListingSchema {
  return {
    listingId: warehouse.id,
    developerId: 'provider@example.com', // Mocked as not in warehouse data
    status: 'approved', // Assuming only active warehouses are shown
    warehouseBoxId: warehouse.id,
    name: warehouse.locationName,
    location: warehouse.locationName,
    latLng: `${warehouse.generalizedLocation.lat},${warehouse.generalizedLocation.lng}`,
    sizeSqFt: warehouse.size,
    description: `A prime warehouse facility in ${warehouse.locationName} with a total area of ${warehouse.size.toLocaleString()} sq. ft.`,
    rentPerSqFt: 20, // Mock data
    rentalSecurityDeposit: 6, // Mock data
    availabilityDate: warehouse.readiness,
    constructionProgress: warehouse.readiness === 'Ready for Occupancy' ? '100%' : 'In Progress',
    area: {
      totalChargeableArea: warehouse.size,
    },
    buildingSpecifications: {
      buildingType: 'PEB', // Mock data
      numberOfDocksAndShutters: warehouse.specifications.docks,
      roofInsulationStatus: 'Fully Insulated', // Mock data
      internalLighting: 'LED High-bay', // Mock data
    },
    siteSpecifications: {
      typeOfFlooringInside: warehouse.specifications.flooringType,
      typeOfRoad: 'Tar Road', // Mock data
    },
    certificatesAndApprovals: {
      parkApproval: true,
      buildingApproval: true,
      fireLicense: true,
      fireNOC: true,
      buildingInsurance: true,
      propertyTax: true,
    },
    documents: warehouse.imageUrls.map((url, i) => ({
      type: 'image',
      name: `Photo ${i + 1}`,
      url: url,
    })),
  };
}


export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const { logDownload, logListingView } = useData();
    const [listing, setListing] = React.useState<WarehouseSchema | null>(null);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
    const [navigationList, setNavigationList] = React.useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(-1);

    React.useEffect(() => {
        const listingId = params.listingId as string;
        
        if (user && listingId) {
            logListingView(user, listingId);
        }

        fetch('/api/warehouses')
            .then(res => res.json())
            .then((warehouses: WarehouseSchema[]) => {
                const activeWarehouses = warehouses.filter(w => w.isActive);

                const foundWarehouse = activeWarehouses.find(w => w.id === listingId);
                 if (foundWarehouse) {
                    setListing(foundWarehouse);
                } else {
                    router.push('/listings');
                }

                // Logic for previous/next navigation
                const storedResultIds = sessionStorage.getItem('warehouse_search_results');
                let listToNavigate: string[];

                if (storedResultIds) {
                    listToNavigate = JSON.parse(storedResultIds);
                } else {
                    listToNavigate = activeWarehouses.map(w => w.id).sort((a,b) => a.localeCompare(b.id));
                }
                
                setNavigationList(listToNavigate);
                const foundIndex = listToNavigate.findIndex(id => id === listingId);
                setCurrentIndex(foundIndex);

            });

    }, [params.listingId, router, user, logListingView]);

    const prevListingId = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
    const nextListingId = currentIndex < navigationList.length - 1 ? navigationList[currentIndex + 1] : null;

    if (!listing) {
        return (
             <div className="flex-grow flex items-center justify-center p-4">
                <Card className="w-full max-w-4xl text-center p-8">
                    <CardTitle>Loading Listing...</CardTitle>
                    <CardDescription>Or the listing could not be found.</CardDescription>
                </Card>
            </div>
        );
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

        const { success, limitReached } = logDownload(user.email, listing);
        
        if (success) {
            const dataToExport = [{
                'Property ID': listing.id,
                'Size (Sq. Ft.)': listing.size,
                'Readiness': listing.readiness,
                'Building Type': listing.specifications.flooringType, // Simplified for CSV
                'Docks': listing.specifications.docks,
                'Ceiling Height (ft)': listing.specifications.ceilingHeight,
                'Flooring Type': listing.specifications.flooringType,
                'Rent (per Sq. Ft.)': 'Contact for details',
                'Security Deposit': 'Contact for details',
            }];

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Listing Details");

            XLSX.writeFile(workbook, `listing_${listing.id}.csv`, { bookType: "csv" });

            toast({
                title: "Download Started",
                description: `Details for ${listing.id} are being downloaded.`,
            });
        }

        if (limitReached) {
             toast({
                variant: 'destructive',
                title: "Download Limit Reached",
                description: `You have reached your daily limit of 3 downloads for the location "${listing.locationName}".`,
            });
        }
    };
    
    const mappedListing = mapWarehouseToListing(listing);
    const mainImage = listing.imageUrls?.[0] || 'https://placehold.co/1200x600.png';

    return (
        <>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header with Navigation */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <Badge variant="secondary">{listing.id}</Badge>
                            <h1 className="text-4xl font-bold font-headline tracking-tight mt-2">{listing.locationName}</h1>
                            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                                <MapPin className="h-5 w-5" /> {listing.locationName}
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image and High-level stats */}
                            <Card>
                                <CardContent className="p-4">
                                     <div className="aspect-video relative mb-6">
                                        <Image
                                            src={mainImage}
                                            alt={listing.locationName}
                                            fill
                                            className="rounded-lg object-cover"
                                            data-ai-hint="warehouse exterior"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <InfoPill icon={Scaling} label="Total Area" value={`${listing.size.toLocaleString()} sft`} />
                                        <InfoPill icon={Building2} label="Building Type" value={mappedListing.buildingSpecifications.buildingType} />
                                        <InfoPill icon={Calendar} label="Availability" value={listing.readiness} />
                                        <InfoPill icon={HardHat} label="Docks" value={listing.specifications.docks} />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Property Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{mappedListing.description}</p>
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
                                            <DetailRow label="Shop Floor Dimension" value={mappedListing.buildingSpecifications.shopFloorLevelDimension} />
                                            <DetailRow label="Roof Insulation" value={mappedListing.buildingSpecifications.roofInsulationStatus} />
                                            <DetailRow label="Natural Light/Ventilation" value={mappedListing.buildingSpecifications.naturalLightingAndVentilation} />
                                            {user && <DetailRow label="Internal Lighting" value={mappedListing.buildingSpecifications.internalLighting} />}
                                            {user && <DetailRow label="Mezzanine Details" value={mappedListing.buildingSpecifications.mezzanineFloorLevelHeightAndDimension} />}
                                        </div>
                                         <div>
                                            <h4 className="font-semibold mb-2">Site</h4>
                                            <Separator />
                                            <DetailRow label="Inside Flooring" value={mappedListing.siteSpecifications.typeOfFlooringInside} />
                                            <DetailRow label="Outside Flooring" value={mappedListing.siteSpecifications.typeOfFlooringOutside} />
                                            <DetailRow label="Access Road" value={mappedListing.siteSpecifications.typeOfRoad} />
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
                                    {listing.imageUrls && listing.imageUrls.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>File Name</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {listing.imageUrls.map((url, index) => {
                                                    const doc = { type: 'image', name: `Photo ${index + 1}`, url };
                                                    return <DocumentRow key={index} doc={doc} onDownload={handleDownloadRequest} />
                                                })}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No documents have been uploaded for this listing.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Sticky Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle>Commercials</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user ? (
                                        <div className="space-y-4">
                                            <div className="flex items-baseline justify-center text-center">
                                                <span className="text-4xl font-bold">₹{mappedListing.rentPerSqFt}</span>
                                                <span className="text-sm text-muted-foreground">/sq.ft./month</span>
                                            </div>
                                            <Separator/>
                                            <DetailRow label="Security Deposit" value={`${mappedListing.rentalSecurityDeposit} months`} />
                                            <DetailRow label="Construction Progress" value={mappedListing.constructionProgress} />
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
                                        <div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="space-y-1">
                                                            <DetailRow label="Park Approval" value={mappedListing.certificatesAndApprovals.parkApproval} isBlurred />
                                                            <DetailRow label="Building Approval" value={mappedListing.certificatesAndApprovals.buildingApproval} isBlurred />
                                                            <DetailRow label="Fire License" value={mappedListing.certificatesAndApprovals.fireLicense} isBlurred />
                                                            <DetailRow label="Fire NOC" value={mappedListing.certificatesAndApprovals.fireNOC} isBlurred />
                                                            <DetailRow label="Building Insurance" value={mappedListing.certificatesAndApprovals.buildingInsurance} isBlurred />
                                                            <DetailRow label="Property Tax Paid" value={mappedListing.certificatesAndApprovals.propertyTax} isBlurred />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="start">
                                                        <div className="flex items-center gap-2 max-w-xs">
                                                            <EyeOff className="h-4 w-4" />
                                                            <p className="text-xs">This data is sensitive. It is blurred for viewing purposes and cannot be downloaded.</p>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                     ) : (
                                         <p className="text-sm text-muted-foreground text-center p-4">
                                            Login to view compliance details.
                                         </p>
                                     )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <LoginDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} onLoginSuccess={() => setIsLoginDialogOpen(false)} />
        </>
    );
}
