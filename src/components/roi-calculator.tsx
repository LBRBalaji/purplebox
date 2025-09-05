
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Calculator, PlusCircle, Trash2, TrendingUp, HandCoins, DollarSign, Percent, Download, File, Share } from "lucide-react";
import { Separator } from "./ui/separator";

const roiCalculatorSchema = z.object({
  // Land Purchase Costs
  landCost: z.coerce.number().default(20000000),
  landSize: z.coerce.number().default(1),
  regCharges: z.coerce.number().default(1500000),
  
  // Construction & Development
  constructionCost: z.coerce.number().default(2500),
  devPercent: z.coerce.number().default(60),
  
  // Revenue Sources & Assumptions
  sftLoading: z.coerce.number().default(25),
  rentPerSft: z.coerce.number().default(30),
  rentalDepositMonths: z.coerce.number().default(10),
  depositInterest: z.coerce.number().default(6),
  rentEscalation: z.coerce.number().default(5),
  camCharges: z.coerce.number().default(4),

  // Land Purchase Loan
  landLoanPercent: z.coerce.number().default(70),
  landLoanInterest: z.coerce.number().default(9),
  landLoanTenure: z.coerce.number().default(10),
  
  // Construction Loan
  constLoanPercent: z.coerce.number().default(80),
  constLoanInterest: z.coerce.number().default(10),
  constLoanTenure: z.coerce.number().default(15),
});

type RoiCalculatorValues = z.infer<typeof roiCalculatorSchema>;

type ProjectionRow = {
  year: number;
  grossRevenue: number;
  loanPayment: number;
  netCashFlow: number;
  roi: number;
};

type ScenarioResult = {
  tableRows: ProjectionRow[];
  averages: {
    avg10: number;
    avg20: number;
    avg30: number;
  };
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{title}</h2>
        {children}
    </div>
);

const InputCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);


export function RoiCalculator() {
    const [nonLeveragedResult, setNonLeveragedResult] = React.useState<ScenarioResult | null>(null);
    const [leveragedResult, setLeveragedResult] = React.useState<ScenarioResult | null>(null);

    const form = useForm<RoiCalculatorValues>({
        resolver: zodResolver(roiCalculatorSchema),
        defaultValues: {
            landCost: 20000000,
            landSize: 1,
            regCharges: 1500000,
            constructionCost: 2500,
            devPercent: 60,
            sftLoading: 25,
            rentPerSft: 30,
            rentalDepositMonths: 10,
            depositInterest: 6,
            rentEscalation: 5,
            camCharges: 4,
            landLoanPercent: 70,
            landLoanInterest: 9,
            landLoanTenure: 10,
            constLoanPercent: 80,
            constLoanInterest: 10,
            constLoanTenure: 15,
        },
    });

    const watchedValues = form.watch();

    const preCalculations = React.useMemo(() => {
        const { landSize, devPercent, sftLoading, landCost, regCharges, constructionCost, landLoanPercent, constLoanPercent } = watchedValues;
        const landSizeSFT = landSize * 43560;
        const potentialArea = landSizeSFT * (devPercent / 100);
        const billableArea = potentialArea * (1 + sftLoading / 100);
        const totalLandCost = (landCost * landSize) + regCharges;
        const totalConstructionCost = potentialArea * constructionCost;
        const landLoanAmount = totalLandCost * (landLoanPercent / 100);
        const constLoanAmount = totalConstructionCost * (constLoanPercent / 100);

        return { potentialArea, billableArea, landLoanAmount, constLoanAmount };
    }, [watchedValues]);

    const formatCurrency = (value: number) => `₹ ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;

    const onSubmit = (data: RoiCalculatorValues) => {
        // Core Calculations
        const totalLandCost = (data.landCost * data.landSize) + data.regCharges;
        const landSizeSFT = data.landSize * 43560;
        const potentialArea = landSizeSFT * (data.devPercent / 100);
        const totalConstructionCost = potentialArea * data.constructionCost;
        const totalInvestment = totalLandCost + totalConstructionCost;
        const billableArea = potentialArea * (1 + data.sftLoading / 100);
        const grossMonthlyRent = billableArea * data.rentPerSft;
        const totalRentalDeposit = grossMonthlyRent * data.rentalDepositMonths;
        const interestOnDeposit = totalRentalDeposit * (data.depositInterest / 100);
        const camRevenue = billableArea * data.camCharges * 12;
        const grossAnnualRevenue = (grossMonthlyRent * 12) + interestOnDeposit + camRevenue;

        const generateProjections = (annualLandLoanPayment: number, annualConstLoanPayment: number) => {
            let currentRevenue = grossAnnualRevenue;
            let rows: ProjectionRow[] = [];
            let totalRoi = 0;
            const averages = { avg10: 0, avg20: 0, avg30: 0 };

            for (let year = 1; year <= 30; year++) {
                const landPayment = year <= data.landLoanTenure ? annualLandLoanPayment : 0;
                const constPayment = year <= data.constLoanTenure ? annualConstLoanPayment : 0;
                const totalLoanPayment = landPayment + constPayment;
                const netCashFlow = currentRevenue - totalLoanPayment;
                const roi = totalInvestment > 0 ? (netCashFlow / totalInvestment) * 100 : 0;
                totalRoi += roi;

                rows.push({ year, grossRevenue: currentRevenue, loanPayment: totalLoanPayment, netCashFlow, roi });
                currentRevenue *= (1 + data.rentEscalation / 100);

                if (year === 10) averages.avg10 = totalRoi / 10;
                if (year === 20) averages.avg20 = totalRoi / 20;
            }
            averages.avg30 = totalRoi / 30;
            return { tableRows: rows, averages };
        };

        // Non-Leveraged Scenario
        setNonLeveragedResult(generateProjections(0, 0));

        // Leveraged Scenario
        const landLoanAmount = totalLandCost * (data.landLoanPercent / 100);
        const constLoanAmount = totalConstructionCost * (data.constLoanPercent / 100);

        const calculateEMI = (p:number, r:number, n:number) => {
            if (p === 0 || r === 0 || n === 0) return 0;
            const monthlyRate = r / 12 / 100;
            const numMonths = n * 12;
            const emi = p * monthlyRate * Math.pow(1 + monthlyRate, numMonths) / (Math.pow(1 + monthlyRate, numMonths) - 1);
            return isNaN(emi) ? 0 : emi;
        };

        const annualLandLoanPayment = calculateEMI(landLoanAmount, data.landLoanInterest, data.landLoanTenure) * 12;
        const annualConstLoanPayment = calculateEMI(constLoanAmount, data.constLoanInterest, data.constLoanTenure) * 12;

        setLeveragedResult(generateProjections(annualLandLoanPayment, annualConstLoanPayment));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Section title="Inputs">
                    <InputCard title="Land Purchase Costs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="landCost" render={({ field }) => (<FormItem><FormLabel>Land Cost per Acre</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="landSize" render={({ field }) => (<FormItem><FormLabel>Size of Land (Acres)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="regCharges" render={({ field }) => (<FormItem><FormLabel>Registration Charges</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </InputCard>
                    <InputCard title="Construction & Development">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="constructionCost" render={({ field }) => (<FormItem><FormLabel>Cost of Construction per SFT</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="devPercent" render={({ field }) => (<FormItem><FormLabel>Land for Construction (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-md">Potential Area: <span className="font-semibold text-gray-700">{preCalculations.potentialArea.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span> SFT</div><FormMessage /></FormItem>)} />
                        </div>
                    </InputCard>
                    <InputCard title="Revenue Sources & Assumptions">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="sftLoading" render={({ field }) => (<FormItem><FormLabel>% SFT Loading</FormLabel><FormControl><Input type="number" {...field} /></FormControl><div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-md">Billable Area: <span className="font-semibold text-gray-700">{preCalculations.billableArea.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span> SFT</div><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="rentPerSft" render={({ field }) => (<FormItem><FormLabel>Rent per SFT</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="rentalDepositMonths" render={({ field }) => (<FormItem><FormLabel># Months Deposit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="depositInterest" render={({ field }) => (<FormItem><FormLabel>Interest on Deposit (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="rentEscalation" render={({ field }) => (<FormItem><FormLabel>Annual Escalation (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="camCharges" render={({ field }) => (<FormItem><FormLabel>CAM per SFT</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </InputCard>
                    <InputCard title="Leveraged Model Inputs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-600">Land Purchase Loan</h4>
                                <FormField control={form.control} name="landLoanPercent" render={({ field }) => (<FormItem><FormLabel>% of Loan</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="landLoanInterest" render={({ field }) => (<FormItem><FormLabel>Interest (% p.a.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="landLoanTenure" render={({ field }) => (<FormItem><FormLabel>Tenure (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-md">Calculated Loan Amount: <span className="font-semibold text-gray-700">{formatCurrency(preCalculations.landLoanAmount)}</span></div>
                            </div>
                             <div className="space-y-4">
                                <h4 className="font-semibold text-gray-600">Construction Loan</h4>
                                <FormField control={form.control} name="constLoanPercent" render={({ field }) => (<FormItem><FormLabel>% of Loan</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="constLoanInterest" render={({ field }) => (<FormItem><FormLabel>Interest (% p.a.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="constLoanTenure" render={({ field }) => (<FormItem><FormLabel>Tenure (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-md">Calculated Loan Amount: <span className="font-semibold text-gray-700">{formatCurrency(preCalculations.constLoanAmount)}</span></div>
                            </div>
                        </div>
                    </InputCard>
                </Section>
                 <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full">
                        <Calculator className="mr-2 h-5 w-5" /> Calculate Projections
                    </Button>
                </div>
            </form>
        </Form>
    );
}
