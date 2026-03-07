const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

const mockGoogleConfigure = jest.fn();
const mockGoogleHasPlayServices = jest.fn().mockResolvedValue(true);
const mockGoogleSignIn = jest.fn();
const mockGoogleGetTokens = jest.fn();
const mockGoogleSignOut = jest.fn();

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: (...args: unknown[]) => mockGoogleConfigure(...args),
    hasPlayServices: () => mockGoogleHasPlayServices(),
    signIn: () => mockGoogleSignIn(),
    getTokens: () => mockGoogleGetTokens(),
    signOut: () => mockGoogleSignOut(),
  },
}));

const mockAppleSignInAsync = jest.fn();
const mockAppleIsAvailable = jest.fn();

jest.mock('expo-apple-authentication', () => ({
  signInAsync: (...args: unknown[]) => mockAppleSignInAsync(...args),
  isAvailableAsync: () => mockAppleIsAvailable(),
  AppleAuthenticationScope: { EMAIL: 0, FULL_NAME: 1 },
}));

import {
  signInWithGoogle,
  signInWithApple,
  signOut,
  getStoredToken,
  getStoredProvider,
} from '../authService';

beforeEach(() => {
  jest.clearAllMocks();
  mockSetItemAsync.mockResolvedValue(undefined);
  mockDeleteItemAsync.mockResolvedValue(undefined);
});

describe('authService', () => {
  describe('signInWithGoogle', () => {
    it('returns auth result with token and user info', async () => {
      mockGoogleSignIn.mockResolvedValue({
        data: {
          user: {
            id: 'g-123',
            email: 'test@gmail.com',
            name: 'Test User',
          },
        },
      });
      mockGoogleGetTokens.mockResolvedValue({
        idToken: 'google-id-token',
        accessToken: 'google-access-token',
      });

      const result = await signInWithGoogle();

      expect(result.provider).toBe('google');
      expect(result.idToken).toBe('google-id-token');
      expect(result.email).toBe('test@gmail.com');
      expect(result.displayName).toBe('Test User');
    });

    it('stores token in secure store', async () => {
      mockGoogleSignIn.mockResolvedValue({
        data: { user: { id: 'g-1', email: null, name: null } },
      });
      mockGoogleGetTokens.mockResolvedValue({
        idToken: 'tok-123',
        accessToken: 'at-123',
      });

      await signInWithGoogle();

      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'auth-id-token',
        'tok-123',
      );
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'auth-provider',
        'google',
      );
    });

    it('throws when no ID token returned', async () => {
      mockGoogleSignIn.mockResolvedValue({
        data: { user: { id: 'g-1' } },
      });
      mockGoogleGetTokens.mockResolvedValue({
        idToken: null,
        accessToken: 'at',
      });

      await expect(signInWithGoogle()).rejects.toThrow(
        'did not return an ID token',
      );
    });
  });

  describe('signInWithApple', () => {
    it('returns auth result with identity token', async () => {
      mockAppleSignInAsync.mockResolvedValue({
        identityToken: 'apple-id-token',
        email: 'apple@example.com',
        fullName: { givenName: 'Jane', familyName: 'Doe' },
        user: 'apple-user-id',
      });

      const result = await signInWithApple();

      expect(result.provider).toBe('apple');
      expect(result.idToken).toBe('apple-id-token');
      expect(result.email).toBe('apple@example.com');
      expect(result.displayName).toBe('Jane Doe');
    });

    it('handles null fullName gracefully', async () => {
      mockAppleSignInAsync.mockResolvedValue({
        identityToken: 'apple-tok',
        email: null,
        fullName: null,
        user: 'apple-user',
      });

      const result = await signInWithApple();

      expect(result.displayName).toBeNull();
      expect(result.email).toBeNull();
    });

    it('throws when no identity token', async () => {
      mockAppleSignInAsync.mockResolvedValue({
        identityToken: null,
        email: null,
        user: 'u1',
      });

      await expect(signInWithApple()).rejects.toThrow(
        'did not return an identity token',
      );
    });
  });

  describe('signOut', () => {
    it('clears secure store tokens', async () => {
      mockGetItemAsync.mockResolvedValue('google');
      mockGoogleSignOut.mockResolvedValue(null);

      await signOut();

      expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth-id-token');
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth-provider');
    });

    it('calls Google signOut when provider is google', async () => {
      mockGetItemAsync.mockResolvedValue('google');
      mockGoogleSignOut.mockResolvedValue(null);

      await signOut();

      expect(mockGoogleSignOut).toHaveBeenCalled();
    });

    it('does not call Google signOut for apple provider', async () => {
      mockGetItemAsync.mockResolvedValue('apple');

      await signOut();

      expect(mockGoogleSignOut).not.toHaveBeenCalled();
    });
  });

  describe('getStoredToken', () => {
    it('returns stored token', async () => {
      mockGetItemAsync.mockResolvedValue('my-token');
      expect(await getStoredToken()).toBe('my-token');
    });

    it('returns null when no token', async () => {
      mockGetItemAsync.mockResolvedValue(null);
      expect(await getStoredToken()).toBeNull();
    });
  });

  describe('getStoredProvider', () => {
    it('returns google when stored', async () => {
      mockGetItemAsync.mockResolvedValue('google');
      expect(await getStoredProvider()).toBe('google');
    });

    it('returns apple when stored', async () => {
      mockGetItemAsync.mockResolvedValue('apple');
      expect(await getStoredProvider()).toBe('apple');
    });

    it('returns null for unknown value', async () => {
      mockGetItemAsync.mockResolvedValue('unknown');
      expect(await getStoredProvider()).toBeNull();
    });
  });
});
