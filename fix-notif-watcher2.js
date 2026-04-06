const fs = require('fs');

// Update NotificationWatcher with crash protection
const watcherContent = `'use client';
import * as React from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';

export function NotificationWatcher() {
  const { user } = useAuth();
  const { setNotificationsFromWatcher } = useData();
  const unsubRef = React.useRef<(() => void) | null>(null);
  const retryRef = React.useRef<NodeJS.Timeout | null>(null);
  const retryCount = React.useRef(0);
  const MAX_RETRIES = 3;

  const subscribe = React.useCallback(() => {
    if (!user) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    try {
      const unsub = onSnapshot(
        doc(db, 'notifications', '0'),
        { includeMetadataChanges: false },
        (snap) => {
          try {
            retryCount.current = 0;
            if (!snap.exists()) return;
            const d = snap.data();
            const notifs = Array.isArray(d?.data) ? d.data : [];
            setNotificationsFromWatcher(notifs);
          } catch(e) {
            console.error('NotificationWatcher snapshot handler error:', e);
          }
        },
        (error) => {
          console.error('NotificationWatcher onSnapshot error:', error);
          if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
          if (retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            retryRef.current = setTimeout(() => subscribe(), 5000 * retryCount.current);
          }
        }
      );
      unsubRef.current = unsub;
    } catch(e) {
      console.error('NotificationWatcher subscribe error:', e);
    }
  }, [user, setNotificationsFromWatcher]);

  React.useEffect(() => {
    if (!user || user.role === 'SuperAdmin' || user.role === 'O2O') {
      subscribe();
      return;
    }
    subscribe();
    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      if (retryRef.current) { clearTimeout(retryRef.current); }
    };
  }, [user, subscribe]);

  return null;
}`;

fs.writeFileSync('src/components/notification-watcher.tsx', watcherContent);
console.log('NotificationWatcher updated!');

// Add to dashboard layout
let layout = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
layout = layout.replace(
  `import { SessionWatcher } from '@/components/session-watcher';`,
  `import { SessionWatcher } from '@/components/session-watcher';
import { NotificationWatcher } from '@/components/notification-watcher';`
);
layout = layout.replace(
  `      <SessionWatcher />`,
  `      <SessionWatcher />
      <NotificationWatcher />`
);
fs.writeFileSync('src/app/dashboard/layout.tsx', layout);
console.log('Layout updated!');
