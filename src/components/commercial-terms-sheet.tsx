
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
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Building, HandCoins, HardHat, Info, Link, ListChecks, MapPin, PlusCircle, Save, Droplets, ShieldCheck, Truck, Wind, Zap } from 'lucide-react';
import { Separator } from './ui/separator';
import { Trash2 } from 'lucide-react';

export function CommercialTermsSheet({ lead }: { lead: RegisteredLead }) {
    const { listings, submissions } = useData();
    
    // Find the primary associated listing for this lead, if any.
    // This could be improved if a lead is formally linked to one submission.
    const primarySubmission = submissions.find(s => s.demandId === lead.id && s.status === 'Approved');
    const primaryListing = listings.find(l => l.listingId === primarySubmission?.listingId);

    const form = useForm<CommercialTermsSchema>({
        resolver: zodResolver(commercialTermsSchema),
        defaultValues: {
            siteInfo: {},
            area: {},
            tenantImprovements: { customItems: [] },
            leaseTerms: { customItems: [] },
            commercialTerms: { capexItems: [] },
            electricalInfrastructure: {},
            building: {},
            waterAndSafety: {},
            safetyAndSecurity: {},
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
                    postalAddress: primaryListing.location,
                    googleCoordinates: primaryListing.latLng,
                    buildingStatus: primaryListing.availabilityDate,
                },
                area: {
                    plinthArea: primaryListing.area.plinthArea,
                    mezzanineArea1: primaryListing.area.mezzanineArea1,
                    mezzanineArea2: primaryListing.area.mezzanineArea2,
                    canopyArea: primaryListing.area.canopyArea,
                    driversRestRoom: primaryListing.area.driversRestRoomArea,
                    totalChargeableArea: primaryListing.area.totalChargeableArea || primaryListing.sizeSqFt,
                },
                commercialTerms: {
                    chargeableArea: primaryListing.area.totalChargeableArea || primaryListing.sizeSqFt,
                    buildingRentPerSft: primaryListing.rentPerSqFt,
                    ifrsd: primaryListing.rentalSecurityDeposit,
                },
                building: {
                    buildingType: primaryListing.buildingSpecifications.buildingType,
                    shopFloorDimension: primaryListing.buildingSpecifications.shopFloorLevelDimension,
                    mezzanineDimension: primaryListing.buildingSpecifications.mezzanineFloorLevelHeightAndDimension,
                    docksAndShutters: primaryListing.buildingSpecifications.numberOfDocksAndShutters,
                    canopyDimension: primaryListing.buildingSpecifications.canopyDimension,
                    naturalLighting: primaryListing.buildingSpecifications.naturalLightingAndVentilation,
                    roofInsulation: primaryListing.buildingSpecifications.roofInsulationStatus,
                    internalLighting: primaryListing.buildingSpecifications.internalLighting,
                },
                 safetyAndSecurity: {
                    fireHydrantOutside: primaryListing.certificatesAndApprovals.fireLicense,
                    fireHydrantInside: primaryListing.certificatesAndApprovals.fireLicense,
                    fireSprinklers: primaryListing.certificatesAndApprovals.fireNOC,
                },
                // Keep other fields as default
                tenantImprovements: { customItems: [] },
                leaseTerms: { customItems: [] },
                electricalInfrastructure: {},
                waterAndSafety: {},
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
                            Create and manage the commercial terms for Transaction ID: {lead.id}.
                             {primaryListing && <span className="block mt-1 text-xs">Pre-filled with data from listing: <Link href={`/listings/${primaryListing.listingId}`} target="_blank" className="text-primary underline">{primaryListing.name}</Link></span>}
                        </CardDescription>
                    </CardHeader>
                </Card>
                
                 {/* SITE INFORMATION */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><MapPin/> Site Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="siteInfo.postalAddress" render={({ field }) => (<FormItem><FormLabel>Postal Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="siteInfo.buildingNumber" render={({ field }) => (<FormItem><FormLabel>Building Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="siteInfo.googleCoordinates" render={({ field }) => (<FormItem><FormLabel>Google Coordinates</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="siteInfo.buildingStatus" render={({ field }) => (<FormItem><FormLabel>Building Status</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                
                 {/* AREA */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Building/> Area (in SFT)</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="area.plinthArea" render={({ field }) => (<FormItem><FormLabel>Plinth Area (Shop Floor)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="area.mezzanineArea1" render={({ field }) => (<FormItem><FormLabel>Mezzanine Area 1</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="area.mezzanineArea2" render={({ field }) => (<FormItem><FormLabel>Mezzanine Area 2</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="area.canopyArea" render={({ field }) => (<FormItem><FormLabel>Canopy Area</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="area.driversRestRoom" render={({ field }) => (<FormItem><FormLabel>Driver's Rest Room</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="area.totalChargeableArea" render={({ field }) => (<FormItem><FormLabel>Total Chargeable Area</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                
                 {/* TENANT IMPROVEMENT */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><HardHat/> Tenant Improvement Items</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="tenantImprovements.electricityPower" render={({ field }) => (<FormItem><FormLabel>Electricity Power</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tenantImprovements.internalCabling" render={({ field }) => (<FormItem><FormLabel>Internal Cabling & Related Power Gear</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tenantImprovements.hvac" render={({ field }) => (<FormItem><FormLabel>HVAC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tenantImprovements.mechanisedAccess" render={({ field }) => (<FormItem><FormLabel>Mechanised Access to Mezzanine</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tenantImprovements.washroomsOnMezzanine" render={({ field }) => (<FormItem><FormLabel>Washrooms on Mezzanine</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tenantImprovements.ramp" render={({ field }) => (<FormItem><FormLabel>Ramp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Separator />
                        {tenantImprovementFields.map((field, index) => (
                           <div key={field.id} className="flex gap-2 items-end"><FormField control={form.control} name={`tenantImprovements.customItems.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`Custom Item ${index+1}`} {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeTenantImprovement(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTenantImprovement({ value: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Item</Button>
                    </CardContent>
                </Card>
                
                 {/* LEASE TERMS */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks/> Lease Terms</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="leaseTerms.leaseTenure" render={({ field }) => (<FormItem><FormLabel>Lease Tenure</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.leaseLockIn" render={({ field }) => (<FormItem><FormLabel>Lease Lock-in Period</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.fitoutHandoverDate" render={({ field }) => (<FormItem><FormLabel>Tentative Fitout Handover Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.fullHandoverDate" render={({ field }) => (<FormItem><FormLabel>Tentative 100% Handover Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.rentFreePeriod" render={({ field }) => (<FormItem><FormLabel>Rent Free Period (for Fitout)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.chargeableArea" render={({ field }) => (<FormItem><FormLabel>Chargeable Area (SFT)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.leaseCommencementDate" render={({ field }) => (<FormItem><FormLabel>Lease Commencement Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="leaseTerms.rentCommencementDate" render={({ field }) => (<FormItem><FormLabel>Rent Commencement Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="leaseTerms.scopeAndCostOfRegistration" render={({ field }) => (<FormItem><FormLabel>Scope & Cost of Lease Registration</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <Separator />
                        {leaseTermFields.map((field, index) => (
                           <div key={field.id} className="flex gap-2 items-end"><FormField control={form.control} name={`leaseTerms.customItems.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`Custom Item ${index+1}`} {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeLeaseTerm(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendLeaseTerm({ value: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add Item</Button>
                    </CardContent>
                </Card>

                 {/* COMMERCIALS */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><HandCoins/> Commercial Terms</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="commercialTerms.chargeableArea" render={({ field }) => (<FormItem><FormLabel>Chargeable Area (SFT)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.buildingRentPerSft" render={({ field }) => (<FormItem><FormLabel>Building Rent per SFT (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.totalRentPerMonth" render={({ field }) => (<FormItem><FormLabel>Total Building Rent per Month (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                         <Separator />
                        {capexFields.map((field, index) => (
                           <div key={field.id} className="flex gap-2 items-end"><FormField control={form.control} name={`commercialTerms.capexItems.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel>Monthly Amortization for CAPEX Item {index+1}</FormLabel><FormControl><Input placeholder="Item Description and Amount" {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeCapex(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendCapex({ value: '' })}><PlusCircle className="mr-2 h-4 w-4"/> Add CAPEX Item</Button>
                        <Separator />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="commercialTerms.netTotalRental" render={({ field }) => (<FormItem><FormLabel>Net Total Rental (excl. GST)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.camCharges" render={({ field }) => (<FormItem><FormLabel>CAM Charges per SFT (excl. GST)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.ifrsd" render={({ field }) => (<FormItem><FormLabel>IFRSD (Interest Free Refundable Security Deposit)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.rentEscalation" render={({ field }) => (<FormItem><FormLabel>Rent Escalation (%) and Frequency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.commitmentPhase2" render={({ field }) => (<FormItem><FormLabel>Commitment for Phase II</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="commercialTerms.additionalCharges" render={({ field }) => (<FormItem><FormLabel>Additional Charges</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </CardContent>
                </Card>

                 {/* ELECTRICAL */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap/> Electrical Infrastructure</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="electricalInfrastructure.installedCapacity" render={({ field }) => (<FormItem><FormLabel>Installed Capacity of Sub-Station</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.powerRequirementP1" render={({ field }) => (<FormItem><FormLabel>Power Requirement - Phase I</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.powerRequirementP2" render={({ field }) => (<FormItem><FormLabel>Power Requirement - Phase II</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.scopeOfProvidingPower" render={({ field }) => (<FormItem><FormLabel>Scope of Providing Power</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.timeToProvidePower" render={({ field }) => (<FormItem><FormLabel>Time to Provide Required Power</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.budgetForPowerP1" render={({ field }) => (<FormItem><FormLabel>Indicative Budget for Power - Phase I</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.budgetForPowerP2" render={({ field }) => (<FormItem><FormLabel>Indicative Budget for Power - Phase II</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.powerEnhancement" render={({ field }) => (<FormItem><FormLabel>Enhancement of Required Power</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.mainCableCapacity" render={({ field }) => (<FormItem><FormLabel>Main Cable Power Load Capacity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.mainPowerTappingPoint" render={({ field }) => (<FormItem><FormLabel>Main Power Tapping Point</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.internalCabling" render={({ field }) => (<FormItem><FormLabel>Internal Power Cabling</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.internalSwitches" render={({ field }) => (<FormItem><FormLabel>Internal Power Switches/Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.streetLightToWarehouse" render={({ field }) => (<FormItem><FormLabel>Street Light from Main Gate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.streetLightInCompound" render={({ field }) => (<FormItem><FormLabel>Street Light Inside Compound</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.gensetRequirement" render={({ field }) => (<FormItem><FormLabel>Genset Requirement</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.gensetCapacity" render={({ field }) => (<FormItem><FormLabel>Genset Capacity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.gensetProvision" render={({ field }) => (<FormItem><FormLabel>Provision for Genset</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.hvacRequirement" render={({ field }) => (<FormItem><FormLabel>HVAC Requirement</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.hvacCapacity" render={({ field }) => (<FormItem><FormLabel>HVAC Capacity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.hvacProvision" render={({ field }) => (<FormItem><FormLabel>Provision for HVAC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="electricalInfrastructure.falseCeiling" render={({ field }) => (<FormItem><FormLabel>False Ceiling</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>

                 {/* BUILDING */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Building/> The Building</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="building.buildingType" render={({ field }) => (<FormItem><FormLabel>Building Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.shopFloorDimension" render={({ field }) => (<FormItem><FormLabel>Shop Floor Dimension</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.mezzanineDimension" render={({ field }) => (<FormItem><FormLabel>Mezzanine Floor Height & Dimension</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.docksAndShutters" render={({ field }) => (<FormItem><FormLabel>Number of Docks & Shutters</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.canopyDimension" render={({ field }) => (<FormItem><FormLabel>Canopy Dimension</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.naturalLighting" render={({ field }) => (<FormItem><FormLabel>Natural Lighting & Ventilation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.roofInsulation" render={({ field }) => (<FormItem><FormLabel>Roof Insulation Status</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="building.internalLighting" render={({ field }) => (<FormItem><FormLabel>Internal Lighting</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>

                {/* WATER & SAFETY */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Droplets/> Water & Sewerage</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="waterAndSafety.workersToilet" render={({ field }) => (<FormItem><FormLabel>Workers Toilet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.executiveToilet" render={({ field }) => (<FormItem><FormLabel>Executive Toilet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.waterForWash" render={({ field }) => (<FormItem><FormLabel>Water for Wash & Toilets</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.waterSource" render={({ field }) => (<FormItem><FormLabel>Water Source</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.overheadTank" render={({ field }) => (<FormItem><FormLabel>Overhead Tank Type & Capacity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.waterSump" render={({ field }) => (<FormItem><FormLabel>Water Sump</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.septicTank" render={({ field }) => (<FormItem><FormLabel>Septic Tank</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.stp" render={({ field }) => (<FormItem><FormLabel>STP Provided & Capacity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="waterAndSafety.solidWasteDisposal" render={({ field }) => (<FormItem><FormLabel>Solid Waste Disposal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck/> Safety & Security</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="safetyAndSecurity.fireExit" render={({ field }) => (<FormItem><FormLabel>Fire Exit Door Provision</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.fireHydrantOutside" render={({ field }) => (<FormItem><FormLabel>Fire Hydrant (Outside)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.fireHydrantInside" render={({ field }) => (<FormItem><FormLabel>Fire Hydrant (Inside)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.fireSprinklers" render={({ field }) => (<FormItem><FormLabel>Fire Sprinklers</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.dedicatedWaterSump" render={({ field }) => (<FormItem><FormLabel>Dedicated Water Sump for Fire</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.fullyCompounded" render={({ field }) => (<FormItem><FormLabel>Fully Compounded Park</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.securityAtGate" render={({ field }) => (<FormItem><FormLabel>Security at Gate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.cctv" render={({ field }) => (<FormItem><FormLabel>CCTV Installed in Park</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="safetyAndSecurity.securityDesk" render={({ field }) => (<FormItem><FormLabel>Security Desk for Building</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="flex justify-end pt-4">
                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Commercial Terms</Button>
                </div>
            </form>
        </Form>
    );
}
