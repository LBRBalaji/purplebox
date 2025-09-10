
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast";
import { createPropertySchema, type PropertySchema, type DemandSchema, type ListingSchema } from "@/lib/schema";
import { Building2, HandCoins, User, FileBadge, Plug, Flame, Truck, Images, Info, Copy, Check, Sparkles, Wand, ClipboardList, FileText, ListChecks, ChevronsUpDown, Building, Factory, Construction as CraneIcon, Car, HardHat, Droplets, Wind, CircuitBoard, Lightbulb, UserCog, Briefcase, PlusCircle, ShieldCheck, Scaling, Zap, AlertTriangle, CheckCircle, Pin, Library } from 'lucide-react';
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { getPropertyMatchScore } from "@/ai/flows/get-property-match-score";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";

const priorityLabels: { [key: string]: string } = {
  size: 'Size Range',
  location: 'Location',
  ceilingHeight: 'Ceiling Height',
  docks: 'Docks',
  readiness: 'Readiness',
  approvals: 'Approvals',
  fireNoc: 'Fire NOC',
  power: 'Power',
  fireSafety: 'Fire Safety',
  buildingType: 'Building Type',
  crane: 'Crane Details',
  operations: 'Operations Details'
};

function ListingSelector({ onSelect, onMultiSubmit }: { onSelect: (listing: ListingSchema) => void, onMultiSubmit: (listings: ListingSchema[]) => void }) {
    const { user } = useAuth();
    const { listings } = useData();
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedListings, setSelectedListings] = React.useState<ListingSchema[]>([]);

    const developerListings = React.useMemo(() => 
        listings.filter(l => l.developerId === user?.email),
        [listings, user]
    );

    const handleToggleSelection = (listing: ListingSchema) => {
        setSelectedListings(prev => 
            prev.find(l => l.listingId === listing.listingId)
                ? prev.filter(l => l.listingId !== listing.listingId)
                : [...prev, listing]
        );
    }
    
    const handleSubmit = () => {
        if (selectedListings.length > 0) {
            onMultiSubmit(selectedListings);
            setIsOpen(false);
            setSelectedListings([]);
        }
    }
    
    if (developerListings.length === 0) {
        return null;
    }

    return (
        <>
            <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
                <Library className="mr-2 h-4 w-4" />
                Select from Your Listings
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Select Existing Listings to Submit</DialogTitle>
                        <DialogDescription>
                            Select one or more of your existing properties to submit against this demand.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] -mx-6 px-2">
                        <ScrollArea className="h-full px-4">
                            <div className="space-y-4 py-4">
                                {developerListings.map(listing => {
                                    const isSelected = selectedListings.some(l => l.listingId === listing.listingId);
                                    return (
                                        <div
                                            key={listing.listingId}
                                            className="w-full text-left p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-4"
                                        >
                                            <Checkbox
                                                id={`listing-${listing.listingId}`}
                                                checked={isSelected}
                                                onCheckedChange={() => handleToggleSelection(listing)}
                                                aria-label={`Select listing ${listing.name}`}
                                            />
                                            <label htmlFor={`listing-${listing.listingId}`} className="flex-grow flex justify-between items-center cursor-pointer">
                                                <div>
                                                    <p className="font-semibold">{listing.name}</p>
                                                    <p className="text-sm text-muted-foreground">{listing.location} - {listing.sizeSqFt.toLocaleString()} sq.ft.</p>
                                                </div>
                                                <Badge variant={listing.status === 'approved' ? 'default' : 'secondary'}>
                                                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                                </Badge>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit} disabled={selectedListings.length === 0}>
                            Submit {selectedListings.length > 0 ? selectedListings.length : ''} Properties
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function DemandSummaryCard({ demand }: { demand: DemandSchema | undefined }) {

    if (!demand) {
        return (
            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800">Demand Not Found</CardTitle>
                </CardHeader>
            </Card>
        );
    }
    
    const basePriorities = [
        ...(demand.preferences?.nonCompromisable || []),
    ];
    // Use a Set to ensure keys are unique, preventing the React key error
    const priorityItems = Array.from(new Set(basePriorities));
    
    const getSection = (priority: string) => {
        if (['crane'].includes(priority) || demand.optionals?.hasOwnProperty(priority as any)) return 'Optionals';
        if (['operations'].includes(priority) || demand.operations?.hasOwnProperty(priority as any)) return 'Operations';
        return 'Essentials';
    }

    return (
        <Card className="bg-primary/5 mb-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Demand Summary: {demand.demandId}
                </CardTitle>
                 <CardDescription>
                    Fill out the form below. The customer's key priorities are listed here for your reference. 
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {demand.description && (
                    <div className="text-sm">
                        <p className="font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> Customer Demand Description</p>
                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-xs bg-background/50 p-2 rounded-md">{demand.description}</p>
                    </div>
                )}
                 <div className="text-sm pt-2">
                    <p className="font-semibold flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Customer Priorities</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {priorityItems.length > 0 ? priorityItems.map(p => (
                            <div key={p} className="p-2 rounded-md bg-secondary border text-xs">
                                <span className="font-semibold">{priorityLabels[p] || p}</span>
                            </div>
                        )) : (
                            <p className="text-xs text-muted-foreground">No specific high-priority items were marked by the customer.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const ComplianceToggle = ({ field, form }: { form: any, field: any }) => (
    <div className="grid grid-cols-3 gap-1 rounded-full p-1 bg-muted w-fit">
        <Button type="button" variant={field.value === 'Acceptable' ? 'default' : 'ghost'} size="sm" onClick={() => form.setValue(field.name, 'Acceptable')} className="rounded-full">Acceptable</Button>
        <Button type="button" variant={field.value === 'May Be' ? 'default' : 'ghost'} size="sm" onClick={() => form.setValue(field.name, 'May Be')} className="rounded-full">May Be</Button>
        <Button type="button" variant={field.value === 'No' ? 'default' : 'ghost'} size="sm" onClick={() => form.setValue(field.name, 'No')} className="rounded-full">No</Button>
    </div>
  );

function mapListingToProperty(listing: ListingSchema, demand: DemandSchema | undefined, user: any): PropertySchema {
    const readinessMap: { [key: string]: PropertySchema['readinessToOccupy'] } = {
        "Ready for Occupancy": "Immediate",
        "Available in 3 months": "Within 90 Days",
    };
    
    const mapped: PropertySchema = {
        propertyId: `PS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        isLocationConfirmed: false,
        size: listing.sizeSqFt,
        readinessToOccupy: readinessMap[listing.availabilityDate] || "BTS",
        buildingType: (listing.buildingSpecifications.buildingType as any[] | undefined)?.includes('PEB') ? 'PEB' : (listing.buildingSpecifications.buildingType as any[] | undefined)?.includes('RCC') ? 'RCC' : undefined,
        floor: "Ground",
        ceilingHeight: listing.buildingSpecifications.eveHeightMeters,
        ceilingHeightUnit: 'm',
        docks: listing.buildingSpecifications.numberOfDocksAndShutters,
        rentPerSft: listing.rentPerSqFt || 0,
        rentalSecurityDeposit: listing.rentalSecurityDeposit || 0,
        approvalStatus: listing.certificatesAndApprovals.buildingApproval ? 'Obtained' : 'To Apply',
        fireNoc: listing.certificatesAndApprovals.fireNOC ? 'Obtained' : 'To Apply',
        fireHydrant: listing.certificatesAndApprovals.fireLicense ? 'Installed' : 'Can be provided',
        
        userType: "Developer",
        userName: user?.userName || "",
        userCompanyName: user?.companyName || "",
        userPhoneNumber: user?.phone || "",
        userEmail: user?.email || "",

        o2oDealDemandId: demand?.demandId,
        serviceModel: listing.serviceModel || 'Standard',
        safety: "Fully Compounded",
        approvalAuthority: "DTCP",
        genSetBackup: "Available",
        canopy: "Installed",
        availablePower: undefined,
        additionalInformation: `Pre-filled from listing: ${listing.name} (${listing.listingId}). ${listing.description || ''}`,

        optionals: {},
        operations: {}
    };

    return mapped;
}


export function PropertyForm({ demandId }: { demandId: string | null }) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { demands, addSubmission } = useData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const [isEssentialsOpen, setIsEssentialsOpen] = React.useState(true);
  const [isOptionalsOpen, setIsOptionalsOpen] = React.useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = React.useState(false);
  const [isCommercialsOpen, setIsCommercialsOpen] = React.useState(true);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = React.useState(false);
  
  const demandToMatch = React.useMemo(() => 
    demands.find(d => d.demandId === demandId),
    [demands, demandId]
  );
  
  const propertySchema = React.useMemo(() => createPropertySchema(demandToMatch), [demandToMatch]);

  const form = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyId: "",
      isLocationConfirmed: false,
      size: undefined,
      floor: "Ground",
      readinessToOccupy: "Immediate",
      serviceModel: "Standard",
      buildingType: undefined,
      safety: "Fully Compounded",
      ceilingHeight: undefined,
      ceilingHeightUnit: 'ft',
      rentPerSft: undefined,
      rentalSecurityDeposit: undefined,
      userType: "Developer",
      userName: "",
      userCompanyName: "",
      o2oDealDemandId: "",
      userPhoneNumber: "",
      userEmail: "",
      approvalStatus: "Obtained",
      approvalAuthority: "DTCP",
      availablePower: undefined,
      genSetBackup: "Available",
      fireHydrant: "Installed",
      fireNoc: "Obtained",
      docks: undefined,
      canopy: "Installed",
      additionalInformation: "",
      optionals: {
        crane: { required: false }
      },
      operations: {}
    },
  });
  
  const handleSelectListing = (listing: ListingSchema) => {
    const mappedData = mapListingToProperty(listing, demandToMatch, user);
    form.reset({
        ...form.getValues(),
        ...mappedData
    });
    toast({
        title: "Form Pre-filled",
        description: `Data from listing "${listing.name}" has been loaded. Please review and complete the form.`,
    });
  };

  const handleMultiSubmit = (listings: ListingSchema[]) => {
      let submissionCount = 0;
      if (!demandToMatch || !user?.email) {
          toast({ variant: "destructive", title: "Submission Failed", description: "User or Demand information is missing." });
          return;
      }

      listings.forEach(listing => {
          const submission = {
              listingId: listing.listingId,
              providerEmail: user!.email!,
              demandId: demandToMatch!.demandId,
              demandUserEmail: demandToMatch?.userEmail,
          };
          addSubmission(submission, user?.email);
          submissionCount++;
      });
      toast({
          title: "Batch Submission Successful",
          description: `${submissionCount} properties have been submitted for demand ${demandToMatch?.demandId}.`,
      });
      router.push('/dashboard');
  }

  const optionalPrioritiesCount = React.useMemo(() => {
    if (!demandToMatch) return 0;
    const nonCompromisable = demandToMatch.preferences?.nonCompromisable || [];
    let count = 0;
    if (nonCompromisable.includes('crane')) count++;
    // Add other optional priorities here if they are added to the non-compromisable list
    return count;
  }, [demandToMatch]);

  const operationPrioritiesCount = React.useMemo(() => {
      if (!demandToMatch || demandToMatch.operationType !== 'Manufacturing') return 0;
      const nonCompromisable = demandToMatch.preferences?.nonCompromisable || [];
      let count = 0;
      if (nonCompromisable.includes('operations')) count++; 
      // A more granular check could be added here if specific operation fields are added to nonCompromisable
      else if (demandToMatch.operations?.mpcbEcCategory || demandToMatch.operations?.etpDetails || demandToMatch.operations?.effluentCharacteristics) {
          // If the section has any data, we can consider it a priority area for manufacturing
          count = 1; 
      }
      return count;
  }, [demandToMatch]);


  React.useEffect(() => {
    const newId = `PS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    form.setValue("propertyId", newId);

    if (user) {
        form.setValue("userName", user.userName);
        form.setValue("userCompanyName", user.companyName);
        form.setValue("userPhoneNumber", user.phone);
        form.setValue("userEmail", user.email);
    }
  }, [form, user]);

  React.useEffect(() => {
    if (demandId) {
      form.setValue('o2oDealDemandId', demandId, { shouldValidate: true });
    }
    if (demandToMatch) {
       form.setValue('ceilingHeightUnit', demandToMatch.ceilingHeightUnit || 'ft');
    }
  }, [searchParams, form, demandId, demandToMatch]);
  
  const onFinalSubmit = (data: PropertySchema) => {
      try {
        toast({
            variant: "destructive",
            title: "Action Not Supported",
            description: "Submitting a new, unlisted property directly is not supported. Please use 'Select from Your Listings' to submit a property you have already created.",
        });

    } catch (error) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  
  const onInvalidSubmit = (errors: FieldErrors<PropertySchema>) => {
    const errorFields = Object.keys(errors);
    
    // Auto-expand sections with errors
    if(errorFields.some(field => field.startsWith('optionals') || field === 'optionals')) {
        setIsOptionalsOpen(true);
    }
    if(errorFields.some(field => field.startsWith('operations') || field === 'operations')) {
        setIsOperationsOpen(true);
    }
    if(errorFields.some(field => ['rentPerSft', 'rentalSecurityDeposit'].includes(field))) {
        setIsCommercialsOpen(true);
    }

    const errorFieldNames = Object.keys(errors).join(', ');
    toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: `Please fill out: ${errorFieldNames}`
    });


    setTimeout(() => {
        const firstErrorField = errorFields[0];
        if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                try {
                (element as HTMLElement).focus({ preventScroll: true });
                } catch (e) {
                    // ignore errors on elements that can't be focused
                }
            }
        }
    }, 100); 
  }
  

  if (!demandId || !demandToMatch) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invalid Submission</CardTitle>
                <CardDescription>
                    To submit a property, please select a demand from the "Active Demands" list first.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinalSubmit, onInvalidSubmit)} className="space-y-6">
          <DemandSummaryCard demand={demandToMatch}/>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Submit Existing Listing</CardTitle>
                    <ListingSelector onSelect={handleSelectListing} onMultiSubmit={handleMultiSubmit} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the primary method for submitting a property against a demand. Click the button above to select one or more of your approved listings. The form below is for reference or for creating a one-off submission if absolutely necessary, but creating a listing first is the recommended workflow.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" /> Provider Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userCompanyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
      <Dialog open={isDialogOpen} onOpenChange={() => {
            if (isDialogOpen) {
                router.push('/dashboard');
            }
            setIsDialogOpen(!isDialogOpen);
      }}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Submission Success</DialogTitle>
              <DialogDescription>
                Your property match has been sent to the admin for review. You can track its status in the "My Submissions" tab.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    router.push('/dashboard');
                }}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
