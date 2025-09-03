
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
import { Check, ChevronsUpDown, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RegisteredLead, RegisteredLeadProvider } from '@/contexts/data-context';

const leadRegistrationSchema = z.object({
  leadName: z.string().min(1, 'Lead/Company name is required.'),
  leadContact: z.string().min(1, 'Contact person name is required.'),
  leadEmail: z.string().email('Invalid email address.'),
  leadPhone: z.string().min(1, 'Phone number is required.'),
  requirementsSummary: z.string().min(10, 'Please provide a brief summary of requirements.'),
  providerEmails: z.array(z.string().email()).min(1, 'At least one provider must be selected.'),
});

type LeadRegistrationFormValues = z.infer<typeof leadRegistrationSchema>;

export default function RegisterLeadPage() {
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { addRegisteredLead } = useData();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<LeadRegistrationFormValues>({
    resolver: zodResolver(leadRegistrationSchema),
    defaultValues: {
      leadName: '',
      leadContact: '',
      leadEmail: '',
      leadPhone: '',
      requirementsSummary: '',
      providerEmails: [],
    },
  });

  const providers = React.useMemo(() => 
    Object.values(users).filter(u => u.role === 'SuperAdmin' && u.email !== 'admin@example.com'),
    [users]
  );
  
  const onSubmit = (data: LeadRegistrationFormValues) => {
    if (!user) return;
    
    const leadProviders: RegisteredLeadProvider[] = data.providerEmails.map(email => ({
      providerEmail: email,
      status: 'Pending',
    }));

    const newLead: Omit<RegisteredLead, 'id' | 'registeredAt'> = {
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

    form.reset();
  };

  if (isAuthLoading) {
    return null;
  }
  
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
                <FormField
                  control={form.control}
                  name="leadName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead / Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ACME Logistics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="leadContact"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
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
                            <Input placeholder="+91..." {...field} />
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
                            <Input type="email" placeholder="contact@company.com" {...field} />
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
                      <Popover open={open} onOpenChange={setOpen}>
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
      </div>
    </main>
  );
}
