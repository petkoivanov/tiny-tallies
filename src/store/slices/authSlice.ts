/**
 * Auth store slice — manages signed-in state and user identity.
 *
 * This is global state (not per-child). Persisted via partialize in appStore.
 */

import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export interface AuthSlice {
  userId: string | null;
  authProvider: 'google' | 'apple' | null;
  userEmail: string | null;
  userDisplayName: string | null;
  isSignedIn: boolean;
  setAuth: (auth: {
    userId: string;
    provider: 'google' | 'apple';
    email: string | null;
    displayName: string | null;
  }) => void;
  clearAuth: () => void;
}

export const createAuthSlice: StateCreator<
  AppState,
  [],
  [],
  AuthSlice
> = (set) => ({
  userId: null,
  authProvider: null,
  userEmail: null,
  userDisplayName: null,
  isSignedIn: false,
  setAuth: ({ userId, provider, email, displayName }) =>
    set({
      userId,
      authProvider: provider,
      userEmail: email,
      userDisplayName: displayName,
      isSignedIn: true,
    }),
  clearAuth: () =>
    set({
      userId: null,
      authProvider: null,
      userEmail: null,
      userDisplayName: null,
      isSignedIn: false,
    }),
});
