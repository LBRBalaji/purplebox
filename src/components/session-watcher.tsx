'use client';
import * as React from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export function SessionWatcher() {
  const { user, logout } = useAuth();
  const [kicked, setKicked] = React.useState(false);
  const [countdown, setCountdown] = React.useState(10);

  React.useEffect(() => {
    if (!user || user.role === 'SuperAdmin' || user.role === 'O2O') return;
    const storedToken = sessionStorage.getItem('sessionToken');
    if (!storedToken) return;

    const unsub = onSnapshot(doc(db, 'sessions', user.email), (snap) => {
      if (!snap.exists()) { setKicked(true); return; }
      const data = snap.data();
      if (data?.sessionToken && data.sessionToken !== storedToken) {
        setKicked(true);
      }
    });

    return () => unsub();
  }, [user]);

  React.useEffect(() => {
    if (!kicked) return;
    if (countdown <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [kicked, countdown, logout]);

  if (!kicked) return null;

  return (
    <Dialog open={kicked} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Session Ended</DialogTitle>
          <DialogDescription className="text-center">
            Your session has been ended by the platform administrator, or your account has been accessed from another device.
            <br/><br/>
            <span className="font-semibold text-foreground">You will be logged out in {countdown} seconds.</span>
            <br/>
            For assistance, contact balaji@lakshmibalajio2o.com
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-2">
          <Button onClick={() => logout()} className="bg-primary hover:bg-primary/90">
            Log Out Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}