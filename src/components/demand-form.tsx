"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as React from "react";
import Image from "next/image";
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
import { useToast } from "@/hooks/use-toast";
import { demandSchema, type DemandSchema } from "@/lib/schema";
import { ClipboardList, User, MapPinned, Share2, MessageSquare, Search, Sparkles } from 'lucide-react';

export function DemandForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [demandId, setDemandId] = React.useState("");

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
    },
  });

  const companyNameValue = form.watch("companyName");

  React.useEffect(() => {
    const companyPart = (companyNameValue?.split(" ")[0] || "DEMAND").toUpperCase();
    const newId = `${companyPart}-${Date.now()}`;
    setDemandId(newId);
    form.setValue("demandId", newId);
  }, [companyNameValue, form]);

  const handleShare = async () => {
    const shareData = {
      title: 'Property Demand',
      text: `Looking for ${form.getValues('propertyType') || 'a property'} in ${form.getValues('location') || 'a specific area.'}`,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: 'Demand shared successfully!' });
      } else {
        await navigator.clipboard.writeText(`${shareData.text} URL: ${shareData.url}`);
        toast({ title: 'Link copied to clipboard!' });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: 'Error sharing', description: 'Could not share the demand.' });
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Looking for ${form.getValues('propertyType') || 'a property'} in ${form.getValues('location') || 'a specific area.'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  async function onSubmit(data: DemandSchema) {
    setIsLoading(true);
    // Simulate API call to log demand
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Demand Data:", data);
    toast({
      title: "Demand Logged Successfully!",
      description: `Your demand (ID: ${data.demandId}) has been logged.`,
    });
    setIsLoading(false);
    form.reset();
  }

  return (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPinned className="w-5 h-5 text-primary" /> Location</CardTitle>
                <CardDescription>Specify the desired location and search radius.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Image src="https://placehold.co/800x400.png" alt="Map placeholder" width={800} height={400} className="rounded-md object-cover" data-ai-hint="map location" />
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
                        Share
                    </Button>
                    <Button type="button" variant="outline" onClick={handleWhatsAppShare} className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        WhatsApp
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
                <Search className="mr-2 h-4 w-4" />
                Submit Match
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
