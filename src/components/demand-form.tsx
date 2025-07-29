
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
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
import { User, Sparkles, List, ChevronsUpDown, PlusCircle, ClipboardPlus, ArrowRight } from 'lucide-react';
import DemandMapWrapper from "./demand-map";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { type ImprovePropertyDemandDescriptionInput } from "@/ai/flows/improve-property-demand";

const priorityItems = [
    { id: 'size', label: 'Size' },
    { id: 'location', label: 'Location & Radius' },
    { id: 'ceilingHeight', label: 'Ceiling Height' },
    { id: 'docks', label: 'Number of Docks' },
    { id: 'readiness', label: 'Readiness' },
    { id: 'approvals', label: 'Approvals Status' },
    { id: 'fireNoc', label: 'Fire NOC Status' },
    { id: 'power', label: 'Sufficient Power' },
    { id: 'fireSafety', label: 'Fire Safety Compliance' },
];

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

  const [isOptionalOpen, setIsOptionalOpen] = React.useState(isEditMode);

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
      radius: undefined,
      size: undefined,
      ceilingHeight: undefined,
      docks: undefined,
      readiness: "Immediate",
      description: "",
      preferences: {
        nonCompromisable: [],
      }
    },
  });

  const watchedDemandId = form.watch("demandId");

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

    if (locationFromMap) {
      form.setValue('location', locationFromMap, { shouldValidate: true });
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
        form.reset(demandToEdit);
        setDemandId(demandToEdit.demandId);

        const hasOptionalData = demandToEdit.ceilingHeight || demandToEdit.docks || demandToEdit.description || (demandToEdit.preferences?.nonCompromisable && demandToEdit.preferences.nonCompromisable.length > 0);
        if (hasOptionalData) {
            setIsOptionalOpen(true);
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
        location: data.location,
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
                                <FormLabel>Size (Sq. Ft.)</FormLabel>
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
                          <FormField control={form.control} name="location" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location Coordinates</FormLabel>
                                <FormControl><Input placeholder="e.g. 13.0827, 80.2707" {...field} readOnly /></FormControl>
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

                  {/* --- LEVEL 2: OPTIONAL --- */}
                  <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen}>
                    <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                           <PlusCircle className="h-4 w-4" />
                           {isOptionalOpen ? 'Hide Optional Details & Priorities' : 'Show Optional Details & Priorities'}
                        </div>
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-2">
                        <FormLabel className="text-base font-semibold text-primary">Optional Details & Priorities</FormLabel>
                        <div className="p-4 border rounded-lg space-y-6">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                  <FormLabel>Description</FormLabel>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating || isLoading}
                                    className="gap-2"
                                  >
                                    {isGenerating ? (
                                      <Sparkles className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-4 w-4" />
                                    )}
                                    Generate with AI
                                  </Button>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="e.g., 'We need a warehouse with high ceilings for storing equipment. Must be near the main highway and have at least 4 loading docks...'" className="min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="space-y-3">
                                <FormLabel>Requirement Priorities</FormLabel>
                                <p className="text-sm text-muted-foreground">Select items that are non-negotiable and provide details. This helps the AI find you the most relevant properties.</p>
                                <FormField
                                    control={form.control}
                                    name="preferences.nonCompromisable"
                                    render={({ field }) => (
                                    <div className="space-y-4 pt-2">
                                        {priorityItems.map((item) => {
                                            const isChecked = field.value?.includes(item.id);
                                            return (
                                            <div key={item.id} className="space-y-2">
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const currentValue = field.value || [];
                                                            const newValue = checked
                                                                ? [...currentValue, item.id]
                                                                : currentValue.filter((value) => value !== item.id);
                                                            field.onChange(newValue);

                                                            if (!checked) {
                                                                if (item.id === 'ceilingHeight') {
                                                                    form.setValue('ceilingHeight', undefined, { shouldValidate: true });
                                                                }
                                                                if (item.id === 'docks') {
                                                                    form.setValue('docks', undefined, { shouldValidate: true });
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {item.label}
                                                </FormLabel>
                                                </FormItem>
                                                
                                                {isChecked && item.id === 'ceilingHeight' && (
                                                    <div className="pl-8 pr-1">
                                                        <FormField
                                                            control={form.control}
                                                            name="ceilingHeight"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl><Input type="number" placeholder="Enter min ceiling height (ft)" {...field} value={field.value ?? ''} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                                {isChecked && item.id === 'docks' && (
                                                    <div className="pl-8 pr-1">
                                                        <FormField
                                                            control={form.control}
                                                            name="docks"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl><Input type="number" placeholder="Enter min number of docks" {...field} value={field.value ?? ''} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            );
                                        })}
                                        <FormMessage /> 
                                    </div>
                                    )}
                                />
                            </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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
