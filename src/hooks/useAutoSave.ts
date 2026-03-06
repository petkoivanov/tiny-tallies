import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppStore } from '@/store/appStore';

/**
 * Auto-saves the active child's data when the app goes to background.
 * Call once at the app root level.
 */
export function useAutoSave(): void {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        const previous = appStateRef.current;
        appStateRef.current = nextState;

        if (
          previous === 'active' &&
          (nextState === 'background' || nextState === 'inactive')
        ) {
          useAppStore.getState().saveActiveChild();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
