
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableResultFooter } from "@/components/ui/table";
import { Calculator, PlusCircle, Trash2, TrendingUp, HandCoins, Building, ArrowDown, Warehouse, Users, FileText, BarChart2 } from "lucide-react";
import { useData } from "@/contexts/data-context";
import type { ListingSchema } from "@/lib/schema";
import { Separator } from "./ui/separator";


const calculatorSchema = z.object({
  leasePeriodYears: z.coerce.number().int().positive("Lease period must be a positive integer."),
  escalationCycle: z.enum(['1', '2', '3']),
  escalationPercentage: z.coerce.number().min(0, "Escalation must be non-negative."),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

type Result = {
    listing: ListingSchema;
    netChargeableArea: number;
    oneTimeOutflow: number;
    initialMonthlyRent: string;
    initialTotalMonthlyOutflow: string;
    yearlyBreakdown: { year: number; totalMonthlyOutflow: string; annualOutflow: string }[];
    totalOutflow: string;
}


export function CommercialCalculator() {
  const { listings } = useData();
  const searchParams = useSearchParams();
  const [results, setResults] = React.useState<Result[]>([]);
  const [comparisonListings, setComparisonListings] = React.useState<ListingSchema[]>([]);

  const form = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      leasePeriodYears: 5,
      escalationCycle: '3',
      escalationPercentage: 15,
    },
  });

  React.useEffect(() => {
    const compareIds = searchParams.get('compare')?.split(',') || [];
    if (compareIds.length > 0) {
        const foundListings = listings.filter(l => compareIds.includes(l.listingId));
        setComparisonListings(foundListings);
        // Automatically trigger calculation when comparison starts
        if(foundListings.length > 0) {
            onSubmit(form.getValues(), foundListings);
        }
    }
  }, [searchParams, listings, form]);


  const onSubmit = (data: CalculatorValues, listingsToCompare: ListingSchema[]) => {
    const newResults = listingsToCompare.map(listing => {
        const netChargeableArea = listing.area.totalChargeableArea || listing.sizeSqFt;
        const oneTimeOutflow = (listing.rentalSecurityDeposit || 0) * ((listing.rentPerSqFt || 0) * netChargeableArea);
        const monthlyCam = 0; // Assuming 0 CAM for now as it's not in the listing data

        let currentRentSft = listing.rentPerSqFt || 0;
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
        
        return {
            listing,
            netChargeableArea,
            oneTimeOutflow,
            initialMonthlyRent: ((listing.rentPerSqFt || 0) * netChargeableArea).toFixed(2),
            initialTotalMonthlyOutflow: (((listing.rentPerSqFt || 0) * netChargeableArea) + monthlyCam).toFixed(2),
            yearlyBreakdown,
            totalOutflow: totalOutflow.toFixed(2),
        }
    });

    setResults(newResults);
  }

  const handleFormSubmit = (data: CalculatorValues) => {
    onSubmit(data, comparisonListings);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><BarChart2 className="h-6 w-6 text-primary"/> Lease Outflow Comparison</CardTitle>
             <CardDescription>Adjust the lease terms below to compare the financial outflow for your selected properties. Up to 5 properties can be compared at a time.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
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
             <div className="md:mt-8">
                <Button type="submit" size="lg" className="w-full"><Calculator className="mr-2 h-4 w-4" /> Recalculate</Button>
            </div>
          </CardContent>
        </Card>
        
        {results.length > 0 && (
          <Card className="animate-in fade-in-0 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/> Financial Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold text-foreground sticky left-0 bg-card z-10 w-[250px]">Metric</TableHead>
                          {results.map(r => (
                              <TableHead key={r.listing.listingId} className="w-[200px] text-center">
                                 <p className="font-semibold text-primary truncate">{r.listing.name}</p>
                                 <p className="text-xs text-muted-foreground">{r.listing.location}</p>
                              </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                            <TableCell className="font-semibold sticky left-0 bg-secondary/50 z-10">Net Chargeable Area (Sq. Ft.)</TableCell>
                            {results.map(r => (
                                <TableCell key={r.listing.listingId} className="text-center font-medium">{r.netChargeableArea.toLocaleString()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold sticky left-0 bg-card z-10">Rent (per Sq. Ft./Month)</TableCell>
                             {results.map(r => (
                                <TableCell key={r.listing.listingId} className="text-center">₹{r.listing.rentPerSqFt?.toLocaleString() || 'N/A'}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold sticky left-0 bg-card z-10">Security Deposit (Months)</TableCell>
                             {results.map(r => (
                                <TableCell key={r.listing.listingId} className="text-center">{r.listing.rentalSecurityDeposit?.toLocaleString() || 'N/A'}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                            <TableCell className="font-semibold sticky left-0 bg-secondary/50 z-10">One-Time Security Deposit</TableCell>
                            {results.map(r => (
                                <TableCell key={r.listing.listingId} className="text-center font-medium">₹{r.oneTimeOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold sticky left-0 bg-card z-10">Initial Monthly Outflow</TableCell>
                             {results.map(r => (
                                <TableCell key={r.listing.listingId} className="text-center">₹{parseFloat(r.initialTotalMonthlyOutflow).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                            ))}
                        </TableRow>
                      </TableBody>
                       <TableResultFooter>
                        <TableRow className="bg-primary/10 hover:bg-primary/10">
                            <TableCell className="font-bold text-lg text-primary sticky left-0 bg-primary/10 z-10">Total Outflow for Lease Period</TableCell>
                            {results.map(r => (
                                <TableCell key={r.listing.listingId} className="font-bold text-right text-lg text-primary text-center">₹{parseFloat(r.totalOutflow).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                            ))}
                        </TableRow>
                      </TableResultFooter>
                    </Table>
                  </div>
            </CardContent>
          </Card>
        )}

        {results.length === 0 && comparisonListings.length > 0 && (
            <div className="text-center p-8 border rounded-lg border-dashed">
                <p className="text-muted-foreground">Click "Recalculate" to generate the comparison.</p>
            </div>
        )}

         {comparisonListings.length === 0 && (
            <div className="text-center p-12 border rounded-lg">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">Start Your Comparison</h3>
                <p className="mt-2 text-sm text-muted-foreground">Go to the listings page, select up to 5 properties, and click "Compare" to see your analysis here.</p>
                <Button asChild className="mt-4">
                    <a href="/">Browse Listings</a>
                </Button>
            </div>
         )}
      </form>
    </Form>
  );
}
