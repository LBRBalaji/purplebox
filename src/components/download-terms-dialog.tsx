
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
import { ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

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
            <DialogTitle className="text-center text-xl">Terms of Use for Download</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground px-4">
                Please review and agree to the following terms before proceeding.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-2 space-y-4 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-secondary-foreground">
                    The information provided is a gesture of goodwill to facilitate collaboration. You agree not to contact property owners directly and to conduct all leasing transactions exclusively through Lakshmi Balaji Realty (LBR).
                </p>
            </div>
            <div className="flex items-start space-x-3 pt-4 p-2">
                <Checkbox id="terms-ack" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
                <Label htmlFor="terms-ack" className="text-xs font-normal leading-snug">
                    I, {user?.userName}, confirm that I am not a real estate broker/agent or engaged in the same business as Lakshmi Balaji Realty, and I agree to the terms outlined above.
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
