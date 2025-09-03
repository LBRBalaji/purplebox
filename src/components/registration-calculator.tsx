
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import * as XLSX from 'xlsx';
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Calculator, PlusCircle, Trash2, TrendingUp, HandCoins, DollarSign, Percent, Download } from "lucide-react";
import { Separator } from "./ui/separator";

const additionalChargeSchema = z.object({
  name: z.string().min(1, "Name is required."),
  amount: z.coerce.number().min(0, "Amount must be non-negative."),
});

const calculatorSchema = z.object({
  netRental: z.coerce.number().positive("Net rental is required."),
  stampDutyPercentage: z.coerce.number().min(0, "Stamp duty must be non-negative.").max(100),
  registrationCharges: z.coerce.number().min(0, "Registration charges must be non-negative."),
  additionalCharges: z.array(additionalChargeSchema).optional(),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

type Result = {
    calculatedStampDuty: number;
    totalAdditionalCharges: number;
    netAmount: number;
};

const generateCsvFilename = (toolName: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    return `Lakshmi_Balaji_O2O_${toolName}_${timestamp}.csv`;
};

export function RegistrationCalculator() {
    const [result, setResult] = React.useState<Result | null>(null);

    const form = useForm<CalculatorValues>({
        resolver: zodResolver(calculatorSchema),
        defaultValues: {
            netRental: 1000000,
            stampDutyPercentage: 5,
            registrationCharges: 10000,
            additionalCharges: [
                { name: 'Advocate Fees', amount: 5000 },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "additionalCharges",
    });

    const onSubmit = (data: CalculatorValues) => {
        const calculatedStampDuty = data.netRental * (data.stampDutyPercentage / 100);
        const totalAdditionalCharges = data.additionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0;
        const netAmount = calculatedStampDuty + data.registrationCharges + totalAdditionalCharges;

        setResult({
            calculatedStampDuty,
            totalAdditionalCharges,
            netAmount,
        });
    }
    
    const handleDownload = () => {
        if (!result) return;
        
        const data = form.getValues();
        const mainData = [
            ["Item", "Value"],
            ["Net Rental Value", `₹${data.netRental.toLocaleString('en-IN')}`],
            ["Stamp Duty", `₹${result.calculatedStampDuty.toLocaleString('en-IN')} (@ ${data.stampDutyPercentage}%)`],
            ["Registration Charges", `₹${data.registrationCharges.toLocaleString('en-IN')}`],
            ...(data.additionalCharges || []).map(charge => [charge.name, `₹${charge.amount.toLocaleString('en-IN')}`]),
            ["", ""],
            ["Net Amount Payable", `₹${result.netAmount.toLocaleString('en-IN')}`]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [["Tool Name: Registration Charges Calculator"]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(worksheet, mainData, { origin: 'A3' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registration Calculation");
        XLSX.writeFile(workbook, generateCsvFilename("Registration_Calculator"), { bookType: "csv" });
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* INPUTS */}
                    <Card>
                         <CardHeader><CardTitle className="flex items-center gap-2"><HandCoins className="h-6 w-6 text-primary"/> Input Charges</CardTitle></CardHeader>
                         <CardContent className="space-y-6">
                            <FormField control={form.control} name="netRental" render={({ field }) => (<FormItem><FormLabel>Net Rental (Total Lease Value)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 1000000" /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="stampDutyPercentage" render={({ field }) => (<FormItem><FormLabel>Stamp Duty</FormLabel><FormControl><div className="flex items-center"><Input type="number" {...field} placeholder="e.g. 5" /><span className="p-2 text-muted-foreground"><Percent className="h-4 w-4"/></span></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="registrationCharges" render={({ field }) => (<FormItem><FormLabel>Registration Charges</FormLabel><FormControl><div className="flex items-center"><Input type="number" {...field} placeholder="e.g. 10000" /><span className="p-2 text-muted-foreground"><DollarSign className="h-4 w-4"/></span></div></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <FormLabel>Additional Charges</FormLabel>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-end">
                                        <FormField control={form.control} name={`additionalCharges.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="Charge Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`additionalCharges.${index}.amount`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Amount" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', amount: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Charge</Button>
                            </div>
                         </CardContent>
                    </Card>
                    
                    {/* RESULTS */}
                    <div className="sticky top-24">
                         {result ? (
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary"/> Calculation Results</CardTitle>
                                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download</Button>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableBody>
                                            <TableRow><TableCell>Net Rental</TableCell><TableCell className="text-right font-medium">₹{form.getValues('netRental').toLocaleString('en-IN')}</TableCell></TableRow>
                                            <TableRow><TableCell>Stamp Duty ({form.getValues('stampDutyPercentage')}%)</TableCell><TableCell className="text-right font-medium">₹{result.calculatedStampDuty.toLocaleString('en-IN')}</TableCell></TableRow>
                                            <TableRow><TableCell>Registration Charges</TableCell><TableCell className="text-right font-medium">₹{form.getValues('registrationCharges').toLocaleString('en-IN')}</TableCell></TableRow>
                                            {form.getValues('additionalCharges')?.map((charge, i) => (
                                                <TableRow key={i}><TableCell>{charge.name}</TableCell><TableCell className="text-right font-medium">₹{charge.amount.toLocaleString('en-IN')}</TableCell></TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow className="text-base font-bold bg-primary/10">
                                                <TableCell>Net Amount Payable</TableCell>
                                                <TableCell className="text-right">₹{result.netAmount.toLocaleString('en-IN')}</TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </CardContent>
                            </Card>
                         ) : (
                            <Card className="flex items-center justify-center min-h-[300px] text-center p-8 border-dashed">
                                <div>
                                    <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Results will appear here</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Fill in the details and click "Calculate".</p>
                                </div>
                            </Card>
                         )}
                    </div>
                </div>
                 <div className="flex justify-end pt-4">
                     <Button type="submit" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calculate Charges</Button>
                </div>
            </form>
        </Form>
    );
}
