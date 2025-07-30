
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

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
        ...(demand.preferences.nonCompromisable || []),
        ...(demand.optionals?.crane?.required ? ['crane'] : []),
        ...(demand.operationType === 'Manufacturing' ? ['operations'] : []),
    ];
    const priorityItems = Array.from(new Set(basePriorities));
    
    const getSection = (priority: string) => {
        if (['crane'].includes(priority)) return 'Optionals';
        if (['operations'].includes(priority)) return 'Operations';
        return 'Essentials';
    }

    const priorityCounts = priorityItems.reduce((acc, item) => {
        const section = getSection(item);
        if (section === 'Optionals') acc.optionals++;
        if (section === 'Operations') acc.operations++;
        return acc;
    }, { optionals: 0, operations: 0 });

    return (
        <Card className="bg-primary/5 mb-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Demand Summary: {demand.demandId}
                </CardTitle>
                 <CardDescription>
                    Fill out the form below. The customer's key priorities are listed here for your reference. 
                    Badges with counts on the section headers indicate where priority items can be found.
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
                                <span className="text-muted-foreground"> (in {getSection(p)} section)</span>
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

const ScoreBadge = ({ score }: { score: number | null }) => {
    if (score === null || score === undefined) return null;

    const displayScore = Math.round(score * 100);
    const colorClass = displayScore >= 85 ? 'bg-green-100 text-green-800 border-green-300' 
        : displayScore >= 60 ? 'bg-amber-100 text-amber-800 border-amber-300' 
        : 'bg-destructive/20 text-destructive-foreground border-destructive/30';

    return (
        <Badge variant="outline" className={cn("absolute -top-2 -right-2", colorClass)}>
            <Percent className="h-3 w-3 mr-1" /> {displayScore}
        </Badge>
    );
};

export function PropertyForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { demands, addSubmission } = useData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [submissionData, setSubmissionData] = React.useState<PropertySchema | null>(null);
  const [matchResult, setMatchResult] = React.useState<GetPropertyMatchScoreOutput | null>(null);
  
  const [isEssentialsOpen, setIsEssentialsOpen] = React.useState(true);
  const [isOptionalsOpen, setIsOptionalsOpen] = React.useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = React.useState(false);
  const [isCommercialsOpen, setIsCommercialsOpen] = React.useState(true);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = React.useState(false);
  
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
      },
      operations: {}
    },
  });

  const demandToMatch = React.useMemo(() => 
    demands.find(d => d.demandId === demandIdFromUrl),
    [demands, demandIdFromUrl]
  );
  
  const priorityCounts = React.useMemo(() => {
    if (!demandToMatch) return { optionals: 0, operations: 0 };
    
    const basePriorities = [
        ...(demandToMatch.preferences.nonCompromisable || []),
        ...(demandToMatch.optionals?.crane?.required ? ['crane'] : []),
        ...(demandToMatch.operationType === 'Manufacturing' ? ['operations'] : []),
    ];
    const uniquePriorities = Array.from(new Set(basePriorities));

    return uniquePriorities.reduce((acc, item) => {
        if (['crane'].includes(item) || demandToMatch.optionals?.hasOwnProperty(item as any)) {
            acc.optionals++;
        } else if (['operations'].includes(item) || demandToMatch.operations?.hasOwnProperty(item as any)) {
            acc.operations++;
        }
        return acc;
    }, { optionals: 0, operations: 0 });
  }, [demandToMatch]);
  
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
  
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    if (!submissionData || !matchResult) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Missing submission data or match score.",
        });
        setIsLoading(false);
        return;
    }
    
    try {
        const submission = {
          property: submissionData,
          matchResult: matchResult,
          demandId: submissionData.o2oDealDemandId!,
          demandUserEmail: demandToMatch?.userEmail,
        };

        addSubmission(submission, user?.email);
        setIsConfirmOpen(false);
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
      setSubmissionData(null);
    }
  };

  const onAttemptSubmit = async (data: PropertySchema) => {
    setIsLoading(true);
    setMatchResult(null); // Clear previous results
    setSubmissionData(data); // Store current data

    try {
        if(!demandToMatch) throw new Error("Demand to match not found");

        const result = await getPropertyMatchScoreAction({ property: data, demand: demandToMatch });
        if (result.error || !result.submission) {
            throw new Error(result.error || "Failed to get a valid response from the action.");
        }
        setMatchResult(result.submission.matchResult);
        setIsConfirmOpen(true);
    } catch (error) {
       const e = error as Error;
       toast({
        variant: "destructive",
        title: "AI Score Calculation Failed",
        description: e.message,
      });
    } finally {
        setIsLoading(false);
    }
  }

  const onInvalidSubmit = (errors: any) => {
    const errorFields = Object.keys(errors);
    if(errorFields.some(field => field.startsWith('optionals'))) {
        setIsOptionalsOpen(true);
    }
    if(errorFields.some(field => field.startsWith('operations'))) {
        setIsOperationsOpen(true);
    }
    if(errorFields.some(field => ['rentPerSft', 'rentalSecurityDeposit'].includes(field))) {
        setIsCommercialsOpen(true);
    }
    toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: 'Please fill out all required fields before submitting. Sections with errors have been expanded.'
    })
  }
  
  const ComplianceToggle = ({ field, form }: { form: any, field: any }) => (
    <div className="grid grid-cols-3 gap-1 rounded-full p-1 bg-muted w-fit">
        <Button type="button" variant={field.value === 'Acceptable' ? 'default' : 'ghost'} size="sm" onClick={() => form.setValue(field.name, 'Acceptable')} className="rounded-full">Acceptable</Button>
        <Button type="button" variant={field.value === 'May Be' ? 'default' : 'ghost'} size="sm" onClick={() => form.setValue(field.name, 'May Be')} className="rounded-full">May Be</Button>
        <Button type="button" variant={field.value === 'No' ? 'default' : 'ghost'} size="sm" onClick={() => form.setValue(field.name, 'No')} className="rounded-full">No</Button>
    </div>
  );

  const watchedValues = form.watch();

  const calculateScore = (field: string, value: any) => {
    if (!demandToMatch || value === undefined || value === null || value === '') return null;
  
    let score = 0;
    switch (field) {
        case 'size': {
            const propertySize = Number(value);
            const demandSize = demandToMatch.size;
            if (!propertySize || !demandSize) return null;
            score = Math.min(propertySize, demandSize) / Math.max(propertySize, demandSize);
            break;
        }
        case 'ceilingHeight': {
            const propertyHeight = Number(value);
            const demandHeight = demandToMatch.ceilingHeight;
            if (!propertyHeight || !demandHeight) return null;
            score = Math.min(propertyHeight, demandHeight) / Math.max(propertyHeight, demandHeight);
            break;
        }
        case 'docks': {
            const propertyDocks = Number(value);
            const demandDocks = demandToMatch.docks;
            if (propertyDocks === undefined || propertyDocks === null || !demandDocks) return null;
            score = Math.min(propertyDocks, demandDocks) / Math.max(propertyDocks, demandDocks);
            break;
        }
        case 'fireNoc': {
            if (value === 'Obtained') score = 1.0;
            else if (value === 'Applied For') score = 0.6;
            else if (value === 'To Apply') score = 0.3;
            break;
        }
        case 'approvalStatus': {
             if (value === 'Obtained') score = 1.0;
            else if (value === 'Applied For') score = 0.6;
            else if (value === 'To Apply') score = 0.3;
            else score = 0.1;
            break;
        }
        case 'operations.mpcbEcCategory':
        case 'operations.etpDetails':
        case 'operations.effluentCharacteristics':
            if (value === 'Acceptable') score = 1.0;
            else if (value === 'May Be') score = 0.5;
            else score = 0.1;
            break;
        case 'optionals.crane.required':
            const craneDemand = demandToMatch.optionals?.crane?.required;
            if(craneDemand) score = value ? 1.0 : 0.0;
            else score = 0.9;
            break;
        default:
            return null;
    }
    return score;
  };
  
  const scores: Record<string, number | null> = {};
  if (demandToMatch) {
    Object.keys(watchedValues).forEach(key => {
        const value = watchedValues[key as keyof typeof watchedValues];
        if (typeof value === 'object' && value !== null) {
            Object.keys(value).forEach(subKey => {
                const subValue = value[subKey as keyof typeof value];
                if (typeof subValue === 'object' && subValue !== null) {
                    Object.keys(subValue).forEach(deepKey => {
                        const deepValue = subValue[deepKey as keyof typeof subValue];
                        scores[`${key}.${subKey}.${deepKey}`] = calculateScore(`${key}.${subKey}.${deepKey}`, deepValue);
                    });
                } else {
                    scores[`${key}.${subKey}`] = calculateScore(`${key}.${subKey}`, subValue);
                }
            });
        } else {
            scores[key] = calculateScore(key, value);
        }
    });
  }


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

  const scoreItems = matchResult ? [
      { criterion: "Location", demand: `${demandToMatch.locationName} (within ${demandToMatch.radius}km)`, property: submissionData?.isLocationConfirmed ? "Confirmed by Provider" : "Not Confirmed", score: matchResult.scoreBreakdown.location },
      { criterion: "Size (Sq. Ft.)", demand: `${demandToMatch.size.toLocaleString()}`, property: `${submissionData?.size?.toLocaleString()}`, score: matchResult.scoreBreakdown.size },
      { criterion: "Building Type", demand: `${demandToMatch.buildingType}${demandToMatch.floorPreference ? ` (${demandToMatch.floorPreference})` : ''}`, property: `${submissionData?.buildingType} (${submissionData?.floor})`, score: (matchResult.scoreBreakdown.amenities) },
      { criterion: "Ceiling Height", demand: `${demandToMatch.ceilingHeight || 'N/A'} ${demandToMatch.ceilingHeightUnit || 'ft'}`, property: `${submissionData?.ceilingHeight} ft`, score: matchResult.scoreBreakdown.amenities },
      { criterion: "Docks", demand: `${demandToMatch.docks || 'N/A'}`, property: `${submissionData?.docks}`, score: matchResult.scoreBreakdown.amenities },
      { criterion: "Power (kVA)", demand: `${demandToMatch.powerMin || '...'} - ${demandToMatch.powerMax || '...'}`, property: `${submissionData?.availablePower}`, score: matchResult.scoreBreakdown.power },
      { criterion: "Approvals", demand: demandToMatch.preferences.approvals || 'Good to have', property: submissionData?.approvalStatus, score: matchResult.scoreBreakdown.approvals },
      { criterion: "Fire Safety (NOC)", demand: demandToMatch.preferences.fireNoc || 'Good to have', property: submissionData?.fireNoc, score: matchResult.scoreBreakdown.fireSafety },
  ] : [];


  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onAttemptSubmit, onInvalidSubmit)} className="space-y-6">
          <DemandSummaryCard demand={demandToMatch}/>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Essentials</CardTitle>
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
                        <FormItem className="relative">
                        <FormLabel>Size (Sq. Ft.)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={`Req: ${demandToMatch.sizeMin || demandToMatch.size} - ${demandToMatch.sizeMax || demandToMatch.size} sq.ft.`}
                                {...field} value={field.value ?? ''} 
                            />
                        </FormControl>
                        <ScoreBadge score={scores.size ?? null} />
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="readinessToOccupy" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Readiness</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={`Req: ${demandToMatch.readiness}`} /></SelectTrigger></FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={!demandToMatch.buildingType}>
                            <FormControl><SelectTrigger><SelectValue placeholder={`Req: ${demandToMatch.buildingType}`} /></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value="PEB">PEB</SelectItem>
                            <SelectItem value="RCC">RCC</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                    {form.getValues('buildingType') === 'RCC' && (
                        <FormField control={form.control} name="floor" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Floor Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!demandToMatch.floorPreference}>
                                <FormControl><SelectTrigger><SelectValue placeholder={`Req: ${demandToMatch.floorPreference ?? 'N/A'}`} /></SelectTrigger></FormControl>
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
                        <FormItem className="relative">
                        <FormLabel>Ceiling Height ({demandToMatch.ceilingHeightUnit || 'ft'})</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch.ceilingHeight ? `Req: ${demandToMatch.ceilingHeight} ${demandToMatch.ceilingHeightUnit || 'ft'}` : "Req: N/A"} 
                                {...field} value={field.value ?? ''}
                                disabled={!demandToMatch.ceilingHeight}
                            />
                        </FormControl>
                        <ScoreBadge score={scores.ceilingHeight ?? null} />
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField control={form.control} name="docks" render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel>Number of Docks</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={demandToMatch.docks !== undefined ? `Req: ${demandToMatch.docks}` : "Req: N/A"} 
                                {...field} value={field.value ?? ''}
                                disabled={demandToMatch.docks === undefined}
                            />
                        </FormControl>
                        <ScoreBadge score={scores.docks ?? null} />
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
                                (demandToMatch.powerMin !== undefined || demandToMatch.powerMax !== undefined)
                                    ? `Req: ${demandToMatch.powerMin ?? '...'} - ${demandToMatch.powerMax ?? '...'} kVA`
                                    : 'Req: N/A'
                                }
                                {...field}
                                value={field.value ?? ''}
                                disabled={demandToMatch.powerMin === undefined && demandToMatch.powerMax === undefined}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="approvalStatus" render={({ field }) => (<FormItem className="relative">
                        <div className="flex items-center justify-between">
                        <FormLabel>Approval Status</FormLabel>
                        <Badge variant={demandToMatch.preferences.approvals === "Must to have" ? "destructive" : "secondary"} className="text-xs">{demandToMatch.preferences.approvals}</Badge>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem><SelectItem value="Un-Approved">Un-Approved</SelectItem></SelectContent></Select>
                        <ScoreBadge score={scores.approvalStatus ?? null} />
                        <FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fireNoc" render={({ field }) => (<FormItem className="relative">
                        <div className="flex items-center justify-between">
                            <FormLabel>Fire NOC</FormLabel>
                            <Badge variant={demandToMatch.preferences.fireNoc === "Must to have" ? "destructive" : "secondary"} className="text-xs">{demandToMatch.preferences.fireNoc}</Badge>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obtained">Obtained</SelectItem><SelectItem value="Applied For">Applied For</SelectItem><SelectItem value="To Apply">To Apply</SelectItem></SelectContent></Select>
                        <ScoreBadge score={scores.fireNoc ?? null} />
                        <FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="fireHydrant" render={({ field }) => (<FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>Fire Safety Infrastructure</FormLabel>
                            <Badge variant={demandToMatch.preferences.fireSafety === "Must to have" ? "destructive" : "secondary"} className="text-xs">{demandToMatch.preferences.fireSafety}</Badge>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Can be provided">Can be provided</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                </CardContent>
              </Card>
              
              <Collapsible open={isOptionalsOpen} onOpenChange={setIsOptionalsOpen}>
                  <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Optionals &amp; Preferences
                           {priorityCounts.optionals > 0 && <Badge>{priorityCounts.optionals} priorities</Badge>}
                      </div>
                      <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <Card>
                          <CardContent className="pt-6 space-y-8">
                              <div id="crane-details-section" className="relative">
                                <CardTitle className="flex items-center gap-2 pt-4 border-t"><CraneIcon className="w-5 h-5 text-primary" /> Crane Details</CardTitle>
                                {demandToMatch?.optionals?.crane?.required && <CardDescription>This is a critical requirement for the customer.</CardDescription>}
                                <div className="pl-6 pt-4">
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
                                            <FormLabel htmlFor="crane-required" className="text-base !m-0">Crane Provided?</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <Collapsible open={form.watch('optionals.crane.required')}>
                                        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up pt-4">
                                            {demandToMatch?.optionals?.crane?.required && (
                                                <div className="mb-4 p-3 rounded-md bg-secondary text-secondary-foreground/90">
                                                    <FormLabel className="text-sm font-semibold">Customer Requirement</FormLabel>
                                                    <FormDescription>
                                                        A {demandToMatch.optionals.crane.capacity} Ton {demandToMatch.optionals.crane.type} crane is required.
                                                    </FormDescription>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                                <FormField control={form.control} name="optionals.crane.type" render={({ field }) => (
                                                    <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={`Req: ${demandToMatch?.optionals?.crane?.type ?? 'N/A'}`} /></SelectTrigger></FormControl><SelectContent><SelectItem value="EOT">EOT</SelectItem><SelectItem value="Gantry">Gantry</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={form.control} name="optionals.crane.count" render={({ field }) => (<FormItem><FormLabel>No. of Cranes</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch?.optionals?.crane?.count ?? 'N/A'}`} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.transverseLength" render={({ field }) => (<FormItem><FormLabel>Transverse (m)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch?.optionals?.crane?.transverseLength ?? 'N/A'}`} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.span" render={({ field }) => (<FormItem><FormLabel>Span (m)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch?.optionals?.crane?.span ?? 'N/A'}`} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.underhookHeight" render={({ field }) => (<FormItem><FormLabel>Underhook (m)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch?.optionals?.crane?.underhookHeight ?? 'N/A'}`} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name="optionals.crane.capacity" render={({ field }) => (<FormItem><FormLabel>Capacity (Tons)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch?.optionals?.crane?.capacity ?? 'N/A'}`} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                                <ScoreBadge score={scores['optionals.crane.required'] ?? null} />
                              </div>
                              {/* Office & Amenities */}
                              <div className="space-y-4">
                                  <FormLabel className="flex items-center gap-2 text-base"><Building className="w-4 h-4"/> Office &amp; Amenities</FormLabel>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6">
                                      <div className="space-y-2">
                                          <FormLabel className="text-sm">Office Space</FormLabel>
                                          <div className="grid grid-cols-2 gap-4">
                                              <FormField control={form.control} name="optionals.officeSpaceMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.officeSpaceMin ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.officeSpaceMin} /></FormControl><FormMessage /></FormItem>)} />
                                              <FormField control={form.control} name="optionals.officeSpaceMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.officeSpaceMax ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.officeSpaceMax} /></FormControl><FormMessage /></FormItem>)} />
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-4 items-end">
                                          <FormField control={form.control} name="optionals.cafeteriaOrCanteen" render={({ field }) => (
                                              <FormItem className="space-y-2">
                                                  <FormLabel className="text-sm">Cafeteria/Canteen</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!demandToMatch.optionals?.cafeteriaOrCanteen}>
                                                  <FormControl><SelectTrigger><SelectValue placeholder={`Req: ${demandToMatch.optionals?.cafeteriaOrCanteen ?? 'N/A'}`}/></SelectTrigger></FormControl>
                                                  <SelectContent><SelectItem value="Cafeteria">Cafeteria</SelectItem><SelectItem value="Canteen">Canteen</SelectItem></SelectContent>
                                                </Select>
                                              </FormItem>
                                          )}/>
                                          <FormField control={form.control} name="optionals.seatingCapacity" render={({ field }) => (<FormItem className="space-y-2"><FormLabel className="text-sm">Seating Capacity</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.seatingCapacity ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.seatingCapacity} /></FormControl><FormMessage /></FormItem>)} />
                                      </div>
                                      <div className="space-y-2">
                                          <FormLabel className="text-sm">Additional Toilets</FormLabel>
                                          <div className="grid grid-cols-2 gap-4">
                                              <FormField control={form.control} name="optionals.additionalToiletsMen" render={({ field }) => (<FormItem><FormLabel className="text-xs">For Men (count)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.additionalToiletsMen ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.additionalToiletsMen} /></FormControl><FormMessage /></FormItem>)} />
                                              <FormField control={form.control} name="optionals.additionalToiletsWomen" render={({ field }) => (<FormItem><FormLabel className="text-xs">For Women (count)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.additionalToiletsWomen ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.additionalToiletsWomen} /></FormControl><FormMessage /></FormItem>)} />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Parking & Storage */}
                              <div className="space-y-4">
                                  <FormLabel className="flex items-center gap-2 text-base"><Car className="w-4 h-4"/> Parking &amp; Storage</FormLabel>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6">
                                      <div className="space-y-2">
                                          <FormLabel className="text-sm">Truck Parking Yard</FormLabel>
                                          <div className="grid grid-cols-2 gap-4">
                                              <FormField control={form.control} name="optionals.truckParkingYardMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.truckParkingYardMin ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.truckParkingYardMin} /></FormControl><FormMessage /></FormItem>)} />
                                              <FormField control={form.control} name="optionals.truckParkingYardMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.truckParkingYardMax ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.truckParkingYardMax} /></FormControl><FormMessage /></FormItem>)} />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <FormLabel className="text-sm">Open Storage Yard</FormLabel>
                                          <div className="grid grid-cols-2 gap-4">
                                              <FormField control={form.control} name="optionals.openStorageYardMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.openStorageYardMin ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.openStorageYardMin} /></FormControl><FormMessage /></FormItem>)} />
                                              <FormField control={form.control} name="optionals.openStorageYardMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.openStorageYardMax ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.openStorageYardMax} /></FormControl><FormMessage /></FormItem>)} />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Utilities & Infrastructure */}
                              <div className="space-y-4">
                                  <FormLabel className="flex items-center gap-2 text-base"><Lightbulb className="w-4 h-4"/> Utilities &amp; Infrastructure</FormLabel>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6">
                                      <FormField control={form.control} name="optionals.processWaterRequirement" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><Droplets className="w-4 h-4"/> Process Water Requirement (KL/Day)</FormLabel><FormControl><Input type="number" placeholder={`Req: ${demandToMatch.optionals?.processWaterRequirement ?? 'N/A'}`} {...field} value={field.value ?? ''} disabled={!demandToMatch.optionals?.processWaterRequirement} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={form.control} name="optionals.hvacArea" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><Wind className="w-4 h-4"/> HVAC Area Planned (Sq. Ft.)</FormLabel><FormControl><Input placeholder={`Req: ${demandToMatch.optionals?.hvacArea ?? 'N/A'}`} {...field} disabled={!demandToMatch.optionals?.hvacArea} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={form.control} name="optionals.sprinklerRequirement" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><CircuitBoard className="w-4 h-4"/> Sprinklers</FormLabel><FormControl><Input placeholder={`Req: ${demandToMatch.optionals?.sprinklerRequirement ?? 'N/A'}`} {...field} disabled={!demandToMatch.optionals?.sprinklerRequirement} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={form.control} name="optionals.lightingRequirement" render={({ field }) => (<FormItem><FormLabel className="text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Lighting Requirement</FormLabel><FormControl><Input placeholder={`Req: ${demandToMatch.optionals?.lightingRequirement ?? 'N/A'}`} {...field} disabled={!demandToMatch.optionals?.lightingRequirement} /></FormControl><FormMessage /></FormItem>)} />
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
                                              <Textarea placeholder="Describe any specific modifications or improvements required..." className="min-h-[100px]" {...field} disabled={!demandToMatch.optionals?.tenantSpecificImprovements} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )} />
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  </CollapsibleContent>
              </Collapsible>
              
              {demandToMatch.operationType === 'Manufacturing' && (
                <Collapsible open={isOperationsOpen} onOpenChange={setIsOperationsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4" />
                            Operational Details
                             {priorityCounts.operations > 0 && <Badge>{priorityCounts.operations} priorities</Badge>}
                        </div>
                        <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <Card>
                            <CardHeader>
                                <CardTitle>Operational Details</CardTitle>
                                <CardDescription>Confirm if your property can meet these manufacturing-specific requirements.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <FormField control={form.control} name="operations.mpcbEcCategory" render={({ field }) => (
                                  <FormItem className="relative">
                                      <FormLabel>Unit Categorization (MPCB/EC)</FormLabel>
                                      <FormDescription>Requirement: <span className="font-semibold">{demandToMatch.operations?.mpcbEcCategory ?? 'N/A'}</span></FormDescription>
                                      <FormControl><ComplianceToggle field={field} form={form} /></FormControl>
                                      <FormMessage />
                                      <ScoreBadge score={scores['operations.mpcbEcCategory'] ?? null} />
                                  </FormItem>
                                  )}/>
                                 <FormField control={form.control} name="operations.etpDetails" render={({ field }) => (
                                  <FormItem className="relative">
                                      <FormLabel>Effluent Treatment Plant (ETP)</FormLabel>
                                      <FormDescription>Requirement: <span className="font-semibold">{demandToMatch.operations?.etpDetails ?? 'N/A'}</span></FormDescription>
                                      <FormControl><ComplianceToggle field={field} form={form} /></FormControl>
                                      <FormMessage />
                                      <ScoreBadge score={scores['operations.etpDetails'] ?? null} />
                                  </FormItem>
                                  )}/>
                                 <FormField control={form.control} name="operations.effluentCharacteristics" render={({ field }) => (
                                  <FormItem className="relative">
                                      <FormLabel>Effluent Characteristics</FormLabel>
                                       <FormDescription>Requirement: <span className="font-semibold">{demandToMatch.operations?.effluentCharacteristics ?? 'N/A'}</span></FormDescription>
                                      <FormControl><ComplianceToggle field={field} form={form} /></FormControl>
                                      <FormMessage />
                                      <ScoreBadge score={scores['operations.effluentCharacteristics'] ?? null} />
                                  </FormItem>
                                  )}/>
                            </CardContent>
                        </Card>
                    </CollapsibleContent>
                </Collapsible>
              )}
              
              <Collapsible open={isAdditionalInfoOpen} onOpenChange={setIsAdditionalInfoOpen}>
                  <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                           Additional Information
                      </div>
                      <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
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
                  </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" /> Provider Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userCompanyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} disabled/></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              <Collapsible open={isCommercialsOpen} onOpenChange={setIsCommercialsOpen}>
                <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <HandCoins className="w-4 h-4" />
                        Commercials
                    </div>
                    <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent per Sq.Ft.</FormLabel><FormControl><Input type="number" placeholder="e.g. 25" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (<FormItem><FormLabel>Rental Security Deposit (Months)</FormLabel><FormControl><Input type="number" placeholder="e.g. 6" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
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
                  Review &amp; Submit Match
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI-Powered Submission Review</AlertDialogTitle>
                <AlertDialogDescription>
                    The AI has analyzed your submission. Review the match scores below and confirm to send it for approval.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {matchResult ? (
                <div className="space-y-6">
                    <div className="text-center p-4 border rounded-md bg-primary/5">
                      <p className="text-sm text-muted-foreground">Overall Match Score</p>
                      <p className="text-6xl font-bold text-primary">{(matchResult.overallScore * 100).toFixed(0)}%</p>
                      <Progress value={matchResult.overallScore * 100} className="h-2 mt-2" />
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold">Scorecard</h4>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">Criterion</TableHead>
                                    <TableHead>Customer Requirement</TableHead>
                                    <TableHead>Property Specification</TableHead>
                                    <TableHead className="text-right w-[100px]">Match</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scoreItems.map(item => {
                                    const score = Math.round(item.score * 100);
                                    const scoreColor = score > 85 ? 'bg-green-500' : score > 60 ? 'bg-amber-500' : 'bg-muted';
                                    
                                    return (
                                        <TableRow key={item.criterion}>
                                            <TableCell className="font-semibold">{item.criterion}</TableCell>
                                            <TableCell>{item.demand}</TableCell>
                                            <TableCell>{item.property}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className="font-bold text-sm">{score}%</span>
                                                    <Progress value={score} className={cn("h-2 w-12", scoreColor)} indicatorClassName={scoreColor} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                         </Table>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold">AI Justification</h4>
                         <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-2">
                            {matchResult.justification}
                        </p>
                    </div>
                </div>
            ) : (
                 <div className="space-y-4 mt-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setMatchResult(null)}>Go Back &amp; Edit</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinalSubmit} disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Confirm &amp; Submit"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isDialogOpen} onOpenChange={() => {
            if (isDialogOpen) { // only trigger on close
                router.push('/dashboard');
            }
            setIsDialogOpen(!isDialogOpen);
      }}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Submission Sent for Approval!</DialogTitle>
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
