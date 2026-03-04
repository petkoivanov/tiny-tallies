/**
 * Parental PIN service for AI tutor consent gate.
 *
 * Stores and verifies a 4-digit PIN via expo-secure-store.
 * Used by ConsentScreen to gate AI tutor access behind parental verification.
 */

import * as SecureStore from 'expo-secure-store';

const PIN_STORE_KEY = 'parental-pin';

/**
 * Checks whether a parental PIN has been set.
 * Returns true if a PIN exists in secure storage, false otherwise.
 */
export async function hasParentalPin(): Promise<boolean> {
  const pin = await SecureStore.getItemAsync(PIN_STORE_KEY);
  return pin !== null;
}

/**
 * Stores a new parental PIN in secure storage.
 * Overwrites any existing PIN.
 */
export async function setParentalPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_STORE_KEY, pin);
}

/**
 * Verifies the provided input against the stored PIN.
 * Returns true if the input matches the stored PIN, false otherwise.
 */
export async function verifyParentalPin(input: string): Promise<boolean> {
  const storedPin = await SecureStore.getItemAsync(PIN_STORE_KEY);
  return storedPin === input;
}
