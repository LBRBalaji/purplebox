

'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, UserPlus, X, Building, Warehouse, PlusCircle, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RegisteredLead, RegisteredLeadProvider, User, ListingSchema, RegisteredLeadProperty } from '@/contexts/data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderLeads } from '@/components/provider-leads';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/data-context';
import Link from 'next/link';

const providerSelectionSchema = z.object({
  providerEmail: z.string().email(),
  properties: z.array(z.object({
    listingId: z.string(),
    status: z.enum(['Pending', 'Acknowledged', 'Rejected']),
  })).min(1, 'At least one property must be selected for this provider.'),
});

const leadRegistrationSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  leadName: z.string().min(1, 'Lead/Company name is required.'),
  leadContact: z.string().min(1, 'Contact person name is required.'),
  leadEmail: z.string().email('Invalid email address.'),
  leadPhone: z.string().min(1, 'Phone number is required.'),
  requirementsSummary: z.string().min(10, 'Please provide a brief summary of requirements.'),
  providers: z.array(z.object({
      providerEmail: z.string().email("Please select a provider."),
      listingIds: z.array(z.string()).min(1, "At least one property must be selected.").max(3, "You can select a maximum of 3 properties."),
  })).min(1, 'At least one provider must be selected.'),
  location: z.string().optional(),
  size: z.coerce.number().optional(),
  possession: z.enum(['Immediate', 'within 45 days', '3 months', 'BTS']).optional(),
});

type LeadRegistrationFormValues = z.infer<typeof leadRegistrationSchema>;

function RegisterLeadForm() {
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { addRegisteredLead, listings } = useData();
  const { toast } = useToast();
  const [customerPopoverOpen, setCustomerPopoverOpen] = React.useState(false);
  const isAgent = user?.role === 'Agent';

  const form = useForm<LeadRegistrationFormValues>({
    resolver: zodResolver(leadRegistrationSchema),
    defaultValues: {
      id: '',
      customerId: '',
      leadName: '',
      leadContact: '',
      leadEmail: '',
      leadPhone: '',
      requirementsSummary: '',
      providers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "providers"
  });

  const watchLocation = form.watch('location');

  React.useEffect(() => {
    if (!form.getValues('id')) {
      form.setValue('id', `LDR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
  }, [form]);

  const allProviders = React.useMemo(() =>
    Object.values(users).filter(u => u.role === 'Warehouse Developer'),
    [users]
  );

  const customers = React.useMemo(() =>
    Object.values(users).filter(u => u.role === 'User'),
    [users]
  );

  const approvedListings = React.useMemo(() =>
    listings.filter(l => l.status === 'approved'),
    [listings]
  );

  const handleCustomerSelect = (customer: User) => {
    form.setValue('customerId', customer.email);
    form.setValue('leadName', customer.companyName);
    form.setValue('leadContact', customer.userName);
    form.setValue('leadEmail', customer.email);
    form.setValue('leadPhone', customer.phone);
    setCustomerPopoverOpen(false);
  };

  const onSubmit = (data: LeadRegistrationFormValues) => {
    if (!user) return;

    const leadProviders: RegisteredLeadProvider[] = data.providers.map(p => ({
      providerEmail: p.providerEmail,
      properties: p.listingIds.map(id => ({ listingId: id, status: 'Pending' })),
    }));

    const newLead: Omit<RegisteredLead, 'registeredAt'> = {
      id: data.id,
      customerId: data.customerId || data.leadEmail,
      leadName: data.leadName,
      leadContact: data.leadContact,
      leadEmail: data.leadEmail,
      leadPhone: data.leadPhone,
      requirementsSummary: data.requirementsSummary,
      registeredBy: user.email,
      providers: leadProviders,
    };

    addRegisteredLead(newLead, user.email);

    toast({
      title: 'Lead Registered Successfully!',
      description: `${data.leadName} has been registered with ${data.providers.length} provider(s).`,
    });

    form.reset({
      id: `LDR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      customerId: '',
      leadName: '',
      leadContact: '',
      leadEmail: '',
      leadPhone: '',
      requirementsSummary: '',
      providers: [],
    });
  };

  if (isAuthLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Lead with Providers</CardTitle>
        <CardDescription>
          Use this form to officially register a new business lead with one or more property providers and their specific properties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>Transaction ID</FormLabel><FormControl><Input {...field} disabled /></FormControl></FormItem>)} />
                {isAgent ? (
                     <FormField control={form.control} name="leadName" render={({ field }) => ( <FormItem><FormLabel>Lead / Company Name</FormLabel><FormControl><Input placeholder="Enter company name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                ) : (
                    <FormField control={form.control} name="customerId" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Lead / Company Name</FormLabel>
                        <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                            {field.value ? customers.find(c => c.email === field.value)?.companyName : "Select a customer"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                        </FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command>
                            <CommandInput placeholder="Search customers..." /><CommandList><CommandEmpty>No customers found.</CommandEmpty><CommandGroup>
                            {customers.map((customer) => (
                                <CommandItem value={`${customer.companyName} ${customer.userName} ${customer.email}`} key={customer.email} onSelect={() => handleCustomerSelect(customer)}>
                                    <Check className={cn("mr-2 h-4 w-4", field.value === customer.email ? "opacity-100" : "opacity-0")} />
                                    <div><p>{customer.companyName}</p><p className="text-xs text-muted-foreground">{customer.userName}</p></div>
                                </CommandItem>
                            ))}
                            </CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )} />
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="leadContact" render={({ field }) => ( <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder={isAgent ? "Enter contact name" : "Auto-filled"} {...field} disabled={!isAgent && !!form.watch('customerId')} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="leadPhone" render={({ field }) => ( <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder={isAgent ? "Enter phone number" : "Auto-filled"} {...field} disabled={!isAgent && !!form.watch('customerId')} /></FormControl><FormMessage /></FormItem>)} />
             </div>
             <FormField control={form.control} name="leadEmail" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder={isAgent ? "Enter email" : "Auto-filled"} {...field} disabled={!isAgent && !!form.watch('customerId')} /></FormControl><FormMessage /></FormItem> )} />
            
             {isAgent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. Chennai" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="size" render={({ field }) => (<FormItem><FormLabel>Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="possession" render={({ field }) => (
                      <FormItem><FormLabel>Possession</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="Immediate">Immediate</SelectItem>
                              <SelectItem value="within 45 days">Within 45 days</SelectItem>
                              <SelectItem value="3 months">3 months</SelectItem>
                              <SelectItem value="BTS">BTS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
             )}

            <FormField control={form.control} name="requirementsSummary" render={({ field }) => ( <FormItem><FormLabel>Requirements Summary</FormLabel><FormControl><Textarea placeholder="Briefly describe the lead's requirements..." {...field} /></FormControl><FormMessage /></FormItem>)} />

            <div className="space-y-4">
                <FormLabel>Providers and their Properties</FormLabel>
                 {fields.map((field, index) => {
                    const selectedProviderEmail = form.watch(`providers.${index}.providerEmail`);
                    const providerListings = approvedListings.filter(l => 
                        l.developerId === selectedProviderEmail &&
                        (!watchLocation || l.location.toLowerCase().includes(watchLocation.toLowerCase()))
                    );
                    const selectedCount = form.watch(`providers.${index}.listingIds`)?.length || 0;

                    return (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-end gap-4">
                                <FormField control={form.control} name={`providers.${index}.providerEmail`} render={({ field }) => (
                                    <FormItem className="flex-grow"><FormLabel>Provider</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger>
                                        <SelectValue placeholder="Select a provider" />
                                    </SelectTrigger></FormControl><SelectContent>
                                        {allProviders.map(p => <SelectItem key={p.email} value={p.email}>{p.companyName}</SelectItem>)}
                                    </SelectContent></Select><FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                            <FormField control={form.control} name={`providers.${index}.listingIds`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Properties for this Provider ({selectedCount}/3)</FormLabel>
                                    <FormControl>
                                        <div className="p-3 border rounded-md max-h-48">
                                            <ScrollArea className="h-full">
                                                {providerListings.length > 0 ? providerListings.map(listing => (
                                                    <div key={listing.listingId} className="flex items-center justify-between space-x-2 p-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${field.name}-${listing.listingId}`}
                                                                checked={field.value?.includes(listing.listingId)}
                                                                onCheckedChange={(checked) => {
                                                                    const isSelected = field.value?.includes(listing.listingId);
                                                                    if (!isSelected && selectedCount >= 3) {
                                                                        toast({
                                                                            variant: "destructive",
                                                                            title: "Selection Limit Reached",
                                                                            description: "You can only select up to 3 properties per provider.",
                                                                        });
                                                                        return;
                                                                    }
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), listing.listingId])
                                                                        : field.onChange(field.value?.filter((id) => id !== listing.listingId))
                                                                }}
                                                            />
                                                            <label htmlFor={`${field.name}-${listing.listingId}`} className="text-sm font-medium leading-none cursor-pointer">
                                                                {listing.name} <span className="text-muted-foreground">({listing.location})</span>
                                                            </label>
                                                        </div>
                                                        <Button asChild variant="ghost" size="icon">
                                                            <Link href={`/listings/${listing.listingId}`} target="_blank">
                                                                <Eye className="h-4 w-4"/>
                                                                <span className="sr-only">View Listing</span>
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )) : <p className="text-sm text-muted-foreground p-2">No listings found for this provider {watchLocation ? `in "${watchLocation}"` : ''}. Add properties in 'My Listings' or clear the location filter.</p>}
                                            </ScrollArea>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ providerEmail: '', listingIds: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Provider</Button>
            </div>
            <div className="flex justify-end pt-4"><Button type="submit"><UserPlus className="mr-2 h-4 w-4"/>Register Lead</Button></div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function TransactionsPage() {
  const { user } = useAuth();
  const isAgent = user?.role === 'Agent';

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Transactions</h2>
            <p className="text-muted-foreground mt-2">
              {isAgent
                ? 'Register new business leads or manage the activity for existing ones.'
                : 'Manage ongoing transactions and register new business leads.'
              }
            </p>
        </div>
        <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">
                    {isAgent ? 'My Registered Leads' : 'Transaction Activity'}
                </TabsTrigger>
                <TabsTrigger value="register">Register New Lead</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-6">
                <ProviderLeads />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
                <RegisterLeadForm />
            </TabsContent>
        </Tabs>
      </div>
  );
}
