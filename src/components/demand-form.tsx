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
import { ClipboardList, User, MapPinned, Share2, Sparkles, Copy, Check, Info, Send } from 'lucide-react';

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
      description: ""
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <CardDescription>Specify the desired location and search radius.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative aspect-[2/1] w-full rounded-md bg-secondary flex items-center justify-center overflow-hidden border">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full stroke-current text-muted-foreground/20">
                        <defs>
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <path d="M 10,100 Q 150,20 300,100 T 600,100" strokeWidth="1" fill="none" className="stroke-current text-muted-foreground/30" />
                        <path d="M 10,150 Q 200,80 400,150 T 800,150" strokeWidth="1" fill="none" className="stroke-current text-muted-foreground/30" />
                      </svg>
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="hsl(var(--primary))"/>
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div 
                              className="border-2 border-dashed border-primary rounded-full animate-pulse"
                              style={{ width: '120px', height: '120px' }}>
                            </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-background/80 p-1.5 rounded-md text-xs text-muted-foreground">
                          Add Google Maps API key to enable map
                      </div>
                    </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl><Input placeholder="e.g. Chennai, India" {...field} /></FormControl>
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
                  Submit Match
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
