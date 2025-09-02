
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableResultFooter } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Calculator, PlusCircle, Trash2, TrendingUp, HandCoins, Building, ArrowDown, Warehouse } from "lucide-react";
import { useData } from "@/contexts/data-context";
import type { ListingSchema } from "@/lib/schema";


const calculatorSchema = z.object({
  grossArea: z.coerce.number().positive("Gross area must be positive."),
  deductibleAreas: z.array(z.object({
    name: z.string().min(1, "Area name is required."),
    area: z.coerce.number().min(0, "Area must be non-negative."),
  })).max(10),
  rentPerSft: z.coerce.number().positive("Rent must be positive."),
  camPerSft: z.coerce.number().min(0, "CAM must be non-negative."),
  securityDepositMonths: z.coerce.number().min(0, "Deposit must be non-negative."),
  leasePeriodYears: z.coerce.number().int().positive("Lease period must be a positive integer."),
  escalationCycle: z.enum(['1', '2', '3']),
  escalationPercentage: z.coerce.number().min(0, "Escalation must be non-negative."),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

export function CommercialCalculator() {
  const { listings } = useData();
  const [results, setResults] = React.useState<any>(null);
  const [selectedListingId, setSelectedListingId] = React.useState<string>("");

  const approvedListings = React.useMemo(() => listings.filter(l => l.status === 'approved'), [listings]);

  const form = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      grossArea: undefined,
      deductibleAreas: [{ name: "Canopy", area: 0 }, { name: "Washrooms", area: 0 }],
      rentPerSft: undefined,
      camPerSft: 0,
      securityDepositMonths: 0,
      leasePeriodYears: 5,
      escalationCycle: '3',
      escalationPercentage: 15,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductibleAreas",
  });

  const handleListingSelect = (listingId: string) => {
    const listing = approvedListings.find(l => l.listingId === listingId);
    if (!listing) return;

    setSelectedListingId(listingId);

    const deductibles = [];
    if(listing.area.canopyArea) deductibles.push({ name: 'Canopy', area: listing.area.canopyArea});
    if(listing.area.driversRestRoomArea) deductibles.push({ name: 'Driver Rest Room', area: listing.area.driversRestRoomArea});
    // Add a default empty one if none exist
    if (deductibles.length === 0) deductibles.push({ name: 'Deductible Area', area: 0 });

    form.reset({
        ...form.getValues(),
        grossArea: listing.sizeSqFt,
        rentPerSft: listing.rentPerSqFt || undefined,
        securityDepositMonths: listing.rentalSecurityDeposit || undefined,
        deductibleAreas: deductibles,
    });
  }

  const onSubmit = (data: CalculatorValues) => {
    const totalDeductible = data.deductibleAreas.reduce((sum, item) => sum + item.area, 0);
    const netChargeableArea = data.grossArea - totalDeductible;

    const oneTimeOutflow = data.securityDepositMonths * (data.rentPerSft * netChargeableArea);
    const monthlyCam = data.camPerSft * netChargeableArea;
    
    let currentRentSft = data.rentPerSft;
    const yearlyBreakdown = [];
    let totalOutflow = 0;
    
    for (let year = 1; year <= data.leasePeriodYears; year++) {
      if (year > 1 && (year - 1) % parseInt(data.escalationCycle, 10) === 0) {
        currentRentSft *= (1 + data.escalationPercentage / 100);
      }
      const monthlyRent = currentRentSft * netChargeableArea;
      const totalMonthlyOutflow = monthlyRent + monthlyCam;
      const annualOutflow = totalMonthlyOutflow * 12;
      totalOutflow += annualOutflow;
      
      yearlyBreakdown.push({
        year,
        monthlyRent: monthlyRent.toFixed(2),
        totalMonthlyOutflow: totalMonthlyOutflow.toFixed(2),
        annualOutflow: annualOutflow.toFixed(2),
      });
    }

    setResults({
      netChargeableArea,
      oneTimeOutflow,
      initialMonthlyRent: (data.rentPerSft * netChargeableArea).toFixed(2),
      initialTotalMonthlyOutflow: ((data.rentPerSft * netChargeableArea) + monthlyCam).toFixed(2),
      yearlyBreakdown,
      totalOutflow: totalOutflow.toFixed(2),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
            <Label>Pre-fill from an Existing Listing (Optional)</Label>
            <Select onValueChange={handleListingSelect} value={selectedListingId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a warehouse listing..." />
                </SelectTrigger>
                <SelectContent>
                    {approvedListings.map(listing => (
                        <SelectItem key={listing.listingId} value={listing.listingId}>
                           {listing.name} ({listing.location}) - {listing.sizeSqFt.toLocaleString()} sq.ft.
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary"/> Net Area Calculator</CardTitle>
            <CardDescription>Calculate the net chargeable shop floor area by deducting loaded areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="grossArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gross Shop Floor Area (sq. ft.)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormLabel>Deductible Areas</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`deductibleAreas.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="Area Name (e.g., Security Room)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`deductibleAreas.${index}.area`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder="Area in sq. ft." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", area: 0 })}
                disabled={fields.length >= 10}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Deductible Area
              </Button>
               <FormDescription>
                You can add up to {10 - fields.length} more area{10 - fields.length !== 1 && 's'}.
              </FormDescription>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary"/> Commercials Calculator</CardTitle>
             <CardDescription>Input the commercial terms to calculate your total cash outflow.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
             <FormField control={form.control} name="rentPerSft" render={({ field }) => (
                <FormItem><FormLabel>Rent per sq. ft./month</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="camPerSft" render={({ field }) => (
                <FormItem><FormLabel>CAM per sq. ft./month</FormLabel><FormControl><Input type="number" placeholder="e.g., 2.5" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="securityDepositMonths" render={({ field }) => (
                <FormItem><FormLabel>Refundable Security Deposit (in months)</FormLabel><FormControl><Input type="number" placeholder="e.g., 6" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="leasePeriodYears" render={({ field }) => (
                <FormItem><FormLabel>Lease Period (in years)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="escalationCycle" render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Escalation Cycle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="1">Every Year</SelectItem>
                    <SelectItem value="2">Every 2 Years</SelectItem>
                    <SelectItem value="3">Every 3 Years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="escalationPercentage" render={({ field }) => (
                <FormItem><FormLabel>Rental Escalation (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calculate Now</Button>
          </CardFooter>
        </Card>
        
        {results && (
          <Card className="animate-in fade-in-0 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/> Financial Outflow Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Net Chargeable Area</p>
                        <p className="text-2xl font-bold">{results.netChargeableArea.toLocaleString()} sq. ft.</p>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">One-Time Security Deposit</p>
                        <p className="text-2xl font-bold">₹{results.oneTimeOutflow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Initial Monthly Outflow</p>
                        <p className="text-2xl font-bold">₹{parseFloat(results.initialTotalMonthlyOutflow).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">(Rent + CAM)</p>
                    </div>
                </div>

                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Lease Period Breakdown</h4>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Lease Year</TableHead>
                          <TableHead>Monthly Outflow (Rent + CAM)</TableHead>
                          <TableHead className="text-right">Total Annual Outflow</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.yearlyBreakdown.map((row: any) => (
                          <TableRow key={row.year}>
                            <TableCell className="font-medium">{row.year}</TableCell>
                            <TableCell>₹{parseFloat(row.totalMonthlyOutflow).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right">₹{parseFloat(row.annualOutflow).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableResultFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="font-bold text-right">Total Outflow for Lease Period</TableCell>
                            <TableCell className="font-bold text-right text-lg text-primary">₹{parseFloat(results.totalOutflow).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      </TableResultFooter>
                    </Table>
                  </div>
                </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
