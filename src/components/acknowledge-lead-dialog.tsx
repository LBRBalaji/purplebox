
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { acknowledgmentSchema, type AcknowledgmentDetails } from '@/lib/schema';
import type { RegisteredLead } from '@/contexts/data-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Handshake, UserCheck, AlertTriangle } from 'lucide-react';

type AcknowledgeLeadDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: RegisteredLead | null;
  onSubmit: (details: AcknowledgmentDetails) => void;
};

export function AcknowledgeLeadDialog({ isOpen, onOpenChange, lead, onSubmit }: AcknowledgeLeadDialogProps) {
  const { user } = useAuth();

  const form = useForm<AcknowledgmentDetails>({
    resolver: zodResolver(acknowledgmentSchema),
    defaultValues: {
      name: '',
      title: '',
      mobile: '',
      email: '',
    },
  });

  React.useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.userName,
        mobile: user.phone,
        email: user.email,
        title: '',
      });
    }
  }, [user, isOpen, form]);

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
           <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Handshake className="h-6 w-6 text-primary" />
                </div>
            </div>
          <DialogTitle className="text-center text-xl">Acknowledge Lead Registration</DialogTitle>
          <DialogDescription className="text-center">
             Please confirm your details to formally acknowledge this lead.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
                <Alert variant="default" className="bg-secondary/50">
                    <UserCheck className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Formal Acknowledgment</AlertTitle>
                    <AlertDescription className="text-xs">
                        I/We hereby acknowledge that Customer ID <strong>{lead.customerId}</strong> is a customer of Lakshmi Balaji O2O.
                    </AlertDescription>
                </Alert>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Financial Commitment</AlertTitle>
                    <AlertDescription className="text-xs">
                        By acknowledging this lead, you agree that this is a brokered transaction. Upon successful conversion of this lead, you are contractually bound to pay the agreed-upon brokerage fees to Lakshmi Balaji O2O.
                    </AlertDescription>
                </Alert>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="name"
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
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Title / Designation</FormLabel>
                        <FormControl><Input placeholder="e.g., Director" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
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
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input {...field} disabled /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Acknowledge & Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
