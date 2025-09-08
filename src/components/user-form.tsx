
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type NewUser, type User } from "@/contexts/auth-context";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

const userFormSchema = z.object({
    email: z.string().email('Invalid email address.'),
    companyName: z.string().min(1, 'Company name is required.'),
    userName: z.string().min(1, 'User name is required.'),
    phone: z.string().min(1, 'Phone number is required.'),
    role: z.enum(['User', 'SuperAdmin', 'O2O', 'Warehouse Developer', 'Agent']),
    plan: z.enum(['Free', 'Paid_Basic', 'Paid_Premium']),
});

type UserFormSchema = z.infer<typeof userFormSchema>;

type UserFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: NewUser, isEditing: boolean) => void;
};

export function UserForm({ isOpen, onOpenChange, user, onSubmit }: UserFormProps) {
  const isEditMode = !!user;
  const { users } = useAuth();

  const companies = React.useMemo(() => {
    const companyNames = new Set(Object.values(users).map(u => u.companyName));
    return Array.from(companyNames);
  }, [users]);

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      companyName: '',
      userName: '',
      phone: '',
      role: 'User',
      plan: 'Free',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        if (isEditMode && user) {
            form.reset({
                email: user.email,
                companyName: user.companyName,
                userName: user.userName,
                phone: user.phone,
                role: user.role,
                plan: user.plan || 'Free',
            });
        } else {
            form.reset({
              email: '',
              companyName: '',
              userName: '',
              phone: '',
              role: 'User',
              plan: 'Free',
            });
        }
    }
  }, [isOpen, isEditMode, user, form]);

  const handleSubmit = (data: UserFormSchema) => {
    onSubmit(data, isEditMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User Profile' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this user.' : 'Fill out the form to create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} placeholder="user@company.com" disabled={isEditMode} /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />
               <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter or select company" list="company-suggestions" />
                      </FormControl>
                      <datalist id="company-suggestions">
                        {companies.map(c => <option key={c} value={c} />)}
                      </datalist>
                      <FormMessage />
                  </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="userName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>User Name</FormLabel>
                        <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input {...field} placeholder="+1 234 567 890" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="User">Customer (Demand)</SelectItem>
                          <SelectItem value="Warehouse Developer">Warehouse Developer</SelectItem>
                          <SelectItem value="Agent">Agent</SelectItem>
                          <SelectItem value="O2O">O2O Platform Manager</SelectItem>
                          <SelectItem value="SuperAdmin">O2O Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="plan" render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Plan Model</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Paid_Basic">Paid_Basic</SelectItem>
                          <SelectItem value="Paid_Premium">Paid_Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
