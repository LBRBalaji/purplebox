
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commercialTermsSchema, type CommercialTermsSchema } from '@/lib/schema';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, ListChecks, MapPin, PlusCircle, Save, Trash2, Home, Power, Droplets, ShieldCheck, User, FolderArchive } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from './ui/table';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const SectionHeader = ({ icon, title }: { icon: React.ElementType; title: string }) => {
    const Icon = icon;
    return (
        <TableHead colSpan={5} className="bg-primary/5 text-primary font-semibold">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
            </div>
        </TableHead>
    );
};

const FormRow = ({ name, label, control, isTextarea }: { name: any; label: string; control: any, isTextarea?: boolean }) => {
    const InputComponent = isTextarea ? Textarea : Input;
    return (
    <TableRow>
        <TableCell className="font-medium w-[20%]">{label}</TableCell>
        <TableCell className="w-[30%]">
            <FormField
                control={control}
                name={`${name}.details`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <InputComponent placeholder="Specific details..." {...field} className="min-h-0 h-10 p-2" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
        <TableCell className="w-[15%]">
             <FormField
                control={control}
                name={`${name}.proposedBy`}
                render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Customer">Customer</SelectItem>
                                <SelectItem value="Provider">Provider</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
        <TableCell className="w-[15%]">
             <FormField
                control={control}
                name={`${name}.status`}
                render={({ field }) => (
                     <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Agreed">Agreed</SelectItem>
                                <SelectItem value="Reserved For Discussion">Reserved</SelectItem>
                                <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
         <TableCell className="w-[20%]">
            <FormField
                control={control}
                name={`${name}.remarks`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea placeholder="Remarks..." {...field} className="min-h-0 h-10 p-2" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </TableCell>
    </TableRow>
)};

const CustomFormRow = ({ control, index, remove }: { control: any, index: number, remove: (index: number) => void}) => (
    <TableRow>
        <TableCell>
            <FormField control={control} name={`tenantImprovements.customItems.${index}.particulars`} render={({ field }) => <Input placeholder="Custom Item" {...field} />} />
        </TableCell>
        <TableCell>
            <FormField control={control} name={`tenantImprovements.customItems.${index}.details`} render={({ field }) => <Textarea placeholder="Details..." {...field} className="h-10 p-2"/>} />
        </TableCell>
        <TableCell>
            <FormField control={control} name={`tenantImprovements.customItems.${index}.proposedBy`} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select>
            )} />
        </TableCell>
        <TableCell>
             <FormField control={control} name={`tenantImprovements.customItems.${index}.status`} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select>
            )} />
        </TableCell>
        <TableCell className="flex items-center gap-2">
             <FormField control={control} name={`tenantImprovements.customItems.${index}.remarks`} render={({ field }) => <Textarea placeholder="Remarks..." {...field} className="h-10 p-2 flex-grow"/>} />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
            tenantImprovements: { customItems: [] },
        }
    });
    
     const { fields: tenantImprovementFields, append: appendTenantImprovement, remove: removeTenantImprovement } = useFieldArray({
        control: form.control,
        name: "tenantImprovements.customItems",
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
                },
                leaseTerms: { customItems: [] },
                tenantImprovements: { customItems: [] },
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
                        <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[20%]">Particulars</TableHead>
                                    <TableHead className="w-[30%]">Specific Details</TableHead>
                                    <TableHead className="w-[15%]">Proposed By</TableHead>
                                    <TableHead className="w-[15%]">Status</TableHead>
                                    <TableHead className="w-[20%]">Remarks</TableHead>
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
                                <TableRow><SectionHeader icon={Home} title="Area (in SFT)" /></TableRow>
                                <FormRow name="area.plinthArea" label="Plinth Area (Shop Floor)" control={form.control} />
                                <FormRow name="area.mezzanineArea1" label="Mezzanine Area 1" control={form.control} />
                                <FormRow name="area.mezzanineArea2" label="Mezzanine Area 2" control={form.control} />
                                <FormRow name="area.canopyArea" label="Canopy Area" control={form.control} />
                                <FormRow name="area.driversRestRoom" label="Driver's Rest Room" control={form.control} />
                                <FormRow name="area.totalChargeableArea" label="Total Chargeable Area" control={form.control} />

                                {/* Tenant Improvements */}
                                <TableRow><SectionHeader icon={HardHat} title="Tenant Improvement Items" /></TableRow>
                                <FormRow name="tenantImprovements.electricityPower" label="Electricity Power" control={form.control} />
                                <FormRow name="tenantImprovements.internalCabling" label="Internal Cabling & Power Gear" control={form.control} />
                                <FormRow name="tenantImprovements.hvac" label="HVAC" control={form.control} />
                                <FormRow name="tenantImprovements.mechanisedAccess" label="Mechanised Access to Mezzanine" control={form.control} />
                                <FormRow name="tenantImprovements.washroomsOnMezzanine" label="Washrooms on Mezzanine" control={form.control} />
                                <FormRow name="tenantImprovements.ramp" label="Ramp" control={form.control} />
                                {tenantImprovementFields.map((field, index) => ( <CustomFormRow key={field.id} control={form.control} index={index} remove={removeTenantImprovement} /> ))}
                                <TableRow><TableCell colSpan={5}><Button type="button" variant="outline" size="sm" onClick={() => appendTenantImprovement({ particulars: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Improvement Item</Button></TableCell></TableRow>

                                {/* Lease Terms */}
                                <TableRow><SectionHeader icon={ListChecks} title="Lease Terms" /></TableRow>
                                <FormRow name="leaseTerms.leaseTenure" label="Lease Tenure" control={form.control} />
                                <FormRow name="leaseTerms.leaseLockIn" label="Lease Lock-in Period" control={form.control} />
                                <FormRow name="leaseTerms.fitoutHandoverDate" label="Fitout Handover Date" control={form.control} />
                                <FormRow name="leaseTerms.fullHandoverDate" label="100% Handover Date" control={form.control} />
                                <FormRow name="leaseTerms.rentFreePeriod" label="Rent Free Period (for Fitout)" control={form.control} />
                                <FormRow name="leaseTerms.chargeableArea" label="Chargeable Area" control={form.control} />
                                <FormRow name="leaseTerms.leaseCommencementDate" label="Lease Commencement Date" control={form.control} />
                                <FormRow name="leaseTerms.rentCommencementDate" label="Rent Commencement Date" control={form.control} />
                                <FormRow name="leaseTerms.scopeAndCostOfRegistration" label="Scope & Cost of Registration" control={form.control} isTextarea/>
                                {leaseTermFields.map((field, index) => ( <CustomFormRow key={field.id} control={form.control} index={index} remove={removeLeaseTerm} /> ))}
                                <TableRow><TableCell colSpan={5}><Button type="button" variant="outline" size="sm" onClick={() => appendLeaseTerm({ particulars: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Lease Term</Button></TableCell></TableRow>

                                 {/* Commercial Terms */}
                                <TableRow><SectionHeader icon={HandCoins} title="Commercial Terms" /></TableRow>
                                <FormRow name="commercialTerms.chargeableArea" label="Chargeable Area (SFT)" control={form.control} />
                                <FormRow name="commercialTerms.buildingRentPerSft" label="Building Rent per SFT (INR)" control={form.control} />
                                <FormRow name="commercialTerms.totalRentPerMonth" label="Total Rent per Month (INR)" control={form.control} />
                                {capexFields.map((field, index) => (
                                     <TableRow key={field.id}>
                                        <TableCell><FormField control={form.control} name={`commercialTerms.capexItems.${index}.particulars`} render={({ field }) => <Input placeholder={`CAPEX Item ${index+1}`} {...field} />} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`commercialTerms.capexItems.${index}.details`} render={({ field }) => <Textarea placeholder="Details..." {...field} className="h-10 p-2"/>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`commercialTerms.capexItems.${index}.proposedBy`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Customer">Customer</SelectItem><SelectItem value="Provider">Provider</SelectItem></SelectContent></Select> )} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`commercialTerms.capexItems.${index}.status`} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Agreed">Agreed</SelectItem><SelectItem value="Reserved For Discussion">Reserved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select> )} /></TableCell>
                                        <TableCell className="flex items-center gap-2"><FormField control={form.control} name={`commercialTerms.capexItems.${index}.remarks`} render={({ field }) => <Textarea placeholder="Remarks..." {...field} className="h-10 p-2 flex-grow"/>} /><Button type="button" variant="ghost" size="icon" onClick={() => removeCapex(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                    </TableRow>
                                ))}
                                <TableRow><TableCell colSpan={5}><Button type="button" variant="outline" size="sm" onClick={() => appendCapex({ particulars: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add CAPEX Item</Button></TableCell></TableRow>
                                <FormRow name="commercialTerms.netTotalRental" label="Net Total Rental (incl. CAPEX)" control={form.control} />
                                <FormRow name="commercialTerms.camCharges" label="CAM Charges per SFT" control={form.control} />
                                <FormRow name="commercialTerms.ifrsd" label="IFRSD (Security Deposit)" control={form.control} />
                                <FormRow name="commercialTerms.rentEscalation" label="Rent Escalation (% and Freq.)" control={form.control} />
                                <FormRow name="commercialTerms.commitmentPhase2" label="Commitment for Phase II" control={form.control} isTextarea />
                                <FormRow name="commercialTerms.additionalCharges" label="Additional Charges" control={form.control} isTextarea />

                                 {/* Electrical Infrastructure */}
                                <TableRow><SectionHeader icon={Power} title="Electrical Infrastructure" /></TableRow>
                                <FormRow name="electricalInfrastructure.installedCapacity" label="Installed Capacity of Sub-Station" control={form.control} />
                                <FormRow name="electricalInfrastructure.powerRequirementP1" label="Power Req. (Phase I)" control={form.control} />
                                <FormRow name="electricalInfrastructure.powerRequirementP2" label="Power Req. (Phase II)" control={form.control} />
                                <FormRow name="electricalInfrastructure.scopeOfProvidingPower" label="Scope of Providing Power" control={form.control} isTextarea />
                                <FormRow name="electricalInfrastructure.timelineToProvidePower" label="Timeline to Provide Power (Months)" control={form.control} />
                                <FormRow name="electricalInfrastructure.budgetP1" label="Indicative Budget (Phase I)" control={form.control} />
                                <FormRow name="electricalInfrastructure.budgetP2" label="Indicative Budget (Phase II)" control={form.control} />
                                <FormRow name="electricalInfrastructure.enhancementOfPower" label="Enhancement of Required Power" control={form.control} />
                                <FormRow name="electricalInfrastructure.mainCableCapacity" label="Main Cable Power Load Capacity" control={form.control} />
                                <FormRow name="electricalInfrastructure.mainTappingPoint" label="Main Power Tapping Point" control={form.control} />
                                <FormRow name="electricalInfrastructure.internalCabling" label="Internal Power Cabling" control={form.control} />
                                <FormRow name="electricalInfrastructure.internalSwitches" label="Internal Power Switches/Type" control={form.control} />
                                <FormRow name="electricalInfrastructure.streetLightToWarehouse" label="Street Light to Warehouse" control={form.control} />
                                <FormRow name="electricalInfrastructure.streetLightInCompound" label="Street Light in Compound" control={form.control} />
                                <FormRow name="electricalInfrastructure.gensetRequirement" label="Genset Requirement" control={form.control} />
                                <FormRow name="electricalInfrastructure.gensetCapacity" label="Genset Capacity (if required)" control={form.control} />
                                <FormRow name="electricalInfrastructure.provisionForGenset" label="Provision to Place Genset" control={form.control} />
                                <FormRow name="electricalInfrastructure.hvacRequirement" label="HVAC Requirement" control={form.control} />
                                <FormRow name="electricalInfrastructure.hvacCapacity" label="HVAC Capacity (if required)" control={form.control} />
                                <FormRow name="electricalInfrastructure.provisionForHvac" label="Provision to Place HVAC" control={form.control} />
                                <FormRow name="electricalInfrastructure.falseCeiling" label="False Ceiling" control={form.control} />

                                 {/* Building */}
                                <TableRow><SectionHeader icon={Building} title="The Building" /></TableRow>
                                <FormRow name="building.buildingType" label="Building Type" control={form.control} />
                                <FormRow name="building.shopFloorDimension" label="Shop Floor Dimension" control={form.control} />
                                <FormRow name="building.mezzanineDimension" label="Mezzanine Floor Dimension" control={form.control} />
                                <FormRow name="building.docksAndShutters" label="Number of Docks & Shutters" control={form.control} />
                                <FormRow name="building.canopyDimension" label="Canopy Dimension" control={form.control} />
                                <FormRow name="building.naturalLightingVentilation" label="Natural Lighting & Ventilation" control={form.control} />
                                <FormRow name="building.roofInsulation" label="Roof Insulation Status" control={form.control} />
                                <FormRow name="building.internalLighting" label="Internal Lighting" control={form.control} />
                                
                                 {/* Water-Toilet-Sewerage */}
                                <TableRow><SectionHeader icon={Droplets} title="Water-Toilet-Sewerage" /></TableRow>
                                <FormRow name="waterToiletSewerage.workersToilet" label="Workers' Toilet" control={form.control} />
                                <FormRow name="waterToiletSewerage.executiveToilet" label="Executive Toilet" control={form.control} />
                                <FormRow name="waterToiletSewerage.waterForWash" label="Water for Wash & Toilets" control={form.control} />
                                <FormRow name="waterToiletSewerage.waterSource" label="Water Source" control={form.control} />
                                <FormRow name="waterToiletSewerage.overheadTank" label="Overhead Tank Type & Capacity" control={form.control} />
                                <FormRow name="waterToiletSewerage.waterSump" label="Water Sump" control={form.control} />
                                <FormRow name="waterToiletSewerage.septicTank" label="Septic Tank" control={form.control} />
                                <FormRow name="waterToiletSewerage.stpProvided" label="STP Provided (Capacity)" control={form.control} />
                                <FormRow name="waterToiletSewerage.solidWasteDisposal" label="Solid Waste Disposal" control={form.control} />

                                 {/* Safety & Security */}
                                <TableRow><SectionHeader icon={ShieldCheck} title="Safety & Security" /></TableRow>
                                <FormRow name="safetyAndSecurity.fireExitDoor" label="Provision of Fire Exit Door" control={form.control} />
                                <FormRow name="safetyAndSecurity.fireHydrantOutside" label="Fire Hydrant (Outside)" control={form.control} />
                                <FormRow name="safetyAndSecurity.fireHydrantInside" label="Fire Hydrant (Inside)" control={form.control} />
                                <FormRow name="safetyAndSecurity.fireSprinklers" label="Fire Sprinklers" control={form.control} />
                                <FormRow name="safetyAndSecurity.dedicatedWaterSump" label="Dedicated Water Sump for Fire" control={form.control} />
                                <FormRow name="safetyAndSecurity.isFullyCompounded" label="Fully Compounded" control={form.control} />
                                <FormRow name="safetyAndSecurity.isSecurityProvided" label="Security at Gate" control={form.control} />
                                <FormRow name="safetyAndSecurity.isCctvInstalled" label="CCTV in Park" control={form.control} />
                                <FormRow name="safetyAndSecurity.isSecurityDeskProvided" label="Security Desk for Building" control={form.control} />

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
