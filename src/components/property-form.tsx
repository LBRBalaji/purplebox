
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as React from "react";
import { useSearchParams } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { propertySchema, type PropertySchema, type DemandSchema } from "@/lib/schema";
import { generateDescriptionAction, getPropertyMatchScoreAction } from "@/lib/actions";
import { Building2, HandCoins, User, FileBadge, Plug, Flame, Truck, Images, Info, MapPin, Copy, Check, Sparkles, Wand, Percent, ClipboardList, FileText, ListChecks } from 'lucide-react';
import { Skeleton } from "./ui/skeleton";
import type { GetPropertyMatchScoreOutput } from "@/ai/flows/get-property-match-score";
import { Progress } from "./ui/progress";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

const priorityLabels: { [key: string]: string } = {
  size: 'Size',
  location: 'Location',
  ceilingHeight: 'Ceiling Height',
  docks: 'Docks',
  readiness: 'Readiness',
  approvals: 'Approvals',
  fireNoc: 'Fire NOC',
  power: 'Power',
  fireSafety: 'Fire Safety',
};


type AiResult = {
  description?: string;
  matchResult?: GetPropertyMatchScoreOutput;
}

const useMatchScorer = (demand: DemandSchema | undefined, watchedValues: Partial<PropertySchema>) => {
    const calculateScore = React.useCallback((field: 'size' | 'ceilingHeight' | 'docks') => {
        if (!demand) return null;

        const isNonCompromisable = demand.preferences?.nonCompromisable?.includes(field) ?? false;

        if (field === 'size') {
            const demandSize = demand.size;
            const propertySize = watchedValues.size;
            if (!propertySize) return null;
            
            const diff = Math.abs(demandSize - propertySize);
            const pctDiff = diff / demandSize;

            if (isNonCompromisable && pctDiff > 0.15) return 0.1; // Harsh penalty
            if (pctDiff <= 0.15) return 0.95;
            if (pctDiff <= 0.25) return 0.7;
            return 0.4;
        }

        if (field === 'ceilingHeight') {
            const demandHeight = demand.ceilingHeight;
            const propertyHeight = watchedValues.ceilingHeight;
            if (!demandHeight || !propertyHeight) return null;

            if (propertyHeight >= demandHeight) return 1.0;
            const pctDiff = (demandHeight - propertyHeight) / demandHeight;
            
            if (isNonCompromisable && propertyHeight < demandHeight) return 0.1;
            if (pctDiff < 0.1) return 0.8; // 10% less
            return 0.3;
        }
        
        if (field === 'docks') {
            const demandDocks = demand.docks;
            const propertyDocks = watchedValues.docks;
            if (demandDocks === undefined || propertyDocks === undefined) return null;

            if (propertyDocks >= demandDocks) return 1.0;
            if (isNonCompromisable) return 0.1;
            if (propertyDocks >= demandDocks - 2) return 0.75; // within 2 docks
            return 0.3;
        }

        return null;
    }, [demand, watchedValues]);

    const sizeScore = calculateScore('size');
    const ceilingHeightScore = calculateScore('ceilingHeight');
    const docksScore = calculateScore('docks');

    return { sizeScore, ceilingHeightScore, docksScore };
};

const FieldMatchIndicator = ({ score }: { score: number | null }) => {
    if (score === null) return null;

    const displayScore = Math.round(score * 100);
    const colorClasses = 
        displayScore >= 90 ? "bg-green-100 text-green-800 border-green-300" :
        displayScore >= 70 ? "bg-amber-100 text-amber-800 border-amber-300" :
        "bg-red-100 text-red-800 border-red-300";

    return (
        <Badge variant="outline" className={cn("text-xs font-bold", colorClasses)}>
            {displayScore}% Match
        </Badge>
    )
}

function DemandSummaryCard({ demandId }: { demandId: string }) {
    const { demands } = useData();
    const demand = demands.find(d => d.demandId === demandId);

    if (!demand) {
        return (
            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800">Demand Not Found</CardTitle>
                    <CardDescription className="text-amber-700">Could not find details for Demand ID: {demandId}</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    return (
        <Card className="bg-primary/5 mb-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Demand Summary
                </CardTitle>
                 <CardDescription>You are submitting a property against this demand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">Property Type</p>
                        <p className="text-muted-foreground">{demand.propertyType}</p>
                    </div>
                     <div>
                        <p className="font-semibold">Size (Sq. Ft.)</p>
                        <p className="text-muted-foreground">{demand.size.toLocaleString()}</p>
                    </div>
                     <div>
                        <p className="font-semibold">Location</p>
                        <p className="text-muted-foreground truncate" title={demand.locationName || demand.location}>{demand.locationName || demand.location}</p>
                    </div>
                     <div>
                        <p className="font-semibold">Radius</p>
                        <p className="text-muted-foreground">{demand.radius} km</p>
                    </div>
                </div>
                 {demand.description && (
                    <div className="text-sm">
                        <p className="font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> Description</p>
                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-xs bg-background/50 p-2 rounded-md">{demand.description}</p>
                    </div>
                )}
                 {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
                    <div className="text-sm">
                        <p className="font-semibold flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Priorities</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {demand.preferences.nonCompromisable.map(item => (
                                <Badge key={item} variant="outline" className="font-medium bg-background">
                                    {priorityLabels[item] || item}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function PropertyForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { demands, addSubmission } = useData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<AiResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const demandIdFromUrl = searchParams.get('demandId');
  const isMatchingMode = !!demandIdFromUrl;

  const form = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyId: "",
      propertyGeoLocation: "",
      isLocationConfirmed: false,
      size: undefined,
      floor: "Ground",
      readinessToOccupy: "Immediate",
      siteType: "Standalone",
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
      installedCapacity: "",
      availablePower: "",
      genSetBackup: "Available",
      fireHydrant: "Installed",
      fireNoc: "Obtained",
      docks: undefined,
      canopy: "Installed",
      additionalInformation: "",
    },
  });

  const demandToMatch = React.useMemo(() => 
    demands.find(d => d.demandId === demandIdFromUrl),
    [demands, demandIdFromUrl]
  );
  
  const watchedFields = form.watch();
  const { sizeScore, ceilingHeightScore, docksScore } = useMatchScorer(demandToMatch, watchedFields);


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
      if (demandToMatch) {
        // Pre-fill location for AI context
        form.setValue('propertyGeoLocation', demandToMatch.locationName || demandToMatch.location);
      }
    }
  }, [searchParams, form, demandIdFromUrl, demandToMatch]);


  async function onSubmit(data: PropertySchema) {
    setIsLoading(true);
    setAiResult(null);
    try {
      if (isMatchingMode) {
        // Matching flow
        const result = await getPropertyMatchScoreAction(data, demands);
        if (result.error || !result.submission) {
            throw new Error(result.error || "Failed to get a valid response from the action.");
        }
        addSubmission(result.submission, user?.email);
        setAiResult({ matchResult: result.submission.matchResult });
      } else {
        // Description generation flow
        const result = await generateDescriptionAction(data);
        if (result.error) throw new Error(result.error);
        setAiResult({ description: result.description });
      }
      setIsDialogOpen(true);
      toast({
        title: "Success!",
        description: isMatchingMode ? "Property match submitted." : "AI description generated.",
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

  const handleCopy = () => {
    if (aiResult?.description) {
      navigator.clipboard.writeText(aiResult.description);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {isMatchingMode && demandIdFromUrl && <DemandSummaryCard demandId={demandIdFromUrl} />}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Site Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Site Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="propertyId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property ID</FormLabel>
                        <FormControl><Input {...field} disabled /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Size (Sq. Ft.)</FormLabel>
                           <FieldMatchIndicator score={sizeScore} />
                        </div>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch?.size ? String(demandToMatch.size) : "e.g. 50000"} 
                                {...field} value={field.value ?? ''} 
                                className="placeholder:text-muted-foreground/60"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="isLocationConfirmed" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Confirm Location Match</FormLabel>
                                <FormDescription>
                                    By enabling this, you confirm your property is within the customer's desired location area.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="floor" render={({ field }) => (
                      <FormItem><FormLabel>Floor</FormLabel><FormControl><Input placeholder="e.g. Ground Floor" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField control={form.control} name="readinessToOccupy" render={({ field }) => (
                      <FormItem>
                      <FormLabel>Readiness to Occupy</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="placeholder:text-muted-foreground/60"><SelectValue placeholder={demandToMatch?.readiness || "Select readiness"} /></SelectTrigger></FormControl>
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
                    )}
                  />
                  <FormField control={form.control} name="siteType" render={({ field }) => (
                      <FormItem><FormLabel>Site Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Standalone">Standalone</SelectItem><SelectItem value="Part of Industrial Park">Part of Industrial Park</SelectItem><SelectItem value="Part of Commercial Project">Part of Commercial Project</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )}
                  />
                  <FormField control={form.control} name="safety" render={({ field }) => (
                      <FormItem><FormLabel>Safety</FormLabel><FormControl><Input placeholder="e.g. Fully compounded" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField control={form.control} name="ceilingHeight" render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Ceiling Height (ft)</FormLabel>
                           <FieldMatchIndicator score={ceilingHeightScore} />
                        </div>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch?.ceilingHeight ? String(demandToMatch.ceilingHeight) : "e.g. 30"} 
                                {...field} value={field.value ?? ''}
                                className="placeholder:text-muted-foreground/60"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Commercials Section */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><HandCoins className="w-5 h-5 text-primary" /> Commercials</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent per Sq. Ft.</FormLabel><FormControl><Input type="number" placeholder="e.g. 25" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (<FormItem><FormLabel>Security Deposit (months)</FormLabel><FormControl><Input type="number" placeholder="e.g. 6" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              {/* Combined Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Plug className="w-5 h-5 text-primary" /> Electricity</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="installedCapacity" render={({ field }) => (<FormItem><FormLabel>Installed Capacity (kva/mva)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="availablePower" render={({ field }) => (<FormItem><FormLabel>Available Power</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="genSetBackup" render={({ field }) => (<FormItem><FormLabel>Gen-set Backup</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Available">Available</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="w-5 h-5 text-primary" /> Fire Safety</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="fireHydrant" render={({ field }) => (<FormItem><FormLabel>Fire Hydrant</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="fireNoc" render={({ field }) => (<FormItem><FormLabel>Fire NOC</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
              </div>

               {/* Docks & Images */}
               <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Docks & More</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="docks" render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Number of Docks</FormLabel>
                          <FieldMatchIndicator score={docksScore} />
                        </div>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch?.docks !== undefined ? String(demandToMatch.docks) : "e.g. 8"} 
                                {...field} value={field.value ?? ''}
                                className="placeholder:text-muted-foreground/60"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="canopy" render={({ field }) => (<FormItem><FormLabel>Canopy</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormItem>
                        <FormLabel>Upload Images</FormLabel>
                        <FormControl><Input type="file" multiple /></FormControl>
                        <FormDescription>Select multiple property images.</FormDescription>
                    </FormItem>
                </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* User Section */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> User Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="userType" render={({ field }) => (<FormItem><FormLabel>User Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Developer">Developer</SelectItem><SelectItem value="Owner">Owner</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userCompanyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userPhoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField
                    control={form.control}
                    name="o2oDealDemandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>O2O Deal Demand ID</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormDescription>
                          This is pre-filled when you submit a match.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Statutory Approvals Section */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileBadge className="w-5 h-5 text-primary" /> Statutory Approvals</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="approvalStatus" render={({ field }) => (<FormItem><FormLabel>Approval Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem><SelectItem value="Un-Approved">Un-Approved</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="approvalAuthority" render={({ field }) => (<FormItem><FormLabel>Approval Authority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="DTCP">DTCP</SelectItem><SelectItem value="CMDA">CMDA</SelectItem><SelectItem value="BDA">BDA</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> Additional Information</CardTitle></CardHeader>
                <CardContent>
                    <FormField control={form.control} name="additionalInformation" render={({ field }) => (<FormItem><FormControl><Textarea placeholder="Provide any other relevant details..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  {isMatchingMode ? 'Analyzing...' : 'Generating...'}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
           {isMatchingMode ? (
              <>
                <DialogHeader>
                  <DialogTitle>AI Match Score Calculated & Submitted!</DialogTitle>
                  <DialogDescription>
                    The AI has analyzed this property against the demand. The submission is now pending admin approval.
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
                            <p className="font-semibold">Features</p>
                            <p className="text-muted-foreground text-lg">{(aiResult.matchResult.scoreBreakdown.features * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Justification</p>
                        <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-1">
                          {aiResult.matchResult.justification}
                        </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <DialogHeader>
                    <DialogTitle>AI-Generated Property Description</DialogTitle>
                    <DialogDescription>
                        Here is the description generated by AI. You can copy it for your listings.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative mt-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-md whitespace-pre-wrap min-h-[150px]">
                          {aiResult?.description}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
