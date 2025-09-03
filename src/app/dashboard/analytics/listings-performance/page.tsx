
// src/app/dashboard/analytics/listings-performance/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, TrendingUp, MapPin, ListChecks, FileText, Settings2, PlusCircle, ChevronsUp, Waves, Scaling, BarChart, Eye, Download, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ListingSchema } from '@/lib/schema';
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
import Link from 'next/link';

type FilterKey = 'sizeRange' | 'buildingType' | 'serviceModel' | 'availability' | 'craneAvailable' | 'roofType' | 'fireNOC' | 'eveHeightMin' | 'docksMin' | 'roofInsulation' | 'ventilation';

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

type AnalysisResult = {
    totalListings: number;
    totalViews: number;
    totalDownloads: number;
    topPerforming: (ListingSchema & { views: number, downloads: number })[];
    industryBreakdown: { name: string, value: number }[];
};

export default function ListingsPerformancePage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { listings, listingAnalytics } = useData();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);

    const [activeFilters, setActiveFilters] = React.useState<FilterKey[]>([]);
    const [open, setOpen] = React.useState(false);

    const maxSliderSize = React.useMemo(() => {
        if (!listings || listings.length === 0) return 1000000;
        const max = Math.max(...listings.map(w => w.sizeSqFt), 0);
        return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
    }, [listings]);

    const form = useForm({
        defaultValues: {
            location: '',
            sizeMin: 0,
            sizeMax: maxSliderSize,
            buildingType: '',
            serviceModel: '',
            availability: '',
            craneAvailable: undefined as boolean | undefined,
            roofType: '',
            fireNOC: undefined as boolean | undefined,
            eveHeightMin: undefined as number | undefined,
            docksMin: undefined as number | undefined,
            roofInsulation: '',
            ventilation: '',
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

    const handleGenerateAnalysis = (data: typeof form.getValues) => {
        setIsLoading(true);
        setAnalysis(null);

        let filteredListings = listings.filter(l => l.status === 'approved');

        if (data.location) {
            filteredListings = filteredListings.filter(l => l.location.toLowerCase().includes(data.location.toLowerCase()));
        }
        if (data.buildingType) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.buildingType?.toLowerCase() === data.buildingType?.toLowerCase());
        }
        if (data.serviceModel) {
            filteredListings = filteredListings.filter(l => l.serviceModel?.toLowerCase() === data.serviceModel?.toLowerCase());
        }
        if (data.availability) {
            filteredListings = filteredListings.filter(l => l.availabilityDate === data.availability);
        }
        if (data.craneAvailable !== undefined) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.craneAvailable === data.craneAvailable);
        }
        if (data.roofType) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.roofType === data.roofType);
        }
        if (data.fireNOC !== undefined) {
            filteredListings = filteredListings.filter(l => l.certificatesAndApprovals.fireNOC === data.fireNOC);
        }
        if (data.eveHeightMin !== undefined) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.eveHeightMeters !== undefined && l.buildingSpecifications.eveHeightMeters >= data.eveHeightMin!);
        }
        if (data.docksMin !== undefined) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.numberOfDocksAndShutters !== undefined && l.buildingSpecifications.numberOfDocksAndShutters >= data.docksMin!);
        }
        if (data.roofInsulation) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.roofInsulation === data.roofInsulation);
        }
        if (data.ventilation) {
            filteredListings = filteredListings.filter(l => l.buildingSpecifications.ventilation === data.ventilation);
        }
        if (data.sizeMin !== undefined && data.sizeMax !== undefined) {
          filteredListings = filteredListings.filter(l => l.sizeSqFt >= data.sizeMin! && l.sizeSqFt <= data.sizeMax!);
        }

        const filteredIds = new Set(filteredListings.map(l => l.listingId));
        const relevantAnalytics = listingAnalytics.filter(a => filteredIds.has(a.listingId));

        const totalViews = relevantAnalytics.reduce((sum, a) => sum + (a.views || 0), 0);
        const totalDownloads = relevantAnalytics.reduce((sum, a) => sum + (a.downloads || 0), 0);
        
        const topPerforming = filteredListings.map(l => {
            const analytics = listingAnalytics.find(a => a.listingId === l.listingId);
            return { ...l, views: analytics?.views || 0, downloads: analytics?.downloads || 0 };
        }).sort((a,b) => (b.views + b.downloads * 2) - (a.views + a.downloads * 2)).slice(0, 5);

        const industryBreakdownMap: Record<string, number> = {};
        relevantAnalytics.forEach(a => {
            Object.entries(a.customerIndustries).forEach(([industry, count]) => {
                industryBreakdownMap[industry] = (industryBreakdownMap[industry] || 0) + count;
            });
        });
        const industryBreakdown = Object.entries(industryBreakdownMap).map(([name, value]) => ({ name, value }));

        setTimeout(() => {
             setAnalysis({
                totalListings: filteredListings.length,
                totalViews,
                totalDownloads,
                topPerforming,
                industryBreakdown
            });
            setIsLoading(false);
        }, 1000); // Simulate network delay
    };
    
    const toggleFilter = (filterKey: FilterKey) => {
        const newActive = activeFilters.includes(filterKey) 
            ? activeFilters.filter(f => f !== filterKey)
            : [...activeFilters, filterKey];

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
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Listings Performance Analytics</h2>
                    <p className="text-muted-foreground mt-2 max-w-3xl">
                        Analyze historical performance of listings based on engagement. Add filters to refine your analysis.
                    </p>
                </div>
                
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5"/>Analysis Parameters</CardTitle>
                        <CardDescription>Set the parameters for the analysis and click "Generate" to see the insights.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <BarChart className="mr-2 h-4 w-4" />
                                {isLoading ? 'Analyzing...' : 'Generate Analysis'}
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
                            <CardContent className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-2/3" />
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
                                    <FileText className="text-primary" /> Performance Summary
                                </CardTitle>
                                <CardDescription>A summary of performance for the {analysis.totalListings} listings matching your criteria.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-secondary rounded-lg">
                                        <p className="text-sm text-muted-foreground">Total Listings</p>
                                        <p className="text-3xl font-bold">{analysis.totalListings.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-secondary rounded-lg">
                                        <p className="text-sm text-muted-foreground">Total Views</p>
                                        <p className="text-3xl font-bold">{analysis.totalViews.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-secondary rounded-lg">
                                        <p className="text-sm text-muted-foreground">Total Downloads</p>
                                        <p className="text-3xl font-bold">{analysis.totalDownloads.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="text-primary" /> Top Performing Listings
                                    </CardTitle>
                                    <CardDescription>Ranked by a weighted score of views and downloads.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.topPerforming.length > 0 ? analysis.topPerforming.map((listing) => (
                                        <Link key={listing.listingId} href={`/listings/${listing.listingId}`} target="_blank" className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{listing.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{listing.location}</p>
                                                </div>
                                                 <Badge variant="outline">{listing.listingId}</Badge>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm mt-2">
                                                <div className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {listing.views}</div>
                                                <div className="flex items-center gap-1.5"><Download className="h-4 w-4" /> {listing.downloads}</div>
                                            </div>
                                        </Link>
                                    )) : <p className="text-sm text-muted-foreground text-center py-4">No performance data for the selected criteria.</p>}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="text-primary" /> Customer Industry Breakdown
                                    </CardTitle>
                                    <CardDescription>Industries that viewed listings matching your criteria.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysis.industryBreakdown.length > 0 ? analysis.industryBreakdown
                                        .sort((a,b) => b.value - a.value)
                                        .map((industry, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm p-3 rounded-md bg-secondary/50">
                                            <span className="font-medium">{industry.name}</span>
                                            <span className="font-bold text-primary">{industry.value}</span>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground text-center py-4">No industry engagement data available.</p>}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <Alert className="text-center p-8 border-dashed">
                            <BarChart className="h-6 w-6 mx-auto mb-2" />
                            <AlertTitle className="text-lg font-semibold">Ready to Analyze Performance?</AlertTitle>
                            <AlertDescription className="mt-2">
                                Add filters and click "Generate Analysis" to reveal performance insights.
                            </AlertDescription>
                        </Alert>
                    )
                )}
            </form>
             </Form>
        </main>
    );
}
