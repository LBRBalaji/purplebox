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
import { propertySchema, type PropertySchema } from "@/lib/schema";
import { generateDescriptionAction } from "@/lib/actions";
import { Building2, HandCoins, User, FileBadge, Plug, Flame, Truck, Images, Info, MapPin, Copy, Check, Sparkles } from 'lucide-react';
import { Skeleton } from "./ui/skeleton";


export function PropertyForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedDescription, setGeneratedDescription] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [propertyId, setPropertyId] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);

  const form = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyId: "",
      propertyGeoLocation: "",
      size: "",
      floor: "",
      readinessToOccupy: "Immediate",
      siteType: "Standalone",
      safety: "",
      ceilingHeight: "",
      rentPerSft: "",
      rentalSecurityDeposit: "",
      userType: "Agent",
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
      docks: "",
      canopy: "Installed",
      additionalInformation: "",
    },
  });

  const o2oDealDemandIdValue = form.watch('o2oDealDemandId');

  React.useEffect(() => {
    const newId = `PS-${Date.now()}`;
    setPropertyId(newId);
    form.setValue("propertyId", newId);
  }, [form]);

  React.useEffect(() => {
    const demandIdFromUrl = searchParams.get('demandId');
    if (demandIdFromUrl) {
      form.setValue('o2oDealDemandId', demandIdFromUrl, { shouldValidate: true });
    }
  }, [searchParams, form]);


  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          form.setValue("propertyGeoLocation", locationString, {
            shouldValidate: true,
          });
          toast({
            title: "Location Captured",
            description: `Set to: ${locationString}`,
          });
        },
        (error) => {
          console.error("Error getting location", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not retrieve your location.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported",
        description: "Geolocation is not supported by your browser.",
      });
    }
  };

  async function onSubmit(data: PropertySchema) {
    setIsLoading(true);
    try {
      const result = await generateDescriptionAction(data);
      if (result.error) {
        throw new Error(result.error);
      }
      setGeneratedDescription(result.description || "No description generated.");
      setIsDialogOpen(true);
    } catch (error) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormField control={form.control} name="propertyGeoLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geo Location</FormLabel>
                        <div className="flex gap-2">
                            <FormControl><Input placeholder="e.g. 13.0827, 80.2707" {...field} /></FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={handleGetLocation}><MapPin className="w-4 h-4"/></Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem><FormLabel>Size (Sq. Ft.)</FormLabel><FormControl><Input placeholder="e.g. 50000" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField control={form.control} name="floor" render={({ field }) => (
                      <FormItem><FormLabel>Floor</FormLabel><FormControl><Input placeholder="e.g. Ground Floor" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField control={form.control} name="readinessToOccupy" render={({ field }) => (
                      <FormItem><FormLabel>Readiness to Occupy</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Immediate">Immediate</SelectItem><SelectItem value="Within 3 months">Within 3 months</SelectItem><SelectItem value="Within 6 months">Within 6 months</SelectItem><SelectItem value="BTS">BTS</SelectItem></SelectContent></Select><FormMessage /></FormItem>
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
                      <FormItem><FormLabel>Ceiling Height (ft)</FormLabel><FormControl><Input placeholder="e.g. 30" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Commercials Section */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><HandCoins className="w-5 h-5 text-primary" /> Commercials</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent per Sq. Ft.</FormLabel><FormControl><Input placeholder="e.g. 25" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="rentalSecurityDeposit" render={({ field }) => (<FormItem><FormLabel>Security Deposit (months)</FormLabel><FormControl><Input placeholder="e.g. 6" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                    <FormField control={form.control} name="docks" render={({ field }) => (<FormItem><FormLabel>Number of Docks</FormLabel><FormControl><Input placeholder="e.g. 8" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                  <FormField control={form.control} name="userType" render={({ field }) => (<FormItem><FormLabel>User Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Developer">Developer</SelectItem><SelectItem value="Agent">Agent</SelectItem><SelectItem value="Owner">Owner</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userCompanyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userPhoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField
                    control={form.control}
                    name="o2oDealDemandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>O2O Deal Demand ID</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly={!!o2oDealDemandIdValue} />
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
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Description
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>AI-Generated Property Description</DialogTitle>
                <DialogDescription>
                    Here is the description generated by AI based on the details you provided. You can copy it for your listings.
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
                      {generatedDescription}
                  </p>
                </>
              )}
            </div>
            <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
