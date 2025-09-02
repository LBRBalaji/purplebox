
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import * as XLSX from 'xlsx';
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
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableResultFooter } from "@/components/ui/table";
import { Calculator, PlusCircle, Trash2, TrendingUp, HandCoins, Building, ArrowDown, Warehouse, Users, FileText, BarChart2, Download, Search, X, Check } from "lucide-react";
import { useData } from "@/contexts/data-context";
import type { ListingSchema } from "@/lib/schema";
import { Separator } from "./ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

const areaSchema = z.object({
  name: z.string().min(1, "Area name is required."),
  size: z.coerce.number().positive("Size must be positive."),
});

const standaloneCalculatorSchema = z.object({
  grossArea: z.coerce.number().positive("Gross area is required."),
  deductibleAreas: z.array(areaSchema).max(10),
  rentPerSft: z.coerce.number().positive(),
  camPerSft: z.coerce.number().min(0).default(0),
  leasePeriodYears: z.coerce.number().int().positive(),
  escalationCycle: z.enum(['1', '2', '3']),
  escalationPercentage: z.coerce.number().min(0),
  securityDepositMonths: z.coerce.number().int().positive(),
});

type StandaloneCalculatorValues = z.infer<typeof standaloneCalculatorSchema>;

type StandaloneResult = {
    netChargeableArea: number;
    oneTimeOutflow: number;
    initialMonthlyRent: number;
    initialCam: number;
    initialTotalMonthlyOutflow: number;
    yearlyBreakdown: { year: number; totalMonthlyOutflow: number; annualOutflow: number }[];
    totalOutflow: number;
};

const comparisonCalculatorSchema = z.object({
  leasePeriodYears: z.coerce.number().int().positive("Lease period must be a positive integer."),
  escalationCycle: z.enum(['1', '2', '3']),
  escalationPercentage: z.coerce.number().min(0, "Escalation must be non-negative."),
});

type ComparisonCalculatorValues = z.infer<typeof comparisonCalculatorSchema>;

type ComparisonResult = {
    listing: ListingSchema;
    netChargeableArea: number;
    oneTimeOutflow: number;
    initialMonthlyRent: string;
    initialTotalMonthlyOutflow: string;
    yearlyBreakdown: { year: number; totalMonthlyOutflow: string; annualOutflow: string }[];
    totalOutflow: string;
}

const generateCsvFilename = (toolName: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    return `Lakshmi_Balaji_O2O_${toolName}_${timestamp}.csv`;
};

const addCsvFooter = (worksheet: XLSX.WorkSheet) => {
    const footer = [
        [], // Empty row for spacing
        ["Source:", "Lakshmi Balaji O2O", "URL:", "www.lakshmibalajio2o.com"],
        ["Page Number:", 1]
    ];
    XLSX.utils.sheet_add_aoa(worksheet, footer, { origin: -1 });
};

export function CommercialCalculator() {
    const { listings } = useData();
    const searchParams = useSearchParams();
    const [result, setResult] = React.useState<StandaloneResult | null>(null);
    const [selectedListingId, setSelectedListingId] = React.useState('');

    const form = useForm<StandaloneCalculatorValues>({
        resolver: zodResolver(standaloneCalculatorSchema),
        defaultValues: {
            grossArea: 100000,
            deductibleAreas: [
                { name: 'Security Room', size: 200 },
                { name: 'Washrooms', size: 300 },
            ],
            rentPerSft: 20,
            camPerSft: 2,
            leasePeriodYears: 5,
            escalationCycle: '3',
            escalationPercentage: 15,
            securityDepositMonths: 6,
        },
    });
    
    React.useEffect(() => {
        const compareId = searchParams.get('compare');
        if (compareId) {
            handleListingSelect(compareId);
        }
    }, [searchParams, listings]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "deductibleAreas",
    });

    const handleListingSelect = (listingId: string) => {
        const listing = listings.find(l => l.listingId === listingId);
        if (listing) {
            form.reset({
                ...form.getValues(),
                grossArea: listing.sizeSqFt,
                rentPerSft: listing.rentPerSqFt || 0,
                securityDepositMonths: listing.rentalSecurityDeposit || 0,
            });
            setSelectedListingId(listingId);
            setResult(null); // Clear previous results
        }
    };

    const onSubmit = (data: StandaloneCalculatorValues) => {
        const totalDeducted = data.deductibleAreas.reduce((sum, area) => sum + area.size, 0);
        const netChargeableArea = data.grossArea - totalDeducted;
        const oneTimeOutflow = data.securityDepositMonths * (data.rentPerSft * netChargeableArea);
        
        let currentRentSft = data.rentPerSft;
        const yearlyBreakdown = [];
        let totalOutflow = 0;

        for (let year = 1; year <= data.leasePeriodYears; year++) {
            if (year > 1 && (year - 1) % parseInt(data.escalationCycle, 10) === 0) {
                currentRentSft *= (1 + data.escalationPercentage / 100);
            }
            const monthlyRent = currentRentSft * netChargeableArea;
            const monthlyCam = data.camPerSft * netChargeableArea;
            const totalMonthlyOutflow = monthlyRent + monthlyCam;
            const annualOutflow = totalMonthlyOutflow * 12;
            totalOutflow += annualOutflow;

            yearlyBreakdown.push({
                year,
                totalMonthlyOutflow,
                annualOutflow,
            });
        }

        setResult({
            netChargeableArea,
            oneTimeOutflow,
            initialMonthlyRent: data.rentPerSft * netChargeableArea,
            initialCam: data.camPerSft * netChargeableArea,
            initialTotalMonthlyOutflow: (data.rentPerSft * netChargeableArea) + (data.camPerSft * netChargeableArea),
            yearlyBreakdown,
            totalOutflow,
        });
    }

    const handleDownload = () => {
        if (!result) return;
        
        const data = form.getValues();
        const mainData = [
            ["Metric", "Value"],
            ["Gross Area (Sq. Ft.)", data.grossArea],
            ...data.deductibleAreas.map(a => [`(less) ${a.name}`, -a.size]),
            ["Net Chargeable Area (Sq. Ft.)", result.netChargeableArea],
            ["Lease Period (Years)", data.leasePeriodYears],
            ["Security Deposit (Months)", data.securityDepositMonths],
            ["One-Time Outflow (Security)", `₹${result.oneTimeOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
            ["Total Outflow (Lease Period)", `₹${result.totalOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
        ];
        
        const yearlyHeader = ["Year", "Avg. Monthly Outflow", "Total Annual Outflow"];
        const yearlyData = result.yearlyBreakdown.map(bd => [
            bd.year,
            `₹${bd.totalMonthlyOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            `₹${bd.annualOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [["Tool Name: Area & Commercials Calculator - Standalone"]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(worksheet, mainData, { origin: 'A3' });
        XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: -1 }); // Spacer
        XLSX.utils.sheet_add_aoa(worksheet, [["Yearly Outflow Breakdown"]], { origin: -1 });
        XLSX.utils.sheet_add_aoa(worksheet, [yearlyHeader, ...yearlyData], { origin: -1 });

        addCsvFooter(worksheet);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Standalone Calculation");
        XLSX.writeFile(workbook, generateCsvFilename("Standalone_Calculator"), { bookType: "csv" });
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
                             {listings.filter(l => l.status === 'approved').map(listing => (
                                <SelectItem key={listing.listingId} value={listing.listingId}>
                                    {listing.name} ({listing.location})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="space-y-6">
                        <Card>
                             <CardHeader><CardTitle className="flex items-center gap-2"><Warehouse className="h-6 w-6 text-primary"/> Area Calculation</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                <FormField control={form.control} name="grossArea" render={({ field }) => (<FormItem><FormLabel>Gross Area (Sq. Ft.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Separator />
                                <div className="space-y-2">
                                    <FormLabel>Deductible Areas</FormLabel>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-end">
                                            <FormField control={form.control} name={`deductibleAreas.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="Area Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`deductibleAreas.${index}.size`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Size (Sq. Ft.)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                    {fields.length < 10 && <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', size: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Area</Button>}
                                </div>
                             </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><HandCoins className="h-6 w-6 text-primary"/> Commercial Terms</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent (per Sq.Ft/Month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="camPerSft" render={({ field }) => (<FormItem><FormLabel>CAM (per Sq.Ft/Month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="leasePeriodYears" render={({ field }) => (<FormItem><FormLabel>Lease Period (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="securityDepositMonths" render={({ field }) => (<FormItem><FormLabel>Security Deposit (Months)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="escalationCycle" render={({ field }) => (<FormItem><FormLabel>Escalation Cycle</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Every Year</SelectItem><SelectItem value="2">Every 2 Years</SelectItem><SelectItem value="3">Every 3 Years</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="escalationPercentage" render={({ field }) => (<FormItem><FormLabel>Escalation (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>
                        <div className="flex gap-2">
                             <Button type="submit" size="lg" className="w-full"><Calculator className="mr-2 h-4 w-4" /> Calculate</Button>
                             {result && <Button type="button" size="lg" variant="outline" className="w-full" onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download</Button>}
                        </div>
                    </div>
                     {/* RESULTS */}
                    <div className="space-y-6">
                         {result ? (
                            <Card className="sticky top-24">
                                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary"/> Calculation Results</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-primary/10 p-4 rounded-lg text-center">
                                        <p className="text-sm text-primary font-semibold">Net Chargeable Area</p>
                                        <p className="text-3xl font-bold text-primary">{result.netChargeableArea.toLocaleString()} Sq. Ft.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-secondary/50 p-3 rounded-lg text-center">
                                            <p className="text-xs text-muted-foreground">One-Time Outflow</p>
                                            <p className="font-bold">₹{result.oneTimeOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded-lg text-center">
                                            <p className="text-xs text-muted-foreground">Total Outflow (Lease)</p>
                                            <p className="font-bold">₹{result.totalOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right">Annual Outflow</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {result.yearlyBreakdown.map(bd => (
                                                    <TableRow key={bd.year}><TableCell>Year {bd.year}</TableCell><TableCell className="text-right">₹{bd.annualOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell></TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                         ) : (
                            <Card className="flex items-center justify-center h-full text-center p-8 border-dashed">
                                <div>
                                    <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Results will appear here</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Fill in the details and click "Calculate".</p>
                                </div>
                            </Card>
                         )}
                    </div>
                </div>
            </form>
        </Form>
    );
}

export function ComparisonCalculator() {
  const { listings } = useData();
  const [results, setResults] = React.useState<ComparisonResult[]>([]);
  const [selectedListings, setSelectedListings] = React.useState<ListingSchema[]>([]);
  const [open, setOpen] = React.useState(false);

  const form = useForm<ComparisonCalculatorValues>({
    resolver: zodResolver(comparisonCalculatorSchema),
    defaultValues: {
      leasePeriodYears: 5,
      escalationCycle: '3',
      escalationPercentage: 15,
    },
  });

  const onSubmit = (data: ComparisonCalculatorValues, listingsToCompare: ListingSchema[]) => {
    const newResults = listingsToCompare.map(listing => {
        const netChargeableArea = listing.area?.totalChargeableArea || listing.sizeSqFt;
        const oneTimeOutflow = (listing.rentalSecurityDeposit || 0) * ((listing.rentPerSqFt || 0) * netChargeableArea);
        const monthlyCam = 0;

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

  const handleFormSubmit = (data: ComparisonCalculatorValues) => {
    onSubmit(data, selectedListings);
  }

    const handleDownload = () => {
        if (results.length === 0) return;

        const tableHeader = ["Metric", ...results.map(r => `${r.listing.name} (${r.listing.listingId})`)];
        const tableRows = [
            ["Listing ID", ...results.map(r => r.listing.listingId)],
            ["Net Chargeable Area (Sq. Ft.)", ...results.map(r => r.netChargeableArea.toLocaleString())],
            ["Rent (per Sq. Ft./Month)", ...results.map(r => `₹${r.listing.rentPerSqFt?.toLocaleString() ?? 'N/A'}`)],
            ["Security Deposit (Months)", ...results.map(r => r.listing.rentalSecurityDeposit?.toLocaleString() ?? 'N/A')],
            ["One-Time Security Deposit", ...results.map(r => `₹${r.oneTimeOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)],
            ["Initial Monthly Outflow", ...results.map(r => `₹${parseFloat(r.initialTotalMonthlyOutflow).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)],
            ["Total Outflow for Lease Period", ...results.map(r => `₹${parseFloat(r.totalOutflow).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)]
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet([]);

        XLSX.utils.sheet_add_aoa(worksheet, [["Tool Name: Commercials Comparison For Listings"]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(worksheet, [tableHeader, ...tableRows], { origin: 'A3' });

        let breakdownStartRow = 4 + tableRows.length;
        results.forEach((result) => {
            XLSX.utils.sheet_add_aoa(worksheet, [[`Yearly Breakdown for ${result.listing.name}`]], { origin: `A${breakdownStartRow}` });
            const breakdownHeader = ["Year", "Monthly Outflow", "Annual Outflow"];
            const breakdownData = result.yearlyBreakdown.map(bd => [
                bd.year, 
                `₹${parseFloat(bd.totalMonthlyOutflow).toLocaleString('en-IN', {maximumFractionDigits: 0})}`,
                `₹${parseFloat(bd.annualOutflow).toLocaleString('en-IN', {maximumFractionDigits: 0})}`
            ]);
            XLSX.utils.sheet_add_aoa(worksheet, [breakdownHeader, ...breakdownData], { origin: `A${breakdownStartRow + 1}` });
            breakdownStartRow += breakdownData.length + 3;
        });

        addCsvFooter(worksheet);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Comparison Calculation");
        XLSX.writeFile(workbook, generateCsvFilename("Comparison_Calculator"), { bookType: "csv" });
    };

    const toggleListingSelection = (listing: ListingSchema) => {
        setSelectedListings(prev => {
            const isSelected = prev.some(l => l.listingId === listing.listingId);
            if (isSelected) {
                return prev.filter(l => l.listingId !== listing.listingId);
            }
            if (prev.length < 5) {
                return [...prev, listing];
            }
            return prev; // Limit to 5
        })
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Users className="h-6 w-6 text-primary"/> Select Properties to Compare</CardTitle>
                <CardDescription>You can select up to 5 properties. The comparison table will appear below once you make a selection.</CardDescription>
            </CardHeader>
             <CardContent className="flex flex-col gap-4">
                 <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {selectedListings.length > 0 ? `${selectedListings.length} selected` : "Select listings..."}
                             <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search listings..." />
                            <CommandList>
                                <CommandEmpty>No listings found.</CommandEmpty>
                                <CommandGroup>
                                    {listings.filter(l=>l.status==='approved').map((listing) => (
                                        <CommandItem
                                            key={listing.listingId}
                                            value={`${listing.name} ${listing.location} ${listing.listingId}`}
                                            onSelect={() => {
                                                toggleListingSelection(listing);
                                                setOpen(true);
                                            }}
                                        >
                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", selectedListings.some(l => l.listingId === listing.listingId) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{listing.name} ({listing.location})</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                 <div className="flex flex-wrap items-center gap-2 min-h-[2.5rem]">
                     {selectedListings.length > 0 ? (
                        <>
                            {selectedListings.map(l => (
                                <Badge key={l.listingId} variant="secondary" className="gap-1">
                                    {l.name}
                                    <button
                                        type="button"
                                        className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                        onClick={() => toggleListingSelection(l)}
                                    >
                                        <X className="h-3 w-3"/>
                                    </button>
                                </Badge>
                            ))}
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setSelectedListings([])}>
                                Clear All
                            </Button>
                        </>
                     ) : (
                        <p className="text-sm text-muted-foreground px-2">No properties selected.</p>
                     )}
                 </div>
             </CardContent>
        </Card>
        
        {selectedListings.length > 0 && (
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><HandCoins className="h-6 w-6 text-primary"/> Lease Terms</CardTitle>
                <CardDescription>Adjust the lease terms below to compare the financial outflow for your selected properties.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 items-end gap-x-8 gap-y-6">
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
                <div className="flex items-center gap-2">
                    <Button type="submit" size="lg" className="w-full" disabled={selectedListings.length === 0}><Calculator className="mr-2 h-4 w-4" /> Recalculate</Button>
                </div>
            </CardContent>
            </Card>
        )}
        
        {results.length > 0 && (
          <Card className="animate-in fade-in-0 duration-500">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/> Financial Analysis</CardTitle>
               <Button type="button" size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download Results
                </Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold text-foreground sticky left-0 bg-card z-10 w-[250px]">Metric</TableHead>
                          {results.map(r => (
                              <TableHead key={r.listing.listingId} className="w-[200px] text-center">
                                 <p className="font-semibold text-primary truncate">{r.listing.name}</p>
                                 <p className="text-xs text-muted-foreground">{r.listing.listingId}</p>
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
                                <TableCell key={r.listing.listingId} className="font-bold text-lg text-primary text-center">₹{parseFloat(r.totalOutflow).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                            ))}
                        </TableRow>
                      </TableResultFooter>
                    </Table>
                  </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
