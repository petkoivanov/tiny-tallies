/**
 * Privacy acknowledgment storage via expo-secure-store.
 *
 * Stores whether the parent has acknowledged the privacy disclosure
 * and the Sentry opt-out preference.
 */

import * as SecureStore from 'expo-secure-store';

const PRIVACY_ACK_KEY = 'privacy-acknowledged';
const SENTRY_OPT_OUT_KEY = 'sentry-opt-out';

export async function hasPrivacyAcknowledged(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(PRIVACY_ACK_KEY);
  return val === 'true';
}

export async function setPrivacyAcknowledged(): Promise<void> {
  await SecureStore.setItemAsync(PRIVACY_ACK_KEY, 'true');
}

export async function getSentryOptOut(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(SENTRY_OPT_OUT_KEY);
  return val === 'true';
}

export async function setSentryOptOut(optOut: boolean): Promise<void> {
  await SecureStore.setItemAsync(SENTRY_OPT_OUT_KEY, optOut ? 'true' : 'false');
}
