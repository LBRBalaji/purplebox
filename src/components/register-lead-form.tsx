'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { type RegisteredLead, type RegisteredLeadProvider } from '@/contexts/data-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronsUpDown, PlusCircle, UserPlus } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const registerLeadSchema = z.object({
  leadName: z.string().min(1, 'Customer Company Name is required.'),
  leadContact: z.string().min(1, 'Contact Name is required.'),
  leadEmail: z.string().email('A valid email is required.'),
  leadPhone: z.string().min(1, 'Phone number is required.'),
  requirementsSummary: z.string().min(10, 'Please provide a brief summary of the requirements.'),
  providerEmails: z.array(z.string()).min(1, 'At least one provider must be selected.'),
});

type RegisterLeadFormValues = z.infer<typeof registerLeadSchema>;

export function RegisterLeadForm() {
    const { user, users } = useAuth();
    const { addRegisteredLead } = useData();
    const { toast } = useToast();

    const form = useForm<RegisterLeadFormValues>({
        resolver: zodResolver(registerLeadSchema),
        defaultValues: {
            leadName: '',
            leadContact: '',
            leadEmail: '',
            leadPhone: '',
            requirementsSummary: '',
            providerEmails: [],
        },
    });

    const developers = React.useMemo(() => {
        return Object.values(users).filter(u => u.role === 'Warehouse Developer');
    }, [users]);

    const onSubmit = (data: RegisterLeadFormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to register a lead.' });
            return;
        }

        const providers: RegisteredLeadProvider[] = data.providerEmails.map(email => ({
            providerEmail: email,
            properties: [], // No specific properties are linked at this initial stage
        }));

        const newLead: Omit<RegisteredLead, 'registeredAt'> = {
            id: `LDR-${Date.now()}`,
            customerId: data.leadEmail,
            leadName: data.leadName,
            leadContact: data.leadContact,
            leadEmail: data.leadEmail,
            leadPhone: data.leadPhone,
            requirementsSummary: data.requirementsSummary,
            registeredBy: user.email,
            providers: providers,
            isO2OCollaborator: false, // O2O collaboration is determined by listing type, not here.
        };

        addRegisteredLead(newLead, user.email);

        toast({
            title: 'Lead Registered Successfully!',
            description: `The lead for ${data.leadName} has been registered with the selected providers.`,
        });

        form.reset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register New Business Lead</CardTitle>
                <CardDescription>
                    Use this form to officially register a new business lead with one or more property providers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="leadName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Company Name</FormLabel>
                                        <FormControl><Input placeholder="e.g. Acme Corp" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="leadContact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Contact Name</FormLabel>
                                        <FormControl><Input placeholder="e.g. John Smith" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="leadEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Email</FormLabel>
                                        <FormControl><Input type="email" placeholder="e.g. john.smith@acme.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="leadPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Phone</FormLabel>
                                        <FormControl><Input placeholder="e.g. +1 555 123 4567" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <FormField
                            control={form.control}
                            name="requirementsSummary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Requirements Summary</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide a summary of the customer's needs (e.g., '100,000 sq. ft. warehouse in Oragadam for e-commerce fulfillment, requires 10 docks, ready in 3 months.')."
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
                                    <FormLabel>Select Providers</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
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
                                                        {developers.map(dev => (
                                                            <CommandItem
                                                                key={dev.email}
                                                                onSelect={() => {
                                                                    const selected = field.value || [];
                                                                    const isSelected = selected.includes(dev.email);
                                                                    if (isSelected) {
                                                                        field.onChange(selected.filter(email => email !== dev.email));
                                                                    } else {
                                                                        field.onChange([...selected, dev.email]);
                                                                    }
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", field.value?.includes(dev.email) ? "opacity-100" : "opacity-0")} />
                                                                {dev.companyName}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="flex flex-wrap gap-1 pt-2">
                                        {field.value?.map(email => {
                                            const dev = developers.find(d => d.email === email);
                                            return <Badge key={email} variant="secondary">{dev?.companyName || email}</Badge>
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Register Lead
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
