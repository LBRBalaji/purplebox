
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { tenantImprovementsSheetSchema, type TenantImprovementsSheet } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PlusCircle, Save, Trash2, HardHat, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


type TenantImprovementsSheetProps = {
  leadId: string;
};

const improvementCategories = [
    "Civil", "Roof", "Door", "Electrical", "Fire", "Road", "Docks", "HVAC", 
    "Safety & Security", "Compliances Certificate", "Mechanical", 
    "Administrative", "Workforce", "3PL"
];

export function TenantImprovementsSheet({ leadId }: TenantImprovementsSheetProps) {
  const { user } = useAuth();
  const { getTenantImprovements, updateTenantImprovements } = useData();
  const [sheetData, setSheetData] = React.useState<TenantImprovementsSheet | null>(null);

  const form = useForm<TenantImprovementsSheet>({
    resolver: zodResolver(tenantImprovementsSheetSchema),
    defaultValues: {
      leadId: leadId,
      items: [],
      overallRemarks: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  React.useEffect(() => {
    const data = getTenantImprovements(leadId);
    setSheetData(data);
    if (data) {
      form.reset(data);
    }
  }, [leadId, getTenantImprovements, form]);

  const onSubmit = (data: TenantImprovementsSheet) => {
    updateTenantImprovements(leadId, data);
  };
  
  const isDeveloper = user?.role === 'SuperAdmin';
  const isCustomer = user?.role === 'User';
  const isO2O = user?.role === 'O2O' || user?.email === 'admin@example.com';

  const statusConfig: { [key: string]: { className: string } } = {
    Pending: { className: 'bg-amber-100 text-amber-800' },
    'In Progress': { className: 'bg-blue-100 text-blue-800' },
    Completed: { className: 'bg-green-100 text-green-800' },
    'On Hold': { className: 'bg-gray-100 text-gray-800' },
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HardHat /> Tenant Improvements Tracker</CardTitle>
            <CardDescription>
              A list of additional services or improvements required for this transaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.length > 0 ? (
                <div className="space-y-4">
                 {fields.map((field, index) => {
                    const status = form.watch(`items.${index}.status`);
                    const statusStyle = statusConfig[status] || {};
                    return (
                        <Card key={field.id} className="bg-secondary/50">
                            <CardHeader className="flex flex-row items-start justify-between">
                                 <div className="flex-grow space-y-2">
                                    <FormField control={form.control} name={`items.${index}.item`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Improvement Item</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe the improvement item..." {...field} disabled={!isO2O} className="text-base font-semibold bg-background"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Last updated on {new Date(form.watch(`items.${index}.lastUpdatedAt`)).toLocaleDateString()} by {form.watch(`items.${index}.updatedBy`)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end ml-4">
                                     {isO2O && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                    <FormField control={form.control} name={`items.${index}.status`} render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue(`items.${index}.lastUpdatedAt`, new Date().toISOString());
                                                    if(user?.email) form.setValue(`items.${index}.updatedBy`, user.email);
                                                }} value={field.value} disabled={!isDeveloper && !isO2O}>
                                                    <SelectTrigger className={cn("w-[150px] font-semibold", statusStyle.className)}>
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name={`items.${index}.category`} render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!isO2O}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {improvementCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`items.${index}.estimatedSchedule`} render={({ field }) => (
                                    <FormItem><FormLabel>Estimated Schedule</FormLabel><FormControl><Input placeholder="e.g. 45 days" {...field} disabled={!isO2O} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name={`items.${index}.agreedSchedule`} render={({ field }) => (
                                    <FormItem><FormLabel>Agreed Schedule</FormLabel><FormControl><Input placeholder="e.g. 40 days" {...field} disabled={!isO2O} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    )
                 })}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground border-dashed border-2 rounded-lg">
                    <p>No improvement items have been added for this transaction yet.</p>
                </div>
            )}
             {isO2O && (
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-6"
                    onClick={() => append({ 
                        id: `TI-${Date.now()}`,
                        item: '',
                        category: 'Civil',
                        status: 'Pending',
                        lastUpdatedAt: new Date().toISOString(),
                        updatedBy: user?.email || '',
                     })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-4 pt-6 border-t">
              <div className="space-y-2">
                <FormLabel>Overall Remarks</FormLabel>
                <FormField control={form.control} name="overallRemarks" render={({ field }) => (
                    <FormControl>
                        <Textarea {...field} placeholder="Add any summary notes here..." disabled={!isO2O} />
                    </FormControl>
                )} />
              </div>
              {!isCustomer && (
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
