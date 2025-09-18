
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

import { useToast } from "@/hooks/use-toast";
import { createPropertySchema, type PropertySchema, type DemandSchema, type ListingSchema } from "@/lib/schema";
import { ClipboardList, FileText, ListChecks, CheckCircle, PinIcon, Library, Building, HandCoins, HardHat, FileBadge, Flame, Plug, Truck } from 'lucide-react';
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "./ui/badge";
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

export function PropertyForm({ demandId }: { demandId: string | null }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { demands, addSubmission } = useData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
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
      docks: undefined,
      rentPerSft: undefined,
      rentalSecurityDeposit: undefined,
      userType: "Developer",
      userName: "",
      userCompanyName: "",
      o2oDealDemandId: "",
      userPhoneNumber: "",
      userEmail: "",
      approvalStatus: "Obtained",
      fireNoc: "Obtained",
    },
  });

  const handleSelectListing = (listing: ListingSchema) => {
    // This function is for a different component now.
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

  React.useEffect(() => {
    if (!form.getValues('propertyId')) {
      const newId = `PS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      form.setValue("propertyId", newId);
    }
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
  }, [form, demandId, demandToMatch]);
  
  const onFinalSubmit = (data: PropertySchema) => {
      toast({
          variant: "destructive",
          title: "Action Not Supported",
          description: "Submitting a new, unlisted property is not supported. Please use 'Select from Your Listings' to submit a property you have already created.",
      });
  }

  const onInvalidSubmit = (errors: FieldErrors<PropertySchema>) => {
    const errorMessages = Object.values(errors).map(e => e.message).filter(Boolean);
    toast({
        variant: 'destructive',
        title: 'Please fix the errors',
        description: errorMessages.join('\n') || 'Some required fields are missing or invalid.',
    });
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Your Submission</CardTitle>
                <ListingSelector onSelect={handleSelectListing} onMultiSubmit={handleMultiSubmit} />
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              
              <FormField control={form.control} name="isLocationConfirmed" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm bg-background">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2"><PinIcon className="h-4 w-4" /> I confirm the location of my property matches this demand.</FormLabel>
                    <FormDescription>Your property must be within the customer's specified radius of {demandToMatch?.radius}km from {demandToMatch?.locationName}.</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )} />
              
              <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building className="h-5 w-5"/>General Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField control={form.control} name="size" render={({ field }) => (<FormItem><FormLabel>Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 50000" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="floor" render={({ field }) => (<FormItem><FormLabel>Floor</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Ground">Ground</SelectItem><SelectItem value="First Floor">First Floor</SelectItem><SelectItem value="Multi-Floor">Multi-Floor</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="readinessToOccupy" render={({ field }) => (<FormItem><FormLabel>Readiness to Occupy</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Immediate">Immediate</SelectItem><SelectItem value="Within 45 Days">Within 45 Days</SelectItem><SelectItem value="Within 90 Days">Within 90 Days</SelectItem><SelectItem value="More than 90 Days">More than 90 Days</SelectItem><SelectItem value="BTS">BTS</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="serviceModel" render={({ field }) => (<FormItem><FormLabel>Service Model</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="3PL Operated Warehouse">3PL Operated Warehouse</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><HardHat className="h-5 w-5"/>Specifications</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField control={form.control} name="buildingType" render={({ field }) => (<FormItem><FormLabel>Building Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger></FormControl><SelectContent><SelectItem value="PEB">PEB</SelectItem><SelectItem value="RCC">RCC</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="safety" render={({ field }) => (<FormItem><FormLabel>Safety/Compound</FormLabel><FormControl><Input {...field} placeholder="e.g. Fully Compounded" /></FormControl><FormMessage /></FormItem>)} />
                      <div className="flex gap-2">
                        <FormField control={form.control} name="ceilingHeight" render={({ field: heightField }) => (<FormItem className="flex-grow"><FormLabel>Ceiling Height</FormLabel><FormControl><Input type="number" placeholder="Enter height" {...heightField} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="ceilingHeightUnit" render={({ field: unitField }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={unitField.onChange} value={unitField.value}><FormControl><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ft">ft</SelectItem><SelectItem value="m">m</SelectItem></SelectContent></Select></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="docks" render={({ field }) => (<FormItem><FormLabel>Docks</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 10" /></FormControl><FormMessage /></FormItem>)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><HandCoins className="h-5 w-5"/>Commercials</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent per Sq. Ft.</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 25" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (<FormItem><FormLabel>Security Deposit (months)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 6" /></FormControl><FormMessage /></FormItem>)} />
                  </CardContent>
              </Card>
              
              <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileBadge className="h-5 w-5"/>Compliance & Utilities</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={form.control} name="approvalStatus" render={({ field }) => (<FormItem><FormLabel>Approval Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem><SelectItem value="Un-Approved">Un-Approved</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fireNoc" render={({ field }) => (<FormItem><FormLabel>Fire NOC</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fireHydrant" render={({ field }) => (<FormItem><FormLabel>Fire Hydrant</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="availablePower" render={({ field }) => (<FormItem><FormLabel>Available Power (kVA)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 150" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="genSetBackup" render={({ field }) => (<FormItem><FormLabel>Genset Backup</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Available">Available</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="canopy" render={({ field }) => (<FormItem><FormLabel>Canopy</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  </CardContent>
              </Card>

            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-8">
            <Button type="submit" size="lg" disabled={true} aria-disabled="true" title="Please use 'Select from Your Listings' to submit.">
              Submit New Property
            </Button>
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
