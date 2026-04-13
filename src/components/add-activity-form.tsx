
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import type { TransactionActivity, SiteVisitStatus } from '@/contexts/data-context';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';


type AddActivityFormProps = {
  leadId: string;
  onAddActivity: (data: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => void;
};

const activitySchema = z.object({
  activityType: z.enum(['Quote Requested', 'Site Visit Request', 'Site Visit Update', 'Customer Feedback', 'Tenant Improvements']),
  visitDateTime: z.date().optional(),
  message: z.string().optional(),
  status: z.enum(['Planned', 'Visited', 'Re-Scheduled', 'Cancelled']).optional(),
  notes: z.string().optional(),
  feedbackText: z.string().optional(),
  improvementsText: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export function AddActivityForm({ leadId, onAddActivity }: AddActivityFormProps) {
  const { user } = useAuth();
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityType: 'Quote Requested',
    },
  });
  
  const activityType = form.watch('activityType');

  const onSubmit = (data: ActivityFormValues) => {
    if (!user) return;
    
    const activityData = {
      leadId,
      activityType: data.activityType,
      details: {
        visitDateTime: data.visitDateTime?.toISOString(),
        message: data.message,
        status: data.status,
        notes: data.notes,
        feedbackText: data.feedbackText,
        improvementsText: data.improvementsText,
      },
      createdBy: user.email,
    };
    onAddActivity(activityData);
    form.reset({
      activityType: 'Quote Requested',
      visitDateTime: undefined,
      message: '',
      status: undefined,
      notes: '',
      feedbackText: '',
      improvementsText: '',
    });
  };

  const renderFormFields = () => {
    switch(activityType) {
      case 'Quote Requested':
        return (
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message to Developer <span className="text-xs text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Please provide current rent per sq ft, security deposit and lease tenure for this property." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'Site Visit Request':
        return (
          <>
            <FormField
              control={form.control}
              name="visitDateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Visit Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Provider</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Please confirm availability for a site visit." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'Site Visit Update':
         return (
             <>
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Visit Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="Visited">Visited</SelectItem>
                            <SelectItem value="Re-Scheduled">Re-Scheduled</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Add any notes about the visit status..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             </>
         );
      case 'Customer Feedback':
        return (
             <FormField
              control={form.control}
              name="feedbackText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback from Customer</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the customer's feedback here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        );
      case 'Tenant Improvements':
        return (
             <FormField
              control={form.control}
              name="improvementsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Tenant Improvements</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List any improvements or modifications requested by the tenant..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        );
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Activity</CardTitle>
        <CardDescription>Log activities at each stage — quote request, site visit, feedback, and fit-out requirements.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Quote Requested">Request Formal Quote</SelectItem>
                      <SelectItem value="Site Visit Request">Site Visit Request</SelectItem>
                      <SelectItem value="Site Visit Update">Site Visit Update</SelectItem>
                      <SelectItem value="Customer Feedback">Customer Feedback</SelectItem>
                      <SelectItem value="Tenant Improvements">Tenant Improvements</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {renderFormFields()}
            <div className="flex justify-end pt-4">
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
