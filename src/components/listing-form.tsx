
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
import { listingSchema, type ListingSchema } from '@/lib/schema';
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
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";


type ListingFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ListingSchema | null;
  onSubmit: (data: ListingSchema) => void;
};

export function ListingForm({ isOpen, onOpenChange, listing, onSubmit }: ListingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditMode = !!listing;

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
      area: {
        plinthArea: undefined,
        mezzanineArea1: undefined,
        mezzanineArea2: undefined,
        canopyArea: undefined,
        driversRestRoomArea: undefined,
        totalChargeableArea: undefined,
      },
      buildingSpecifications: {},
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

  React.useEffect(() => {
    if (isOpen) {
        if (isEditMode && listing) {
            form.reset(listing);
        } else {
            form.reset({
                status: 'pending',
                developerId: user?.email || '',
                listingId: `LST-${Date.now()}`,
                warehouseBoxId: `WBX-${user?.companyName?.substring(0,4).toUpperCase() || 'NEW'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
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
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[70vh] p-1 pr-6">
            <div className="space-y-8">

              {/* General Information */}
              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">General Information</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Warehouse Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Prime Logistics Park - Unit A" /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} placeholder="e.g. Oragadam, Chennai" /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="sizeSqFt" render={({ field }) => (
                        <FormItem><FormLabel>Total Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 150000" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe the key features of your property..." /></FormControl><FormMessage /></FormItem>
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
                        <FormItem><FormLabel>Construction Progress</FormLabel><FormControl><Input {...field} placeholder="e.g., 80% or 'Structure Complete'" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentPerSqFt" render={({ field }) => (
                        <FormItem><FormLabel>Rent per Sq. Ft.</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 25" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (
                        <FormItem><FormLabel>Security Deposit (Months)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 6" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>

               {/* Area Specifications */}
              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">Area Specifications (in Sq. Ft.)</FormLabel>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-4 border rounded-md">
                    <FormField control={form.control} name="area.plinthArea" render={({ field }) => (
                        <FormItem><FormLabel>Plinth Area (Shop Floor)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area.mezzanineArea1" render={({ field }) => (
                        <FormItem><FormLabel>Mezzanine Area 1</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="area.mezzanineArea2" render={({ field }) => (
                        <FormItem><FormLabel>Mezzanine Area 2</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="area.canopyArea" render={({ field }) => (
                        <FormItem><FormLabel>Canopy Area</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area.driversRestRoomArea" render={({ field }) => (
                        <FormItem><FormLabel>Driver's Rest Room Area</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="area.totalChargeableArea" render={({ field }) => (
                        <FormItem><FormLabel>Total Chargeable Area</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>

                {/* Building & Site Specifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Building Specifications</FormLabel>
                        <div className="space-y-4 p-4 border rounded-md">
                             <FormField control={form.control} name="buildingSpecifications.buildingType" render={({ field }) => (
                                <FormItem><FormLabel>Building Type</FormLabel><FormControl><Input {...field} placeholder="e.g., PEB" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="buildingSpecifications.numberOfDocksAndShutters" render={({ field }) => (
                                <FormItem><FormLabel>Number of Docks/Shutters</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="buildingSpecifications.roofInsulationStatus" render={({ field }) => (
                                <FormItem><FormLabel>Roof Insulation</FormLabel><FormControl><Input {...field} placeholder="e.g., Fully insulated" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="buildingSpecifications.internalLighting" render={({ field }) => (
                                <FormItem><FormLabel>Internal Lighting</FormLabel><FormControl><Input {...field} placeholder="e.g., LED High-bay, 200 LUX" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold">Site Specifications</FormLabel>
                        <div className="space-y-4 p-4 border rounded-md">
                             <FormField control={form.control} name="siteSpecifications.typeOfFlooringInside" render={({ field }) => (
                                <FormItem><FormLabel>Inside Flooring Type</FormLabel><FormControl><Input {...field} placeholder="e.g., FM2 Grade, 8-ton point load" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="siteSpecifications.typeOfFlooringOutside" render={({ field }) => (
                                <FormItem><FormLabel>Outside Flooring Type</FormLabel><FormControl><Input {...field} placeholder="e.g., VDF Concrete" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="siteSpecifications.typeOfRoad" render={({ field }) => (
                                <FormItem><FormLabel>Access Road Type</FormLabel><FormControl><Input {...field} placeholder="e.g., Tar road, 4-lane access" /></FormControl><FormMessage /></FormItem>
                            )} />
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
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                            <FormField control={form.control} name={`documents.${index}.name`} render={({ field }) => (
                                <FormItem><FormLabel>Document Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Floor Plan" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`documents.${index}.url`} render={({ field }) => (
                                <FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} placeholder="https://" /></FormControl><FormMessage /></FormItem>
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
            <DialogFooter className="sticky bottom-0 bg-background/95 p-6 -m-6 mt-6 pt-6 z-10 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Submit for Approval'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
