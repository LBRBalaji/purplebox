const fs = require('fs');

const content = `'use client';
import * as React from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  onUpdate: (notifications: any[]) => void;
};

export function NotificationWatcher({ onUpdate }: Props) {
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;
    let lastData = '';
    const unsub = onSnapshot(doc(db, 'notifications', '0'), (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const notifs = Array.isArray(d?.data) ? d.data : [];
      const serialized = JSON.stringify(notifs);
      if (serialized !== lastData) {
        lastData = serialized;
        onUpdate(notifs);
      }
    }, (error) => {
      console.error('Notification watcher error:', error);
    });
    return () => unsub();
  }, [user]);

  return null;
}`;

fs.writeFileSync('src/components/notification-watcher.tsx', content);
console.log('Done!');
