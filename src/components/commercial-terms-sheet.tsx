
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commercialTermsSchema, type CommercialTermsSchema } from '@/lib/schema';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from './ui/table';
import { Textarea } from './ui/textarea';

const SectionHeader = ({ icon, title }: { icon: React.ElementType; title: string }) => {
    const Icon = icon;
    return (
        <TableHead colSpan={4} className="bg-primary/5 text-primary font-semibold">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
            </div>
        </TableHead>
    );
};

const FormRow = ({ name, label, control, placeholder }: { name: any; label: string; control: any; placeholder?: string }) => (
    <TableRow>
        <TableCell className="font-medium w-1/4">{label}</TableCell>
        <TableCell>
            <FormField
                control={control}
                name={`${name}.customerValue`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea placeholder={placeholder || "Customer's demand..."} {...field} className="min-h-0 h-10 p-2" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
        <TableCell>
             <FormField
                control={control}
                name={`${name}.providerValue`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea placeholder={placeholder || "Provider's offer..."} {...field} className="min-h-0 h-10 p-2"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
        <TableCell>
             <FormField
                control={control}
                name={`${name}.agreedValue`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea placeholder="Final agreed term..." {...field} className="min-h-0 h-10 p-2 bg-green-50"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
    </TableRow>
);


export function CommercialTermsSheet({ lead }: { lead: RegisteredLead }) {
    const { listings, submissions } = useData();
    
    const primarySubmission = submissions.find(s => s.demandId === lead.id && s.status === 'Approved');
    const primaryListing = listings.find(l => l.listingId === primarySubmission?.listingId);

    const form = useForm<CommercialTermsSchema>({
        resolver: zodResolver(commercialTermsSchema),
        defaultValues: {
            leaseTerms: { customItems: [] },
            commercialTerms: { capexItems: [] },
        }
    });
    
     const { fields: leaseTermFields, append: appendLeaseTerm, remove: removeLeaseTerm } = useFieldArray({
        control: form.control,
        name: "leaseTerms.customItems",
    });
    const { fields: capexFields, append: appendCapex, remove: removeCapex } = useFieldArray({
        control: form.control,
        name: "commercialTerms.capexItems",
    });

    React.useEffect(() => {
        if (primaryListing) {
            form.reset({
                siteInfo: {
                    postalAddress: { providerValue: primaryListing.location },
                    buildingStatus: { providerValue: primaryListing.availabilityDate },
                    googleCoordinates: { providerValue: primaryListing.latLng },
                },
                area: {
                    totalChargeableArea: { providerValue: String(primaryListing.sizeSqFt) },
                },
                building: {
                    buildingType: { providerValue: primaryListing.buildingSpecifications.buildingType },
                    docksAndShutters: { providerValue: String(primaryListing.buildingSpecifications.numberOfDocksAndShutters) },
                },
                commercialTerms: {
                    chargeableArea: { providerValue: String(primaryListing.sizeSqFt) },
                    buildingRentPerSft: { providerValue: String(primaryListing.rentPerSqFt) },
                    ifrsd: { providerValue: String(primaryListing.rentalSecurityDeposit) },
                },
                leaseTerms: { customItems: [] },
            });
        }
    }, [primaryListing, form]);

    const onSubmit = (data: CommercialTermsSchema) => {
        console.log("Commercial Terms Submitted: ", data);
        alert("Commercial terms saved! Check console for data.");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Commercial Terms Sheet</CardTitle>
                        <CardDescription>
                            Manage the negotiation points for Transaction ID: {lead.id}.
                             {primaryListing && <span className="block mt-1 text-xs">Pre-filled with data from listing: <Link href={`/listings/${primaryListing.listingId}`} target="_blank" className="text-primary underline">{primaryListing.name}</Link></span>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">Particulars</TableHead>
                                    <TableHead className="w-1/4 bg-blue-50">Customer's Position</TableHead>
                                    <TableHead className="w-1/4 bg-orange-50">Provider's Position</TableHead>
                                    <TableHead className="w-1/4 bg-green-50">Agreed Terms</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Site Information */}
                                <TableRow><SectionHeader icon={MapPin} title="Site Information" /></TableRow>
                                <FormRow name="siteInfo.postalAddress" label="Postal Address" control={form.control} />
                                <FormRow name="siteInfo.buildingNumber" label="Building Number" control={form.control} />
                                <FormRow name="siteInfo.googleCoordinates" label="Google Coordinates" control={form.control} />
                                <FormRow name="siteInfo.buildingStatus" label="Building Status" control={form.control} />
                                
                                {/* Area */}
                                <TableRow><SectionHeader icon={Building} title="Area (in SFT)" /></TableRow>
                                <FormRow name="area.plinthArea" label="Plinth Area (Shop Floor)" control={form.control} />
                                <FormRow name="area.mezzanineArea1" label="Mezzanine Area 1" control={form.control} />
                                <FormRow name="area.totalChargeableArea" label="Total Chargeable Area" control={form.control} />

                                {/* Tenant Improvements */}
                                <TableRow><SectionHeader icon={HardHat} title="Tenant Improvement Items" /></TableRow>
                                <FormRow name="tenantImprovements.electricityPower" label="Electricity Power" control={form.control} />
                                <FormRow name="tenantImprovements.hvac" label="HVAC" control={form.control} />

                                {/* Lease Terms */}
                                <TableRow><SectionHeader icon={ListChecks} title="Lease Terms" /></TableRow>
                                <FormRow name="leaseTerms.leaseTenure" label="Lease Tenure" control={form.control} />
                                <FormRow name="leaseTerms.leaseLockIn" label="Lease Lock-in Period" control={form.control} />
                                <FormRow name="leaseTerms.rentFreePeriod" label="Rent Free Period (for Fitout)" control={form.control} />
                                <FormRow name="leaseTerms.leaseCommencementDate" label="Lease Commencement Date" control={form.control} />
                                <FormRow name="leaseTerms.rentCommencementDate" label="Rent Commencement Date" control={form.control} />
                                {leaseTermFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                             <FormField control={form.control} name={`leaseTerms.customItems.${index}.label`} render={({ field }) => (<Input placeholder="Custom Item" {...field} />)} />
                                        </TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`leaseTerms.customItems.${index}.customerValue`} render={({ field }) => (<Textarea placeholder="Customer's demand..." {...field} className="min-h-0 h-10 p-2" />)} />
                                        </TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`leaseTerms.customItems.${index}.providerValue`} render={({ field }) => (<Textarea placeholder="Provider's offer..." {...field} className="min-h-0 h-10 p-2" />)} />
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <FormField control={form.control} name={`leaseTerms.customItems.${index}.agreedValue`} render={({ field }) => (<Textarea placeholder="Final agreed term..." {...field} className="min-h-0 h-10 p-2 flex-grow bg-green-50" />)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLeaseTerm(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow><TableCell colSpan={4}><Button type="button" variant="outline" size="sm" onClick={() => appendLeaseTerm({ label: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Lease Term</Button></TableCell></TableRow>

                                 {/* Commercial Terms */}
                                <TableRow><SectionHeader icon={HandCoins} title="Commercial Terms" /></TableRow>
                                <FormRow name="commercialTerms.chargeableArea" label="Chargeable Area (SFT)" control={form.control} />
                                <FormRow name="commercialTerms.buildingRentPerSft" label="Building Rent per SFT (INR)" control={form.control} />
                                <FormRow name="commercialTerms.ifrsd" label="IFRSD (Security Deposit)" control={form.control} />
                                <FormRow name="commercialTerms.rentEscalation" label="Rent Escalation" control={form.control} placeholder="e.g., 15% every 3 years"/>
                                {capexFields.map((field, index) => (
                                     <TableRow key={field.id}>
                                        <TableCell>
                                             <FormField control={form.control} name={`commercialTerms.capexItems.${index}.label`} render={({ field }) => (<Input placeholder={`CAPEX Item ${index+1}`} {...field} />)} />
                                        </TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`commercialTerms.capexItems.${index}.customerValue`} render={({ field }) => (<Textarea placeholder="Customer's demand..." {...field} className="min-h-0 h-10 p-2" />)} />
                                        </TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`commercialTerms.capexItems.${index}.providerValue`} render={({ field }) => (<Textarea placeholder="Provider's offer..." {...field} className="min-h-0 h-10 p-2" />)} />
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <FormField control={form.control} name={`commercialTerms.capexItems.${index}.agreedValue`} render={({ field }) => (<Textarea placeholder="Final agreed term..." {...field} className="min-h-0 h-10 p-2 flex-grow bg-green-50" />)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCapex(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow><TableCell colSpan={4}><Button type="button" variant="outline" size="sm" onClick={() => appendCapex({ label: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add CAPEX Item</Button></TableCell></TableRow>

                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>

                 <div className="flex justify-end pt-4">
                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Commercial Terms</Button>
                </div>
            </form>
        </Form>
    );
}
