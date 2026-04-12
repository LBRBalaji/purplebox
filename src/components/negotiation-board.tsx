

'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { negotiationBoardSchema, type NegotiationBoardSchema, type ListingSchema, type HistoryEntry } from '@/lib/schema';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2, Home, Power, Droplets, ShieldCheck, User, FolderArchive, FileSymlink, DollarSign, Calendar, Users, Share, FileText, FileSignature, TrendingUp, Notebook, Download, Warehouse, ChevronsUpDown, AlertTriangle, History, Info, Edit, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead, TableFooter } from './ui/table';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';

// All term sheet sections from the lease term sheet template
const TERM_SHEET_SECTIONS = [
  {
    id: 'siteInfo', label: '1. Site Information', icon: 'MapPin',
    fields: [
      { id: '1.1', label: 'Postal Address of Facility', type: 'text', listingKey: 'location' },
      { id: '1.2', label: 'Building Number', type: 'text', listingKey: 'warehouseBoxId' },
      { id: '1.4', label: 'Google Coordinates', type: 'text', listingKey: 'latLng' },
      { id: '1.5', label: 'Building Status', type: 'select', options: ['Ready for Occupancy', 'Under Construction', 'BTS-Built To Suit'], listingKey: 'availabilityDate' },
    ]
  },
  {
    id: 'area', label: '2. Area (SFT)', icon: 'Home',
    fields: [
      { id: '2.1', label: 'Plinth Area (Shop Floor) - SFT', type: 'number', listingKey: 'area.plinthArea' },
      { id: '2.2', label: 'Mezzanine Area 1 - SFT', type: 'number', listingKey: 'area.mezzanineArea1' },
      { id: '2.3', label: 'Mezzanine Area 2 - SFT', type: 'number', listingKey: 'area.mezzanineArea2' },
      { id: '2.4', label: 'Canopy Area - SFT', type: 'number', listingKey: 'area.canopyArea' },
      { id: '2.5', label: "Driver's Rest Room - SFT", type: 'number', listingKey: 'area.driversRestRoomArea' },
      { id: '2.6', label: 'Total Chargeable Area - SFT', type: 'number', listingKey: 'area.totalChargeableArea' },
    ]
  },
  {
    id: 'tenantImprovements', label: '3. Tenant Improvement Items', icon: 'HardHat',
    fields: [
      { id: '3.1', label: 'Electricity Power', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
      { id: '3.2', label: 'Internal Cabling & Power Gear', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
      { id: '3.3', label: 'HVAC', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Not Required'] },
      { id: '3.4', label: 'Mechanised Access to Mezzanine', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Not Required'] },
      { id: '3.5', label: 'Wash Rooms on Mezzanine Floor', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Not Required'] },
      { id: '3.6', label: 'Ramp (if required due to partition)', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Not Required'] },
    ]
  },
  {
    id: 'leaseTerms', label: '4. Lease Terms', icon: 'Calendar',
    fields: [
      { id: '4.1', label: 'Lease Tenure', type: 'select', options: ['1 Year', '2 Years', '3 Years', '5 Years', '7 Years', '9 Years', '10 Years', 'Custom'] },
      { id: '4.2', label: 'Lease Lock-In Period', type: 'select', options: ['None', '6 Months', '1 Year', '2 Years', '3 Years', 'Custom'] },
      { id: '4.3', label: 'Tentative Handover Date for Fitout', type: 'date' },
      { id: '4.4', label: 'Tentative 100% Handover Date', type: 'date' },
      { id: '4.5', label: 'Rent Free Period (for Fitout)', type: 'select', options: ['None', '1 Month', '2 Months', '3 Months', 'Custom'] },
      { id: '4.6', label: 'Chargeable Area - SFT', type: 'number', listingKey: 'area.totalChargeableArea' },
      { id: '4.7', label: 'Lease Commencement Date', type: 'date' },
      { id: '4.8', label: 'Rent Commencement Date (Post Rent Free)', type: 'date' },
      { id: '4.9', label: 'Scope & Cost of Lease Registration', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared 50:50'] },
    ]
  },
  {
    id: 'commercialTerms', label: '5. Commercial Terms', icon: 'HandCoins',
    fields: [
      { id: '5.1', label: 'Chargeable Area - SFT', type: 'number', listingKey: 'area.totalChargeableArea' },
      { id: '5.2a', label: 'Building Rent per SFT (INR)', type: 'number', listingKey: 'rentPerSqFt' },
      { id: '5.2b', label: 'Building Rent - Total Chargeable Area per Month (INR)', type: 'number' },
      { id: '5.3', label: 'Monthly Amortization - CAPEX Item 1 (excl. GST)', type: 'number' },
      { id: '5.4', label: 'Monthly Amortization - CAPEX Item 2 (excl. GST)', type: 'number' },
      { id: '5.5', label: 'Monthly Amortization - CAPEX Item 3 (excl. GST)', type: 'number' },
      { id: '5.6', label: 'Net Total Rental incl. CAPEX Amortization (excl. GST)', type: 'number' },
      { id: '5.7', label: 'CAM Charges per SFT (excl. GST)', type: 'number', listingKey: 'camCharges' },
      { id: '5.8', label: 'IFRSD - Interest Free Refundable Security Deposit', type: 'number' },
      { id: '5.9', label: 'Rent Escalation % and Frequency', type: 'text' },
      { id: '5.10', label: 'Commitment for Phase II', type: 'radio', options: ['Yes', 'No', 'To be discussed'] },
      { id: '5.11', label: 'Additional Charges', type: 'text' },
    ]
  },
  {
    id: 'electrical', label: '6. Electrical Infrastructure', icon: 'Power',
    fields: [
      { id: '6.1', label: 'Installed Capacity of Sub-Station in Park', type: 'text' },
      { id: '6.2', label: 'Power Requirement - Phase I', type: 'text' },
      { id: '6.3', label: 'Power Requirement - Phase II', type: 'text' },
      { id: '6.4', label: 'Scope of Providing Required Power', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
      { id: '6.15', label: 'Genset Requirement', type: 'radio', options: ['Yes', 'No'] },
      { id: '6.16', label: 'Genset Capacity (if required)', type: 'text' },
      { id: '6.18', label: 'HVAC Requirement', type: 'radio', options: ['Yes', 'No'] },
      { id: '6.19', label: 'HVAC Capacity (if required)', type: 'text' },
      { id: '6.21', label: 'False Ceiling', type: 'radio', options: ['Yes', 'No', 'Partial'] },
    ]
  },
  {
    id: 'legal', label: '7. Legal & Statutory Compliances', icon: 'ShieldCheck',
    fields: [
      { id: '7.1', label: 'Building Plan Approved By & Approval Number', type: 'text' },
      { id: '7.2', label: 'Status & Scope of Fire License & NOC', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
      { id: '7.3', label: 'Business Licenses / PCB CTO - Scope', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope'] },
      { id: '7.4', label: 'All Building/Property Approvals & Taxes', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope'] },
      { id: '7.5', label: 'Title Due-Diligence', type: 'lessor_lessee', options: ['Lessor to Provide', 'Lessee to Conduct', 'Jointly'] },
    ]
  },
  {
    id: 'maintenance', label: '8. Maintenance & Insurance', icon: 'Home',
    fields: [
      { id: '8.1', label: 'Maintenance of Access Road', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
      { id: '8.2', label: 'Maintenance of Leased Space', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope'] },
      { id: '8.3', label: 'Common Area Maintenance', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
      { id: '8.4', label: 'Insurance of Proposed Lease Building', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope'] },
      { id: '8.5', label: 'Insurance for Goods Inside the Building', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope'] },
    ]
  },
  {
    id: 'parties', label: '9. Lessor & Lessee Details', icon: 'Users',
    fields: [
      { id: '9.1', label: 'Lessee Company Name', type: 'text' },
      { id: '9.2', label: 'Lessee - Signing Authority & Designation', type: 'text' },
      { id: '9.3', label: 'Lessee - Corporate Office Address', type: 'text' },
      { id: '9.4.1', label: 'Lessor Company Name (Rental Agreement)', type: 'text' },
      { id: '9.4.2', label: 'Lessor Company Name (Services Agreement)', type: 'text' },
      { id: '9.5', label: 'Lessor - Signing Authority & Designation', type: 'text' },
      { id: '9.6', label: 'Lessor - Corporate Office Address', type: 'text' },
    ]
  },
  {
    id: 'periphery', label: '10. Periphery Area', icon: 'MapPin',
    fields: [
      { id: '10.1', label: 'Plot Elevation Above Road (meters)', type: 'number' },
      { id: '10.2', label: 'Flooring Type - Inside Warehouse', type: 'select', options: ['FM 2', 'FM 1', 'PU Coating', 'Concrete', 'Other'] },
      { id: '10.3', label: 'Flooring Type - Outside Warehouse', type: 'select', options: ['RCC', 'Asphalt', 'Paver Blocks', 'Other'] },
      { id: '10.4', label: 'Road Type - Main Gate to Warehouse', type: 'select', options: ['RCC', 'Asphalt', 'WBM', 'Other'] },
    ]
  },
  {
    id: 'building', label: '11. The Building', icon: 'Warehouse',
    fields: [
      { id: '11.1', label: 'Building Type', type: 'select', options: ['Grade-A Pre-Engineered Building', 'RCC', 'Standard Shed', 'Other'] },
      { id: '11.2', label: 'Shop Floor Dimension (L x W meters)', type: 'text' },
      { id: '11.3', label: 'Mezzanine Floor Height & Dimension', type: 'text' },
      { id: '11.4', label: 'Number of Docks & Shutters', type: 'text', listingKey: 'buildingSpecifications.numberOfDocksAndShutters' },
      { id: '11.5', label: 'Canopy Dimension', type: 'text' },
      { id: '11.6', label: 'Natural Lighting & Ventilation', type: 'radio', options: ['Yes', 'No', 'Partial'] },
      { id: '11.7', label: 'Roof Insulation', type: 'radio', options: ['Yes', 'No'] },
    ]
  },
  {
    id: 'water', label: '12. Water, Toilet & Sewerage', icon: 'Droplets',
    fields: [
      { id: '12.1', label: 'Workers Toilet', type: 'lessor_lessee', options: ['Lessor Provides', 'Lessee to Provide', 'Shared'] },
      { id: '12.2', label: 'Executive Toilet', type: 'lessor_lessee', options: ['Lessor Provides', 'Lessee to Provide', 'Shared'] },
      { id: '12.8', label: 'STP Provided', type: 'radio', options: ['Yes', 'No'] },
      { id: '12.9', label: 'Solid Waste Disposal', type: 'lessor_lessee', options: ['Lessor Scope', 'Lessee Scope', 'Shared'] },
    ]
  },
  {
    id: 'safety', label: '13. Safety & Security', icon: 'ShieldCheck',
    fields: [
      { id: '13.1', label: 'Fire Exit Doors', type: 'lessor_lessee', options: ['Lessor Provides', 'Lessee to Provide'] },
      { id: '13.2', label: 'Fire Hydrant - Outside Building', type: 'radio', options: ['Yes', 'No'] },
      { id: '13.3', label: 'Fire Hydrant - Inside Building', type: 'radio', options: ['Yes', 'No'] },
      { id: '13.4', label: 'Fire Sprinklers', type: 'radio', options: ['Yes', 'No'] },
      { id: '13.6', label: 'Park Fully Compounded', type: 'radio', options: ['Yes', 'No', 'Partial'] },
      { id: '13.7', label: 'Security at Gate', type: 'radio', options: ['Yes', 'No'] },
      { id: '13.8', label: 'CCTV Installed', type: 'radio', options: ['Yes', 'No'] },
    ]
  },
];

// Helper to get listing field value by dot-path
function getListingValue(listing: ListingSchema | null, path?: string): string {
  if (!listing || !path) return '';
  const parts = path.split('.');
  let val: any = listing;
  for (const p of parts) { val = val?.[p]; }
  return val !== undefined && val !== null ? String(val) : '';
}

const SectionHeader = ({ icon, title, description }: { icon: React.ElementType; title: string, description?: string }) => {
    const Icon = icon;
    return (
        <div className="pt-6 first:pt-0">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
            <Separator />
        </div>
    );
};

const FormRow = ({ fieldName, control, form, disabled }: { fieldName: any; control: any; form: any, disabled?: boolean }) => {
    const { getValues, setValue, watch } = form;
    const { user } = useAuth();
    
    const [focusedFieldValue, setFocusedFieldValue] = React.useState<{field: string, value: string} | null>(null);
    const [editingLabel, setEditingLabel] = React.useState(false);
    
    const fieldLabel = watch(`${fieldName}.label`);
    const isLabelEditable = watch(`${fieldName}.isLabelEditable`);

    const handleFieldChange = (field: 'agreedTerms' | 'proposedBy' | 'status', newValue: string, oldValue?: string) => {
        const valueBeforeChange = oldValue ?? focusedFieldValue?.value;
        
        if (valueBeforeChange === undefined || valueBeforeChange === newValue) {
            setFocusedFieldValue(null);
            return;
        }

        const fieldPath = `${fieldName}.${field}`;
        const historyPath = `${fieldPath}.history`;
        const currentHistory = getValues(historyPath) || [];
        const newHistoryEntry: HistoryEntry = {
            previousValue: valueBeforeChange,
            newValue: newValue,
            changedBy: user?.userName || 'System',
            changedAt: new Date().toISOString(),
        };
        setValue(historyPath, [newHistoryEntry, ...currentHistory]);
        setFocusedFieldValue(null);
    };
    
    const fullHistory = [
        ...(watch(`${fieldName}.agreedTerms.history`) || []).map(h => ({...h, field: 'Agreed Terms'})),
        ...(watch(`${fieldName}.proposedBy.history`) || []).map(h => ({...h, field: 'Proposed By'})),
        ...(watch(`${fieldName}.status.history`) || []).map(h => ({...h, field: 'Status'})),
    ].sort((a,b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

    const hasHistory = fullHistory.length > 0;

    return (
        <div className={cn("grid grid-cols-12 gap-x-6 gap-y-2 py-4 border-b", watch(`${fieldName}.status.current`) === 'Reserved For Discussion' && 'bg-amber-100/50 rounded-md p-4')}>
            <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                {hasHistory && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This term has been modified.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {editingLabel ? (
                     <FormField control={control} name={`${fieldName}.label`} render={({ field }) => (
                         <Input autoFocus placeholder="New Field Name" {...field} value={field.value ?? ''} className="h-9" disabled={disabled} onBlur={() => setEditingLabel(false)}/>
                     )} />
                ) : (
                    <FormLabel>{fieldLabel}</FormLabel>
                )}
                {isLabelEditable && !editingLabel && !disabled && (
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingLabel(true)}><Edit className="h-3 w-3"/></Button>
                )}
            </div>
            <div className="col-span-12 md:col-span-3">
                <FormField control={control} name={`${fieldName}.agreedTerms.current`} render={({ field }) => {
                  const fieldType = watch(`${fieldName}.fieldType`);
                  const fieldOptions: string[] = watch(`${fieldName}.fieldOptions`) || [];
                  // radio / select / lessor_lessee
                  if ((fieldType === 'radio' || fieldType === 'select' || fieldType === 'lessor_lessee') && fieldOptions.length > 0) {
                    return (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-wrap gap-1">
                            {fieldOptions.map((opt: string) => (
                              <button key={opt} type="button" disabled={disabled}
                                onClick={() => { const old = field.value; field.onChange(opt); handleFieldChange('agreedTerms', opt, old); }}
                                className="px-2 py-1 rounded-lg text-xs font-semibold border transition-all"
                                style={field.value === opt
                                  ? {background:'#6141ac', color:'#fff', borderColor:'#6141ac'}
                                  : {background:'white', color:'hsl(259 15% 40%)', borderColor:'hsl(259 30% 82%)'}}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }
                  return (
                    <FormItem><FormControl>
                      <Input
                        placeholder={fieldType === 'number' ? '0' : fieldType === 'date' ? 'DD/MM/YYYY' : 'Enter value...'}
                        type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                        {...field} value={field.value ?? ''} className="h-10 p-2" disabled={disabled}
                        onFocus={() => setFocusedFieldValue({field: 'agreedTerms', value: field.value})}
                        onBlur={() => handleFieldChange('agreedTerms', field.value)}
                      />
                    </FormControl><FormMessage /></FormItem>
                  );
                }} />
            </div>
             <div className="col-span-6 md:col-span-2">
                 <FormField control={control} name={`${fieldName}.proposedBy.current`} render={({ field }) => (
                    <FormItem><Select onValueChange={(val) => { const oldVal = field.value; field.onChange(val); handleFieldChange('proposedBy', val, oldVal); }} value={field.value} disabled={disabled}><FormControl><SelectTrigger><SelectValue placeholder="Proposed By" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
             <div className="col-span-6 md:col-span-3">
                 <FormField control={control} name={`${fieldName}.status.current`} render={({ field }) => (
                    <FormItem><Select onValueChange={(val) => { const oldVal = field.value; field.onChange(val); handleFieldChange('status', val, oldVal); }} value={field.value} disabled={disabled}><FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
             <div className="col-span-12 md:col-span-1 flex items-center justify-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" disabled={!hasHistory}><History className="h-4 w-4"/></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Version History for "{fieldLabel}"</h4>
                            {fullHistory.length > 0 ? (
                                <ScrollArea className="h-64">
                                <div className="space-y-3">
                                {fullHistory.map((entry, i) => (
                                    <div key={i} className="text-xs p-2 rounded-md bg-secondary/50">
                                        <p className="font-semibold">{entry.field} changed:</p>
                                        <p>from <strong className="text-destructive">"{entry.previousValue || 'empty'}"</strong> to <strong className="text-primary">"{entry.newValue || 'empty'}"</strong></p>
                                        <p className="text-muted-foreground">{entry.changedBy} on {new Date(entry.changedAt).toLocaleString()}</p>
                                    </div>
                                    ))}
                                </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-sm text-muted-foreground">No changes have been made to this item.</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
};


const AttendeeSection = ({ sessionIndex, type, disabled }: { sessionIndex: number, type: 'customer' | 'provider', disabled: boolean }) => {
    const { control } = useFormContext<NegotiationBoardSchema>();
    const name = `${type}Attendees` as 'customerAttendees' | 'providerAttendees';
    const path = `sessions.${sessionIndex}.${name}`;
    const { fields, append, remove } = useFieldArray({ name: path, control });

    const titleMap = {
        customer: 'Customer Represented By',
        provider: 'Provider Represented By',
    };

    return (
        <div className="space-y-2">
            <FormLabel>{titleMap[type]}</FormLabel>
            {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <FormField control={control} name={`${path}.${index}.name`} render={({field}) => <Input placeholder="Name" {...field} value={field.value ?? ''} disabled={disabled}/>} />
                    <FormField control={control} name={`${path}.${index}.title`} render={({field}) => <Input placeholder="Title" {...field} value={field.value ?? ''} disabled={disabled}/>} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={disabled} className="no-print"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => append({name: '', title: ''})} disabled={disabled} className="no-print"><PlusCircle className="mr-2 w-4 h-4"/>Add</Button>
        </div>
    );
};


const NegotiationSession = ({ sessionIndex, onRemove, canEdit, form, lead }: { sessionIndex: number; onRemove: () => void; canEdit: boolean; form: any, lead: RegisteredLead }) => {
    const { control, watch, setValue, getValues } = useFormContext<NegotiationBoardSchema>();
    const { user, users } = useAuth();
    const { addAgentToLead } = useData();

    const sessionPath = `sessions.${sessionIndex}`;
    const { fields, append, remove } = useFieldArray({ name: `${sessionPath}.sections`, control });

    const [newSectionName, setNewSectionName] = React.useState('');
    const [showTermSheetBuilder, setShowTermSheetBuilder] = React.useState(false);
    const [selectedTermSections, setSelectedTermSections] = React.useState<string[]>([]);

    const handleAddNewSection = () => {
        if (newSectionName.trim()) {
            append({
                id: `sec-${Date.now()}`,
                title: newSectionName,
                icon: 'FileText',
                fields: []
            });
            setNewSectionName('');
        }
    }

     const handleBuildTermSheet = () => {
        // Ensure sessions[0] exists — create it if board is fresh
        const existingSessions = form.getValues('sessions') || [];
        if (existingSessions.length === 0) {
            appendSession({
                date: new Date().toISOString(),
                venue: 'Term Sheet',
                customerAttendees: [{ name: lead.leadContact, title: 'Lead' }],
                providerAttendees: [],
                facilitatorAttendees: [],
                sections: [],
            } as any);
            // Give React a tick to update form state
        }

        // Use setTimeout to ensure form state is updated before reading
        setTimeout(() => {
            const currentSections: any[] = form.getValues('sessions.0.sections') || [];
            const existingSectionIds = currentSections.map((s: any) => s.id);

            selectedTermSections.forEach(sectionId => {
                if (existingSectionIds.includes(sectionId)) return;
                const def = TERM_SHEET_SECTIONS.find(s => s.id === sectionId);
                if (!def) return;
                const newSection = {
                    id: def.id,
                    title: def.label,
                    fields: def.fields.map(f => ({
                        id: f.id,
                        label: f.label,
                        isLabelEditable: false,
                        agreedTerms: {
                            current: getListingValue(primaryListing, (f as any).listingKey),
                            history: [],
                        },
                        proposedBy: { current: '', history: [] },
                        status: { current: 'Pending', history: [] },
                        fieldType: f.type,
                        fieldOptions: (f as any).options || [],
                    }))
                };
                currentSections.push(newSection);
            });
            form.setValue('sessions.0.sections', currentSections, { shouldDirty: true });
        }, 50);

        setShowTermSheetBuilder(false);
        setSelectedTermSections([]);
    };

     const handleAddNewField = (sectionIndex: number) => {
        const sections = getValues(`${sessionPath}.sections`);
        const newField = {
            id: `field-${Date.now()}`,
            label: '',
            isLabelEditable: true,
            agreedTerms: { current: '', history: [] },
            proposedBy: { current: 'Customer', history: [] },
            status: { current: 'Reserved For Discussion', history: [] },
        };
        sections[sectionIndex].fields.push(newField);
        setValue(`${sessionPath}.sections`, sections);
    }
    
    const allAgents = Object.values(users).filter(u => u.role === 'Agent');
    const agentUser = lead.agentId ? users[lead.agentId] : null;

    return (
        <Card className="bg-secondary/30">
            <Collapsible defaultOpen={sessionIndex === watch('sessions').length - 1}>
                <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-secondary/50 rounded-t-lg">
                        <h3 className="text-lg font-semibold text-primary">
                            Negotiation Session {sessionIndex + 1}: {new Date(watch(`${sessionPath}.date`)).toLocaleString()}
                        </h3>
                        <div className="flex items-center gap-2">
                            {canEdit && <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                            <ChevronsUpDown className="h-4 w-4" />
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-6 space-y-6">
                        <div className="p-4 border rounded-lg bg-background space-y-4">
                            <FormField control={control} name={`${sessionPath}.venue`} render={({ field }) => ( <FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g. LBR Office, Online" {...field} value={field.value ?? ''} disabled={!canEdit} /></FormControl></FormItem> )} />
                            
                            <AttendeeSection sessionIndex={sessionIndex} type="customer" disabled={!canEdit} />
                            <AttendeeSection sessionIndex={sessionIndex} type="provider" disabled={!canEdit} />

                            <div className="space-y-2">
                                <FormLabel>Transaction Facilitated By</FormLabel>
                                {agentUser ? (
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        <p className="font-semibold">{agentUser.userName}</p>
                                        <p className="text-xs text-muted-foreground">{agentUser.companyName}</p>
                                    </div>
                                ) : (
                                    <Select onValueChange={(agentEmail) => addAgentToLead(lead.id, agentEmail)} disabled={!canEdit}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an agent to facilitate..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allAgents.map(agent => (
                                                <SelectItem key={agent.email} value={agent.email}>
                                                    {agent.userName} ({agent.companyName})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                         <div className="space-y-6">
                           {fields.map((section, sectionIndex) => (
                                <div key={section.id}>
                                    <SectionHeader icon={FileText} title={section.title} />
                                     {(section.fields || []).map((field, fieldIndex) => (
                                        <FormRow 
                                            key={field.id}
                                            form={form} 
                                            fieldName={`${sessionPath}.sections.${sectionIndex}.fields.${fieldIndex}`} 
                                            control={control} 
                                            disabled={!canEdit} />
                                    ))}
                                    {canEdit && <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => handleAddNewField(sectionIndex)}><PlusCircle className="mr-2 h-4 w-4"/>Add Field</Button>}
                                </div>
                            ))}
                         </div>
                         {canEdit && (
                            <div className="pt-6 border-t space-y-3">
                              {/* Primary: Build Term Sheet */}
                              <div>
                                <Button type="button" className="w-full" onClick={() => setShowTermSheetBuilder(true)}
                                  style={{background:'#6141ac'}}>
                                  <FileText className="mr-2 h-4 w-4" /> Build Commercial Term Sheet
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-1">Select sections from the standard lease term sheet template</p>
                              </div>
                              {/* Secondary: custom blank section */}
                              <div className="flex items-center gap-2">
                                <Input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="Or add a custom section..."/>
                                <Button type="button" variant="outline" onClick={handleAddNewSection}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                              </div>
                            </div>
                         )}

                         {/* Term Sheet Builder Modal */}
                         {showTermSheetBuilder && (
                           <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
                             <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{maxHeight:'85vh'}}>
                               <div className="px-6 py-5 border-b flex items-center justify-between" style={{background:'hsl(259 25% 10%)', borderRadius:'1rem 1rem 0 0'}}>
                                 <div>
                                   <h3 className="text-lg font-black text-white">Build Commercial Term Sheet</h3>
                                   <p className="text-xs mt-0.5" style={{color:'hsl(259 30% 60%)'}}>Select sections to include. Fields pre-filled from listing where available.</p>
                                 </div>
                                 <button onClick={() => setShowTermSheetBuilder(false)} className="h-8 w-8 rounded-full flex items-center justify-center" style={{background:'hsl(259 25% 20%)'}}>
                                   <span className="text-white text-sm">✕</span>
                                 </button>
                               </div>
                               <div className="overflow-y-auto flex-1 p-5">
                                 <div className="flex justify-between mb-4">
                                   <button type="button" className="text-xs font-bold" style={{color:'#6141ac'}}
                                     onClick={() => setSelectedTermSections(TERM_SHEET_SECTIONS.map(s => s.id))}>
                                     Select All
                                   </button>
                                   <button type="button" className="text-xs text-muted-foreground"
                                     onClick={() => setSelectedTermSections([])}>
                                     Clear All
                                   </button>
                                 </div>
                                 <div className="grid grid-cols-1 gap-2">
                                   {TERM_SHEET_SECTIONS.map(section => {
                                     const selected = selectedTermSections.includes(section.id);
                                     return (
                                       <button key={section.id} type="button"
                                         onClick={() => setSelectedTermSections(prev =>
                                           prev.includes(section.id) ? prev.filter(s => s !== section.id) : [...prev, section.id]
                                         )}
                                         className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                                         style={selected
                                           ? {background:'hsl(259 44% 94%)', border:'2px solid #6141ac'}
                                           : {background:'hsl(259 30% 97%)', border:'1px solid hsl(259 30% 88%)'}}>
                                         <div className="h-5 w-5 rounded flex items-center justify-center flex-shrink-0"
                                           style={{background: selected ? '#6141ac' : 'white', border: selected ? 'none' : '2px solid hsl(259 30% 78%)'}}>
                                           {selected && <span className="text-white text-xs">✓</span>}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                           <p className="text-sm font-semibold text-foreground">{section.label}</p>
                                           <p className="text-xs text-muted-foreground mt-0.5">{section.fields.length} fields
                                             {section.fields.some(f => (f as any).listingKey) && (
                                               <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{background:'hsl(259 44% 90%)', color:'#6141ac'}}>
                                                 ✦ auto-filled from listing
                                               </span>
                                             )}
                                           </p>
                                         </div>
                                       </button>
                                     );
                                   })}
                                 </div>
                               </div>
                               <div className="px-5 py-4 border-t flex items-center justify-between gap-3">
                                 <p className="text-sm text-muted-foreground">{selectedTermSections.length} section{selectedTermSections.length !== 1 ? 's' : ''} selected</p>
                                 <div className="flex gap-2">
                                   <Button type="button" variant="outline" onClick={() => setShowTermSheetBuilder(false)}>Cancel</Button>
                                   <Button type="button" disabled={selectedTermSections.length === 0} onClick={handleBuildTermSheet}
                                     style={{background:'#6141ac', color:'white'}}>
                                     <FileText className="mr-2 h-4 w-4" /> Add {selectedTermSections.length} Section{selectedTermSections.length !== 1 ? 's' : ''} →
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           </div>
                         )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export function NegotiationBoard({ lead, primaryListing }: { lead: RegisteredLead, primaryListing: ListingSchema | null }) {
    const { user } = useAuth();
    const { getNegotiationBoard, updateNegotiationBoard } = useData();
    
    const canEdit = true;

    const form = useForm<NegotiationBoardSchema>({
        resolver: zodResolver(negotiationBoardSchema),
        defaultValues: {
            leadId: lead.id,
            sessions: [],
            actionableItems: [],
            overallRemarks: "",
        }
    });

     const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ name: "sessions", control: form.control });
     const { fields: actionableItemFields, append: appendActionableItem, remove: removeActionableItem } = useFieldArray({ name: "actionableItems", control: form.control });

    
    React.useEffect(() => {
        const existingData = getNegotiationBoard(lead.id);
        if (existingData && existingData.sessions.length > 0) {
            form.reset(existingData);
        } else {
            const defaultSections = [
                { id: 'siteInfo', title: 'Site Information', icon: 'MapPin', fields: [
                    { id: 'listingId', label: 'Listing ID', agreedTerms: { current: primaryListing?.listingId || '' }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                    { id: 'postalAddress', label: 'Postal Address', agreedTerms: { current: primaryListing?.location || '' }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                    { id: 'buildingNumber', label: 'Building Number', agreedTerms: { current: '' }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                    { id: 'googleCoordinates', label: 'Google Coordinates', agreedTerms: { current: primaryListing?.latLng || '' }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                    { id: 'buildingStatus', label: 'Building Status', agreedTerms: { current: primaryListing?.availabilityDate || '' }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                ]},
                { id: 'area', title: 'Area (in SFT)', icon: 'Home', fields: [
                    { id: 'totalChargeableArea', label: 'Total Chargeable Area', agreedTerms: { current: String(primaryListing?.sizeSqFt || '') }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                ]},
                { id: 'leaseTerms', title: 'Lease Terms', icon: 'ListChecks', fields: [] },
                { id: 'commercialTerms', title: 'Commercial Terms', icon: 'HandCoins', fields: [
                     { id: 'buildingRentPerSft', label: 'Building Rent per SFT (INR)', agreedTerms: { current: String(primaryListing?.rentPerSqFt || '') }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                     { id: 'totalRentPerMonth', label: 'Total Rent per Month (INR)', agreedTerms: { current: String((primaryListing?.rentPerSqFt || 0) * (primaryListing?.sizeSqFt || 0)) }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                     { id: 'ifrsd', label: 'IFRSD (Security Deposit)', agreedTerms: { current: `INR ${((primaryListing?.rentPerSqFt || 0) * (primaryListing?.sizeSqFt || 0) * (primaryListing?.rentalSecurityDeposit || 0)).toLocaleString()}` }, proposedBy: { current: 'Provider' }, status: { current: 'Agreed' }},
                ]}
            ];
             const defaultSession = {
                date: new Date().toISOString(),
                venue: '',
                customerAttendees: [{ name: lead.leadContact, title: 'Lead' }],
                providerAttendees: [],
                facilitatorAttendees: [],
             };
             form.reset({
                ...form.getValues(),
                sessions: [defaultSession] as any
            });
        }
    }, [lead.id, primaryListing, getNegotiationBoard, form, lead.leadContact]);

    const onSubmit = (data: NegotiationBoardSchema) => {
        updateNegotiationBoard(lead.id, data);
    };
    
    const handleGenerateFollowUp = () => {
        const lastSession = form.getValues().sessions[form.getValues().sessions.length - 1];
        console.log("Generating follow-up based on last session:", lastSession);
        alert("Check console for follow-up data. This would be a new session in a real implementation.");
    }
    
    const handleFinalizeMoM = () => {
        const momData = form.getValues();
        console.log("Finalized Minutes of Meeting:", momData);
        alert("Minutes of Meeting finalized. Check the console for the data object that would be shared/stored.");
    };
    
    const handleDraftMoU = () => {
        const agreedTerms = form.getValues();
        console.log("Drafting MoU based on these agreed terms:", agreedTerms);
        alert("MoU draft initiated. Check the console for the data that would be used to generate the document.");
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        document.title = `MoM_${lead.id}_Lakshmi_Balaji_O2O_${timestamp}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="printable-container">
            <div className="print-header hidden">Negotiation Board</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 printable-content">
                    <Card>
                        <CardHeader className="no-print">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Negotiation Board</CardTitle>
                                    <CardDescription>
                                        Manage negotiation points for Transaction ID: {lead.id}.
                                        {primaryListing && <span className="block mt-1 text-xs">For Listing: <Link href={`/listings/${primaryListing.listingId}`} target="_blank" className="text-primary underline">{primaryListing.name}</Link></span>}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button type="button" variant="outline" onClick={handlePrint}>
                                        <Download className="mr-2 h-4 w-4" /> Download as PDF
                                    </Button>
                                    {canEdit && (
                                        <>
                                            <Button type="button" variant="outline" onClick={handleGenerateFollowUp}>
                                                <FileSymlink className="mr-2 h-4 w-4" />
                                                Generate Follow-up
                                            </Button>
                                            <Button type="button" onClick={() => appendSession({ date: new Date().toISOString(), customerAttendees:[], providerAttendees:[], facilitatorAttendees:[], sections:[] })}>
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                Add Session
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             {sessionFields.map((field, index) => (
                                <NegotiationSession
                                    key={field.id}
                                    sessionIndex={index}
                                    onRemove={() => removeSession(index)}
                                    canEdit={canEdit}
                                    form={form}
                                    lead={lead}
                                />
                            ))}
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-4 pt-6">
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Notebook className="h-5 w-5 text-primary" /> Actionable Items</CardTitle>
                                    <CardDescription>Track tasks and responsibilities agreed upon during negotiations.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[30%]">Item</TableHead>
                                                <TableHead>Responsibility</TableHead>
                                                <TableHead>Schedule</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Remarks</TableHead>
                                                <TableHead className="no-print"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {actionableItemFields.map((field, index) => (
                                                <TableRow key={field.id}>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.item`} render={({ field }) => <Textarea {...field} value={field.value ?? ''} placeholder="Action item description" disabled={!canEdit}/>} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.responsibility`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value} disabled={!canEdit}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem><SelectItem value="O2O">O2O</SelectItem></SelectContent></Select> )} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.schedule`} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="e.g., Within 7 days" disabled={!canEdit}/>} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.status`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value} disabled={!canEdit}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select> )} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.remarks`} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Add remarks" disabled={!canEdit}/>} /></TableCell>
                                                    <TableCell className="no-print"><Button type="button" variant="ghost" size="icon" onClick={() => removeActionableItem(index)} disabled={!canEdit}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendActionableItem({})} className="mt-4 no-print" disabled={!canEdit}><PlusCircle className="mr-2 h-4 w-4"/> Add Action Item</Button>
                                </CardContent>
                            </Card>

                            <div className="w-full space-y-2 pt-4">
                                <FormLabel>Overall Remarks</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="overallRemarks"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormControl>
                                            <Textarea placeholder="Add any final notes, summaries, or next steps for this negotiation round..." {...field} value={field.value ?? ''} disabled={!canEdit} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="flex items-center gap-2 justify-end pt-4 no-print">
                                <Button type="button" variant="outline" onClick={handleDraftMoU}><FileSignature className="mr-2 h-4 w-4" /> Draft MoU</Button>
                                {canEdit && (
                                    <>
                                        <Button type="button" variant="outline" onClick={handleFinalizeMoM}>
                                            <Share className="mr-2 h-4 w-4" /> Finalize as MoM
                                        </Button>
                                        <Button type="submit" variant="secondary"><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
                                    </>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
            <div className="print-footer hidden">
                <span>Transaction ID: {lead.id}</span>
                <span>Transaction Facilitator: <a href="https://www.lakshmibalajio2o.com" target="_blank" rel="noopener noreferrer">ORS-ONE</a></span>
            </div>
        </div>
    );
}

    
