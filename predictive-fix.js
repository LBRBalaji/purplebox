const fs = require('fs');

// ── FIX 1: Update AI flow to accept live data ─────────────────
const newFlow = `'use server';

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { 
    demandSchema, 
    listingSchema, 
    PredictDemandTrendsInputSchema, 
    PredictDemandTrendsOutputSchema,
    type PredictDemandTrendsInput,
    type PredictDemandTrendsOutput,
} from '@/lib/schema';

export async function predictDemandTrends(input: PredictDemandTrendsInput): Promise<PredictDemandTrendsOutput> {
  return predictDemandTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDemandTrendsPrompt',
  model: googleAI.model('gemini-1.5-flash:latest'),
  input: {schema: z.object({
    timeHorizon: z.string(),
    location: z.string().optional(),
    buildingType: z.string().optional(),
    warehouseModel: z.string().optional(),
    availability: z.string().optional(),
    craneAvailable: z.boolean().optional(),
    roofType: z.string().optional(),
    fireNOC: z.boolean().optional(),
    eveHeightMin: z.number().optional(),
    docksMin: z.number().optional(),
    roofInsulation: z.string().optional(),
    ventilation: z.string().optional(),
    sizeMin: z.number().optional(),
    sizeMax: z.number().optional(),
    demands: z.array(demandSchema),
    listings: z.array(listingSchema),
    submissions: z.array(z.any()),
    analytics: z.array(z.any()),
  })},
  output: {schema: PredictDemandTrendsOutputSchema},
  prompt: \`You are a highly experienced real estate market analyst specializing in the Indian warehousing and industrial sector.
  Your task is to predict future demand trends for the {{{timeHorizon}}}.
  
  Your analysis should be based on the provided LIVE historical data from the platform, filtered by the following user-defined criteria:
  {{#if location}}- **Location Focus**: Focus specifically on **{{{location}}}**.{{/if}}
  {{#if buildingType}}- **Building Type**: Filter for **{{{buildingType}}}**.{{/if}}
  {{#if availability}}- **Availability**: Filter for **{{{availability}}}**.{{/if}}
  {{#if craneAvailable}}- **Crane**: Properties where crane is available.{{/if}}
  {{#if roofType}}- **Roof Type**: **{{{roofType}}}** roof.{{/if}}
  {{#if fireNOC}}- **Fire NOC**: Properties where Fire NOC is obtained.{{/if}}
  {{#if eveHeightMin}}- **Eve Height**: >= **{{{eveHeightMin}}}** meters.{{/if}}
  {{#if docksMin}}- **Docks**: >= **{{{docksMin}}}** docks.{{/if}}
  {{#if roofInsulation}}- **Roof Insulation**: **{{{roofInsulation}}}**.{{/if}}
  {{#if ventilation}}- **Ventilation**: **{{{ventilation}}}** type.{{/if}}
  {{#if sizeMin}}- **Size**: Between **{{{sizeMin}}}** and **{{{sizeMax}}}** sq. ft.{{/if}}

  Analyze these LIVE data sets from the platform:
  1. **Demand Data**: Customer requirements — locations, sizes, readiness timelines, priorities
  2. **Listings Data**: Current supply — property types, specifications, availability
  3. **Submissions Data**: Matched listings to demands — shows market fit
  4. **Analytics Data**: Views and downloads — signals unstated demand

  Provide a predictive report with:
  - **Market Outlook**: High-level forward-looking summary
  - **Predicted Hotspots**: Specific locations that will see demand surge with reasoning
  - **Trending Specifications**: Features most sought after with specific reasoning

  Be insightful, data-driven and actionable. Make forward-looking predictions, not historical restatements.

  **LIVE Platform Data:**
  - Demands: {{{json demands}}}
  - Listings: {{{json listings}}}
  - Submissions: {{{json submissions}}}
  - Engagement Analytics: {{{json analytics}}}
  \`,
});

const predictDemandTrendsFlow = ai.defineFlow(
  {
    name: 'predictDemandTrendsFlow',
    inputSchema: PredictDemandTrendsInputSchema,
    outputSchema: PredictDemandTrendsOutputSchema,
  },
  async (input) => {
    let filteredListings = (input.listings || []) as any[];

    if (input.location) { const loc = input.location.toLowerCase(); filteredListings = filteredListings.filter(l => l.location?.toLowerCase().includes(loc)); }
    if (input.buildingType) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.buildingType?.some((t: string) => t.toLowerCase() === input.buildingType?.toLowerCase())); }
    if (input.warehouseModel) { filteredListings = filteredListings.filter(l => l.warehouseModel?.toLowerCase() === input.warehouseModel?.toLowerCase()); }
    if (input.availability) { filteredListings = filteredListings.filter(l => l.availabilityDate === input.availability); }
    if (input.craneAvailable !== undefined) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.craneAvailable === input.craneAvailable); }
    if (input.roofType) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.roofType === input.roofType); }
    if (input.fireNOC !== undefined) { filteredListings = filteredListings.filter(l => l.certificatesAndApprovals?.fireNOC === input.fireNOC); }
    if (input.eveHeightMin !== undefined) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.eveHeightMeters !== undefined && l.buildingSpecifications.eveHeightMeters >= input.eveHeightMin!); }
    if (input.docksMin !== undefined) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.numberOfDocksAndShutters !== undefined && l.buildingSpecifications.numberOfDocksAndShutters >= input.docksMin!); }
    if (input.roofInsulation) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.roofInsulation === input.roofInsulation); }
    if (input.ventilation) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.ventilation === input.ventilation); }
    if (input.sizeMin !== undefined && input.sizeMax !== undefined) { filteredListings = filteredListings.filter(l => l.sizeSqFt >= input.sizeMin! && l.sizeSqFt <= input.sizeMax!); }

    const {output} = await prompt({
      ...input,
      listings: filteredListings,
      demands: input.demands || [],
      submissions: input.submissions || [],
      analytics: input.analytics || [],
    });
    return output!;
  }
);`;

fs.writeFileSync('src/ai/flows/predict-demand-trends.ts', newFlow);
console.log('AI flow updated');

// ── FIX 2: Redesign the page ──────────────────────────────────
const newPage = `'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, TrendingUp, MapPin, ListChecks, FileText, Settings2, PlusCircle, Check, ChevronRight, Brain, Zap, AlertCircle } from 'lucide-react';
import { predictDemandTrends } from '@/ai/flows/predict-demand-trends';
import { useToast } from '@/hooks/use-toast';
import type { PredictDemandTrendsInput, PredictDemandTrendsOutput } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Slider } from '@/components/ui/slider';

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

// ── AI Thinking Animation ─────────────────────────────────────
const AIThinking = () => {
  const steps = [
    'Reading live platform data...',
    'Analysing demand patterns...',
    'Studying listing engagement...',
    'Cross-referencing submissions...',
    'Generating market predictions...',
    'Finalising insights...',
  ];
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-card rounded-2xl border border-primary/20 p-8 text-center space-y-4">
      <div className="relative mx-auto h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>
      <div>
        <p className="font-bold text-foreground text-lg">Gemini AI is analysing...</p>
        <p className="text-sm text-muted-foreground mt-1 animate-pulse">{steps[step]}</p>
      </div>
      <div className="flex justify-center gap-1.5 pt-2">
        {steps.map((_, i) => <div key={i} className={\`h-1.5 rounded-full transition-all duration-500 \${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'}\`} />)}
      </div>
    </div>
  );
};

// ── Hotspot Card ──────────────────────────────────────────────
const HotspotCard = ({ location, reasoning, growthPercentage, rank }: { location: string; reasoning: string; growthPercentage?: string; rank: number }) => (
  <div className="bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all p-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <div className={\`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black \${rank===1?'bg-amber-100 text-amber-700':rank===2?'bg-slate-100 text-slate-600':rank===3?'bg-orange-50 text-orange-600':'bg-primary/10 text-primary'}\`}>{rank}</div>
        <h4 className="font-bold text-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{location}</h4>
      </div>
      {growthPercentage && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex-shrink-0"><TrendingUp className="h-3 w-3" />{growthPercentage}% Growth</span>}
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{reasoning}</p>
  </div>
);

// ── Spec Card ─────────────────────────────────────────────────
const SpecCard = ({ specification, reasoning, index }: { specification: string; reasoning: string; index: number }) => (
  <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-2xl border border-border">
    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Zap className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="font-bold text-foreground text-sm">{specification}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{reasoning}</p>
    </div>
  </div>
);

export default function PredictiveAnalyticsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { listings, demands, submissions, listingAnalytics } = useData();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<PredictDemandTrendsOutput | null>(null);
  const [activeFilters, setActiveFilters] = React.useState<FilterKey[]>([]);
  const [open, setOpen] = React.useState(false);

  const maxSliderSize = React.useMemo(() => {
    const max = Math.max(...(listings || []).map(w => w.sizeSqFt), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 1000000;
  }, [listings]);

  const form = useForm<PredictDemandTrendsInput>({ defaultValues: { timeHorizon: 'next quarter', location: '', sizeMin: 0, sizeMax: maxSliderSize } });

  React.useEffect(() => { form.reset({ ...form.formState.defaultValues, sizeMin: 0, sizeMax: maxSliderSize }); }, [maxSliderSize]);

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => { if (!isAuthLoading && !hasAccess) router.push('/dashboard'); }, [user, isAuthLoading, router, hasAccess]);

  const handleGenerateAnalysis = async (data: PredictDemandTrendsInput) => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await predictDemandTrends({
        ...data,
        listings: listings || [],
        demands: demands || [],
        submissions: submissions || [],
        analytics: listingAnalytics || [],
      });
      setAnalysis(result);
    } catch (error) {
      const e = error as Error;
      toast({ variant: 'destructive', title: 'Analysis Failed', description: e.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (key: FilterKey) => {
    const newActive = activeFilters.includes(key) ? activeFilters.filter(f => f !== key) : [...activeFilters, key];
    if (!newActive.includes(key)) {
      if (key === 'sizeRange') { form.setValue('sizeMin', 0); form.setValue('sizeMax', maxSliderSize); }
      else { form.setValue(key as any, undefined); }
    }
    setActiveFilters(newActive);
  };

  if (isAuthLoading || !hasAccess) return null;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleGenerateAnalysis)} className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> Predictive Demand Analytics
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Gemini AI analyses your live platform data to forecast warehouse market trends.</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-xl px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live Firestore Data
            </div>
          </div>

          {/* Parameters Panel */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Settings2 className="h-4 w-4 text-primary" /></div>
              <div><h3 className="font-bold text-foreground">Analysis Parameters</h3><p className="text-xs text-muted-foreground">Configure and click Generate to get AI insights</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="timeHorizon" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time Horizon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="next quarter">Next Quarter</SelectItem>
                      <SelectItem value="next 6 months">Next 6 Months</SelectItem>
                      <SelectItem value="next year">Next Year</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Focus Location (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. Chennai, Oragadam" {...field} className="rounded-xl" /></FormControl>
                </FormItem>
              )} />
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Add Data Filters</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {activeFilters.length > 0 ? \`\${activeFilters.length} filter\${activeFilters.length > 1 ? 's' : ''} active\` : 'Select filters...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0 rounded-xl">
                    <Command>
                      <CommandInput placeholder="Search filters..." />
                      <CommandList>
                        <CommandEmpty>No filters found.</CommandEmpty>
                        <CommandGroup>
                          {availableFilters.map(f => (
                            <CommandItem key={f.value} value={f.label} onSelect={() => { toggleFilter(f.value); setOpen(true); }}>
                              <Check className={cn('mr-2 h-4 w-4', activeFilters.includes(f.value) ? 'opacity-100' : 'opacity-0')} />
                              {f.label}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-dashed border-border">
                {activeFilters.includes('sizeRange') && (
                  <FormField control={form.control} name="sizeMin" render={() => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Size Range (Sq. Ft.) — {(form.watch('sizeMin')||0).toLocaleString()} to {(form.watch('sizeMax')||maxSliderSize).toLocaleString()}</FormLabel>
                      <FormControl>
                        <Slider min={0} max={maxSliderSize} step={10000} value={[form.watch('sizeMin')||0, form.watch('sizeMax')||maxSliderSize]} onValueChange={v => { form.setValue('sizeMin', v[0]); form.setValue('sizeMax', v[1]); }} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('buildingType') && (
                  <FormField control={form.control} name="buildingType" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Building Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="PEB">PEB</SelectItem><SelectItem value="RCC">RCC</SelectItem></SelectContent></Select>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('availability') && (
                  <FormField control={form.control} name="availability" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Availability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem><SelectItem value="Under Construction">Under Construction</SelectItem></SelectContent></Select>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('roofType') && (
                  <FormField control={form.control} name="roofType" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Roof Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Galvalume">Galvalume</SelectItem><SelectItem value="RCC">RCC</SelectItem><SelectItem value="ACC">ACC</SelectItem></SelectContent></Select>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('roofInsulation') && (
                  <FormField control={form.control} name="roofInsulation" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Roof Insulation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Insulated">Insulated</SelectItem><SelectItem value="Non-Insulated">Non-Insulated</SelectItem></SelectContent></Select>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('ventilation') && (
                  <FormField control={form.control} name="ventilation" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ventilation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Turbo">Turbo</SelectItem><SelectItem value="Ridge">Ridge</SelectItem></SelectContent></Select>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('eveHeightMin') && (
                  <FormField control={form.control} name="eveHeightMin" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Min Eve Height (m)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value??''} onChange={e => field.onChange(e.target.value===''?undefined:+e.target.value)} className="rounded-xl" /></FormControl>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('docksMin') && (
                  <FormField control={form.control} name="docksMin" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Min Docks</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value??''} onChange={e => field.onChange(e.target.value===''?undefined:+e.target.value)} className="rounded-xl" /></FormControl>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('craneAvailable') && (
                  <FormField control={form.control} name="craneAvailable" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                      <FormLabel className="text-sm font-medium">Crane Available</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                )}
                {activeFilters.includes('fireNOC') && (
                  <FormField control={form.control} name="fireNOC" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                      <FormLabel className="text-sm font-medium">Fire NOC Obtained</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                )}
              </div>
            )}

            {/* Data Summary */}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" />{(listings||[]).length} listings</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" />{(demands||[]).length} demands</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" />{(submissions||[]).length} submissions</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" />{(listingAnalytics||[]).length} analytics records</span>
              </div>
              <Button type="submit" disabled={isLoading} className="ml-auto rounded-xl gap-2 px-6">
                <Sparkles className="h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Analysis'}
              </Button>
            </div>
          </div>

          {/* AI Thinking */}
          {isLoading && <AIThinking />}

          {/* Results */}
          {analysis && !isLoading && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">

              {/* Market Outlook */}
              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-4 w-4 text-primary" /></div>
                  <div><h3 className="font-bold text-foreground">Market Outlook</h3><p className="text-xs text-muted-foreground">AI-generated summary for {form.getValues('timeHorizon')}</p></div>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full"><Sparkles className="h-3 w-3" /> Gemini AI</span>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{analysis.marketOutlook}</p>
              </div>

              {/* Hotspots + Specs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>
                    <div><h3 className="font-bold text-foreground">Predicted Demand Hotspots</h3><p className="text-xs text-muted-foreground">Locations forecast to see demand surge</p></div>
                  </div>
                  <div className="space-y-3">
                    {analysis.predictedHotspots.map((h, i) => <HotspotCard key={i} location={h.location} reasoning={h.reasoning} growthPercentage={h.growthPercentage} rank={i+1} />)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><ListChecks className="h-4 w-4 text-primary" /></div>
                    <div><h3 className="font-bold text-foreground">Trending Specifications</h3><p className="text-xs text-muted-foreground">Features forecast to be most in demand</p></div>
                  </div>
                  <div className="space-y-3">
                    {analysis.trendingSpecifications.map((s, i) => <SpecCard key={i} specification={s.specification} reasoning={s.reasoning} index={i} />)}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Empty State */}
          {!analysis && !isLoading && (
            <div className="bg-card rounded-2xl border border-dashed border-primary/30 p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Ready to See the Future?</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Configure your parameters above and click Generate Analysis. Gemini AI will analyse your live platform data to forecast warehouse market trends.</p>
            </div>
          )}

        </form>
      </Form>
    </main>
  );
}`;

fs.writeFileSync('src/app/dashboard/analytics/predictive/page.tsx', newPage);
console.log('Page updated');
console.log('All done!');
