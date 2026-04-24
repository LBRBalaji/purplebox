'use client';
import * as React from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';

export function NotificationWatcher() {
  const { user } = useAuth();
  const { setNotificationsFromWatcher } = useData();

  React.useEffect(() => {
    if (!user) return;

    let unsub: (() => void) | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const subscribe = () => {
      if (unsub) { unsub(); unsub = null; }

      unsub = onSnapshot(
        doc(db, 'notifications', '0'),
        { includeMetadataChanges: false },
        (snap) => {
          // Defer state update — prevents React error #300 when snapshot
          // fires synchronously during an active render cycle
          queueMicrotask(() => {
            try {
              if (!snap.exists()) return;
              const d = snap.data();
              const notifs = Array.isArray(d?.data) ? d.data : [];
              setNotificationsFromWatcher(notifs);
            } catch {}
          });
        },
        (error) => {
          console.error('NotificationWatcher error:', error);
          if (unsub) { unsub(); unsub = null; }
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            retryTimeout = setTimeout(subscribe, 5000 * retryCount);
          }
        }
      );
    };

    subscribe();

    // Cleanup always runs — fixes missing cleanup for SuperAdmin path
    return () => {
      if (unsub) { unsub(); unsub = null; }
      if (retryTimeout) { clearTimeout(retryTimeout); }
    };
  }, [user?.email, setNotificationsFromWatcher]);
  // user?.email as dep — stable primitive, avoids re-subscribing on every user object reference change

  return null;
}
