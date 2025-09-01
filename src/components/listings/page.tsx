
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/data-context';
import type { WarehouseSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Building2, Calendar, Check, Download, MapPin, Scaling, Search, SlidersHorizontal, Trash2, X, AlertTriangle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/auth-context';
import { Checkbox } from '@/components/ui/checkbox';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoginDialog } from '../login-dialog';


function ListingCard({ listing, isSelected, onSelectionChange }: { listing: WarehouseSchema, isSelected: boolean, onSelectionChange: (listing: WarehouseSchema) => void }) {
  const previewImage = listing.imageUrls?.[0] || 'https://placehold.co/600x400.png';

  return (
    <Card className={cn("flex flex-col transition-all", isSelected && "ring-2 ring-primary")}>
       <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="aspect-video relative mb-4 flex-grow">
            <Image
              src={previewImage}
              alt={listing.locationName}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="modern warehouse"
            />
          </div>
           <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectionChange(listing)}
            aria-label={`Select warehouse ${listing.id}`}
            className="w-5 h-5"
          />
        </div>
        <CardTitle>{listing.locationName}</CardTitle>
        <CardDescription>ID: {listing.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Scaling className="h-4 w-4 text-primary" />
                <span>{listing.size.toLocaleString()} sq. ft.</span>
            </div>
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{listing.specifications.flooringType || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{listing.locationName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{listing.readiness}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/listings/${listing.id}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function DownloadBar() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { selectedForDownload, logDownload, clearSelectedForDownload, getTodaysDownloadsForLocation }