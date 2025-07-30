
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast";
import { propertySchema, type PropertySchema, type DemandSchema } from "@/lib/schema";
import { getPropertyMatchScoreAction } from "@/lib/actions";
import { Building2, HandCoins, User, FileBadge, Plug, Flame, Truck, Images, Info, Copy, Check, Sparkles, Wand, Percent, ClipboardList, FileText, ListChecks, ChevronsUpDown, Building, Factory, Construction as CraneIcon, Car, HardHat, Droplets, Wind, CircuitBoard, Lightbulb, UserCog, Briefcase, PlusCircle, ShieldCheck, Scaling, Zap, AlertTriangle, CheckCircle, Pin } from 'lucide-react';
import { Skeleton } from "./ui/skeleton";
import type { GetPropertyMatchScoreOutput } from "@/ai/flows/get-property-match-score";
import { Progress } from "./ui/progress";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

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
};

const PreferenceBadge = ({ preference }: { preference: 'Must to have' | 'Good to have' | undefined }) => {
    if (!preference) return null;
    return (
        <Badge variant={preference === 'Must to have' ? "destructive" : "secondary"} className="text-xs">
            {preference}
        </Badge>
    );
};


function DemandSummaryCard({ demand, onScrollToSection }: { demand: DemandSchema | undefined, onScrollToSection: (sectionId: string) => void }) {

    if (!demand) {
        return (
            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800">Demand Not Found</CardTitle>
                </CardHeader>
            </Card>
        );
    }
    
    return (
        <Card className="bg-primary/5 mb-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Demand Summary: {demand.demandId}
                </CardTitle>
                 <CardDescription>You are submitting a property against this demand. Click on a key requirement below to navigate to its section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {demand.description && (
                    <div className="text-sm">
                        <p className="font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> Description</p>
                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-xs bg-background/50 p-2 rounded-md">{demand.description}</p>
                    </div>
                )}
                 
                <div className="space-y-2">
                    <p className="font-semibold flex items-center gap-1.5 text-sm"><Pin className="h-4 w-4" /> Key Requirements</p>
                    <div className="flex flex-wrap gap-2">
                        {demand.optionals?.crane?.required && (
                            <Button size="sm" variant="outline" className="bg-background" onClick={() => onScrollToSection('crane-details-section')}>
                                <CraneIcon className="mr-2 h-4 w-4" /> Crane Details
                            </Button>
                        )}
                        {demand.operations?.etpDetails && (
                             <Button size="sm" variant="outline" className="bg-background" onClick={() => onScrollToSection('operations-details-section')}>
                                <Factory className="mr-2 h-4 w-4" /> ETP / Operations
                            </Button>
                        )}
                         {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
                            demand.preferences.nonCompromisable.map(item => (
                                <Badge key={item} variant="secondary" className="font-medium bg-background border-primary/20 text-primary">
                                    {priorityLabels[item] || item} is a priority
                                </Badge>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function PropertyForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { demands, addSubmission } = useData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<{ matchResult: GetPropertyMatchScoreOutput } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [submissionData, setSubmissionData] = React.useState<PropertySchema | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);
  
  const [isOptionalsOpen, setIsOptionalsOpen] = React.useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = React.useState(false);

  const demandIdFromUrl = searchParams.get('demandId');
  const isMatchingMode = !!demandIdFromUrl;

  const form = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyId: "",
      isLocationConfirmed: false,
      size: undefined,
      floor: "Ground",
      readinessToOccupy: "Immediate",
      siteType: "Standalone",
      buildingType: 'PEB',
      safety: "",
      ceilingHeight: undefined,
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
      }
    },
  });

  const demandToMatch = React.useMemo(() => 
    demands.find(d => d.demandId === demandIdFromUrl),
    [demands, demandIdFromUrl]
  );
  
  const buildingType = form.watch('buildingType');


  React.useEffect(() => {
    const newId = `PS-${Date.now()}`;
    form.setValue("propertyId", newId);

    if (user) {
        form.setValue("userName", user.userName);
        form.setValue("userCompanyName", user.companyName);
        form.setValue("userPhoneNumber", user.phone);
        form.setValue("userEmail", user.email);
    }
  }, [form, user]);

  React.useEffect(() => {
    if (demandIdFromUrl) {
      form.setValue('o2oDealDemandId', demandIdFromUrl, { shouldValidate: true });
    }
  }, [searchParams, form, demandIdFromUrl, demandToMatch]);
  
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
        // Expand the relevant collapsible before scrolling
        if (sectionId.startsWith('crane') || sectionId.startsWith('optionals')) {
            setIsOptionalsOpen(true);
        }
        if (sectionId.startsWith('operations')) {
            setIsOperationsOpen(true);
        }
        
        // Allow time for the collapsible to open
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus({ preventScroll: true }); // Focus for accessibility
        }, 300);
    }
  };


  const handleCloseDialogAndRedirect = () => {
    setIsDialogOpen(false);
    if (isMatchingMode) {
      router.push('/dashboard');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!submissionData) return;
    setIsLoading(true);
    setAiResult(null);
    try {
        if (!isMatchingMode) {
            throw new Error("This form is for submitting matches only.");
        }
        
        const result = await getPropertyMatchScoreAction(submissionData, demands);
        if (result.error || !result.submission) {
            throw new Error(result.error || "Failed to get a valid response from the action.");
        }
        addSubmission(result.submission, user?.email);
        setAiResult({ matchResult: result.submission.matchResult });
        setIsDialogOpen(true);
        toast({
            title: "Success!",
            description: "Property match submitted for approval.",
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
      setIsConfirmOpen(false);
      setSubmissionData(null);
    }
  };

  async function onAttemptSubmit(data: PropertySchema) {
    setSubmissionData(data);
    setIsConfirmOpen(true);
  }

  const handleCopy = () => {
    if (aiResult?.matchResult.justification) {
      navigator.clipboard.writeText(aiResult.matchResult.justification);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isMatchingMode || !demandToMatch) {
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
        <form onSubmit={form.handleSubmit(onAttemptSubmit)} className="space-y-6">
          <DemandSummaryCard demand={demandToMatch} onScrollToSection={handleScrollToSection} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Essentials */}
              <Card>
                 <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Essentials & Preferences</CardTitle>
                  <CardDescription>Provide the core details of the property, answering the customer's primary requirements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="isLocationConfirmed" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5">
                          <div className="space-y-0.5">
                              <FormLabel className="text-base">Confirm Location Match</FormLabel>
                              <FormDescription>
                                  Confirm this property is within <b>{demandToMatch.radius}km</b> of <b>{demandToMatch.locationName || demandToMatch.location}</b>.
                              </FormDescription>
                          </div>
                          <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                      </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (Sq. Ft.)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={`Req: ${demandToMatch.sizeMin || demandToMatch.size} - ${demandToMatch.sizeMax || demandToMatch.size} sq.ft.`}
                                {...field} value={field.value ?? ''} 
                                className="placeholder:text-destructive/60"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="readinessToOccupy" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Readiness</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="placeholder:text-destructive/60"><SelectValue placeholder={`Req: ${demandToMatch.readiness}`} /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Immediate">Immediate</SelectItem>
                              <SelectItem value="Within 45 Days">Within 45 Days</SelectItem>
                              <SelectItem value="Within 90 Days">Within 90 Days</SelectItem>
                              <SelectItem value="More than 90 Days">More than 90 Days</SelectItem>
                              <SelectItem value="BTS">BTS (Build to Suit)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="buildingType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="placeholder:text-destructive/60"><SelectValue placeholder={`Req: ${demandToMatch.buildingType}`} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="PEB">PEB</SelectItem>
                            <SelectItem value="RCC">RCC</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {buildingType === 'RCC' && (
                        <FormField control={form.control} name="floor" render={({ field }) => (
                           <FormItem>
                            <FormLabel>Floor Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="placeholder:text-destructive/60"><SelectValue placeholder={`Req: ${demandToMatch.floorPreference}`} /></SelectTrigger></FormControl>
                                <SelectContent>
                                <SelectItem value="Ground">Ground</SelectItem>
                                <SelectItem value="Multi-Floor">Multi-Floor</SelectItem>
                                <SelectItem value="Any">Any</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                           </FormItem>
                         )}
                        />
                    )}
                     <FormField control={form.control} name="ceilingHeight" render={({ field }) => (
                      <FormItem>
                         <FormLabel>Ceiling Height ({demandToMatch.ceilingHeightUnit || 'ft'})</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch.ceilingHeight ? `Req: ${demandToMatch.ceilingHeight} ${demandToMatch.ceilingHeightUnit || 'ft'}` : "e.g. 30"} 
                                {...field} value={field.value ?? ''}
                                className="placeholder:text-destructive/60"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField control={form.control} name="docks" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Number of Docks</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch.docks !== undefined ? `Req: ${demandToMatch.docks}` : "e.g. 8"} 
                                {...field} value={field.value ?? ''}
                                className="placeholder:text-destructive/60"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="availablePower" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Power (kVA)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={
                                (demandToMatch.powerMin !== undefined && demandToMatch.powerMax !== undefined)
                                  ? `Required: ${demandToMatch.powerMin} - ${demandToMatch.powerMax} kVA`
                                  : 'e.g. 500'
                              }
                              {...field}
                              value={field.value ?? ''}
                              className="placeholder:text-destructive/60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="approvalStatus" render={({ field }) => (<FormItem>
                       <div className="flex items-center justify-between">
                         <FormLabel>Approval Status</FormLabel>
                         <PreferenceBadge preference={demandToMatch.preferences.approvals} />
                       </div>
                       <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem><SelectItem value="Un-Approved">Un-Approved</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="fireNoc" render={({ field }) => (<FormItem>
                       <div className="flex items-center justify-between">
                          <FormLabel>Fire NOC</FormLabel>
                          <PreferenceBadge preference={demandToMatch.preferences.fireNoc} />
                       </div>
                       <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="fireHydrant" render={({ field }) => (<FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Fire Safety Infrastructure</FormLabel>
                          <PreferenceBadge preference={demandToMatch.preferences.fireSafety} />
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>

              {/* Optionals */}
               <Collapsible open={isOptionalsOpen} onOpenChange={setIsOptionalsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Optionals & Preferences
                        </div>
                        <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <Card>
                            <CardContent className="pt-6 space-y-8">
                                
                                {/* Office & Amenities */}
                                <div className="space-y-4">
                                    <FormLabel className="flex items-center gap-2 text-base"><Building className="w-4 h-4"/> Office & Amenities</FormLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6">
                                        <div className="space-y-2">
                                            <FormLabel className="text-sm">Office Space</FormLabel>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="optionals.officeSpaceMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.officeSpaceMin ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.officeSpaceMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.officeSpaceMax ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 items-end">
                                            <FormField control={form.control} name="optionals.cafeteriaOrCanteen" render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm">Cafeteria/Canteen</FormLabel>
                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="placeholder:text-destructive/60"><SelectValue placeholder={`Req: ${demandToMatch.optionals?.cafeteriaOrCanteen}`}/></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Cafeteria">Cafeteria</SelectItem><SelectItem value="Canteen">Canteen</SelectItem></SelectContent>
                                                  </Select>
                                                </FormItem>
                                            )}/>
                                            <FormField control={form.control} name="optionals.seatingCapacity" render={({ field }) => (<FormItem className="space-y-2"><FormLabel className="text-sm">Seating Capacity</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.seatingCapacity ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                        <div className="space-y-2">
                                            <FormLabel className="text-sm">Additional Toilets</FormLabel>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="optionals.additionalToiletsMen" render={({ field }) => (<FormItem><FormLabel className="text-xs">For Men (count)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.additionalToiletsMen ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.additionalToiletsWomen" render={({ field }) => (<FormItem><FormLabel className="text-xs">For Women (count)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.additionalToiletsWomen ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Parking & Storage */}
                                <div className="space-y-4">
                                    <FormLabel className="flex items-center gap-2 text-base"><Car className="w-4 h-4"/> Parking & Storage</FormLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6">
                                        <div className="space-y-2">
                                            <FormLabel className="text-sm">Truck Parking Yard</FormLabel>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="optionals.truckParkingYardMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.truckParkingYardMin ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.truckParkingYardMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.truckParkingYardMax ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <FormLabel className="text-sm">Open Storage Yard</FormLabel>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="optionals.openStorageYardMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.openStorageYardMin ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.openStorageYardMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.openStorageYardMax ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Utilities & Infrastructure */}
                                <div className="space-y-4">
                                    <FormLabel className="flex items-center gap-2 text-base"><Lightbulb className="w-4 h-4"/> Utilities & Infrastructure</FormLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6">
                                        <FormField control={form.control} name="optionals.processWaterRequirement" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><Droplets className="w-4 h-4"/> Process Water Requirement (KL/Day)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.processWaterRequirement ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="optionals.hvacArea" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><Wind className="w-4 h-4"/> HVAC Area Planned (Sq. Ft.)</FormLabel><FormControl><Input placeholder={`Req: ${demandToMatch.optionals?.hvacArea ?? 'N/A'}`} {...field} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="optionals.sprinklerRequirement" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><CircuitBoard className="w-4 h-4"/> Sprinklers</FormLabel><FormControl><Input placeholder={`Req: ${demandToMatch.optionals?.sprinklerRequirement ?? 'N/A'}`} {...field} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="optionals.lightingRequirement" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Lighting Requirement</FormLabel><FormControl><Input placeholder={`Req: ${demandToMatch.optionals?.lightingRequirement ?? 'N/A'}`} {...field} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                </div>

                                 {/* Tenant Improvements */}
                                <div className="space-y-2">
                                    <FormLabel className="flex items-center gap-2 text-base"><HardHat className="w-4 h-4"/> Tenant Specific Improvements</FormLabel>
                                    <div className="pl-6">
                                        <FormField control={form.control} name="optionals.tenantSpecificImprovements" render={({ field }) => (
                                        <FormItem>
                                            {demandToMatch.optionals?.tenantSpecificImprovements && (
                                                <FormDescription>Customer Requirement: {demandToMatch.optionals.tenantSpecificImprovements}</FormDescription>
                                            )}
                                            <FormControl>
                                                <Textarea placeholder="Describe any specific modifications or improvements required..." className="min-h-[100px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    </div>
                                </div>
                                
                                {/* Crane */}
                                <div className="space-y-2" id="crane-details-section">
                                    <FormField
                                        control={form.control}
                                        name="optionals.crane.required"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center gap-2">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    id="crane-required"
                                                />
                                            </FormControl>
                                            <FormLabel htmlFor="crane-required" className="flex items-center gap-2 text-base !m-0"><CraneIcon className="w-4 h-4"/> Crane Provided?</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <Collapsible open={form.watch('optionals.crane.required')}>
                                        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up pl-6 pt-4">
                                            {demandToMatch.optionals?.crane?.required && (
                                                 <div className="mb-4">
                                                    <FormLabel className="text-sm">Customer Requirement</FormLabel>
                                                    <FormDescription>
                                                        A {demandToMatch.optionals.crane.capacity} Ton {demandToMatch.optionals.crane.type} crane is required.
                                                    </FormDescription>
                                                 </div>
                                            )}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                                <FormField control={form.control} name="optionals.crane.type" render={({ field }) => (
                                                    <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={`Req: ${demandToMatch.optionals?.crane?.type ?? 'N/A'}`} /></SelectTrigger></FormControl><SelectContent><SelectItem value="EOT">EOT</SelectItem><SelectItem value="Gantry">Gantry</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={form.control} name="optionals.crane.count" render={({ field }) => (<FormItem><FormLabel>No. of Cranes</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.crane?.count ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.transverseLength" render={({ field }) => (<FormItem><FormLabel>Transverse (m)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.crane?.transverseLength ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.span" render={({ field }) => (<FormItem><FormLabel>Span (m)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.crane?.span ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.underhookHeight" render={({ field }) => (<FormItem><FormLabel>Underhook (m)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.crane?.underhookHeight ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.capacity" render={({ field }) => (<FormItem><FormLabel>Capacity (Tons)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.crane?.capacity ?? 'N/A'}`} {...field} value={field.value ?? ''} className="placeholder:text-destructive/60"/></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            </CardContent>
                        </Card>
                    </CollapsibleContent>
                </Collapsible>
              
              {/* Operations */}
              {demandToMatch.operationType === 'Manufacturing' && (
                <Collapsible open={isOperationsOpen} onOpenChange={setIsOperationsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4" />
                            Operational Details
                        </div>
                        <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" id="operations-details-section">
                        <Card>
                          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                <FormField control={form.control} name="operations.mpcbEcCategory" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit Categorization (MPCB/EC)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder={`Req: ${demandToMatch.operations?.mpcbEcCategory ?? 'N/A'}`} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Green">Green</SelectItem>
                                        <SelectItem value="Orange">Orange</SelectItem>
                                        <SelectItem value="Red">Red</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}/>
                                <div></div>
                                <FormField control={form.control} name="operations.etpDetails" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Effluent Treatment Plant Details</FormLabel>
                                    {demandToMatch.operations?.etpDetails && (
                                        <FormDescription>Customer Requirement: {demandToMatch.operations.etpDetails}</FormDescription>
                                    )}
                                    <FormControl>
                                    <Textarea placeholder="Capacity, technology, etc." {...field} className="placeholder:text-destructive/60"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}/>
                                <FormField control={form.control} name="operations.effluentCharacteristics" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Effluent Characteristics</FormLabel>
                                    {demandToMatch.operations?.effluentCharacteristics && (
                                        <FormDescription>Customer Requirement: {demandToMatch.operations.effluentCharacteristics}</FormDescription>
                                    )}
                                    <FormControl>
                                    <Textarea placeholder="pH, temperature, chemical composition, etc." {...field} className="placeholder:text-destructive/60"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" /> Provider Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userCompanyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><HandCoins className="w-5 h-5 text-primary" /> Commercials</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent per Sq.Ft.</FormLabel><FormControl><Input type="number" placeholder="e.g. 25" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (<FormItem><FormLabel>Rental Security Deposit (Months)</FormLabel><FormControl><Input type="number" placeholder="e.g. 6" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              <Card>
                 <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> Additional Information</CardTitle></CardHeader>
                 <CardContent>
                    <FormField control={form.control} name="additionalInformation" render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder="Provide any other relevant details..." className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand className="mr-2 h-4 w-4" />
                  Submit Match
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Review Your Submission</AlertDialogTitle>
                <AlertDialogDescription>
                    Please confirm your submission. The AI will calculate a match score and the details will be sent for approval.
                </AlertDialogDescription>
            </AlertDialogHeader>
             <div className="text-sm max-h-60 overflow-y-auto pr-4 -mr-4">
                <h4 className="font-semibold mb-2">Checklist of Customer Requirements:</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                    {Object.entries(demandToMatch.preferences).map(([key, value]) => {
                         if (value === 'Must to have' || demandToMatch.preferences.nonCompromisable?.includes(key)) {
                             const isMissing = !submissionData?.[key as keyof PropertySchema]
                             return (
                                <li key={key} className={cn("flex items-center", isMissing && "text-destructive")}>
                                     {isMissing ? <AlertTriangle className="h-4 w-4 mr-2"/> : <CheckCircle className="h-4 w-4 mr-2 text-green-600"/>}
                                    You have {isMissing ? 'not provided a value for' : 'provided a value for'} <span className="font-semibold mx-1">{priorityLabels[key] || key}</span>, which is a <span className="font-semibold mx-1">Must to have</span> item.
                                </li>
                             )
                         }
                         return null
                    })}
                    {demandToMatch.optionals?.crane?.required && (
                        <li className={cn("flex items-center", !submissionData?.optionals?.crane?.required && "text-destructive")}>
                            {!submissionData?.optionals?.crane?.required ? <AlertTriangle className="h-4 w-4 mr-2"/> : <CheckCircle className="h-4 w-4 mr-2 text-green-600"/>}
                            You have {!submissionData?.optionals?.crane?.required ? 'not specified' : 'specified'} a crane, which the customer requires.
                        </li>
                    )}
                </ul>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSubmissionData(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSubmit}>
                    Confirm & Submit
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialogAndRedirect}>
        <DialogContent className="sm:max-w-2xl">
           {isMatchingMode ? (
              <>
                <DialogHeader>
                  <DialogTitle>AI Match Score Calculated & Submitted!</DialogTitle>
                  <DialogDescription>
                    The AI has analyzed this property against the demand. Your submission is now pending approval from an admin.
                  </DialogDescription>
                </DialogHeader>
                {isLoading || !aiResult?.matchResult ? (
                  <div className="space-y-4 mt-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Overall Match Score</p>
                      <p className="text-6xl font-bold text-primary">{(aiResult.matchResult.overallScore * 100).toFixed(0)}%</p>
                      <Progress value={aiResult.matchResult.overallScore * 100} className="h-2 mt-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="font-semibold">Location</p>
                            <p className="text-muted-foreground text-lg">{(aiResult.matchResult.scoreBreakdown.location * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                            <p className="font-semibold">Size</p>
                            <p className="text-muted-foreground text-lg">{(aiResult.matchResult.scoreBreakdown.size * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                            <p className="font-semibold">Amenities</p>
                            <p className="text-muted-foreground text-lg">{(aiResult.matchResult.scoreBreakdown.amenities * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                           <Button variant="link" className="text-sm p-0 h-auto">
                             Show Justification
                             <ChevronsUpDown className="h-4 w-4 ml-1" />
                           </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-2">
                              {aiResult.matchResult.justification}
                            </p>
                        </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </>
            ) : null }
            <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialogAndRedirect}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
