
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, type FieldErrors } from "react-hook-form";
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
import { listingSchema, type ListingSchema, type Document } from '@/lib/schema';
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
import { AlertTriangle, Trash2, PlusCircle, UploadCloud, Maximize, Link, ExternalLink, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { FileText } from "lucide-react";
import type { LocationCircle } from "@/contexts/data-context";

type ListingFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ListingSchema | null;
  onSubmit: (data: ListingSchema) => void;
  locationCircles?: LocationCircle[];
  initialIntent?: 'approve';
};

const buildingTypes = [
    { id: 'PEB', label: 'PEB' },
    { id: 'RCC', label: 'RCC' },
    { id: 'Standard Shed', label: 'Standard Shed' },
];

type UploadResult = { name: string; url: string; type: 'image' | 'video' | 'layout'; error?: never } | { name: string; url?: never; type?: never; error: string };

async function uploadFiles(files: File[]): Promise<UploadResult[]> {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file): Promise<UploadResult> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const contentType = response.headers.get('content-type') || '';
            const result = contentType.includes('application/json')
                ? await response.json()
                : { success: false, error: `Server error ${response.status} — please try again.` };
            if (!response.ok || !result.success) {
                return { name: file.name, error: result.error || 'Upload failed' };
            }
            return {
                type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'layout',
                name: file.name,
                url: result.url,
            };
        } catch (error: any) {
            console.error('Error uploading file:', file.name, error);
            return { name: file.name, error: error.message || 'Network error. Check your connection and try again.' };
        }
    });

    return Promise.all(uploadPromises);
}


export function ListingForm({ isOpen, onOpenChange, listing, onSubmit, locationCircles = [], initialIntent }: ListingFormProps) {
  const { user, users } = useAuth();
  const { toast } = useToast();
  const isEditMode = !!listing;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mediaTab, setMediaTab] = React.useState<'upload' | 'url'>('url');
  const [urlInput, setUrlInput] = React.useState('');
  const [urlName, setUrlName] = React.useState('');
  const [urlType, setUrlType] = React.useState<'image' | 'video' | 'layout'>('image');
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const isInternalStaff = (user as any)?.isInternalStaff === true;
  const isCustomer = user?.role === 'User';
  const canCreateForDeveloper = isAdmin || isInternalStaff;
  const [showSubleaseWarning, setShowSubleaseWarning] = React.useState(false);
  const [subleaseConfirmed, setSubleaseConfirmed] = React.useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = React.useState<string>('');
  const allDevelopers = React.useMemo(() => Object.values(users || {}).filter((u: any) => u.role === 'Warehouse Developer' && u.status === 'approved'), [users]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ListingSchema>({
      // No defaultValues here; we will use form.reset() in useEffect for controlled initialization
  });


  React.useEffect(() => {
    if (isOpen) {
      const defaultValues = isEditMode && listing ? 
            {...listing, plan: listing.plan || 'Free', documents: listing.documents || []} : 
            {
              status: 'pending' as const,
              developerId: (canCreateForDeveloper && selectedDeveloperId) ? selectedDeveloperId : user?.email || '',
              listingId: `LST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              plan: 'Free' as const,
              listingType: (isCustomer ? 'Sublease' : 'Owner') as 'Owner' | 'Sublease',
              warehouseBoxId: '',
              actualSizeSqFt: undefined,
              additionalInformation: '',
              name: '',
              location: '',
              sizeSqFt: undefined,
              description: '',
              rentPerSqFt: undefined,
              rentalSecurityDeposit: undefined,
              availabilityDate: 'Ready for Occupancy',
              constructionProgress: '',
              warehouseModel: 'Non-Temperature Controlled',
              locationCircle: '',
              area: { plinthArea: undefined, mezzanineArea1: undefined, mezzanineArea2: undefined, canopyArea: undefined, driversRestRoomArea: undefined, totalChargeableArea: undefined, tempControlledArea: undefined, nonTempControlledArea: undefined },
              buildingSpecifications: { buildingType: [], craneSupportStructureAvailable: false, craneAvailable: false, warehouseLayoutAvailable: false, louvers: false, },
              siteSpecifications: {},
              certificatesAndApprovals: { parkApproval: false, buildingApproval: false, fireLicense: false, fireNOC: false, buildingInsurance: false, pcbForAir: false, pcbForWater: false, propertyTax: false, },
              documents: [],
            };
      form.reset(defaultValues);
    }
  }, [isOpen, isEditMode, listing, form, user]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents"
  });
  
  const [watchedCircle, warehouseModel] = form.watch(['locationCircle', 'warehouseModel']);
  const selectedCircleLocations = React.useMemo(() => {
    if (!watchedCircle) return [];
    const circle = locationCircles.find(c => c.name === watchedCircle);
    return circle?.locations || [];
  }, [watchedCircle, locationCircles]);



  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const fileList = Array.from(event.target.files);
    
    setIsSubmitting(true);
    toast({ title: "Uploading...", description: `${fileList.length} file(s) selected.` });

    try {
        const results = await uploadFiles(fileList);
        
        const succeeded = results.filter(r => r.url);
        const failed = results.filter(r => r.error);

        if (succeeded.length > 0) {
          const newDocuments = succeeded.map(file => ({
            type: file.type as 'image' | 'video' | 'layout',
            name: file.name,
            url: file.url!,
          }));
          append(newDocuments);
          toast({ title: `${succeeded.length} file(s) uploaded`, description: succeeded.map(f => f.name).join(', ') });
        }

        if (failed.length > 0) {
          failed.forEach(f => {
            toast({ variant: 'destructive', title: `Upload failed: ${f.name}`, description: f.error, duration: 8000 });
          });
        }

        if (succeeded.length === 0 && failed.length === 0) {
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'No files were uploaded. Please try again.' });
        }
    } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Upload Error', description: error.message || 'An unexpected error occurred.' });
    } finally {
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
        setIsSubmitting(false);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast({ variant: 'destructive', title: 'No URL entered', description: 'Please paste a Google Drive or Google Photos link.' });
      return;
    }
    let finalUrl = trimmed;
    const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
    const driveId = driveMatch?.[1] || driveOpenMatch?.[1];
    if (driveId) {
      finalUrl = 'https://drive.google.com/uc?export=view&id=' + driveId;
    }
    const name = urlName.trim() || ('Media ' + (fields.length + 1));
    append({ type: urlType, name, url: finalUrl });
    setUrlInput('');
    setUrlName('');
    toast({ title: 'Link added', description: '"' + name + '" added to your listing.' });
  };




  const handleSubmitWrapper = async (data: ListingSchema) => {
    if (isInternalStaff && !selectedDeveloperId) {
      toast({ variant: 'destructive', title: 'Select Developer', description: 'Please select the developer this listing belongs to.' });
      return;
    }
    setIsSubmitting(true);
    try {
        // Smart Approval Logic for Admins
        if (isAdmin && initialIntent === 'approve' && data.locationCircle && listing?.status === 'pending') {
            data.status = 'approved';
        } else if (!isAdmin && isEditMode && data.status === 'approved') {
            // Non-admin edits must go back through approval
            data.status = 'pending';
            toast({ title: 'Edit submitted for approval', description: 'Your changes have been saved and sent to admin for re-approval before going live.' });
        }
        
        const finalData = {
          ...data,
          isAdmin,
          developerId: (canCreateForDeveloper && selectedDeveloperId) ? selectedDeveloperId : data.developerId,
          ...(isInternalStaff ? { status: 'draft' as const, createdBy: user?.email } : {}),
        };
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
        onSubmit(finalData);
        
        onOpenChange(false);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'An error occurred while saving the listing.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
   const onInvalidSubmit = (errors: FieldErrors<ListingSchema>) => {
    console.log("Form Errors:", errors);
    const errorFields = Object.keys(errors);
    toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: `Please review the form for errors. Required fields missing in: ${errorFields.join(', ')}`
    });
  };

  const approvalFields = Object.keys(form.formState.defaultValues?.certificatesAndApprovals || {}) as (keyof ListingSchema['certificatesAndApprovals'])[];

  // Show sublease caution dialog for customers on first open
  const effectiveOpen = isCustomer && !subleaseConfirmed && !isEditMode ? false : isOpen;

  return (
    <>
      {/* Sublease caution dialog for customers */}
      {isCustomer && !subleaseConfirmed && !isEditMode && isOpen && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onOpenChange(false); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <DialogTitle className="text-lg">List Your Excess Space</DialogTitle>
              </div>
              <DialogDescription className="text-left space-y-3 pt-1">
                <p className="text-sm text-foreground font-medium">This feature is for customers who have unused warehouse space they wish to sublease.</p>
                <p className="text-sm text-muted-foreground">Use this only if:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>You currently occupy a warehouse and have <strong>excess space</strong> you don't need</li>
                  <li>Your lease agreement <strong>permits subleasing</strong> to a third party</li>
                  <li>You have obtained the necessary <strong>landlord / developer consent</strong></li>
                </ul>
                <div className="rounded-xl p-3 mt-2" style={{background:'hsl(259 44% 96%)', border:'1px solid hsl(259 44% 86%)'}}>
                  <p className="text-xs" style={{color:'hsl(259 25% 40%)'}}>Your listing will be reviewed by ORS-ONE admin before going live. Listings without valid leasehold rights will be removed.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <button type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:bg-secondary">
                Cancel
              </button>
              <button type="button"
                onClick={() => setSubleaseConfirmed(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{background:'#6141ac'}}>
                Yes, I understand — Proceed to List
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={effectiveOpen} onOpenChange={(open) => { if (!open) setSubleaseConfirmed(false); onOpenChange(open); }}>
        <DialogContent 
            className="sm:max-w-4xl"
            onInteractOutside={(e) => {
                if (isSubmitting) {
                    e.preventDefault();
                }
            }}
        >
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Warehouse Listing' : 'Create a New Warehouse Listing'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details for this listing.' : 'Fill out the form to create a new warehouse listing for admin approval.'}
            </DialogDescription>
          </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitWrapper, onInvalidSubmit)}>
              {canCreateForDeveloper && !listing && (
                <div className="px-6 pt-4 pb-2">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Creating on behalf of Developer</label>
                    <select
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                      value={selectedDeveloperId}
                      onChange={e => setSelectedDeveloperId(e.target.value)}>
                      <option value="">Select Developer...</option>
                      {(allDevelopers as any[]).map((d: any) => (
                        <option key={d.email} value={d.email}>{d.userName} — {d.companyName}</option>
                      ))}
                    </select>
                    {isInternalStaff && <p className="text-xs text-muted-foreground mt-2">This listing will be saved as a draft pending SuperAdmin approval and developer consent.</p>}
                  </div>
                </div>
              )}
              <ScrollArea className="h-[70vh] p-1 pr-6">
                <div className="space-y-8">
                  
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Public View Information</h3>
                    <p className="text-sm text-muted-foreground -mt-2">The following information will be visible on the public listing, subject to O2O approval.</p>
                  </div>

                  {/* General Information */}
                  <div className="space-y-4">
                    <FormLabel className="text-lg font-semibold">General Information</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Oragadam, Chennai" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="sizeSqFt" render={({ field }) => (
                            <FormItem><FormLabel>Total Size for Listing (Sq. Ft.)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} placeholder="e.g. 150000" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </div>
                  
                  {/* Availability & Commercials */}
                  <div className="space-y-4">
                    <FormLabel className="text-lg font-semibold">Possession Readiness &amp; Commercials</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 border rounded-md">
                        <FormField control={form.control} name="availabilityDate" render={({ field }) => (
                            <FormItem><FormLabel>Possession Readiness</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
                                <SelectItem value="Available in 3 months">Available in 3 months</SelectItem>
                                <SelectItem value="Under Construction">Under Construction</SelectItem>
                                <SelectItem value="BTS-Built To Suit">BTS-Built To Suit</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="constructionProgress" render={({ field }) => (
                            <FormItem><FormLabel>Construction Progress</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g., 80% or 'Structure Complete'" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="rentPerSqFt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rent per Sq. Ft.</FormLabel>
                                <FormControl>
                                    <Input 
                                        type={typeof field.value === 'number' ? 'number' : 'text'} 
                                        {...field} 
                                        value={field.value ?? ''} 
                                        onChange={e => field.onChange(e.target.value === '' ? undefined : (typeof field.value === 'number' ? +e.target.value : e.target.value))}
                                        placeholder="e.g., 25"
                                        disabled={field.value === 'Get Quote'}
                                    />
                                </FormControl>
                                <div className="flex items-center space-x-2 pt-1">
                                    <Checkbox id="rent-get-quote" checked={field.value === 'Get Quote'} onCheckedChange={(checked) => field.onChange(checked ? 'Get Quote' : undefined)} />
                                    <label htmlFor="rent-get-quote" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Set to "Get Quote"</label>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (
                          <FormItem>
                                <FormLabel>Security Deposit</FormLabel>
                                <FormControl>
                                    <Input 
                                        type={typeof field.value === 'number' ? 'number' : 'text'} 
                                        {...field} 
                                        value={field.value ?? ''} 
                                        onChange={e => field.onChange(e.target.value === '' ? undefined : (typeof field.value === 'number' ? +e.target.value : e.target.value))}
                                        placeholder="e.g., 6 months"
                                        disabled={field.value === 'Get Quote'}
                                    />
                                </FormControl>
                                <div className="flex items-center space-x-2 pt-1">
                                    <Checkbox id="deposit-get-quote" checked={field.value === 'Get Quote'} onCheckedChange={(checked) => field.onChange(checked ? 'Get Quote' : undefined)} />
                                    <label htmlFor="deposit-get-quote" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Set to "Get Quote"</label>
                                </div>
                                <FormMessage />
                            </FormItem>
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
                            <FormItem><FormLabel>Total Chargeable Area (SFT)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} placeholder="Enter manually" /></FormControl><FormMessage /></FormItem>
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
                                <FormField control={form.control} name="warehouseModel" render={({ field }) => (
                                    <FormItem><FormLabel>Warehouse Model</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                        <SelectItem value="Non-Temperature Controlled">Non-Temperature Controlled</SelectItem>
                                        <SelectItem value="Temperature Controlled">Temperature Controlled</SelectItem>
                                        <SelectItem value="Temp & Non-Temp Controlled">Temp & Non-Temp Controlled</SelectItem>
                                        <SelectItem value="3PL Operated Warehouse">3PL Operated Warehouse</SelectItem>
                                    </SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                {warehouseModel === 'Temp & Non-Temp Controlled' && (
                                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-secondary/50">
                                        <FormField control={form.control} name="area.tempControlledArea" render={({ field }) => (
                                            <FormItem><FormLabel>Temp-Controlled Area (SFT)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="area.nonTempControlledArea" render={({ field }) => (
                                            <FormItem><FormLabel>Non-Temp-Controlled Area (SFT)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                )}
                                <FormField control={form.control} name="buildingSpecifications.numberOfDocksAndShutters" render={({ field }) => (
                                    <FormItem><FormLabel>Number of Docks/Shutters</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="buildingSpecifications.internalLighting" render={({ field }) => (
                                    <FormItem><FormLabel>Internal Lighting</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g., LED-HI Bay 300 lux" /></FormControl><FormMessage /></FormItem>
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
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Important: Do Not Expose Identity</AlertTitle>
                            <AlertDescription>
                                Please do not upload front views, elevations, or any pictures that could reveal the property's or developer's identity. Use only inside views of the building. Any identifying images will be removed by the admin.
                                We thank you in advance for your understanding and cooperation in respecting this platform policy.
                            </AlertDescription>
                        </Alert>
                        
                        {/* Tab switcher */}
                        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{background:'hsl(259 30% 94%)', border:'1px solid hsl(259 30% 86%)'}}>
                          <button type="button"
                            onClick={() => setMediaTab('url')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={mediaTab === 'url' ? {background:'#6141ac', color:'#fff'} : {color:'hsl(259 15% 45%)'}}>
                            <Link className="h-3.5 w-3.5" /> Add Link
                          </button>
                          <button type="button"
                            onClick={() => setMediaTab('upload')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={mediaTab === 'upload' ? {background:'#6141ac', color:'#fff'} : {color:'hsl(259 15% 45%)'}}>
                            <UploadCloud className="h-3.5 w-3.5" /> Upload File
                          </button>
                        </div>

                        {/* URL tab */}
                        {mediaTab === 'url' && (
                          <div className="rounded-xl p-4 space-y-3" style={{background:'hsl(259 44% 97%)', border:'1px solid hsl(259 44% 88%)'}}>
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-foreground mb-1 block">Google Drive / Photos Link</label>
                                  <Input
                                    value={urlInput}
                                    onChange={e => setUrlInput(e.target.value)}
                                    placeholder="Paste Google Drive or Google Photos share link"
                                    className="text-sm"
                                  />
                                  <p className="text-xs mt-1" style={{color:'hsl(259 15% 50%)'}}>Share your file with &quot;Anyone with the link&quot; in Google Drive first</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-semibold text-foreground mb-1 block">Label (optional)</label>
                                    <Input value={urlName} onChange={e => setUrlName(e.target.value)} placeholder="e.g. Inside View 1" className="text-sm" />
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-foreground mb-1 block">Type</label>
                                    <select value={urlType} onChange={e => setUrlType(e.target.value as any)}
                                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                      <option value="image">Image</option>
                                      <option value="video">Video</option>
                                      <option value="layout">Layout / PDF</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button type="button" onClick={handleAddUrl} className="w-full" style={{background:'#6141ac'}}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Add to Listing
                            </Button>
                            <p className="text-xs text-center" style={{color:'hsl(259 15% 55%)'}}>
                              No file size limits · No server storage · Links are permanent
                            </p>
                          </div>
                        )}

                        {/* Upload tab */}
                        {mediaTab === 'upload' && (
                          <div className="rounded-xl p-4 space-y-3" style={{background:'hsl(259 30% 96%)', border:'1px solid hsl(259 30% 88%)'}}>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting} className="w-full">
                              <UploadCloud className="mr-2 h-4 w-4" />
                              {isSubmitting ? 'Uploading...' : 'Choose File to Upload'}
                            </Button>
                            <p className="text-xs text-center" style={{color:'hsl(259 15% 55%)'}}>JPG, PNG, GIF, MP4, PDF · Max 20MB per file</p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </div>
                        )}

                        {fields.map((field, index) => {
                            const fileUrl = form.watch(`documents.${index}.url`);
                            const fileType = form.watch(`documents.${index}.type`);
                            return (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_auto] gap-4 items-end">
                                    <button
                                        type="button"
                                        onClick={() => fileUrl && setPreviewImageUrl(fileUrl)}
                                        className="w-20 h-20 relative bg-secondary rounded-md overflow-hidden group"
                                    >
                                    {fileType === 'image' && fileUrl ? (
                                        <>
                                            <img
                                                src={fileUrl}
                                                alt={field.name || 'Preview'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Maximize className="h-6 w-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                    )}
                                    </button>
                                    <div className="space-y-1">
                                      <FormField control={form.control} name={`documents.${index}.name`} render={({ field }) => (
                                        <FormItem><FormLabel>Document Name</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                      )} />
                                      {fileUrl && !fileUrl.includes('drive.google.com') && !fileUrl.includes('photos.google.com') && !fileUrl.includes('lh3.googleusercontent.com') && (
                                        <p className="text-xs" style={{color:'hsl(259 15% 55%)'}}>
                                          <ExternalLink className="h-3 w-3 inline mr-1" />
                                          Optionally{' '}
                                          <button type="button" className="underline font-medium" style={{color:'#6141ac'}}
                                            onClick={() => { const url = prompt('Paste Google Drive / Photos link to replace this file:'); if (url?.trim()) { const dm = url.match(/drive\.google\.com\/file\/d\/([^/]+)/); const id = dm?.[1]; form.setValue(`documents.${index}.url`, id ? 'https://drive.google.com/uc?export=view&id=' + id : url.trim()); } }}>
                                            switch to Google Drive link
                                          </button>
                                        </p>
                                      )}
                                    </div>
                                    <FormField control={form.control} name={`documents.${index}.type`} render={({ field }) => (
                                        <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="layout">Layout/PDF</SelectItem>
                                        </SelectContent></Select><FormMessage /></FormItem>
                                    )} />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                        {fields.length === 0 && <p className="text-sm text-muted-foreground">No media uploaded yet.</p>}
                    </div>
                  </div>
                  {/* Property Description */}
                  <div className="space-y-4">
                    <FormLabel className="text-lg font-semibold">Property Description</FormLabel>
                    <div className="p-4 border rounded-md space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overview</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value ?? ''} placeholder="Describe the key features, location advantages, and highlights of your property." className="min-h-32"/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="additionalInformation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Developer Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value ?? ''} placeholder="Any additional details, special features, or internal notes about the property." className="min-h-24"/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Separator/>

                  {/* Admin Only: Location Circle */}
                  {isAdmin && (
                      <Alert variant="default" className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-700" />
                        <AlertTitle className="text-amber-800 font-semibold">Admin Action Required: Assign Location Circle</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            This is a mandatory step for approving the listing.
                        </AlertDescription>
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="locationCircle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location Circle</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} 
                                  value={field.value || 'none'}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Assign to a location circle..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {locationCircles.map(circle => (
                                      <SelectItem key={circle.name} value={circle.name}>{circle.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {selectedCircleLocations.length > 0 && (
                                  <div className="pt-2">
                                    <FormDescription>Locations in this circle:</FormDescription>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedCircleLocations.map(loc => <Badge key={loc} variant="outline">{loc}</Badge>)}
                                    </div>
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Alert>
                  )}

                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-secondary/50">
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
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Submit')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    
      <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
             <DialogTitle>Image Preview</DialogTitle>
             <DialogDescription className="sr-only">A larger preview of the selected image.</DialogDescription>
           </DialogHeader>
          {previewImageUrl && (
                <div className="relative w-full h-full flex-grow">
                    <Image
                        src={previewImageUrl}
                        alt="Image Preview"
                        fill
                        className="object-contain"
                    />
                </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
