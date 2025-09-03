
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commercialTermsSchema, type CommercialTermsSchema } from '@/lib/schema';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2, Home, Power, Droplets, ShieldCheck, User, FolderArchive, FileSymlink, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from './ui/table';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

const SectionHeader = ({ icon, title }: { icon: React.ElementType; title: string }) => {
    const Icon = icon;
    return (
        <TableHead colSpan={6} className="bg-primary/5 text-primary font-semibold">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
            </div>
        </TableHead>
    );
};

const FormRow = ({ name, label, control, isTextarea, isCostFactor, watch }: { name: any; label: string; control: any, isTextarea?: boolean, isCostFactor?: boolean, watch: any }) => {
    const InputComponent = isTextarea ? Textarea : Input;
    const showCostInput = watch(`${name}.isCostFactor`);

    return (
    <TableRow>
        <TableCell className="font-medium w-[15%]">{label}</TableCell>
        <TableCell className="w-[25%]">
            <FormField control={control} name={`${name}.details`} render={({ field }) => (
                <FormItem><FormControl><InputComponent placeholder="Specific details..." {...field} className="min-h-0 h-10 p-2" /></FormControl><FormMessage /></FormItem>
            )} />
        </TableCell>
        <TableCell className="w-[12%]">
             <FormField control={control} name={`${name}.proposedBy`} render={({ field }) => (
                <FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
        </TableCell>
        <TableCell className="w-[15%]">
             <FormField control={control} name={`${name}.status`} render={({ field }) => (
                 <FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
        </TableCell>
        <TableCell className="w-[18%]">
            <div className="flex items-center gap-2">
                 {isCostFactor && (
                    <FormField control={control} name={`${name}.isCostFactor`} render={({ field }) => ( <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> )} />
                 )}
                 <FormField control={control} name={`${name}.agreedTerms`} render={({ field }) => (
                     <FormItem className="flex-grow"><FormControl><Input placeholder="Final terms..." {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
                 {showCostInput && (
                    <FormField control={control} name={`${name}.cost`} render={({ field }) => (
                        <FormItem><FormControl><Input type="number" placeholder="Cost" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="w-24"/></FormControl><FormMessage /></FormItem>
                    )}/>
                 )}
            </div>
        </TableCell>
         <TableCell className="w-[15%]">
            <FormField control={control} name={`${name}.remarks`} render={({ field }) => (
                <FormItem><FormControl><Textarea placeholder="Remarks..." {...field} className="min-h-0 h-10 p-2" /></FormControl><FormMessage /></FormItem>
            )} />
        </TableCell>
    </TableRow>
)};

const CustomFormRow = ({ control, index, remove, isCostFactor, watch }: { control: any, index: number, remove: (index: number) => void, isCostFactor?: boolean, watch: any}) => {
    const showCostInput = watch(`commercialTerms.capexItems.${index}.isCostFactor`);
    return (
    <TableRow>
        <TableCell><FormField control={control} name={`commercialTerms.capexItems.${index}.particulars`} render={({ field }) => <Input placeholder={`Custom Item ${index+1}`} {...field} />} /></TableCell>
        <TableCell><FormField control={control} name={`commercialTerms.capexItems.${index}.details`} render={({ field }) => <Textarea placeholder="Details..." {...field} className="h-10 p-2"/>} /></TableCell>
        <TableCell><FormField control={control} name={`commercialTerms.capexItems.${index}.proposedBy`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select> )} /></TableCell>
        <TableCell><FormField control={control} name={`commercialTerms.capexItems.${index}.status`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select> )} /></TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                {isCostFactor && (
                   <FormField control={control} name={`commercialTerms.capexItems.${index}.isCostFactor`} render={({ field }) => ( <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> )} />
                )}
                <FormField control={control} name={`commercialTerms.capexItems.${index}.agreedTerms`} render={({ field }) => (
                    <FormItem className="flex-grow"><FormControl><Input placeholder="Final terms..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                {showCostInput && (
                   <FormField control={control} name={`commercialTerms.capexItems.${index}.cost`} render={({ field }) => (
                       <FormItem><FormControl><Input type="number" placeholder="Cost" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} className="w-24"/></FormControl><FormMessage /></FormItem>
                   )}/>
                )}
            </div>
        </TableCell>
        <TableCell className="flex items-center gap-2"><FormField control={control} name={`commercialTerms.capexItems.${index}.remarks`} render={({ field }) => <Textarea placeholder="Remarks..." {...field} className="h-10 p-2 flex-grow"/>} /><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
    </TableRow>
)};

export function CommercialTermsSheet({ lead }: { lead: RegisteredLead }) {
    const { listings, submissions } = useData();
    
    const primarySubmission = submissions.find(s => s.demandId === lead.id && s.status === 'Approved');
    const primaryListing = listings.find(l => l.listingId === primarySubmission?.listingId);

    const form = useForm<CommercialTermsSchema>({
        resolver: zodResolver(commercialTermsSchema),
        defaultValues: {
            leaseTerms: { customItems: [] },
            commercialTerms: { capexItems: [], netCostPerMonth: 0 },
            tenantImprovements: { customItems: [] },
            sessions: []
        }
    });

     const { fields: tenantImprovementFields, append: appendTenantImprovement, remove: removeTenantImprovement } = useFieldArray({ name: "tenantImprovements.customItems", control: form.control });
     const { fields: leaseTermFields, append: appendLeaseTerm, remove: removeLeaseTerm } = useFieldArray({ name: "leaseTerms.customItems", control: form.control });
     const { fields: capexFields, append: appendCapex, remove: removeCapex } = useFieldArray({ name: "commercialTerms.capexItems", control: form.control });
     const { fields: sessionFields, append: appendSession } = useFieldArray({ name: "sessions", control: form.control });


    React.useEffect(() => {
        if (primaryListing) {
            form.reset({
                siteInfo: {
                    postalAddress: { details: primaryListing.location },
                    buildingStatus: { details: primaryListing.availabilityDate },
                    googleCoordinates: { details: primaryListing.latLng },
                },
                area: {
                    totalChargeableArea: { details: String(primaryListing.sizeSqFt) },
                },
                building: {
                    buildingType: { details: primaryListing.buildingSpecifications.buildingType },
                    docksAndShutters: { details: String(primaryListing.buildingSpecifications.numberOfDocksAndShutters) },
                },
                commercialTerms: {
                    chargeableArea: { details: String(primaryListing.sizeSqFt) },
                    buildingRentPerSft: { details: String(primaryListing.rentPerSqFt) },
                    ifrsd: { details: String(primaryListing.rentalSecurityDeposit) },
                    capexItems: [],
                    netCostPerMonth: 0,
                },
                leaseTerms: { customItems: [] },
                tenantImprovements: { customItems: [] },
                sessions: []
            });
        }
    }, [primaryListing, form]);

    const commercialTermsWatched = form.watch('commercialTerms');
    React.useEffect(() => {
        const calculateTotalCost = () => {
            let total = 0;
            if (commercialTermsWatched?.buildingRentPerSft?.cost) total += commercialTermsWatched.buildingRentPerSft.cost;
            if (commercialTermsWatched?.camCharges?.cost) total += commercialTermsWatched.camCharges.cost;
            
            commercialTermsWatched?.capexItems?.forEach(item => {
                if (item.isCostFactor && item.cost) {
                    total += item.cost;
                }
            });
            return total;
        };
        form.setValue('commercialTerms.netCostPerMonth', calculateTotalCost());
    }, [commercialTermsWatched, form]);

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
            tenantImprovements: reservedItems(currentData.tenantImprovements),
            leaseTerms: reservedItems(currentData.leaseTerms),
            commercialTerms: reservedItems(currentData.commercialTerms),
            electricalInfrastructure: reservedItems(currentData.electricalInfrastructure),
            building: reservedItems(currentData.building),
            waterToiletSewerage: reservedItems(currentData.waterToiletSewerage),
            safetyAndSecurity: reservedItems(currentData.safetyAndSecurity),
        };

        console.log("Generated Follow-up Sheet Data:", newSheetData);
        alert("Check the console for the generated follow-up sheet data. In a real app, this would create a new version.");
        // In a real application, you would probably save this as a new version or update the UI state.
        // For now, we'll just log it.
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Commercial Terms Sheet</CardTitle>
                                <CardDescription>
                                    Manage negotiation points for Transaction ID: {lead.id}.
                                    {primaryListing && <span className="block mt-1 text-xs">Pre-filled with data from listing: <Link href={`/listings/${primaryListing.listingId}`} target="_blank" className="text-primary underline">{primaryListing.name}</Link></span>}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={handleGenerateFollowUp}>
                                    <FileSymlink className="mr-2 h-4 w-4" />
                                    Generate Follow-up
                                </Button>
                                <Button type="button" onClick={() => appendSession({ date: new Date().toISOString(), attendees: '' })}>
                                    <Calendar className="mr-2 h-4 w-4"/>
                                    Add Session
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {sessionFields.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {sessionFields.map((field, index) => (
                                    <div key={field.id} className="p-3 border rounded-lg bg-secondary/50">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-sm">Negotiation Session {index + 1}: {new Date(form.watch(`sessions.${index}.date`)).toLocaleString()}</p>
                                             <Button type="button" variant="ghost" size="icon" onClick={() => console.log('This would remove a session')}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                        <FormField control={form.control} name={`sessions.${index}.attendees`} render={({ field }) => (
                                            <FormItem className="mt-2"><FormLabel className="text-xs">Attendees</FormLabel><FormControl><Input placeholder="e.g., John (Customer), Jane (Provider)" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[15%]">Particulars</TableHead>
                                    <TableHead className="w-[25%]">Specific Details</TableHead>
                                    <TableHead className="w-[12%]">Proposed By</TableHead>
                                    <TableHead className="w-[15%]">Status</TableHead>
                                    <TableHead className="w-[18%]">Agreed Terms</TableHead>
                                    <TableHead className="w-[15%]">Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Sections */}
                                <TableRow><SectionHeader icon={MapPin} title="Site Information" /></TableRow>
                                <FormRow name="siteInfo.postalAddress" label="Postal Address" control={form.control} watch={form.watch}/>
                                <FormRow name="siteInfo.buildingNumber" label="Building Number" control={form.control} watch={form.watch}/>
                                <FormRow name="siteInfo.googleCoordinates" label="Google Coordinates" control={form.control} watch={form.watch}/>
                                <FormRow name="siteInfo.buildingStatus" label="Building Status" control={form.control} watch={form.watch}/>
                                
                                <TableRow><SectionHeader icon={Home} title="Area (in SFT)" /></TableRow>
                                <FormRow name="area.plinthArea" label="Plinth Area (Shop Floor)" control={form.control} watch={form.watch}/>
                                <FormRow name="area.mezzanineArea1" label="Mezzanine Area 1" control={form.control} watch={form.watch}/>
                                <FormRow name="area.mezzanineArea2" label="Mezzanine Area 2" control={form.control} watch={form.watch}/>
                                <FormRow name="area.canopyArea" label="Canopy Area" control={form.control} watch={form.watch}/>
                                <FormRow name="area.driversRestRoom" label="Driver's Rest Room" control={form.control} watch={form.watch}/>
                                <FormRow name="area.totalChargeableArea" label="Total Chargeable Area" control={form.control} watch={form.watch}/>

                                <TableRow><SectionHeader icon={HardHat} title="Tenant Improvement Items" /></TableRow>
                                <FormRow name="tenantImprovements.electricityPower" label="Electricity Power" control={form.control} watch={form.watch}/>
                                <FormRow name="tenantImprovements.internalCabling" label="Internal Cabling & Power Gear" control={form.control} watch={form.watch}/>
                                {tenantImprovementFields.map((field, index) => ( <CustomFormRow key={field.id} control={form.control} index={index} remove={removeTenantImprovement} watch={form.watch} /> ))}
                                <TableRow><TableCell colSpan={6}><Button type="button" variant="outline" size="sm" onClick={() => appendTenantImprovement({ particulars: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Improvement Item</Button></TableCell></TableRow>

                                <TableRow><SectionHeader icon={ListChecks} title="Lease Terms" /></TableRow>
                                <FormRow name="leaseTerms.leaseTenure" label="Lease Tenure" control={form.control} watch={form.watch}/>
                                {leaseTermFields.map((field, index) => ( <CustomFormRow key={field.id} control={form.control} index={index} remove={removeLeaseTerm} watch={form.watch} /> ))}
                                <TableRow><TableCell colSpan={6}><Button type="button" variant="outline" size="sm" onClick={() => appendLeaseTerm({ particulars: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Lease Term</Button></TableCell></TableRow>

                                <TableRow><SectionHeader icon={HandCoins} title="Commercial Terms" /></TableRow>
                                <FormRow name="commercialTerms.chargeableArea" label="Chargeable Area (SFT)" control={form.control} watch={form.watch}/>
                                <FormRow name="commercialTerms.buildingRentPerSft" label="Building Rent per SFT (INR)" control={form.control} isCostFactor watch={form.watch}/>
                                <FormRow name="commercialTerms.totalRentPerMonth" label="Total Rent per Month (INR)" control={form.control} isCostFactor watch={form.watch}/>
                                {capexFields.map((field, index) => ( <CustomFormRow key={field.id} control={form.control} index={index} remove={removeCapex} isCostFactor watch={form.watch} /> ))}
                                <TableRow><TableCell colSpan={6}><Button type="button" variant="outline" size="sm" onClick={() => appendCapex({ particulars: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add CAPEX Item</Button></TableCell></TableRow>
                                <FormRow name="commercialTerms.camCharges" label="CAM Charges per SFT" control={form.control} isCostFactor watch={form.watch}/>
                                <FormRow name="commercialTerms.ifrsd" label="IFRSD (Security Deposit)" control={form.control} watch={form.watch}/>
                                <FormRow name="commercialTerms.rentEscalation" label="Rent Escalation (% and Freq.)" control={form.control} watch={form.watch}/>

                                {/* Other Sections */}
                                <TableRow><SectionHeader icon={Power} title="Electrical Infrastructure" /></TableRow>
                                <FormRow name="electricalInfrastructure.installedCapacity" label="Installed Capacity of Sub-Station" control={form.control} watch={form.watch} />

                                <TableRow><SectionHeader icon={Building} title="The Building" /></TableRow>
                                <FormRow name="building.buildingType" label="Building Type" control={form.control} watch={form.watch} />
                               
                                <TableRow><SectionHeader icon={Droplets} title="Water-Toilet-Sewerage" /></TableRow>
                                <FormRow name="waterToiletSewerage.workersToilet" label="Workers' Toilet" control={form.control} watch={form.watch} />

                                <TableRow><SectionHeader icon={ShieldCheck} title="Safety & Security" /></TableRow>
                                <FormRow name="safetyAndSecurity.fireExitDoor" label="Provision of Fire Exit Door" control={form.control} watch={form.watch} />
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                     <CardFooter className="flex-col items-end space-y-4 pt-6">
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50 w-full max-w-sm">
                            <FormField
                                control={form.control}
                                name="commercialTerms.netCostPerMonth"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                    <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4"/> Net Cost-Per Month (Excl. Tax)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="text-lg font-bold text-primary bg-primary/10 border-primary/20"/>
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                         <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Commercial Terms</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
