
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Download } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Submission, ChatSubmission } from '@/contexts/data-context';
import * as XLSX from 'xlsx';

export function ShortlistedProperties() {
  const { user, users } = useAuth();
  const { shortlistedItems, toggleShortlist, openChat } = useData();

  const handleDownload = () => {
    const dataToExport = shortlistedItems.map(item => {
      if (!item.listing) return {};
      const { listing } = item;
      return {
        'Property ID': listing.listingId,
        'Name': listing.name,
        'Location': listing.location,
        'Total Area (Sq. Ft.)': listing.sizeSqFt,
        'Building Type': listing.buildingSpecifications.buildingType,
        'Availability': listing.availabilityDate,
        'Docks': listing.buildingSpecifications.numberOfDocksAndShutters,
        'Shop Floor Dimension': listing.buildingSpecifications.shopFloorLevelDimension,
        'Roof Insulation': listing.buildingSpecifications.roofInsulation,
        'Natural Light/Ventilation': listing.buildingSpecifications.naturalLightingAndVentilation,
        'Inside Flooring': listing.siteSpecifications.typeOfFlooringInside,
        'Outside Flooring': listing.siteSpecifications.typeOfFlooringOutside,
        'Access Road': listing.siteSpecifications.typeOfRoad,
        'Rent (per Sq. Ft.)': listing.rentPerSqFt || 'Contact for details',
        'Crane Support Structure': listing.buildingSpecifications.craneSupportStructureAvailable ? 'Yes' : 'No',
        'Crane Available': listing.buildingSpecifications.craneAvailable ? 'Yes' : 'No',
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const footer = [
        [], 
        ["For Leasing, Contact"],
        ["Lakshmi Balaji Realty"],
        ["Email: balaji@lakshmibalajio2o.com"],
        ["Mobile: +91 98410 98170"],
        [],
        ["Powered by ORS-ONE | Building Transaction Ready Assets"]
    ];
    XLSX.utils.sheet_add_aoa(worksheet, footer, { origin: -1 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shortlisted Properties");
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `Lakshmi_Balaji_O2O_Shortlisted_Properties_${timestamp}.csv`;

    XLSX.writeFile(workbook, filename, { bookType: "csv" });
  };
  
  const handleChatInit = (match: Submission) => {
    if (!user) return;
    const provider = users[match.providerEmail];
    const submissionForChat: ChatSubmission = {
      ...match,
      chatPartnerName: provider?.companyName || "Developer",
      customerName: user.userName,
      customerCompany: user.companyName,
    };
    openChat(submissionForChat);
  };

  return (
    <>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle>Shortlisted Properties</CardTitle>
                <CardDescription>
                  Properties you've shortlisted appear here. You can start a conversation or remove them from this list.
                </CardDescription>
              </div>
              {shortlistedItems.length > 0 && (
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download as CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {shortlistedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlistedItems.map(match => {
                    if (!match.listing) return null;
                    const listing = match.listing;
                    return (
                    <Card key={match.submissionId} className="flex flex-col">
                        <CardHeader>
                        <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                            <Image src={listing.documents?.[0]?.url || "https://placehold.co/600x400.png"} alt={`Property ${listing.listingId}`} data-ai-hint="warehouse industrial building" fill className="object-cover" />
                        </div>
                        <CardTitle>{listing.name}</CardTitle>
                        <CardDescription>
                            For Demand: {match.demandId}
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                            <div>
                            <p className="text-muted-foreground">Size</p>
                            <p className="font-medium">{listing.sizeSqFt.toLocaleString()} Sq. Ft.</p>
                            </div>
                            <div>
                            <p className="text-muted-foreground">Rent</p>
                            <p className="font-medium">₹{listing.rentPerSqFt}/sft</p>
                            </div>
                        </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => toggleShortlist(match)}
                        >
                            <Star className="mr-2 h-4 w-4 fill-current text-yellow-400" />
                            Remove
                        </Button>
                        <Button className="w-full" onClick={() => handleChatInit(match)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                        </Button>
                        </CardFooter>
                    </Card>
                )})}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">
                <p>No shortlisted properties yet.</p>
                <p className="text-xs mt-1">Click the star icon on a matched property to add it to this list.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
