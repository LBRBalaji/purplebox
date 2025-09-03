
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { tenantImprovementsSheetSchema, type TenantImprovementsSheet } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from './ui/table';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PlusCircle, Save, Trash2, HardHat } from 'lucide-react';

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
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">Improvement Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Est. Schedule</TableHead>
                    <TableHead>Agreed Schedule</TableHead>
                    <TableHead>Work Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    {!isCustomer && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField control={form.control} name={`items.${index}.item`} render={({ field }) => (
                          <Textarea {...field} disabled={!isO2O} />
                        )} />
                      </TableCell>
                      <TableCell>
                         <FormField control={form.control} name={`items.${index}.category`} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isO2O}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {improvementCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         )} />
                      </TableCell>
                      <TableCell>
                         <FormField control={form.control} name={`items.${index}.estimatedSchedule`} render={({ field }) => (
                            <Input {...field} disabled={!isO2O} />
                         )} />
                      </TableCell>
                       <TableCell>
                         <FormField control={form.control} name={`items.${index}.agreedSchedule`} render={({ field }) => (
                           <Input {...field} disabled={!isO2O} />
                         )} />
                      </TableCell>
                       <TableCell>
                         <FormField control={form.control} name={`items.${index}.status`} render={({ field }) => (
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue(`items.${index}.lastUpdatedAt`, new Date().toISOString());
                                if(user?.email) form.setValue(`items.${index}.updatedBy`, user.email);
                            }} value={field.value} disabled={!isDeveloper && !isO2O}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                         )} />
                      </TableCell>
                      <TableCell>
                         <div className="text-xs text-muted-foreground">
                            <p>{new Date(form.watch(`items.${index}.lastUpdatedAt`)).toLocaleDateString()}</p>
                            <p>by {form.watch(`items.${index}.updatedBy`)}</p>
                         </div>
                      </TableCell>
                      {!isCustomer && (
                        <TableCell className="text-right">
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={!isO2O}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {isO2O && (
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
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
                    <Textarea {...field} placeholder="Add any summary notes here..." disabled={!isO2O} />
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
