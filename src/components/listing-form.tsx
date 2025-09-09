
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from './ui/input';
import { listingSchema, type ListingSchema, type GenerateListingDescriptionInput } from '@/lib/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Trash2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { generateListingDescriptionAction } from "@/lib/actions";
import { Sparkles } from "lucide-react";


type ListingFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ListingSchema | null;
  onSubmit: (data: ListingSchema) => void;
};

const buildingTypes = [
    { id: 'PEB', label: 'PEB' },
    { id: 'RCC', label: 'RCC' },
];

export function ListingForm({ isOpen, onOpenChange, listing, onSubmit }: ListingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditMode = !!listing;
  const [isGenerating, setIsGenerating] = React.useState(false);

  const form = useForm<ListingSchema>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      status: 'pending',
      developerId: '',
      listingId: '',
      name: '',
      location: '',
      sizeSqFt: undefined,
      description: '',
      rentPerSqFt: undefined,
      rentalSecurityDeposit: undefined,
      availabilityDate: 'Ready for Occupancy',
      constructionProgress: '',
      serviceModel: 'Standard',
      area: {
        plinthArea: undefined,
        mezzanineArea1: undefined,
        mezzanineArea2: undefined,
        canopyArea: undefined,
        driversRestRoomArea: undefined,
        totalChargeableArea: undefined,
      },
      buildingSpecifications: {
        buildingType: [],
        craneSupportStructureAvailable: false,
        craneAvailable: false,
        warehouseLayoutAvailable: false,
        louvers: false,
      },
      siteSpecifications: {},
      certificatesAndApprovals: {
        parkApproval: false,
        buildingApproval: false,
        fireLicense: false,
        fireNOC: false,
        buildingInsurance: false,
        pcbForAir: false,
        pcbForWater: false,
        propertyTax: false,
      },
      documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents"
  });

  // Watch for changes in area fields to auto-calculate total
  const areaValues = form.watch("area");
  React.useEffect(() => {
    const { plinthArea, mezzanineArea1, mezzanineArea2, canopyArea, driversRestRoomArea } = areaValues;
    const total =
      (Number(plinthArea) || 0) +
      (Number(mezzanineArea1) || 0) +
      (Number(mezzanineArea2) || 0) +
      (Number(canopyArea) || 0) +
      (Number(driversRestRoomArea) || 0);

    if (total !== (Number(areaValues.totalChargeableArea) || 0)) {
        form.setValue("area.totalChargeableArea", total, { shouldValidate: true });
    }
  }, [areaValues, form]);


  React.useEffect(() => {
    if (isOpen) {
        if (isEditMode && listing) {
            form.reset(listing);
        } else {
            form.reset({
                status: 'pending',
                developerId: user?.email || '',
                listingId: `LST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                warehouseBoxId: `WBX-${user?.companyName?.substring(0,4).toUpperCase() || 'NEW'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                name: '',
                location: '',
                sizeSqFt: undefined,
                description: '',
                rentPerSqFt: undefined,
                rentalSecurityDeposit: undefined,
                availabilityDate: 'Ready for Occupancy',
                constructionProgress: '',
                serviceModel: 'Standard',
                area: {
                  plinthArea: undefined,
                  mezzanineArea1: undefined,
                  mezzanineArea2: undefined,
                  canopyArea: undefined,
                  driversRestRoomArea: undefined,
                  totalChargeableArea: undefined,
                },
                buildingSpecifications: {
                  buildingType: [],
                  craneSupportStructureAvailable: false,
                  craneAvailable: false,
                  warehouseLayoutAvailable: false,
                  louvers: false,
                },
                siteSpecifications: {},
                certificatesAndApprovals: {
                  parkApproval: false,
                  buildingApproval: false,
                  fireLicense: false,
                  fireNOC: false,
                  buildingInsurance: false,
                  pcbForAir: false,
                  pcbForWater: false,
                  propertyTax: false,
                },
                documents: [],
            });
        }
    }
  }, [isOpen, isEditMode, listing, form, user]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
        const data = form.getValues();
        const input: GenerateListingDescriptionInput = {
            propertyId: data.listingId,
            name: data.name,
            location: data.location,
            sizeSqFt: data.sizeSqFt,
            availabilityDate: data.availabilityDate,
            serviceModel: data.serviceModel,
            rentPerSqFt: data.rentPerSqFt,
            buildingType: data.buildingSpecifications.buildingType,
            roofType: data.buildingSpecifications.roofType,
            eveHeightMeters: data.buildingSpecifications.eveHeightMeters,
        };

        const result = await generateListingDescriptionAction(input);
        if (result.error || !result.generatedDescription) {
            throw new Error(result.error || "Failed to generate description");
        }

        form.setValue("description", result.generatedDescription, { shouldValidate: true });
        toast({ title: "Description generated successfully!" });

    } catch (e) {
        const error = e as Error;
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: error.message,
        });
    } finally {
        setIsGenerating(false);
    }
  };


  const handleSubmit = (data: ListingSchema) => {
    onSubmit(data);
    toast({
        title: isEditMode ? "Listing Updated" : "Listing Submitted",
        description: `Your listing for "${data.name}" has been saved and is pending admin approval.`
    })
  };

  const approvalFields = Object.keys(form.getValues().certificatesAndApprovals || {}) as (keyof ListingSchema['certificatesAndApprovals'])[];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Warehouse Listing' : 'Create a New Warehouse Listing'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this listing.' : 'Fill out the form to create a new warehouse listing for admin approval.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="listing-form" onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[70vh] p-1 pr-6">
            <div className="space-y-8">

              {/* General Information */}
              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">General Information</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Warehouse Name</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Prime Logistics Park - Unit A" /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Oragadam, Chennai" /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="sizeSqFt" render={({ field }) => (
                        <FormItem><FormLabel>Total Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} placeholder="e.g. 150000" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>
              
               {/* Availability & Commercials */}
              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">Availability &amp; Commercials</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 border rounded-md">
                    <FormField control={form.control} name="availabilityDate" render={({ field }) => (
                        <FormItem><FormLabel>Availability</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                            <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
                            <SelectItem value="Available in 3 months">Available in 3 months</SelectItem>
                            <SelectItem value="Under Construction">Under Construction</SelectItem>
                        </SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="constructionProgress" render={({ field }) => (
                        <FormItem><FormLabel>Construction Progress</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g., 80% or 'Structure Complete'" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentPerSqFt" render={({ field }) => (
                        <FormItem><FormLabel>Rent per Sq. Ft.</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} placeholder="e.g., 25" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (
                        <FormItem><FormLabel>Security Deposit (Months)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} placeholder="e.g., 6" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>

               {/* Area Specifications */}
              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">Area Specifications (in Sq. Ft.)</FormLabel>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-4 border rounded-md">
                    <FormField control={form.control} name="area.plinthArea" render={({ field }) => (
                        <FormItem><FormLabel>Plinth Area (Shop Floor)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area.mezzanineArea1" render={({ field }) => (
                        <FormItem><FormLabel>Mezzanine Area 1</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="area.mezzanineArea2" render={({ field }) => (
                        <FormItem><FormLabel>Mezzanine Area 2</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="area.canopyArea" render={({ field }) => (
                        <FormItem><FormLabel>Canopy Area</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area.driversRestRoomArea" render={({ field }) => (
                        <FormItem><FormLabel>Driver's Rest Room Area</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area.totalChargeableArea" render={({ field }) => (
                        <FormItem><FormLabel>Total Chargeable Area</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>

                {/* Building & Site Specifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Building Specifications</FormLabel>
                        <div className="space-y-4 p-4 border rounded-md">
                             <FormField control={form.control} name="buildingSpecifications.buildingType" render={() => (
                                <FormItem>
                                    <FormLabel>Building Type</FormLabel>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                    {buildingTypes.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="buildingSpecifications.buildingType"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== item.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                {item.label}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="buildingSpecifications.numberOfDocksAndShutters" render={({ field }) => (
                                <FormItem><FormLabel>Number of Docks/Shutters</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="buildingSpecifications.internalLighting" render={({ field }) => (
                                <FormItem><FormLabel>Internal Lighting</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g., LED High-bay, 200 LUX" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="buildingSpecifications.warehouseLayoutAvailable" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>Warehouse Layout Available?</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField control={form.control} name="buildingSpecifications.craneSupportStructureAvailable" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>Crane Support Structure</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField control={form.control} name="buildingSpecifications.craneAvailable" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>Crane Available</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Site &amp; Roof</FormLabel>
                        <div className="space-y-4 p-4 border rounded-md">
                             <FormField control={form.control} name="siteSpecifications.typeOfFlooringInside" render={({ field }) => (
                                <FormItem><FormLabel>Inside Flooring Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="FM2">FM2</SelectItem><SelectItem value="VDF-RCC">VDF-RCC</SelectItem><SelectItem value="RCC">RCC</SelectItem><SelectItem value="PCC">PCC</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="siteSpecifications.typeOfRoad" render={({ field }) => (
                                <FormItem><FormLabel>Access Road Flooring</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tar">Tar</SelectItem><SelectItem value="RCC">RCC</SelectItem><SelectItem value="PCC">PCC</SelectItem><SelectItem value="Gravel">Gravel</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )} />
                             <Separator />
                            <FormField control={form.control} name="buildingSpecifications.roofType" render={({ field }) => (<FormItem><FormLabel>Roof Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Galvalume">Galvalume</SelectItem><SelectItem value="RCC">RCC</SelectItem><SelectItem value="ACC">ACC</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="buildingSpecifications.eveHeightMeters" render={({ field }) => (<FormItem><FormLabel>Eve Height (in Meters)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="buildingSpecifications.roofInsulation" render={({ field }) => (<FormItem><FormLabel>Roof Insulation</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Insulated">Insulated</SelectItem><SelectItem value="Non-Insulated">Non-Insulated</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="buildingSpecifications.ventilation" render={({ field }) => (<FormItem><FormLabel>Ventilation</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Turbo">Turbo</SelectItem><SelectItem value="Ridge">Ridge</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="buildingSpecifications.louvers" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Louvers</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                        </div>
                    </div>
                </div>

                 {/* Approvals */}
              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">Certificates & Approvals</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md">
                    {approvalFields.map((fieldName) => (
                        <FormField key={fieldName} control={form.control} name={`certificatesAndApprovals.${fieldName}`} render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="font-normal capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                            </FormItem>
                        )} />
                    ))}
                </div>
              </div>
            
              {/* Documents */}
              <div className="space-y-4">
                 <FormLabel className="text-lg font-semibold">Documents & Media</FormLabel>
                 <div className="space-y-4 p-4 border rounded-md">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                            <FormField control={form.control} name={`documents.${index}.name`} render={({ field }) => (
                                <FormItem><FormLabel>Document Name</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name={`documents.${index}.type`} render={({ field }) => (
                                <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="layout">Layout</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`documents.${index}.url`} render={({ field }) => (
                                <FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ type: 'image', name: '', url: '' })}>
                        Add Document
                    </Button>
                 </div>
              </div>
               {/* Description */}
              <div className="space-y-4">
                 <FormLabel className="text-lg font-semibold">Description</FormLabel>
                 <div className="p-4 border rounded-md space-y-2">
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ''} placeholder="Describe the key features of your property, or generate one with AI." className="min-h-32"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                    <Button type="button" variant="outline" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate with AI</>}
                    </Button>
                 </div>
              </div>
              <Separator/>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-amber-50 border-amber-200">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Submission Status</FormLabel>
                    <FormDescription>
                        This listing will be submitted as '{field.value}'. An admin will review it.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input {...field} className="hidden" />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            </ScrollArea>
          </form>
        </Form>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="listing-form">{isEditMode ? 'Save Changes' : 'Submit'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
