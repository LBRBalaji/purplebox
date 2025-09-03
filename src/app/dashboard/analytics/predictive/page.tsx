// src/app/dashboard/analytics/predictive/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, TrendingUp, MapPin, ListChecks, FileText, Settings2, PlusCircle, ChevronsUp, Waves, Scaling } from 'lucide-react';
import { predictDemandTrends } from '@/ai/flows/predict-demand-trends';
import { useToast } from '@/hooks/use-toast';
import type { PredictDemandTrendsInput, PredictDemandTrendsOutput } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from '@/components/ui/check';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Slider } from '@/components/ui/slider';
import { useData } from '@/contexts/data-context';

type FilterKey = 'buildingType' | 'serviceModel' | 'availability' | 'craneAvailable' | 'roofType' | 'fireNOC' | 'eveHeightMin' | 'docksMin' | 'roofInsulation' | 'ventilation' | 'sizeRange';

const availableFilters: { value: FilterKey; label: string }[] = [
    { value: 'sizeRange', label: 'Size Range' },
    { value: 'buildingType', label: 'Building Type' },
    { value: 'serviceModel', label: 'Service Model' },
    { value: 'availability', label: 'Availability' },
    { value: 'craneAvailable', label: 'Crane Available' },
    { value: 'roofType', label: 'Roof Type' },
    { value: 'fireNOC', label: 'Fire NOC Status' },
    { value: 'eveHeightMin', label: 'Min Eve Height (m)' },
    { value: 'docksMin', label: 'Min Docks' },
    { value: 'roofInsulation', label: 'Roof Insulation' },
    { value: 'ventilation', label: 'Ventilation Type' },
];

export default function PredictiveAnalyticsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { listings } = useData();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [analysis, setAnalysis] = React.useState<PredictDemandTrendsOutput | null>(null);

    // State for filters
    const [activeFilters, setActiveFilters] = React.useState<FilterKey[]>([]);
    const [open, setOpen] = React.useState(false);

    const maxSliderSize = React.useMemo(() => {
        const max = Math.max(...listings.map(w => w.sizeSqFt), 0);
        return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
    }, [listings]);

    const form = useForm<PredictDemandTrendsInput>({
        defaultValues: {
            timeHorizon: 'next quarter',
            location: '',
            sizeMin: 0,
            sizeMax: maxSliderSize
        }
    });

    React.useEffect(() => {
      form.reset({
        ...form.formState.defaultValues,
        sizeMin: 0,
        sizeMax: maxSliderSize,
      })
    }, [maxSliderSize, form])

    React.useEffect(() => {
        if (!isAuthLoading && user?.email !== 'admin@example.com' && user?.role !== 'O2O') {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    const handleGenerateAnalysis = async (data: PredictDemandTrendsInput) => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await predictDemandTrends(data);
            setAnalysis(result);
        } catch (error) {
            console.error("Failed to generate predictive analysis:", error);
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: "Analysis Failed",
                description: e.message || "An unexpected error occurred."
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleFilter = (filterKey: FilterKey) => {
        const newActive = activeFilters.includes(filterKey) 
            ? activeFilters.filter(f => f !== filterKey)
            : [...activeFilters, filterKey];

        // Clean up filter value when removing
        if (!newActive.includes(filterKey)) {
             if (filterKey === 'sizeRange') {
                form.setValue('sizeMin', 0);
                form.setValue('sizeMax', maxSliderSize);
            } else {
                form.setValue(filterKey as any, undefined);
            }
        }
        setActiveFilters(newActive);
    }
    
    if (isAuthLoading || (user && user.email !== 'admin@example.com' && user.role !== 'O2O')) {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
             <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateAnalysis)} className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Predictive Demand Analytics</h2>
                    <p className="text-muted-foreground mt-2 max-w-3xl">
                        Leverage AI to forecast market trends based on your platform's historical data. Add filters to refine your analysis.
                    </p>
                </div>
                
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5"/>Analysis Parameters</CardTitle>
                        <CardDescription>Set the parameters for the analysis and click "Generate" to see the insights.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <FormField control={form.control} name="timeHorizon" render={({ field }) => (
                                <FormItem><FormLabel>Time Horizon</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="next quarter">Next Quarter</SelectItem>
                                        <SelectItem value="next 6 months">Next 6 Months</SelectItem>
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Focus Location (Optional)</FormLabel><FormControl><Input placeholder="e.g. Chennai, Oragadam" {...field} /></FormControl></FormItem>
                            )}/>
                             <div className="space-y-2">
                                <Label>Add Data Filters</Label>
                                 <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-start"
                                        >
                                           <PlusCircle className="mr-2 h-4 w-4" />
                                           Select filters...
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search filters..." />
                                            <CommandList>
                                                <CommandEmpty>No filters found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableFilters.map((filter) => (
                                                        <CommandItem
                                                            key={filter.value}
                                                            value={filter.label}
                                                            onSelect={() => {
                                                                toggleFilter(filter.value);
                                                                setOpen(true);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", activeFilters.includes(filter.value) ? "opacity-100" : "opacity-0")} />
                                                            <span>{filter.label}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {activeFilters.length > 0 && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-dashed">
                               {activeFilters.includes('sizeRange') && (
                                   <FormField control={form.control} name="sizeMin" render={() => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Size Range (Sq. Ft.)</FormLabel>
                                             <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={maxSliderSize}
                                                    step={10000}
                                                    value={[form.watch('sizeMin') || 0, form.watch('sizeMax') || maxSliderSize]}
                                                    onValueChange={(value) => {
                                                        form.setValue('sizeMin', value[0]);
                                                        form.setValue('sizeMax', value[1]);
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{(form.watch('sizeMin') || 0).toLocaleString()}</span>
                                                <span>{(form.watch('sizeMax') || maxSliderSize).toLocaleString()}</span>
                                            </div>
                                        </FormItem>
                                    )} />
                                )}
                               {activeFilters.includes('buildingType') && (
                                     <FormField control={form.control} name="buildingType" render={({ field }) => (
                                        <FormItem><FormLabel>Building Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="PEB">PEB</SelectItem><SelectItem value="RCC">RCC</SelectItem>
                                        </SelectContent></Select></FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('serviceModel') && (
                                     <FormField control={form.control} name="serviceModel" render={({ field }) => (
                                        <FormItem><FormLabel>Service Model</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="Standard">Standard</SelectItem><SelectItem value="3PL">3PL</SelectItem><SelectItem value="Both">Both</SelectItem>
                                        </SelectContent></Select></FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('availability') && (
                                     <FormField control={form.control} name="availability" render={({ field }) => (
                                        <FormItem><FormLabel>Availability</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem><SelectItem value="Available in 3 months">Available in 3 months</SelectItem><SelectItem value="Under Construction">Under Construction</SelectItem>
                                        </SelectContent></Select></FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('roofType') && (
                                     <FormField control={form.control} name="roofType" render={({ field }) => (
                                        <FormItem><FormLabel>Roof Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="Galvalume">Galvalume</SelectItem><SelectItem value="RCC">RCC</SelectItem><SelectItem value="ACC">ACC</SelectItem>
                                        </SelectContent></Select></FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('eveHeightMin') && (
                                    <FormField control={form.control} name="eveHeightMin" render={({ field }) => (
                                       <FormItem><FormLabel>Min Eve Height (m)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl></FormItem>
                                   )} />
                               )}
                               {activeFilters.includes('docksMin') && (
                                    <FormField control={form.control} name="docksMin" render={({ field }) => (
                                       <FormItem><FormLabel>Min Docks</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl></FormItem>
                                   )} />
                               )}
                               {activeFilters.includes('roofInsulation') && (
                                     <FormField control={form.control} name="roofInsulation" render={({ field }) => (
                                        <FormItem><FormLabel>Roof Insulation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="Insulated">Insulated</SelectItem><SelectItem value="Non-Insulated">Non-Insulated</SelectItem>
                                        </SelectContent></Select></FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('ventilation') && (
                                     <FormField control={form.control} name="ventilation" render={({ field }) => (
                                        <FormItem><FormLabel>Ventilation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                            <SelectItem value="Turbo">Turbo</SelectItem><SelectItem value="Ridge">Ridge</SelectItem>
                                        </SelectContent></Select></FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('craneAvailable') && (
                                    <FormField control={form.control} name="craneAvailable" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-3">
                                            <FormLabel>Crane Available</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                               )}
                               {activeFilters.includes('fireNOC') && (
                                    <FormField control={form.control} name="fireNOC" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-3">
                                            <FormLabel>Fire NOC Obtained</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                               )}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} size="lg">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isLoading ? 'Generating...' : 'Generate Analysis'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
                {isLoading && (
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-1/3" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                                <CardContent className="space-y-4">
                                     <Skeleton className="h-16 w-full" />
                                     <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {analysis ? (
                    <div className="space-y-8 animate-in fade-in-50">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="text-primary" /> Market Outlook
                                </CardTitle>
                                <CardDescription>An AI-generated summary of predicted trends for the selected parameters.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground whitespace-pre-wrap">{analysis.marketOutlook}</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="text-primary" /> Predicted Demand Hotspots
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.predictedHotspots.map((hotspot, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-secondary/50">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> {hotspot.location}
                                                {hotspot.growthPercentage && <Badge variant="secondary">{hotspot.growthPercentage}% Growth</Badge>}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1 pl-6">{hotspot.reasoning}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ListChecks className="text-primary" /> Trending Specifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.trendingSpecifications.map((spec, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-secondary/50">
                                            <h4 className="font-semibold">{spec.specification}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{spec.reasoning}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <Alert className="text-center p-8 border-dashed">
                            <Sparkles className="h-6 w-6 mx-auto mb-2" />
                            <AlertTitle className="text-lg font-semibold">Ready to See the Future?</AlertTitle>
                            <AlertDescription className="mt-2">
                                Add filters and click "Generate Analysis" to reveal predictive insights.
                            </AlertDescription>
                        </Alert>
                    )
                )}
            </form>
             </Form>
        </main>
    );
}
