
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Download } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Submission } from '@/contexts/data-context';
import { ChatDialog } from './chat-dialog';
import * as XLSX from 'xlsx';

export function ShortlistedProperties() {
  const { user } = useAuth();
  const { shortlistedItems, toggleShortlist } = useData();
  const [selectedChat, setSelectedChat] = React.useState<Submission | null>(null);

  const handleDownload = () => {
    const dataToExport = shortlistedItems.map(item => ({
        'Property ID': item.property.propertyId,
        'Total Area (Sq. Ft.)': item.property.size,
        'Building Type': item.property.buildingType,
        'Availability': item.property.readinessToOccupy,
        'Docks': item.property.docks,
        'Ceiling Height (ft)': item.property.ceilingHeight,
        'Rent (per Sq. Ft.)': item.property.rentPerSft,
        'Crane Support Structure': item.property.optionals?.crane?.required ? 'Yes' : 'No', // Note: This mapping might need adjustment based on final schema
        'Crane Available': item.property.optionals?.crane?.required ? 'Yes' : 'No', // Assuming if support is there, crane is available for simplicity
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Add branding
    const footer = [
        [], // Empty row for spacing
        ["Powered by Lakshmi Balaji O2O | Sourcing & Leasing Simplified"]
    ];
    XLSX.utils.sheet_add_aoa(worksheet, footer, { origin: -1 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shortlisted Properties");
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `Lakshmi_Balaji_O2O_Shortlisted_Properties_${timestamp}.csv`;

    XLSX.writeFile(workbook, filename, { bookType: "csv" });
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
                {shortlistedItems.map(match => (
                  <Card key={match.property.propertyId} className="flex flex-col">
                    <CardHeader>
                      <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                        <Image src="https://placehold.co/600x400.png" alt={`Property ${match.property.propertyId}`} data-ai-hint="modern office" fill className="object-cover" />
                      </div>
                      <CardTitle>Property ID: {match.property.propertyId}</CardTitle>
                      <CardDescription>
                        For Demand: {match.demandId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{match.property.size} Sq. Ft.</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rent</p>
                          <p className="font-medium">₹{match.property.rentPerSft}/sft</p>
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
                      <Button className="w-full" onClick={() => setSelectedChat(match)}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
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
      <ChatDialog submission={selectedChat} isOpen={!!selectedChat} onOpenChange={() => setSelectedChat(null)} />
    </>
  );
}
