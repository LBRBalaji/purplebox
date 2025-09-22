
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
import type { RegisteredLead, RegisteredLeadProvider, User, ListingSchema } from '@/contexts/data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderLeads } from '@/components/provider-leads';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/data-context';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const providerSelectionSchema = z.object({
  providerEmail: z.string().email(),
  listingIds: z.array(z.string()).min(1, 'At least one property must be selected for this provider.').max(3, 'You can select a maximum of 3 properties.'),
});

const leadRegistrationSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  leadName: z.string().min(1, 'Lead/Company name is required.'),
  leadContact: z.string().min(1, 'Contact person name is required.'),
  leadEmail: z.string().email('Invalid email address.'),
  leadPhone: z.string().min(1, 'Phone number is required.'),
  requirementsSummary: z.string().min(10, 'Please provide a brief summary of requirements.'),
  location: z.string().optional(),
  size: z.coerce.number().optional(),
  possession: z.string().optional(),
  providers: z.array(providerSelectionSchema).min(1, 'At least one provider must be selected.'),
});

type LeadRegistrationFormValues = z.infer<typeof leadRegistrationSchema>;

function RegisterLeadForm() {
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { addRegisteredLead, listings, registeredLeads } = useData();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [customerPopoverOpen, setCustomerPopoverOpen] = React.useState(false);
  const isAgent = user?.role === 'Agent';
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';

  const prefillLeadId = searchParams.get('prefillFromLead');

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
      location: '',
      size: undefined,
      possession: 'Immediate',
      providers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "providers"
  });
  
  const locationValue = form.watch('location');

  React.useEffect(() => {
    if (prefillLeadId && user) {
        const leadToPrefill = registeredLeads.find(l => l.id === prefillLeadId);
        if (leadToPrefill) {
            form.reset({
                ...form.getValues(),
                id: `LDR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                // Prefill impersonal lead details
                customerId: leadToPrefill.customerId,
                leadName: leadToPrefill.leadName,
                requirementsSummary: leadToPrefill.requirementsSummary,
                // Use the logged-in ADMIN/AGENT's contact details as the point of contact for the provider.
                leadContact: user.userName,
                leadEmail: user.email,
                leadPhone: user.phone,
                providers: [], 
            });
        }
    } else if (!form.getValues('id')) {
      form.setValue('id', `LDR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
  }, [form, prefillLeadId, registeredLeads, user]);


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

    // CRITICAL FIX: The logged-in admin/agent is the point of contact in a brokered deal
    if (user && (isAdmin || isAgent)) {
        form.setValue('leadContact', user.userName);
        form.setValue('leadEmail', user.email);
        form.setValue('leadPhone', user.phone);
    }
    
    setCustomerPopoverOpen(false);
  };

  const onSubmit = (data: LeadRegistrationFormValues) => {
    if (!user) return;

    const leadProviders: RegisteredLeadProvider[] = data.providers.map(p => ({
      providerEmail: p.providerEmail,
      properties: p.listingIds.map(id => ({ listingId: id, status: 'Pending' }))
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
      // For SuperAdmin/O2O, if the lead was prefilled, it's a brokered deal.
      isO2OCollaborator: (isAdmin && !!prefillLeadId), 
    };

    addRegisteredLead(newLead, user?.email);

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
      location: '',
      size: undefined,
      possession: 'Immediate',
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
                {isAdmin || isAgent ? (
                    prefillLeadId ? (
                         <FormField control={form.control} name="leadName" render={({ field }) => ( <FormItem><FormLabel>Lead / Company Name</FormLabel><FormControl><Input placeholder="Enter company name" {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
                    ) : (
                         <FormField control={form.control} name="customerId" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Lead / Company Name (Select Existing Customer)</FormLabel>
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
                            </CommandGroup></CommandList></Command></PopoverContent></Popover>
                             <FormDescription className="text-xs">Select an existing customer to pre-fill their details. The logged-in admin/agent will be the contact person.</FormDescription>
                        </FormItem>
                    )}
                )) : (
                     <FormField control={form.control} name="leadName" render={({ field }) => ( <FormItem><FormLabel>Lead / Company Name</FormLabel><FormControl><Input placeholder="Enter company name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="leadContact" render={({ field }) => ( <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder={"Your Name (as contact)"} {...field} disabled={isAdmin || isAgent} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="leadPhone" render={({ field }) => ( <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder={"Your Phone (as contact)"} {...field} disabled={isAdmin || isAgent} /></FormControl><FormMessage /></FormItem>)} />
             </div>
             <FormField control={form.control} name="leadEmail" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder={"Your Email (as contact)"} {...field} disabled={isAdmin || isAgent} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="requirementsSummary" render={({ field }) => ( <FormItem><FormLabel>Requirements Summary</FormLabel><FormControl><Textarea placeholder="Briefly describe the lead's requirements..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            {(isAgent || isAdmin) && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. Oragadam, Chennai" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="size" render={({ field }) => ( <FormItem><FormLabel>Size (Sq. Ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g. 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="possession" render={({ field }) => (<FormItem><FormLabel>Possession</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="within 45 days">Within 45 days</SelectItem>
                        <SelectItem value="3 months">3 months</SelectItem>
                        <SelectItem value="BTS">BTS</SelectItem>
                     </SelectContent></Select></FormItem>)} />
                 </div>
            )}

            <div className="space-y-4">
                <FormLabel>Providers and their Properties</FormLabel>
                 {fields.map((field, index) => {
                    const providerEmail = form.watch(`providers.${index}.providerEmail`);
                    const selectedListings = form.watch(`providers.${index}.listingIds`) || [];
                    const filteredProviderListings = approvedListings.filter(l => 
                      l.developerId === providerEmail &&
                      (!locationValue || l.location.toLowerCase().includes(locationValue.toLowerCase()))
                    );
                    const canSelectMore = selectedListings.length < 3;

                    return (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-end gap-4">
                                <FormField control={form.control} name={`providers.${index}.providerEmail`} render={({ field }) => (
                                    <FormItem className="flex-grow"><FormLabel>Provider</FormLabel>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue(`providers.${index}.listingIds`, []);
                                    }} value={field.value}><FormControl><SelectTrigger>
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
                                    <FormLabel>Select Properties for this Provider (Max 3)</FormLabel>
                                    <FormControl>
                                        <div className="p-3 border rounded-md max-h-48">
                                            <ScrollArea className="h-full">
                                                {providerEmail ? (
                                                    filteredProviderListings.length > 0 ? filteredProviderListings.map(listing => (
                                                    <div key={listing.listingId} className="flex items-center justify-between space-x-2 p-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${field.name}-${listing.listingId}`}
                                                                checked={field.value?.includes(listing.listingId)}
                                                                onCheckedChange={(checked) => {
                                                                    const currentValue = field.value || [];
                                                                    if (checked) {
                                                                        if (canSelectMore) {
                                                                            return field.onChange([...currentValue, listing.listingId]);
                                                                        }
                                                                    } else {
                                                                        return field.onChange(currentValue.filter((id) => id !== listing.listingId));
                                                                    }
                                                                }}
                                                                disabled={!canSelectMore && !field.value?.includes(listing.listingId)}
                                                            />
                                                            <label htmlFor={`${field.name}-${listing.listingId}`} className={cn("text-sm font-medium leading-none cursor-pointer", !canSelectMore && !field.value?.includes(listing.listingId) && "text-muted-foreground")}>
                                                                {listing.listingId} - {listing.name} <span className="text-muted-foreground">({listing.location} - {listing.sizeSqFt.toLocaleString()} sq. ft.)</span>
                                                            </label>
                                                        </div>
                                                        <Button asChild variant="ghost" size="icon">
                                                            <Link href={`/listings/${listing.listingId}`} target="_blank">
                                                                <Eye className="h-4 w-4"/>
                                                                <span className="sr-only">View Listing</span>
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )) : <p className="text-sm text-muted-foreground p-2">No listings match the specified location. Try changing the location or clearing it to see all listings.</p>
                                                ) : <p className="text-sm text-muted-foreground p-2">Please select a provider first.</p>}
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillFromLead = searchParams.get('prefillFromLead');

  const isAgent = user?.role === 'Agent';
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  
  const [activeTab, setActiveTab] = React.useState(prefillFromLead ? 'register' : 'activity');
  
  React.useEffect(() => {
    if (prefillFromLead && isSuperAdmin) {
        setActiveTab('register');
        // Clean the URL parameter after setting the tab
        router.replace('/dashboard/transactions', { scroll: false });
    }
  }, [prefillFromLead, router, isSuperAdmin]);

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Transactions</h2>
            <p className="text-muted-foreground mt-2">
              {isAgent
                ? 'Register new business leads or manage the activity for existing ones.'
                : 'Manage ongoing brokered transactions and register new business leads.'
              }
            </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">
                    {isAgent ? 'My Registered Leads' : (isSuperAdmin ? 'Transactions on Broking' : 'My Acknowledged Leads')}
                </TabsTrigger>
                <TabsTrigger value="register">Register New Lead</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-6">
                <ProviderLeads view={isSuperAdmin ? 'broking' : 'default'} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
                <RegisterLeadForm />
            </TabsContent>
        </Tabs>
      </div>
  );
}

    