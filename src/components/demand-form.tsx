
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath, type UseFormReturn } from "react-hook-form";
import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { demandSchema, type DemandSchema } from "@/lib/schema";
import { getImprovedDemandDescriptionAction, logDemandAction } from "@/lib/actions";
import { User, Sparkles, List, ChevronsUpDown, PlusCircle, ClipboardPlus, ArrowRight, Check, Scaling, Flame, ShieldCheck, Zap, Warehouse, Building, SlidersHorizontal, Percent, Briefcase, Utensils, Users, Car, HardHat, Droplets, Wind, CircuitBoard, Lightbulb, Factory, Construction as CraneIcon } from 'lucide-react';
import DemandMapWrapper from "./demand-map";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { type ImprovePropertyDemandDescriptionInput } from "@/ai/flows/improve-property-demand";
import { cn } from "@/lib/utils";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";

const priorityItems = [
    { id: 'location', label: 'Location & Radius' },
    { id: 'readiness', label: 'Readiness' },
];

type PriorityCardProps = {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    form: UseFormReturn<DemandSchema>;
    field: FieldPath<DemandSchema['preferences']['nonCompromisable']>;
    fieldName: string;
};

const PriorityCard = ({ title, icon: Icon, children, form, field, fieldName }: PriorityCardProps) => {
    const isChecked = form.watch(field)?.includes(fieldName) ?? false;
    
    const handleCheckedChange = (checked: boolean) => {
        const currentValues = form.getValues(field) || [];
        const newValues = checked
            ? [...currentValues, fieldName]
            : currentValues.filter((value) => value !== fieldName);
        form.setValue(field, newValues, { shouldValidate: true });
    };

    return (
        <div className={cn("p-4 border rounded-lg transition-colors", isChecked ? 'bg-primary/5 border-primary/50' : 'bg-secondary/30')}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <FormLabel className="font-semibold text-base">{title}</FormLabel>
                </div>
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={handleCheckedChange}
                />
            </div>
            <Collapsible open={isChecked} className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <CollapsibleContent>
                <div className="mt-4 pl-8 space-y-4 pt-4 border-t border-primary/20">
                    {children}
                </div>
              </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

const PriorityToggle = ({ form, field }: { form: UseFormReturn<DemandSchema>, field: FieldPath<DemandSchema['preferences']> }) => {
    const value = form.watch(field) as 'Must to have' | 'Good to have';
    return (
        <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1 rounded-full p-1 bg-muted w-fit">
                 <Button
                    type="button"
                    variant={value === 'Must to have' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => form.setValue(field, 'Must to have')}
                    className="rounded-full"
                >
                    Must to have
                </Button>
                <Button
                    type="button"
                    variant={value === 'Good to have' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => form.setValue(field, 'Good to have')}
                     className="rounded-full"
                >
                    Good to have
                </Button>
            </div>
        </div>
    );
}

export function DemandForm({ onDemandLogged }: { onDemandLogged: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { demands, addDemand, updateDemand } = useData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [demandId, setDemandId] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const editDemandId = searchParams.get('editDemandId');
  const isEditMode = !!editDemandId;

  const [isEssentialsOpen, setIsEssentialsOpen] = React.useState(isEditMode);
  const [isOptionalsOpen, setIsOptionalsOpen] = React.useState(isEditMode);
  const [isOperationsOpen, setIsOperationsOpen] = React.useState(isEditMode);

  const form = useForm<DemandSchema>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      demandId: "",
      companyName: "",
      userName: "",
      userEmail: "",
      userPhone: "",
      propertyType: undefined,
      location: "",
      locationName: "",
      radius: undefined,
      size: undefined,
      sizeMin: undefined,
      sizeMax: undefined,
      sizeVariationPercentage: 10,
      ceilingHeight: undefined,
      ceilingHeightUnit: 'ft',
      docks: undefined,
      powerMin: undefined,
      powerMax: undefined,
      readiness: "Immediate",
      description: "",
      buildingType: "PEB",
      floorPreference: undefined,
      preferences: {
        nonCompromisable: [],
        approvals: 'Must to have',
        fireNoc: 'Must to have',
        fireSafety: 'Must to have',
      },
      optionals: {
        officeSpaceMin: undefined,
        officeSpaceMax: undefined,
        cafeteriaOrCanteen: 'Cafeteria',
        seatingCapacity: undefined,
        additionalToiletsMen: undefined,
        additionalToiletsWomen: undefined,
        truckParkingYardMin: undefined,
        truckParkingYardMax: undefined,
        openStorageYardMin: undefined,
        openStorageYardMax: undefined,
        tenantSpecificImprovements: "",
        processWaterRequirement: undefined,
        hvacArea: "",
        sprinklerRequirement: "",
        crane: { required: false },
        lightingRequirement: "",
      },
      operations: {
        mpcbEcCategory: undefined,
        etpDetails: "",
        effluentCharacteristics: "",
      },
    },
  });

  const watchedDemandId = form.watch("demandId");
  const sizeMax = form.watch('sizeMax');
  const buildingType = form.watch('buildingType');
  const craneRequired = form.watch('optionals.crane.required');

  const effectiveUsableArea = React.useMemo(() => {
    return sizeMax ? Math.round(sizeMax * 0.9) : 0;
  }, [sizeMax]);


  React.useEffect(() => {
    if (user && !isEditMode) {
      form.reset({
        ...form.getValues(),
        companyName: user.companyName,
        userName: user.userName,
        userEmail: user.email,
        userPhone: user.phone,
      });
    }
  }, [user, form, isEditMode]);

  React.useEffect(() => {
    // Check for pre-fill data from map search
    const locationFromMap = searchParams.get('location');
    const radiusFromMap = searchParams.get('radius');
    const locationNameFromMap = searchParams.get('locationName');

    if (locationFromMap) {
      form.setValue('location', locationFromMap, { shouldValidate: true });
    }
    if (locationNameFromMap) {
      form.setValue('locationName', locationNameFromMap, { shouldValidate: true });
    }
    if (radiusFromMap) {
      form.setValue('radius', Number(radiusFromMap), { shouldValidate: true });
    }
    
    // Generate an ID for a new demand if one doesn't exist
    if (!isEditMode && !watchedDemandId) {
        const newId = `DMD-${Date.now()}`;
        setDemandId(newId);
        form.setValue("demandId", newId);
    }
  }, [isEditMode, watchedDemandId, form, searchParams]);

  React.useEffect(() => {
    if (isEditMode) {
      const demandToEdit = demands.find(d => d.demandId === editDemandId);
      if (demandToEdit) {
        form.reset({
            ...form.formState.defaultValues,
            ...demandToEdit,
            ceilingHeightUnit: demandToEdit.ceilingHeightUnit || 'ft',
            buildingType: demandToEdit.buildingType || 'PEB',
            preferences: {
              ...form.formState.defaultValues.preferences,
              ...demandToEdit.preferences,
            },
            optionals: {
              ...form.formState.defaultValues.optionals,
              ...demandToEdit.optionals,
            },
            operations: {
              ...form.formState.defaultValues.operations,
              ...demandToEdit.operations,
            }
        });
        setDemandId(demandToEdit.demandId);

        const hasEssentialData = demandToEdit.ceilingHeight || demandToEdit.docks || (demandToEdit.preferences?.nonCompromisable && demandToEdit.preferences.nonCompromisable.length > 0);
        if (hasEssentialData) {
            setIsEssentialsOpen(true);
        }
        
        const hasOptionalData = Object.values(demandToEdit.optionals || {}).some(val => val !== undefined && val !== '' && val !== null);
        if (hasOptionalData) {
            setIsOptionalsOpen(true);
        }

        const hasOperationData = Object.values(demandToEdit.operations || {}).some(val => val !== undefined && val !== '' && val !== null);
        if (hasOperationData) {
            setIsOperationsOpen(true);
        }
      }
    }
  }, [isEditMode, editDemandId, demands, form]);
  
  const handleGenerateDescription = async () => {
    const fieldsToValidate: FieldPath<DemandSchema>[] = ['propertyType', 'location', 'radius', 'size'];
    const isValid = await form.trigger(fieldsToValidate);
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in Property Type, Location, Radius, and Size before generating a description.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const data = form.getValues();
      const input: ImprovePropertyDemandDescriptionInput = {
        description: data.description,
        propertyType: data.propertyType!,
        locationName: data.locationName || "the specified area",
        size: String(data.size),
        readiness: data.readiness,
        additionalDetails: `Ceiling height: ${data.ceilingHeight || 'N/A'}, Docks: ${data.docks || 'N/A'}. Non-compromisable items: ${data.preferences?.nonCompromisable?.join(', ') || 'None'}.`,
      };
      const result = await getImprovedDemandDescriptionAction(input);
      if (result.error || !result.improvedDescription) {
        throw new Error(result.error || "Failed to generate description.");
      }
      form.setValue("description", result.improvedDescription, { shouldValidate: true });
      toast({ title: "Description generated successfully!" });
    } catch (error) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: e.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };


  async function onSubmit(data: DemandSchema) {
    setIsLoading(true);
    try {
      const result = await logDemandAction(data);
      if (result.error || !result.demand) {
        throw new Error(result.error || "Failed to get a valid response from the action.");
      }
      
      if (isEditMode) {
        updateDemand(result.demand);
      } else {
        addDemand(result.demand, user?.email);
      }

      setIsDialogOpen(true);

      if (!isEditMode) {
        const userDetails = {
          companyName: user?.companyName,
          userName: user?.userName,
          userEmail: user?.email,
          userPhone: user?.phone,
        }
        form.reset({
          ...form.formState.defaultValues,
          ...userDetails,
          demandId: "",
          propertyType: undefined,
          description: "",
          preferences: { nonCompromisable: [] }
        });
      }
    } catch (error) {
       const e = error as Error;
       toast({
        variant: "destructive",
        title: "Submission Failed",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleViewMyDemands = () => {
    setIsDialogOpen(false);
    // This navigation clears any 'editDemandId' from the URL
    router.push('/dashboard', { scroll: false });
    // This callback will switch the active tab in the parent component
    onDemandLogged();
  };

  const handleLogAnother = () => {
    setIsDialogOpen(false);
    router.push('/dashboard', { scroll: false });
    const userDetails = {
      companyName: user?.companyName,
      userName: user?.userName,
      userEmail: user?.email,
      userPhone: user?.phone,
    };
    form.reset({
      ...form.formState.defaultValues,
      ...userDetails,
      demandId: "",
      propertyType: undefined,
      description: "",
      preferences: { nonCompromisable: [] },
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isEditMode ? 'Edit Demand' : 'Log New Demand'}</CardTitle>
                  <CardDescription>
                    Fill in the required fields below. Add optional details for more accurate matches.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* --- LEVEL 1: REQUIRED --- */}
                  <div className="space-y-2">
                    <FormLabel className="text-base font-semibold text-primary">Required Details</FormLabel>
                    <div className="p-4 border rounded-lg space-y-6 bg-secondary/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="demandId" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Demand ID</FormLabel>
                              <FormControl><Input {...field} disabled /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField control={form.control} name="propertyType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="Industrial Building">Industrial Building</SelectItem>
                                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField control={form.control} name="size" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Area (Sq. Ft.)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 50000" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                      </div>
                      <div className="space-y-4">
                        <FormLabel>Location</FormLabel>
                        <DemandMapWrapper />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="locationName" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Oragadam, Chennai" {...field} readOnly /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField control={form.control} name="radius" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Radius (km)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 10" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <FormField control={form.control} name="readiness" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Readiness</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select readiness" /></SelectTrigger></FormControl>
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
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> User Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </div>
          </div>
          
           {/* --- LEVEL 2: ESSENTIALS --- */}
            <Collapsible open={isEssentialsOpen} onOpenChange={setIsEssentialsOpen}>
            <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {isEssentialsOpen ? 'Hide Essentials & Preferences' : 'Show Essentials & Preferences-The Key Defining Factors in Lease'}
                </div>
                <ChevronsUpDown className="h-4 w-4" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-2">
                <FormLabel className="text-base font-semibold text-primary">Essentials & Preferences</FormLabel>
                    <p className="text-sm text-muted-foreground">Select items that are critical and provide more details. This helps our AI-assisted sourcing find you the most relevant properties.</p>
                <div className="p-4 border rounded-lg space-y-6">
                    <div className="space-y-4 pt-2">
                        {/* Size */}
                        <PriorityCard title="Size Range" icon={Scaling} form={form} field="preferences.nonCompromisable" fieldName="size">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="sizeMin" render={({ field }) => (<FormItem><FormLabel>Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 80000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="sizeMax" render={({ field }) => (<FormItem><FormLabel>Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 100000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="p-3 rounded-md bg-secondary">
                                    <FormLabel>Effective Usable Area</FormLabel>
                                    <p className="text-lg font-bold text-primary">{effectiveUsableArea.toLocaleString()} Sq. Ft.</p>
                                    <p className="text-xs text-muted-foreground">Calculated as 90% of max area.</p>
                                </div>
                                <FormField control={form.control} name="sizeVariationPercentage" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Acceptable Variation</FormLabel>
                                            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                +/- {field.value}%
                                            </span>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                defaultValue={[field.value ?? 10]}
                                                max={25}
                                                step={1}
                                                onValueChange={(value) => field.onChange(value[0])}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                        </PriorityCard>

                            {/* Building Type */}
                        <PriorityCard title="Building Type" icon={Building} form={form} field="preferences.nonCompromisable" fieldName="buildingType">
                            <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="buildingType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center justify-center">
                                            <div className="grid grid-cols-2 gap-1 rounded-full p-1 bg-muted w-fit">
                                                <Button type="button" variant={field.value === 'PEB' ? 'default' : 'ghost'} size="sm" onClick={() => field.onChange('PEB')} className="rounded-full">PEB</Button>
                                                <Button type="button" variant={field.value === 'RCC' ? 'default' : 'ghost'} size="sm" onClick={() => field.onChange('RCC')} className="rounded-full">RCC</Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">PEB (Pre-Engineered Building with Galvalume Sheet)</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                                {buildingType === 'RCC' && (
                                <FormField
                                    control={form.control}
                                    name="floorPreference"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3 pt-4 border-t">
                                        <FormLabel>Floor Preference</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-3 gap-4"
                                            >
                                            <FormItem>
                                                <FormControl><RadioGroupItem value="Ground" id="ground" className="peer sr-only" /></FormControl>
                                                <FormLabel htmlFor="ground" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-xs font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Ground</FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormControl><RadioGroupItem value="Multi-Floor" id="multi-floor" className="peer sr-only" /></FormControl>
                                                <FormLabel htmlFor="multi-floor" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-xs font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Multi-Floor</FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormControl><RadioGroupItem value="Any" id="any" className="peer sr-only" /></FormControl>
                                                <FormLabel htmlFor="any" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-xs font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Any</FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                )}
                            </div>
                        </PriorityCard>

                        {/* Ceiling Height */}
                        <PriorityCard title="Ceiling Height" icon={Building} form={form} field="preferences.nonCompromisable" fieldName="ceilingHeight">
                            <div className="flex gap-2">
                                <FormField control={form.control} name="ceilingHeight" render={({ field: heightField }) => (
                                    <FormItem className="flex-grow"><FormControl><Input type="number" placeholder="Enter min height" {...heightField} value={heightField.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="ceilingHeightUnit" render={({ field: unitField }) => (
                                    <FormItem><Select onValueChange={unitField.onChange} value={unitField.value}><FormControl><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ft">ft</SelectItem><SelectItem value="m">m</SelectItem></SelectContent></Select></FormItem>
                                )} />
                            </div>
                        </PriorityCard>

                        {/* Docks */}
                        <PriorityCard title="Number of Docks" icon={Warehouse} form={form} field="preferences.nonCompromisable" fieldName="docks">
                            <FormField control={form.control} name="docks" render={({ field }) => (
                                <FormItem><FormControl><Input type="number" placeholder="Enter min number of docks" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </PriorityCard>
                        
                            {/* Power */}
                        <PriorityCard title="Power Requirement" icon={Zap} form={form} field="preferences.nonCompromisable" fieldName="power">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="powerMin" render={({ field }) => (<FormItem><FormLabel>Min kVA</FormLabel><FormControl><Input type="number" placeholder="e.g. 100" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="powerMax" render={({ field }) => (<FormItem><FormLabel>Max kVA</FormLabel><FormControl><Input type="number" placeholder="e.g. 500" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </PriorityCard>

                        {/* Toggles */}
                        <PriorityCard title="Approvals" icon={ShieldCheck} form={form} field="preferences.nonCompromisable" fieldName="approvals">
                            <PriorityToggle form={form} field="preferences.approvals" />
                        </PriorityCard>
                        <PriorityCard title="Fire NOC" icon={Flame} form={form} field="preferences.nonCompromisable" fieldName="fireNoc">
                            <PriorityToggle form={form} field="preferences.fireNoc" />
                        </PriorityCard>
                            <PriorityCard title="Fire Safety Infrastructure" icon={Flame} form={form} field="preferences.nonCompromisable" fieldName="fireSafety">
                            <PriorityToggle form={form} field="preferences.fireSafety" />
                        </PriorityCard>
                    </div>

                    <div className="space-y-2 pt-6 border-t">
                        <FormLabel className="text-base font-semibold text-primary">Additional Notes</FormLabel>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea placeholder="Add any other notes, context, or summary of your requirements here..." className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>
                </div>
            </CollapsibleContent>
            </Collapsible>
          
            {/* --- LEVEL 3: OPTIONALS --- */}
            <Collapsible open={isOptionalsOpen} onOpenChange={setIsOptionalsOpen}>
            <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {isOptionalsOpen ? 'Hide Optionals & Preferences' : 'Show Optionals & Preferences'}
                </div>
                <ChevronsUpDown className="h-4 w-4" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-2">
                <FormLabel className="text-base font-semibold text-primary">Optionals & Preferences</FormLabel>
                <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    {/* Office Space */}
                        <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Building className="w-4 h-4"/> Office Space</FormLabel>
                        <div className="grid grid-cols-2 gap-4 pl-6">
                            <FormField control={form.control} name="optionals.officeSpaceMin" render={({ field }) => (<FormItem><FormLabel>Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 2000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="optionals.officeSpaceMax" render={({ field }) => (<FormItem><FormLabel>Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 5000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                    
                    {/* Cafeteria */}
                    <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Utensils className="w-4 h-4"/> Cafeteria/Canteen</FormLabel>
                        <div className="grid grid-cols-2 gap-4 pl-6">
                            <FormField control={form.control} name="optionals.cafeteriaOrCanteen" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Cafeteria" id="cafe" /></FormControl><FormLabel htmlFor="cafe">Cafeteria</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Canteen" id="canteen" /></FormControl><FormLabel htmlFor="canteen">Canteen</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}/>
                                <FormField control={form.control} name="optionals.seatingCapacity" render={({ field }) => (<FormItem><FormLabel>Seating Capacity</FormLabel><FormControl><Input type="number" placeholder="e.g. 50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>

                    {/* Toilets */}
                        <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Users className="w-4 h-4"/> Additional Toilets</FormLabel>
                        <div className="grid grid-cols-2 gap-4 pl-6">
                            <FormField control={form.control} name="optionals.additionalToiletsMen" render={({ field }) => (<FormItem><FormLabel>For Men (count)</FormLabel><FormControl><Input type="number" placeholder="e.g. 5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="optionals.additionalToiletsWomen" render={({ field }) => (<FormItem><FormLabel>For Women (count)</FormLabel><FormControl><Input type="number" placeholder="e.g. 5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                    
                        {/* Parking/Storage */}
                        <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Car className="w-4 h-4"/> Parking & Storage</FormLabel>
                        <div className="space-y-4 pl-6">
                            <div>
                                <FormLabel className="text-xs font-semibold">Truck Parking Yard</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="optionals.truckParkingYardMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 10000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="optionals.truckParkingYardMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 20000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                                <div>
                                <FormLabel className="text-xs font-semibold">Open Storage Yard</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="optionals.openStorageYardMin" render={({ field }) => (<FormItem><FormLabel className="text-xs">Min Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 5000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="optionals.openStorageYardMax" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 10000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tenant Improvements */}
                        <div className="space-y-2 md:col-span-2">
                        <FormLabel className="flex items-center gap-2"><HardHat className="w-4 h-4"/> Tenant Specific Improvements</FormLabel>
                        <div className="pl-6">
                                <FormField control={form.control} name="optionals.tenantSpecificImprovements" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Describe any specific modifications or improvements required..." className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Droplets className="w-4 h-4"/> Process Water Requirement</FormLabel>
                        <div className="pl-6">
                            <FormField control={form.control} name="optionals.processWaterRequirement" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="KL/Per Day" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Wind className="w-4 h-4"/> HVAC Area Planned (If any)</FormLabel>
                        <div className="pl-6">
                            <FormField control={form.control} name="optionals.hvacArea" render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g., 10,000 Sq. Ft." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><CircuitBoard className="w-4 h-4"/> Sprinklers</FormLabel>
                        <div className="pl-6">
                            <FormField control={form.control} name="optionals.sprinklerRequirement" render={({ field }) => (<FormItem><FormControl><Input placeholder="Requirement & Type" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Lighting Requirement</FormLabel>
                        <div className="pl-6">
                            <FormField control={form.control} name="optionals.lightingRequirement" render={({ field }) => (<FormItem><FormControl><Input placeholder="Type & LUX Levels" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
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
                                <FormLabel htmlFor="crane-required" className="flex items-center gap-2 !m-0"><CraneIcon className="w-4 h-4"/> Any Crane Requirement?</FormLabel>
                                </FormItem>
                            )}
                         />
                         <Collapsible open={craneRequired}>
                            <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up pl-6 pt-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                    <FormField control={form.control} name="optionals.crane.type" render={({ field }) => (
                                        <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="EOT / Gantry" /></SelectTrigger></FormControl><SelectContent><SelectItem value="EOT">EOT</SelectItem><SelectItem value="Gantry">Gantry</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="optionals.crane.count" render={({ field }) => (<FormItem><FormLabel>No. of Cranes</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="optionals.crane.transverseLength" render={({ field }) => (<FormItem><FormLabel>Transverse (m)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="optionals.crane.span" render={({ field }) => (<FormItem><FormLabel>Span (m)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="optionals.crane.underhookHeight" render={({ field }) => (<FormItem><FormLabel>Underhook (m)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="optionals.crane.capacity" render={({ field }) => (<FormItem><FormLabel>Capacity (Tons)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </CollapsibleContent>
                         </Collapsible>
                    </div>

                </div>
                </div>
            </CollapsibleContent>
            </Collapsible>

            {/* --- Operations Section --- */}
            <Collapsible open={isOperationsOpen} onOpenChange={setIsOperationsOpen}>
            <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    {isOperationsOpen ? 'Hide Operation Details' : 'Show More About Your Operations'}
                </div>
                <ChevronsUpDown className="h-4 w-4" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-2">
                <FormLabel className="text-base font-semibold text-primary">Operation Details</FormLabel>
                <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                     <FormField
                        control={form.control}
                        name="operations.mpcbEcCategory"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit Categorization (as per MPCB/EC)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
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
                        )}
                    />
                    <div></div>
                     <FormField
                        control={form.control}
                        name="operations.etpDetails"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Details of Effluent Treatment Plant (if any)</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Capacity, technology, etc."
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="operations.effluentCharacteristics"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Characteristics of Effluent (if any)</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="pH, temperature, chemical composition, etc."
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                </div>
            </CollapsibleContent>
            </Collapsible>

          <div className="flex justify-end mt-8">
            <Button type="submit" size="lg" disabled={isLoading || isGenerating}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Logging...'}
                </>
              ) : (
                <>
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Demand' : 'Log Demand'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{isEditMode ? 'Demand Updated!' : 'Demand Logged Successfully!'}</DialogTitle>
                <DialogDescription>
                    Your demand has been saved. What would you like to do next?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleLogAnother}>
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Log a New Demand' : 'Log Another Demand'}
                </Button>
                <Button onClick={handleViewMyDemands}>
                  <List className="mr-2 h-4 w-4" />
                  View My Demands
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    