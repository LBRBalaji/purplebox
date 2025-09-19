
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { layoutRequestSchema, type LayoutRequestData } from '@/lib/schema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, ShieldCheck } from 'lucide-react';
import { useData } from '@/contexts/data-context';

type LayoutRequestDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingName: string;
  onSubmit: (request: LayoutRequestData) => void;
};

export function LayoutRequestDialog({ isOpen, onOpenChange, listingId, listingName, onSubmit }: LayoutRequestDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<LayoutRequestData>({
    resolver: zodResolver(layoutRequestSchema),
    defaultValues: {
      listingId,
      listingName,
      userName: '',
      department: '',
      title: '',
      mobile: '',
      agreement: false,
    },
  });

  React.useEffect(() => {
    if (user) {
      form.setValue('userName', user.userName);
      form.setValue('mobile', user.phone);
    }
  }, [user, form]);
  
  React.useEffect(() => {
    if (isOpen) {
        form.reset({
            listingId,
            listingName,
            userName: user?.userName || '',
            department: '',
            title: '',
            mobile: user?.phone || '',
            agreement: false,
        })
    }
  }, [isOpen, listingId, listingName, user, form]);

  const handleFormSubmit = (data: LayoutRequestData) => {
    onSubmit(data);
    toast({
      title: 'Request Submitted Successfully!',
      description: `Your request for the layout of "${data.listingName}" has been sent to our team. We will get back to you shortly.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
           <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
            </div>
          <DialogTitle className="text-center text-xl">Request for Warehouse Layout</DialogTitle>
          <DialogDescription className="text-center">
            To receive a copy of the layout for "{listingName}", please provide your details and agree to the terms below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Title / Designation</FormLabel>
                        <FormControl><Input placeholder="e.g., Supply Chain Manager" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl><Input placeholder="e.g., Logistics" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            
            <Alert variant="default" className="bg-secondary/50">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle className="font-semibold">Terms of Engagement</AlertTitle>
                <AlertDescription className="text-xs">
                    By submitting this request, you confirm your interest in this property for technical evaluation and agree to conduct any and all leasing activities exclusively through Lakshmi Balaji O2O.
                </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="agreement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms of engagement.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
