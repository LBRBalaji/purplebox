
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { Check, ChevronsUpDown, UserPlus, X, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RegisteredLead, RegisteredLeadProvider, User } from '@/contexts/data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderLeads } from '@/components/provider-leads';

const leadRegistrationSchema = z.object({
  id: z.string(),
  // customerId is optional for agent-created leads where the customer might not be in the system yet.
  customerId: z.string().optional(), 
  leadName: z.string().min(1, 'Lead/Company name is required.'),
  leadContact: z.string().min(1, 'Contact person name is required.'),
  leadEmail: z.string().email('Invalid email address.'),
  leadPhone: z.string().min(1, 'Phone number is required.'),
  requirementsSummary: z.string().min(10, 'Please provide a brief summary of requirements.'),
  providerEmails: z.array(z.string().email()).min(1, 'At least one provider must be selected.'),
});

type LeadRegistrationFormValues = z.infer<typeof leadRegistrationSchema>;

function RegisterLeadForm() {
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { addRegisteredLead } = useData();
  const { toast } = useToast();
  const [providerPopoverOpen, setProviderPopoverOpen] = React.useState(false);
  const [customerPopoverOpen, setCustomerPopoverOpen] = React.useState(false);

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
      providerEmails: [],
    },
  });

  React.useEffect(() => {
    // Auto-generate transaction ID on component mount for a new form
    if (!form.getValues('id')) {
      form.setValue('id', `LDR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
  }, [form]);

  const providers = React.useMemo(() => 
    Object.values(users).filter(u => u.role === 'Warehouse Developer'),
    [users]
  );
  
  const customers = React.useMemo(() =>
    Object.values(users).filter(u => u.role === 'User'),
    [users]
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
    
    const leadProviders: RegisteredLeadProvider[] = data.providerEmails.map(email => ({
      providerEmail: email,
      status: 'Pending',
    }));

    const newLead: Omit<RegisteredLead, 'registeredAt'> = {
      id: data.id,
      // For agent-created leads, customerId might be the email they entered if it's a new customer
      customerId: data.customerId || data.leadEmail,
      leadName: data.leadName,
      leadContact: data.leadContact,
      leadEmail: data.leadEmail,
      leadPhone: data.leadPhone,
      requirementsSummary: data.requirementsSummary,
      registeredBy: user.email,
      providers: leadProviders,
    };
    
    addRegisteredLead(newLead);
    
    toast({
      title: 'Lead Registered Successfully!',
      description: `${data.leadName} has been registered with ${data.providerEmails.length} provider(s).`,
    });

    form.reset({
      id: `LDR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      customerId: '',
      leadName: '',
      leadContact: '',
      leadEmail: '',
      leadPhone: '',
      requirementsSummary: '',
      providerEmails: [],
    });
  };
  
  const isAgent = user?.role === 'Agent';

  if (isAuthLoading) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Lead with Providers</CardTitle>
        <CardDescription>
          Use this form to officially register a new business lead with one or more property providers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                            <Input {...field} disabled />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                {isAgent ? (
                     <FormField
                        control={form.control}
                        name="leadName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Lead / Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Lead / Company Name</FormLabel>
                        <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? customers.find(c => c.email === field.value)?.companyName
                                    : "Select a customer"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search customers..." />
                                <CommandList>
                                    <CommandEmpty>No customers found.</CommandEmpty>
                                    <CommandGroup>
                                    {customers.map((customer) => (
                                        <CommandItem
                                            value={`${customer.companyName} ${customer.userName} ${customer.email}`}
                                            key={customer.email}
                                            onSelect={() => handleCustomerSelect(customer)}
                                        >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === customer.email ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div>
                                                <p>{customer.companyName}</p>
                                                <p className="text-xs text-muted-foreground">{customer.userName}</p>
                                            </div>
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="leadContact"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                        <Input placeholder={isAgent ? "Enter contact name" : "Auto-filled from selection"} {...field} disabled={!isAgent && !!form.watch('customerId')} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="leadPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                        <Input placeholder={isAgent ? "Enter phone number" : "Auto-filled from selection"} {...field} disabled={!isAgent && !!form.watch('customerId')} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
             </div>
             <FormField
                control={form.control}
                name="leadEmail"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder={isAgent ? "Enter email address" : "Auto-filled from selection"} {...field} disabled={!isAgent && !!form.watch('customerId')} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="requirementsSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe the lead's requirements (e.g., 50,000 sq.ft. warehouse in Oragadam, immediate occupancy)."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="providerEmails"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Property Providers</FormLabel>
                  <Popover open={providerPopoverOpen} onOpenChange={setProviderPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length > 0 ? `${field.value.length} selected` : "Select providers"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search providers..." />
                        <CommandList>
                            <CommandEmpty>No providers found.</CommandEmpty>
                            <CommandGroup>
                            {providers.map((provider) => (
                                <CommandItem
                                value={provider.companyName}
                                key={provider.email}
                                onSelect={() => {
                                    const currentValues = field.value || [];
                                    const newValue = currentValues.includes(provider.email)
                                        ? currentValues.filter(v => v !== provider.email)
                                        : [...currentValues, provider.email];
                                    field.onChange(newValue);
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.includes(provider.email)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                />
                                 <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                                {provider.companyName} ({provider.userName})
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The lead will be registered with these providers.
                  </FormDescription>
                   <div className="pt-2 flex flex-wrap gap-2">
                    {field.value?.map((email) => {
                      const provider = providers.find(p => p.email === email);
                      return (
                        <Badge key={email} variant="secondary" className="gap-1">
                          {provider?.companyName || email}
                          <button
                            type="button"
                            className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                            onClick={() => field.onChange(field.value?.filter(v => v !== email))}
                          >
                            <X className="h-3 w-3"/>
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit">
                <UserPlus className="mr-2 h-4 w-4"/>
                Register Lead
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}


export default function TransactionsPage() {
  const { user } = useAuth();
  const isAgent = user?.role === 'Agent';

  return (
    <main className="container mx-auto p-4 md:p-8">
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
    </main>
  );
}
