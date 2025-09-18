
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ShieldCheck, Info, Star, Truck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type DownloadTermsDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
};

export function DownloadTermsDialog({ isOpen, onOpenChange, onAccept }: DownloadTermsDialogProps) {
    const { user } = useAuth();
    const [isChecked, setIsChecked] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) {
            setIsChecked(false);
        }
    }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
            </div>
            <DialogTitle className="text-center text-xl">Terms of Download & Collaboration</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground px-4">
                Please review and agree to the following terms before proceeding.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-2 space-y-4 text-sm">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Condition of Use</AlertTitle>
                <AlertDescription>
                    You agree that you will not contact property owners directly. All leasing transactions for properties discovered on this platform must be conducted exclusively through Lakshmi Balaji Realty (LBR).
                </AlertDescription>
            </Alert>
            
            <div className="p-4 rounded-md border border-green-200 bg-green-50/50 space-y-3">
                <h4 className="font-semibold text-green-800">Our Zero Brokerage Commitment</h4>
                <div className="space-y-3 text-green-700">
                    <div className="flex items-start gap-3">
                        <Star className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                            <strong className="font-semibold">For Startups:</strong> To support young entrepreneurs, we offer a zero transaction fee on the first transaction for startups recognized by the Government of India.
                        </span>
                    </div>
                    <div className="flex items-start gap-3">
                        <Truck className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                           <strong className="font-semibold">For Logistics Companies:</strong> To foster long-term association, we offer a zero transaction fee for all deals with logistics companies.
                        </span>
                    </div>
                </div>
                <Separator className="bg-green-200"/>
                <p className="text-xs text-green-600">For all other customers, standard brokerage fees are applicable as per industry norms.</p>
            </div>

            <div className="flex items-start space-x-3 pt-4 p-2">
                <Checkbox id="terms-ack" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
                <Label htmlFor="terms-ack" className="text-xs font-normal leading-snug">
                    I, {user?.userName}, confirm that I am not a real estate broker/agent or engaged in the same business as Lakshmi Balaji Realty, and I agree to the terms of collaboration outlined above.
                </Label>
            </div>
        </div>
        <DialogFooter className="sm:justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={onAccept} disabled={!isChecked}>
              Agree & Continue
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
