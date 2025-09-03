
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commercialTermsSchema, type CommercialTermsSchema } from '@/lib/schema';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2, Home, Power, Droplets, ShieldCheck, User, FolderArchive, FileSymlink, DollarSign, Calendar, Users, Share, FileText, FileSignature, TrendingUp, Notebook, Download } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead, TableFooter } from './ui/table';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/auth-context';

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

    return (
         <div className="grid grid-cols-12 gap-x-6 gap-y-2 py-4 border-b">
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

export function CommercialTermsSheet({ lead }: { lead: RegisteredLead }) {
    const { user } = useAuth();
    const { listings, submissions } = useData();
    
    const primarySubmission = submissions.find(s => s.demandId === lead.id && s.status === 'Approved');
    const primaryListing = listings.find(l => l.listingId === primarySubmission?.listingId);

    const [rentalOutflow, setRentalOutflow] = React.useState<{ year: number, annualRent: number }[]>([]);
    const [totalOutflow, setTotalOutflow] = React.useState(0);
    
    const isCustomer = user?.role === 'User';

    const form = useForm<CommercialTermsSchema>({
        resolver: zodResolver(commercialTermsSchema),
        defaultValues: {
            sessions: [
                {
                    date: new Date().toISOString(),
                    venue: 'LBR Office, Chennai',
                    customerAttendees: [{ name: lead.leadContact, title: 'Lead' }],
                    providerAttendees: [{ name: 'Test Provider', title: 'Director' }],
                    facilitatorAttendees: [{ name: 'O2O Manager', title: 'O2O Manager' }],
                }
            ],
            siteInfo: {
                postalAddress: { agreedTerms: '123 Industrial Way, Oragadam, Chennai', status: 'Agreed' },
                googleCoordinates: { agreedTerms: '12.83, 79.95', status: 'Agreed' },
                buildingStatus: { agreedTerms: 'Ready for Occupancy', status: 'Agreed' },
            },
            area: {
                totalChargeableArea: { agreedTerms: '150000', status: 'Agreed' }
            },
            leaseTerms: {
                leaseTenure: { agreedTerms: '5 years', status: 'Agreed' },
                leaseLockIn: { agreedTerms: '3 years', status: 'Agreed' },
                rentEscalation: { agreedTerms: '15% every 3 years', status: 'Reserved For Discussion' },
            },
            commercialTerms: {
                chargeableArea: { agreedTerms: '150000', status: 'Agreed' },
                buildingRentPerSft: { agreedTerms: '25', status: 'Agreed' },
                totalRentPerMonth: { agreedTerms: '3750000', status: 'Agreed' },
                ifrsd: { agreedTerms: '22500000', status: 'Agreed' },
                capexItems: [],
                netCostPerMonth: 0,
            },
            actionableItems: [
                { item: 'Finalize rent escalation clause', responsibility: 'O2O', schedule: 'Next Meeting', status: 'Pending' }
            ],
            overallRemarks: "Initial meeting was positive. Key discussion point for the next session is the rent escalation percentage. Customer is firm on 10%, provider wants 15%.",
        }
    });

     const { fields: capexFields, append: appendCapex, remove: removeCapex } = useFieldArray({ name: "commercialTerms.capexItems", control: form.control });
     const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ name: "sessions", control: form.control });
     const { fields: actionableItemFields, append: appendActionableItem, remove: removeActionableItem } = useFieldArray({ name: "actionableItems", control: form.control });


     const customerAttendees = (index: number) => {
        const { fields, append, remove } = useFieldArray({ name: `sessions.${index}.customerAttendees`, control: form.control });
        return { fields, append, remove };
    };

    const providerAttendees = (index: number) => {
        const { fields, append, remove } = useFieldArray({ name: `sessions.${index}.providerAttendees`, control: form.control });
        return { fields, append, remove };
    };

    const facilitatorAttendees = (index: number) => {
        const { fields, append, remove } = useFieldArray({ name: `sessions.${index}.facilitatorAttendees`, control: form.control });
        return { fields, append, remove };
    };

    const commercialTermsWatched = form.watch('commercialTerms');
    const leaseTermsWatched = form.watch('leaseTerms');

    // Auto-calculate Total Rent per Month
    React.useEffect(() => {
        const rentPerSft = parseFloat(commercialTermsWatched?.buildingRentPerSft?.agreedTerms || '0');
        const chargeableArea = parseFloat(commercialTermsWatched?.chargeableArea?.agreedTerms || '0');
        if (!isNaN(rentPerSft) && !isNaN(chargeableArea)) {
            const totalRent = rentPerSft * chargeableArea;
            form.setValue('commercialTerms.totalRentPerMonth.agreedTerms', String(totalRent));
        }
    }, [commercialTermsWatched?.buildingRentPerSft?.agreedTerms, commercialTermsWatched?.chargeableArea?.agreedTerms, form]);
    
    // Auto-calculate Net Cost per Month
    React.useEffect(() => {
        let total = 0;
        const totalRent = parseFloat(commercialTermsWatched?.totalRentPerMonth?.agreedTerms || '0');
        if (!isNaN(totalRent)) {
            total += totalRent;
        }

        commercialTermsWatched?.capexItems?.forEach(item => {
            if (item.cost) {
                total += item.cost;
            }
        });
        form.setValue('commercialTerms.netCostPerMonth', total);

    }, [commercialTermsWatched?.totalRentPerMonth, commercialTermsWatched?.capexItems, form]);

    // Calculate yearly rent outflow
    React.useEffect(() => {
        const tenureString = leaseTermsWatched?.leaseTenure?.agreedTerms?.match(/\d+/)?.[0];
        const tenure = tenureString ? parseInt(tenureString, 10) : 0;
        
        const rentString = commercialTermsWatched?.totalRentPerMonth?.agreedTerms;
        const initialMonthlyRent = rentString ? parseFloat(rentString) : 0;

        const escalationString = leaseTermsWatched?.rentEscalation?.agreedTerms;
        const escalationPercentMatch = escalationString?.match(/(\d+)%/);
        const escalationFreqMatch = escalationString?.match(/every (\d+)/i);

        const escalationPercent = escalationPercentMatch ? parseInt(escalationPercentMatch[1], 10) / 100 : 0;
        const escalationFreq = escalationFreqMatch ? parseInt(escalationFreqMatch[1], 10) : 0;

        if (tenure > 0 && initialMonthlyRent > 0 && escalationFreq > 0) {
            let yearlyBreakdown = [];
            let currentMonthlyRent = initialMonthlyRent;
            let total = 0;

            for (let year = 1; year <= tenure; year++) {
                if (year > 1 && (year - 1) % escalationFreq === 0) {
                    currentMonthlyRent *= (1 + escalationPercent);
                }
                const annualRent = currentMonthlyRent * 12;
                total += annualRent;
                yearlyBreakdown.push({ year, annualRent });
            }
            setRentalOutflow(yearlyBreakdown);
            setTotalOutflow(total);
        } else {
            setRentalOutflow([]);
            setTotalOutflow(0);
        }

    }, [leaseTermsWatched?.leaseTenure?.agreedTerms, leaseTermsWatched?.rentEscalation?.agreedTerms, commercialTermsWatched?.totalRentPerMonth?.agreedTerms]);

    React.useEffect(() => {
        if (primaryListing) {
            form.reset({
                ...form.getValues(),
                siteInfo: {
                    ...form.getValues().siteInfo,
                    postalAddress: { agreedTerms: primaryListing.location, status: 'Agreed' },
                    buildingStatus: { agreedTerms: primaryListing.availabilityDate, status: 'Agreed' },
                    googleCoordinates: { agreedTerms: primaryListing.latLng, status: 'Agreed' },
                },
                area: {
                    ...form.getValues().area,
                    totalChargeableArea: { agreedTerms: String(primaryListing.sizeSqFt), status: 'Agreed' },
                },
                commercialTerms: {
                    ...form.getValues().commercialTerms,
                    chargeableArea: { agreedTerms: String(primaryListing.sizeSqFt), status: 'Agreed' },
                    buildingRentPerSft: { agreedTerms: String(primaryListing.rentPerSqFt), status: 'Agreed' },
                    ifrsd: { agreedTerms: `INR ${((primaryListing.rentPerSqFt || 0) * primaryListing.sizeSqFt * (primaryListing.rentalSecurityDeposit || 0)).toLocaleString()}`, status: 'Agreed' },
                },
            });
        }
    }, [primaryListing, form]);

    const onSubmit = (data: CommercialTermsSchema) => {
        console.log("Commercial Terms Submitted: ", data);
        alert("Commercial terms saved! Check console for data.");
    };
    
    const handleGenerateFollowUp = () => {
        const currentData = form.getValues();
        const reservedItems = <T extends Record<string, any>>(section: T) => {
            if (!section) return {};
            return Object.entries(section).reduce((acc, [key, value]) => {
                if (key === 'customItems' || key === 'capexItems') {
                    const filteredItems = value.filter((item: any) => item.status === 'Reserved For Discussion');
                    if (filteredItems.length > 0) {
                        (acc as any)[key] = filteredItems;
                    }
                } else if (value && typeof value === 'object' && 'status' in value && value.status === 'Reserved For Discussion') {
                    (acc as any)[key] = value;
                }
                return acc;
            }, {} as Partial<T>);
        };
        
        const newSheetData = {
            ...currentData,
            siteInfo: reservedItems(currentData.siteInfo),
            area: reservedItems(currentData.area),
            leaseTerms: reservedItems(currentData.leaseTerms),
            commercialTerms: reservedItems(currentData.commercialTerms),
            actionableItems: currentData.actionableItems?.filter(item => item.status !== 'Completed'),
        };

        console.log("Generated Follow-up Sheet Data:", newSheetData);
        alert("Check the console for the generated follow-up sheet data. In a real app, this would create a new version.");
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
        <Form {...form}>
            <div className="printable-container">
                <div className="print-header hidden">Commercial Terms Sheet</div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 printable-content">
                    <Card>
                        <CardHeader className="no-print">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Commercial Terms Sheet</CardTitle>
                                    <CardDescription>
                                        Manage negotiation points for Transaction ID: {lead.id}.
                                        {primaryListing && <span className="block mt-1 text-xs">Pre-filled with data from listing: <Link href={`/listings/${primaryListing.listingId}`} target="_blank" className="text-primary underline">{primaryListing.name}</Link></span>}
                                    </CardDescription>
                                </div>
                            {!isCustomer && (
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" onClick={handleGenerateFollowUp}>
                                            <FileSymlink className="mr-2 h-4 w-4" />
                                            Generate Follow-up
                                        </Button>
                                        <Button type="button" onClick={() => appendSession({ date: new Date().toISOString(), venue: '', customerAttendees: [], providerAttendees: [], facilitatorAttendees: [] })}>
                                            <Calendar className="mr-2 h-4 w-4"/>
                                            Add Session
                                        </Button>
                                    </div>
                            )}
                            {isCustomer && (
                                <Button type="button" variant="outline" onClick={handlePrint}>
                                    <Download className="mr-2 h-4 w-4" /> Download as PDF
                                </Button>
                            )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {sessionFields.map((field, index) => {
                                const { fields: customerFields, append: appendCustomer, remove: removeCustomer } = customerAttendees(index);
                                const { fields: providerFields, append: appendProvider, remove: removeProvider } = providerAttendees(index);
                                const { fields: facilitatorFields, append: appendFacilitator, remove: removeFacilitator } = facilitatorAttendees(index);
                                return (
                                    <div key={field.id} className="p-4 border rounded-lg bg-secondary/50 space-y-4 mb-6">
                                        <div className="flex justify-between items-center no-print">
                                            <p className="font-semibold text-sm">Negotiation Session {index + 1}: {new Date(form.watch(`sessions.${index}.date`)).toLocaleString()}</p>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSession(index)} disabled={isCustomer}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                            <Separator className="no-print" />
                                            <FormField control={form.control} name={`sessions.${index}.venue`} render={({ field }) => ( <FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g. LBR Office, Online" {...field} value={field.value ?? ''} disabled={isCustomer} /></FormControl></FormItem> )} />
                                        
                                        <div className="space-y-2">
                                            <FormLabel>Customer Represented By</FormLabel>
                                            {customerFields.map((item, cIndex) => (
                                                <div key={item.id} className="flex items-center gap-2">
                                                    <FormField control={form.control} name={`sessions.${index}.customerAttendees.${cIndex}.name`} render={({field}) => <Input placeholder="Name" {...field} value={field.value ?? ''} disabled={isCustomer}/>} />
                                                    <FormField control={form.control} name={`sessions.${index}.customerAttendees.${cIndex}.title`} render={({field}) => <Input placeholder="Title" {...field} value={field.value ?? ''} disabled={isCustomer}/>} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomer(cIndex)} disabled={isCustomer} className="no-print"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                                </div>
                                            ))}
                                            <Button type="button" size="sm" variant="outline" onClick={() => appendCustomer({name: '', title: ''})} disabled={isCustomer} className="no-print"><PlusCircle className="mr-2 w-4 h-4"/>Add</Button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <FormLabel>Provider Represented By</FormLabel>
                                            {providerFields.map((item, pIndex) => (
                                                <div key={item.id} className="flex items-center gap-2">
                                                    <FormField control={form.control} name={`sessions.${index}.providerAttendees.${pIndex}.name`} render={({field}) => <Input placeholder="Name" {...field} value={field.value ?? ''} disabled={isCustomer}/>} />
                                                    <FormField control={form.control} name={`sessions.${index}.providerAttendees.${pIndex}.title`} render={({field}) => <Input placeholder="Title" {...field} value={field.value ?? ''} disabled={isCustomer}/>} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeProvider(pIndex)} disabled={isCustomer} className="no-print"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                                </div>
                                            ))}
                                            <Button type="button" size="sm" variant="outline" onClick={() => appendProvider({name: '', title: ''})} disabled={isCustomer} className="no-print"><PlusCircle className="mr-2 w-4 h-4"/>Add</Button>
                                        </div>

                                        <div className="space-y-2">
                                            <FormLabel>Transaction Facilitated By</FormLabel>
                                            {facilitatorFields.map((item, fIndex) => (
                                                <div key={item.id} className="flex items-center gap-2">
                                                    <FormField control={form.control} name={`sessions.${index}.facilitatorAttendees.${fIndex}.name`} render={({field}) => <Input placeholder="Name" {...field} value={field.value ?? ''} disabled={isCustomer}/>} />
                                                    <FormField control={form.control} name={`sessions.${index}.facilitatorAttendees.${fIndex}.title`} render={({field}) => <Input placeholder="Title" {...field} value={field.value ?? ''} disabled={isCustomer}/>} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFacilitator(fIndex)} disabled={isCustomer} className="no-print"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                                </div>
                                            ))}
                                            <Button type="button" size="sm" variant="outline" onClick={() => appendFacilitator({name: '', title: ''})} disabled={isCustomer} className="no-print"><PlusCircle className="mr-2 w-4 h-4"/>Add</Button>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="space-y-6">
                                <SectionHeader icon={MapPin} title="Site Information" />
                                <FormRow form={form} name="siteInfo.postalAddress" label="Postal Address" control={form.control} disabled={isCustomer} />
                                <FormRow form={form} name="siteInfo.buildingNumber" label="Building Number" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="siteInfo.googleCoordinates" label="Google Coordinates" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="siteInfo.buildingStatus" label="Building Status" control={form.control} disabled={isCustomer}/>

                                <SectionHeader icon={Home} title="Area (in SFT)" />
                                <FormRow form={form} name="area.plinthArea" label="Plinth Area (Shop Floor)" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="area.mezzanineArea1" label="Mezzanine Area 1" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="area.mezzanineArea2" label="Mezzanine Area 2" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="area.canopyArea" label="Canopy Area" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="area.driversRestRoom" label="Driver's Rest Room" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="area.totalChargeableArea" label="Total Chargeable Area" control={form.control} disabled={isCustomer}/>
                                
                                <SectionHeader icon={ListChecks} title="Lease Terms" />
                                <FormRow form={form} name="leaseTerms.leaseTenure" label="Lease Tenure" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="leaseTerms.leaseLockIn" label="Lease Lock-In Period" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="leaseTerms.rentEscalation" label="Rent Escalation (% and Freq.)" control={form.control} disabled={isCustomer}/>
                                
                                <SectionHeader icon={HandCoins} title="Commercial Terms" />
                                <FormRow form={form} name="commercialTerms.chargeableArea" label="Chargeable Area (SFT)" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="commercialTerms.buildingRentPerSft" label="Building Rent per SFT (INR)" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="commercialTerms.totalRentPerMonth" label="Total Rent per Month (INR)" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="commercialTerms.camCharges" label="CAM Charges per SFT" control={form.control} disabled={isCustomer}/>
                                <FormRow form={form} name="commercialTerms.ifrsd" label="IFRSD (Security Deposit)" control={form.control} disabled={isCustomer}/>

                            </div>

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
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.item`} render={({ field }) => <Textarea {...field} value={field.value ?? ''} placeholder="Action item description" disabled={isCustomer}/>} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.responsibility`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value} disabled={isCustomer}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem><SelectItem value="O2O">O2O</SelectItem></SelectContent></Select> )} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.schedule`} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="e.g., Within 7 days" disabled={isCustomer}/>} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.status`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value} disabled={isCustomer}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select> )} /></TableCell>
                                                    <TableCell><FormField control={form.control} name={`actionableItems.${index}.remarks`} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Add remarks" disabled={isCustomer}/>} /></TableCell>
                                                    <TableCell className="no-print"><Button type="button" variant="ghost" size="icon" onClick={() => removeActionableItem(index)} disabled={isCustomer}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendActionableItem({})} className="mt-4 no-print" disabled={isCustomer}><PlusCircle className="mr-2 h-4 w-4"/> Add Action Item</Button>
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
                                            <Textarea placeholder="Add any final notes, summaries, or next steps for this negotiation round..." {...field} value={field.value ?? ''} disabled={isCustomer} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {rentalOutflow.length > 0 && (
                                <Card className="w-full">
                                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/> Statement of Rent Outflow</CardTitle></CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right">Annual Rental Outflow</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {rentalOutflow.map(item => (
                                                    <TableRow key={item.year}>
                                                        <TableCell>Year {item.year}</TableCell>
                                                        <TableCell className="text-right">₹{item.annualRent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell className="font-bold">Total Outflow (Lease Period)</TableCell>
                                                    <TableCell className="text-right font-bold">₹{totalOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50 w-full justify-end">
                                <div className="text-right">
                                    <FormLabel className="text-sm font-normal">Total Rent per Month</FormLabel>
                                    <p className="text-2xl font-bold text-primary">₹{(commercialTermsWatched?.totalRentPerMonth?.agreedTerms ? parseFloat(commercialTermsWatched.totalRentPerMonth.agreedTerms).toLocaleString('en-IN') : 0)}</p>
                                </div>
                                <div className="text-right">
                                    <FormLabel className="text-sm font-normal">Net Cost per Month (incl. CAPEX)</FormLabel>
                                    <p className="text-2xl font-bold text-primary">₹{commercialTermsWatched?.netCostPerMonth?.toLocaleString('en-IN') || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end pt-4 no-print">
                                <Button type="button" variant="outline" onClick={handleDraftMoU}><FileSignature className="mr-2 h-4 w-4" /> Draft MoU</Button>
                                {!isCustomer && (
                                    <>
                                        <Button type="submit" variant="secondary"><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
                                        <Button type="button" onClick={handleFinalizeMoM}><Share className="mr-2 h-4 w-4" /> Finalize as MoM</Button>
                                    </>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </form>
                <div className="print-footer hidden">
                    <span>Transaction ID: {lead.id}</span>
                    <span>Transaction Facilitator: <a href="https://www.lakshmibalajio2o.com" target="_blank" rel="noopener noreferrer">Lakshmi Balaji O2O</a></span>
                </div>
            </div>
        </Form>
    );
}
