

'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commercialTermsSchema, type CommercialTermsSchema, type ListingSchema } from '@/lib/schema';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2, Home, Power, Droplets, ShieldCheck, User, FolderArchive, FileSymlink, DollarSign, Calendar, Users, Share, FileText, FileSignature, TrendingUp, Notebook, Download, Warehouse, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead, TableFooter } from './ui/table';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

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

const FormRow = ({ name, label, control, form, isTextarea, disabled }: { name: any; label: string; control: any; form: any, isTextarea?: boolean, disabled?: boolean }) => {
    const InputComponent = isTextarea ? Textarea : Input;
    const status = form.watch(`${name}.status`);

    return (
         <div className={cn("grid grid-cols-12 gap-x-6 gap-y-2 py-4 border-b", status === 'Reserved For Discussion' && 'bg-amber-100/50 rounded-md p-4')}>
            <div className="col-span-12 md:col-span-3"><FormLabel>{label}</FormLabel></div>
            <div className="col-span-12 md:col-span-4">
                <FormField control={control} name={`${name}.agreedTerms`} render={({ field }) => (
                    <FormItem><FormControl><InputComponent placeholder="Agreed terms..." {...field} value={field.value ?? ''} className="h-10 p-2" disabled={disabled} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <div className="col-span-6 md:col-span-2">
                 <FormField control={control} name={`${name}.proposedBy`} render={({ field }) => (
                    <FormItem><Select onValueChange={field.onChange} value={field.value} disabled={disabled}><FormControl><SelectTrigger><SelectValue placeholder="Proposed By" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
            <div className="col-span-6 md:col-span-3">
                 <FormField control={control} name={`${name}.status`} render={({ field }) => (
                    <FormItem><Select onValueChange={field.onChange} value={field.value} disabled={disabled}><FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
        </div>
    )
};


const AttendeeSection = ({ sessionIndex, type, disabled }: { sessionIndex: number, type: 'customer' | 'provider' | 'facilitator', disabled: boolean }) => {
    const { control } = useFormContext<CommercialTermsSchema>();
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
    const { control, watch } = useFormContext<CommercialTermsSchema>();
    
    return (
        <Card className="bg-secondary/30">
            <Collapsible defaultOpen={sessionIndex === watch('sessions').length - 1}>
                <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-secondary/50 rounded-t-lg">
                        <h3 className="text-lg font-semibold text-primary">
                            Negotiation Session {sessionIndex + 1}: {new Date(watch(`sessions.${sessionIndex}.date`)).toLocaleString()}
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
                            <FormField control={control} name={`sessions.${sessionIndex}.venue`} render={({ field }) => ( <FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g. LBR Office, Online" {...field} value={field.value ?? ''} disabled={!canEdit} /></FormControl></FormItem> )} />
                            
                            <AttendeeSection sessionIndex={sessionIndex} type="customer" disabled={!canEdit} />
                            <AttendeeSection sessionIndex={sessionIndex} type="provider" disabled={!canEdit} />
                            <AttendeeSection sessionIndex={sessionIndex} type="facilitator" disabled={!canEdit} />
                        </div>

                         <div className="space-y-6">
                            <SectionHeader icon={MapPin} title="Site Information" />
                            <FormRow form={form} name={`sessions.${sessionIndex}.siteInfo.listingId`} label="Listing ID" control={control} disabled={!canEdit} />
                            <FormRow form={form} name={`sessions.${sessionIndex}.siteInfo.postalAddress`} label="Postal Address" control={control} disabled={!canEdit} />
                            <FormRow form={form} name={`sessions.${sessionIndex}.siteInfo.buildingNumber`} label="Building Number" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.siteInfo.googleCoordinates`} label="Google Coordinates" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.siteInfo.buildingStatus`} label="Building Status" control={control} disabled={!canEdit}/>

                            <SectionHeader icon={Home} title="Area (in SFT)" />
                            <FormRow form={form} name={`sessions.${sessionIndex}.area.plinthArea`} label="Plinth Area (Shop Floor)" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.area.mezzanineArea1`} label="Mezzanine Area 1" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.area.mezzanineArea2`} label="Mezzanine Area 2" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.area.canopyArea`} label="Canopy Area" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.area.driversRestRoom`} label="Driver's Rest Room" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.area.totalChargeableArea`} label="Total Chargeable Area" control={control} disabled={true}/>
                            
                            <SectionHeader icon={ListChecks} title="Lease Terms" />
                            <FormRow form={form} name={`sessions.${sessionIndex}.leaseTerms.leaseTenure`} label="Lease Tenure" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.leaseTerms.leaseLockIn`} label="Lease Lock-In Period" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.leaseTerms.rentEscalation`} label="Rent Escalation (% and Freq.)" control={control} disabled={!canEdit}/>
                            
                            <SectionHeader icon={HandCoins} title="Commercial Terms" />
                            <FormRow form={form} name={`sessions.${sessionIndex}.commercialTerms.chargeableArea`} label="Chargeable Area (SFT)" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.commercialTerms.buildingRentPerSft`} label="Building Rent per SFT (INR)" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.commercialTerms.totalRentPerMonth`} label="Total Rent per Month (INR)" control={control} disabled={true}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.commercialTerms.camCharges`} label="CAM Charges per SFT" control={control} disabled={!canEdit}/>
                            <FormRow form={form} name={`sessions.${sessionIndex}.commercialTerms.ifrsd`} label="IFRSD (Security Deposit)" control={control} disabled={!canEdit}/>

                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export function CommercialTermsSheet({ lead, primaryListing }: { lead: RegisteredLead, primaryListing: ListingSchema | null }) {
    const { user } = useAuth();
    const { getCommercialTerms, updateCommercialTerms } = useData();
    
    const isCustomer = user?.role === 'User';
    const isProvider = user?.role === 'Warehouse Developer';
    const isO2O = user?.role === 'O2O' || user?.email === 'admin@example.com';
    const isAgent = user?.role === 'Agent';
    const isPremiumAgent = isAgent && user?.plan === 'Paid_Premium';
    const canEdit = isO2O || isPremiumAgent;

    const form = useForm<CommercialTermsSchema>({
        resolver: zodResolver(commercialTermsSchema),
        defaultValues: {
            sessions: [],
            actionableItems: [],
            overallRemarks: "",
        }
    });

     const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ name: "sessions", control: form.control });
     const { fields: actionableItemFields, append: appendActionableItem, remove: removeActionableItem } = useFieldArray({ name: "actionableItems", control: form.control });

    
    // Load existing data
    React.useEffect(() => {
        const existingData = getCommercialTerms(lead.id);
        if (existingData && existingData.sessions.length > 0) {
            form.reset(existingData);
        } else if (primaryListing) {
             const defaultSession = {
                date: new Date().toISOString(),
                venue: 'LBR Office, Chennai',
                customerAttendees: [{ name: lead.leadContact, title: 'Lead' }],
                providerAttendees: [{ name: 'Test Provider', title: 'Director' }],
                facilitatorAttendees: [{ name: 'O2O Manager', title: 'O2O Manager' }],
                siteInfo: {
                    listingId: { agreedTerms: primaryListing.listingId, status: 'Agreed' },
                    postalAddress: { agreedTerms: primaryListing.location, status: 'Agreed' },
                    buildingStatus: { agreedTerms: primaryListing.availabilityDate, status: 'Agreed' },
                    googleCoordinates: { agreedTerms: primaryListing.latLng, status: 'Agreed' },
                },
                area: {
                    totalChargeableArea: { agreedTerms: String(primaryListing.sizeSqFt), status: 'Agreed' },
                },
                commercialTerms: {
                    chargeableArea: { agreedTerms: String(primaryListing.sizeSqFt), status: 'Agreed' },
                    buildingRentPerSft: { agreedTerms: String(primaryListing.rentPerSqFt), status: 'Agreed' },
                    ifrsd: { agreedTerms: `INR ${((primaryListing.rentPerSqFt || 0) * primaryListing.sizeSqFt * (primaryListing.rentalSecurityDeposit || 0)).toLocaleString()}`, status: 'Agreed' },
                },
                leaseTerms: {}
             };
             form.reset({
                ...form.getValues(),
                sessions: [defaultSession]
            });
        }
    }, [lead.id, primaryListing, getCommercialTerms, form, lead.leadContact]);

    const watchedSessions = form.watch('sessions');

    React.useEffect(() => {
      watchedSessions.forEach((session, index) => {
        // Calculate Total Rent
        const rentPerSft = parseFloat(session.commercialTerms?.buildingRentPerSft?.agreedTerms || '0');
        const chargeableArea = parseFloat(session.commercialTerms?.chargeableArea?.agreedTerms || '0');
        if (!isNaN(rentPerSft) && !isNaN(chargeableArea)) {
            const totalRent = rentPerSft * chargeableArea;
            form.setValue(`sessions.${index}.commercialTerms.totalRentPerMonth.agreedTerms`, String(totalRent));
        }

        // Calculate Total Chargeable Area
        const plinth = parseFloat(session.area?.plinthArea?.agreedTerms || '0');
        const mezz1 = parseFloat(session.area?.mezzanineArea1?.agreedTerms || '0');
        const mezz2 = parseFloat(session.area?.mezzanineArea2?.agreedTerms || '0');
        const canopy = parseFloat(session.area?.canopyArea?.agreedTerms || '0');
        const driversRoom = parseFloat(session.area?.driversRestRoom?.agreedTerms || '0');
        
        const totalArea = [plinth, mezz1, mezz2, canopy, driversRoom]
            .filter(v => !isNaN(v))
            .reduce((acc, v) => acc + v, 0);

        form.setValue(`sessions.${index}.area.totalChargeableArea.agreedTerms`, String(totalArea));
      })
    }, [watchedSessions, form])


    const onSubmit = (data: CommercialTermsSchema) => {
        updateCommercialTerms(lead.id, data);
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
            <div className="print-header hidden">Commercial Terms Sheet</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 printable-content">
                    <Card>
                        <CardHeader className="no-print">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Commercial Terms Sheet</CardTitle>
                                    <CardDescription>
                                        Manage negotiation points for Transaction ID: {lead.id}.
                                        {primaryListing && <span className="block mt-1 text-xs">For Listing: <Link href={`/listings/${primaryListing.listingId}`} target="_blank" className="text-primary underline">{primaryListing.name}</Link></span>}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     {(isCustomer || isProvider) && (
                                        <Button type="button" variant="outline" onClick={handlePrint}>
                                            <Download className="mr-2 h-4 w-4" /> Download as PDF
                                        </Button>
                                    )}
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
                                {(isCustomer || isProvider) && (
                                    <Button type="button" variant="outline" onClick={handleDraftMoU}><FileSignature className="mr-2 h-4 w-4" /> Draft MoU</Button>
                                )}
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
