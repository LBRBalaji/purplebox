
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from './ui/input';
import { warehouseSchema, type WarehouseSchema } from '@/lib/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";


type WarehouseFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: WarehouseSchema | null;
  onSubmit: (data: WarehouseSchema) => void;
};

export function WarehouseForm({ isOpen, onOpenChange, warehouse, onSubmit }: WarehouseFormProps) {
  const isEditMode = !!warehouse;

  const form = useForm<WarehouseSchema>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      id: '',
      locationName: '',
      latLng: '',
      isActive: true,
      is3pl: false,
      generalizedLocation: { lat: 0, lng: 0 },
      size: 0,
      readiness: 'Ready for Occupancy',
      specifications: {
        ceilingHeight: 0,
        docks: 0,
        officeSpace: false,
        flooringType: '',
      },
      imageUrls: [],
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        if (isEditMode && warehouse) {
            form.reset({
                ...warehouse,
                latLng: `${warehouse.generalizedLocation.lat}, ${warehouse.generalizedLocation.lng}`
            });
        } else {
            form.reset({
                id: `WH-${Date.now()}`,
                locationName: '',
                latLng: '',
                isActive: true,
                is3pl: false,
                generalizedLocation: { lat: 0, lng: 0 },
                size: undefined,
                readiness: 'Ready for Occupancy',
                specifications: { ceilingHeight: undefined, docks: undefined, officeSpace: false, flooringType: '' },
                imageUrls: [],
            });
        }
    }
  }, [isOpen, isEditMode, warehouse, form]);

  const handleSubmit = (data: WarehouseSchema) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this warehouse listing.' : 'Fill out the form to add a new warehouse to the listings.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse ID</FormLabel>
                      <FormControl><Input {...field} disabled /></FormControl>
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="locationName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Oragadam" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>

               {/* Location & Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="latLng" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Latitude, Longitude</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 12.83, 79.95" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="size" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size (sq. ft.)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                          placeholder="e.g. 150000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="readiness" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Readiness</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
                          <SelectItem value="Under Construction">Under Construction</SelectItem>
                          <SelectItem value="Available in 3 months">Available in 3 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <FormLabel className="font-medium">Specifications</FormLabel>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                     <FormField control={form.control} name="specifications.ceilingHeight" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ceiling Height (ft)</FormLabel>
                          <FormControl>
                             <Input
                                type="number"
                                {...field}
                                value={field.value ?? ''}
                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                placeholder="e.g. 45"
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="specifications.docks" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Docks</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                              placeholder="e.g. 20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="specifications.flooringType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flooring Type</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. FM2 Grade" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="specifications.officeSpace" render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                            <FormLabel>Office Space Available</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="office-space-switch"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <label htmlFor="office-space-switch">{field.value ? "Yes" : "No"}</label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                 </div>
              </div>

              {/* Images */}
              <FormItem>
                <FormLabel>Image URLs</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter image URLs, one per line."
                    value={form.watch('imageUrls').join('\n')}
                    onChange={e => form.setValue('imageUrls', e.target.value.split('\n'))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              {/* Toggles */}
               <div className="space-y-4">
                <FormField control={form.control} name="is3pl" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">3PL Operated Warehouse</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable this if the warehouse is operated by a Third-Party Logistics provider.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publicly Visible</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Control if this warehouse appears on the public map search.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              
            <DialogFooter className="sticky bottom-0 bg-background/95 p-6 -m-6 mt-6 pt-6 z-10">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Warehouse'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
