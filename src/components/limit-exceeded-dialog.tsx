
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, ClipboardPlus } from 'lucide-react';

type LimitExceededDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
};

export function LimitExceededDialog({ isOpen, onOpenChange, location }: LimitExceededDialogProps) {
    const router = useRouter();

    const handleLogDemand = () => {
        const locationName = encodeURIComponent(location);
        router.push(`/dashboard?logNew=true&locationName=${locationName}`);
        onOpenChange(false);
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
            </div>
            <DialogTitle className="text-center text-xl">Selection Limit Reached</DialogTitle>
            <DialogDescription className="text-center">
                You have reached your selection limit of 3 properties. 
                <br/><br/>
                To get proposals for more properties that match your specific needs, please log a new demand.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Got it
            </Button>
            <Button type="button" onClick={handleLogDemand}>
              <ClipboardPlus className="mr-2 h-4 w-4" />
              Log New Demand
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
