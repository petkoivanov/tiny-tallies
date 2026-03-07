/**
 * Authentication service for Google and Apple Sign-In.
 *
 * Handles native sign-in flows and returns tokens for backend verification.
 * Tokens are stored in expo-secure-store, not in the Zustand store.
 */

import * as SecureStore from 'expo-secure-store';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth-id-token';
const PROVIDER_KEY = 'auth-provider';

export type AuthProvider = 'google' | 'apple';

export interface AuthResult {
  provider: AuthProvider;
  idToken: string;
  email: string | null;
  displayName: string | null;
}

const GOOGLE_CLIENT_IDS = {
  android:
    '83762615868-9vtfe09eo608o8d0prrk7dk9an6o7r10.apps.googleusercontent.com',
  ios: '83762615868-7m9m4hbfuke1n3lnp3dia3e49bplnu13.apps.googleusercontent.com',
  web: '83762615868-5so1eb9clpl2uvml1tiemhn664ft547h.apps.googleusercontent.com',
};

let googleConfigured = false;

function configureGoogle(): void {
  if (googleConfigured) return;
  GoogleSignin.configure({
    iosClientId: GOOGLE_CLIENT_IDS.ios,
    webClientId: GOOGLE_CLIENT_IDS.web,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<AuthResult> {
  configureGoogle();
  await GoogleSignin.hasPlayServices();
  const signInResult = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();

  if (!tokens.idToken) {
    throw new Error('Google Sign-In did not return an ID token');
  }

  const user = signInResult.data?.user;

  await SecureStore.setItemAsync(TOKEN_KEY, tokens.idToken);
  await SecureStore.setItemAsync(PROVIDER_KEY, 'google');

  return {
    provider: 'google',
    idToken: tokens.idToken,
    email: user?.email ?? null,
    displayName: user?.name ?? null,
  };
}

export async function signInWithApple(): Promise<AuthResult> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign-In did not return an identity token');
  }

  await SecureStore.setItemAsync(TOKEN_KEY, credential.identityToken);
  await SecureStore.setItemAsync(PROVIDER_KEY, 'apple');

  const displayName = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ') || null
    : null;

  return {
    provider: 'apple',
    idToken: credential.identityToken,
    email: credential.email ?? null,
    displayName,
  };
}

export async function signOut(): Promise<void> {
  const provider = await SecureStore.getItemAsync(PROVIDER_KEY);

  if (provider === 'google') {
    try {
      configureGoogle();
      await GoogleSignin.signOut();
    } catch {
      // Ignore sign-out errors — we still clear local state
    }
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(PROVIDER_KEY);
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredProvider(): Promise<AuthProvider | null> {
  const val = await SecureStore.getItemAsync(PROVIDER_KEY);
  if (val === 'google' || val === 'apple') return val;
  return null;
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}
