
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
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2, Home, Power, Droplets, ShieldCheck, User, FolderArchive, FileSymlink, DollarSign, Calendar, Users, Share, FileText, FileSignature, TrendingUp, Notebook, Download, Warehouse, ChevronsUpDown, AlertTriangle, History, Info } from 'lucide-react';
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
    
    const fieldLabel = watch(`${fieldName}.label`);
    const isLabelEditable = !fieldLabel;

    const handleFieldChange = (field: 'agreedTerms' | 'status' | 'proposedBy', newValue: string, oldValue: string) => {
        if(oldValue !== newValue) {
            const fieldPath = `${fieldName}.${field}`;
            const historyPath = `${fieldPath}.history`;
            const currentHistory = getValues(historyPath) || [];
            const newHistoryEntry: HistoryEntry = {
                previousValue: oldValue,
                newValue: newValue,
                changedBy: user?.userName || 'System',
                changedAt: new Date().toISOString(),
            };
            setValue(historyPath, [newHistoryEntry, ...currentHistory]);
        }
    };
    
    const fullHistory = [
        ...(watch(`${fieldName}.agreedTerms.history`) || []),
        ...(watch(`${fieldName}.proposedBy.history`) || []),
        ...(watch(`${fieldName}.status.history`) || []),
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
                {isLabelEditable ? (
                     <FormField control={control} name={`${fieldName}.label`} render={({ field }) => (
                         <Input placeholder="New Field Name" {...field} value={field.value ?? ''} className="h-9" disabled={disabled}/>
                     )} />
                ) : (
                    <FormLabel>{fieldLabel}</FormLabel>
                )}
            </div>
            <div className="col-span-12 md:col-span-3">
                <FormField control={control} name={`${fieldName}.agreedTerms.current`} render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Agreed terms..." {...field} value={field.value ?? ''} className="h-10 p-2" disabled={disabled} onBlur={(e) => handleFieldChange('agreedTerms', e.target.value, field.value ?? '')} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <div className="col-span-6 md:col-span-2">
                 <FormField control={control} name={`${fieldName}.proposedBy.current`} render={({ field }) => (
                    <FormItem><Select onValueChange={(val) => { handleFieldChange('proposedBy', val, field.value); field.onChange(val); }} value={field.value} disabled={disabled}><FormControl><SelectTrigger><SelectValue placeholder="Proposed By" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
             <div className="col-span-6 md:col-span-3">
                 <FormField control={control} name={`${fieldName}.status.current`} render={({ field }) => (
                    <FormItem><Select onValueChange={(val) => { handleFieldChange('status', val, field.value); field.onChange(val); }} value={field.value} disabled={disabled}><FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select><FormMessage /></FormItem>
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
                                        <p>Value changed from <strong className="text-destructive">"{entry.previousValue || 'empty'}"</strong> to <strong className="text-primary">"{entry.newValue || 'empty'}"</strong></p>
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


const AttendeeSection = ({ sessionIndex, type, disabled }: { sessionIndex: number, type: 'customer' | 'provider' | 'facilitator', disabled: boolean }) => {
    const { control } = useFormContext<NegotiationBoardSchema>();
    const name = `sessions.${sessionIndex}.${type}Attendees` as const;
    const { fields, append, remove } = useFieldArray({ name, control });

    const titleMap = {
        customer: 'Customer Represented By',
        provider: 'Provider Represented By',
        facilitator: 'Transaction Facilitated By'
    };

    return (
        <div className="space-y-2">
            <FormLabel>{titleMap[type]}</FormLabel>
            {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <FormField control={control} name={`${name}.${index}.name`} render={({field}) => <Input placeholder="Name" {...field} value={field.value ?? ''} disabled={disabled}/>} />
                    <FormField control={control} name={`${name}.${index}.title`} render={({field}) => <Input placeholder="Title" {...field} value={field.value ?? ''} disabled={disabled}/>} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={disabled} className="no-print"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => append({name: '', title: ''})} disabled={disabled} className="no-print"><PlusCircle className="mr-2 w-4 h-4"/>Add</Button>
        </div>
    );
};


const NegotiationSession = ({ sessionIndex, onRemove, canEdit, form }: { sessionIndex: number; onRemove: () => void; canEdit: boolean; form: any }) => {
    const { control, watch, setValue, getValues } = useFormContext<NegotiationBoardSchema>();
    const { user } = useAuth();
    const sessionPath = `sessions.${sessionIndex}`;
    const { fields, append, remove } = useFieldArray({ name: `${sessionPath}.sections`, control });

    const [newSectionName, setNewSectionName] = React.useState('');

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

     const handleAddNewField = (sectionIndex: number) => {
        const sections = getValues(`${sessionPath}.sections`);
        const newField = {
            id: `field-${Date.now()}`,
            label: '', // Start with an empty label to make it editable
            agreedTerms: { current: '', history: [] },
            proposedBy: { current: 'Customer', history: [] },
            status: { current: 'Reserved For Discussion', history: [] },
        };
        sections[sectionIndex].fields.push(newField);
        setValue(`${sessionPath}.sections`, sections);
    }
    
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
                            <AttendeeSection sessionIndex={sessionIndex} type="facilitator" disabled={!canEdit} />
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
                            <div className="pt-6 border-t">
                                <div className="flex items-center gap-2">
                                <Input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="New section name"/>
                                <Button type="button" onClick={handleAddNewSection}><PlusCircle className="mr-2 h-4 w-4" /> Add Section</Button>
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
                sections: defaultSections,
             };
             form.reset({
                ...form.getValues(),
                sessions: [defaultSession]
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
                                            <Button type="button" onClick={() => appendSession({ date: new Date().toISOString() })}>
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
                <span>Transaction Facilitator: <a href="https://www.lakshmibalajio2o.com" target="_blank" rel="noopener noreferrer">Lakshmi Balaji O2O</a></span>
            </div>
        </div>
    );
}

    
