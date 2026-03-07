/**
 * useSyncTrigger — monitors connectivity and triggers cloud sync.
 *
 * Flushes pending deltas when connectivity returns.
 * Pulls on sign-in. Does nothing when not signed in.
 */

import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '@/store/appStore';
import { flushPendingSync, pullSync } from '@/services/sync/syncService';

export function useSyncTrigger(): void {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const prevSignedIn = useRef(isSignedIn);

  // Pull on sign-in
  useEffect(() => {
    if (isSignedIn && !prevSignedIn.current) {
      pullSync();
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  // Flush pending when connectivity returns
  useEffect(() => {
    if (!isSignedIn) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        flushPendingSync();
      }
    });

    return () => unsubscribe();
  }, [isSignedIn]);
}
