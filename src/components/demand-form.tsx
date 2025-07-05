"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { demandSchema, type DemandSchema } from "@/lib/schema";
import { logAndImproveDemandAction } from "@/lib/actions";
import { ClipboardList, User, MapPinned, Share2, Sparkles, Copy, Check, Info, Send, Star } from 'lucide-react';
import DemandMapWrapper from "./demand-map";
import { Checkbox } from "./ui/checkbox";

const priorityItems = [
    { id: 'propertyType', label: 'Property Type' },
    { id: 'size', label: 'Size' },
    { id: 'location', label: 'Location & Radius' },
    { id: 'ceilingHeight', label: 'Ceiling Height' },
    { id: 'docks', label: 'Number of Docks' },
];

export function DemandForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [demandId, setDemandId] = React.useState("");
  const [improvedDescription, setImprovedDescription] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

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
      radius: "",
      size: "",
      ceilingHeight: "",
      docks: "",
      description: "",
      preferences: {
        nonCompromisable: [],
      }
    },
  });

  const companyNameValue = form.watch("companyName");

  React.useEffect(() => {
    if (companyNameValue) {
      const companyPart = (companyNameValue.split(" ")[0] || "DEMAND").toUpperCase();
      const newId = `${companyPart}-${Date.now()}`;
      setDemandId(newId);
      form.setValue("demandId", newId);
    }
  }, [companyNameValue, form]);

  const handleShare = async () => {
    const data = form.getValues();
    const text = `Property Demand Alert!\n\nLooking for: ${data.propertyType}\nSize: ${data.size} Sq. Ft.\nLocation: ${data.location} (within ${data.radius} km)\n\nDescription: ${data.description}`;
    const shareData = {
      title: `Property Demand: ${data.propertyType} in ${data.location}`,
      text: text,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: 'Demand shared successfully!' });
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\nURL: ${shareData.url}`);
        toast({ title: 'Demand details copied to clipboard!' });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: 'Error sharing', description: 'Could not share the demand.' });
    }
  };
  
  async function onSubmit(data: DemandSchema) {
    setIsLoading(true);
    try {
      const result = await logAndImproveDemandAction(data);
      if (result.error) {
        throw new Error(result.error);
      }
      setImprovedDescription(result.improvedDescription || "No description generated.");
      setIsDialogOpen(true);
      toast({
        title: "Demand Logged & Improved!",
        description: `Your demand (ID: ${data.demandId}) has been processed.`,
      });
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

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedDescription);
    setIsCopied(true);
    toast({ title: 'Description copied to clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Demand Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="demandId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demand ID</FormLabel>
                        <FormControl><Input {...field} disabled /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="propertyType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Required Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Industrial Building">Industrial Building</SelectItem>
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                            <SelectItem value="Retail Showroom">Retail Showroom</SelectItem>
                            <SelectItem value="Office Space">Office Space</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Size Required (Sq. Ft.)</FormLabel>
                          <FormControl><Input placeholder="e.g. 50000" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="ceilingHeight" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Min. Ceiling Height (ft)</FormLabel>
                          <FormControl><Input placeholder="e.g. 30" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="docks" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Min. Number of Docks</FormLabel>
                          <FormControl><Input placeholder="e.g. 4" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                  />
                </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> Demand Description</CardTitle></CardHeader>
                  <CardContent>
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe your requirements</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., 'We need a 50,000 sq ft warehouse with high ceilings for storing industrial equipment. Must be located within 10km of the main highway and have at least 4 loading docks...'" className="min-h-[120px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPinned className="w-5 h-5 text-primary" /> Location</CardTitle>
                  <CardDescription>Search for a location or click on the map, then specify the search radius.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          <FormControl><Input placeholder="e.g. 10" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> User Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userName" render={({ field }) => (<FormItem><FormLabel>User Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="userEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Requirement Priorities</CardTitle>
                  <CardDescription>Select items that are non-negotiable for your demand.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="preferences.nonCompromisable"
                    render={() => (
                      <FormItem className="space-y-3">
                        {priorityItems.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="preferences.nonCompromisable"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValue, item.id])
                                          : field.onChange(
                                              currentValue.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5 text-primary" /> Share Demand</CardTitle></CardHeader>
                  <CardContent className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={handleShare} className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share via Social Media
                      </Button>
                  </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Demand
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>AI-Improved Demand Description</DialogTitle>
                <DialogDescription>
                    We've enhanced your demand description using AI. You can copy it or use it to find matches.
                </DialogDescription>
            </DialogHeader>
            <div className="relative mt-4">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-md whitespace-pre-wrap min-h-[150px]">
                      {improvedDescription}
                  </p>
            </div>
            <DialogFooter className="sm:justify-between items-center gap-4">
                <p className="text-xs text-muted-foreground">ID: {form.getValues("demandId")}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                  <Button variant="default" disabled>
                      <Send className="mr-2 h-4 w-4" />
                      Find Matches (Coming Soon)
                  </Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
