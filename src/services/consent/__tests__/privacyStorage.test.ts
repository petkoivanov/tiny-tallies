const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
}));

import {
  hasPrivacyAcknowledged,
  setPrivacyAcknowledged,
  getSentryOptOut,
  setSentryOptOut,
} from '../privacyStorage';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('privacyStorage', () => {
  describe('hasPrivacyAcknowledged', () => {
    it('returns false when no value stored', async () => {
      mockGetItemAsync.mockResolvedValue(null);
      expect(await hasPrivacyAcknowledged()).toBe(false);
    });

    it('returns true when value is "true"', async () => {
      mockGetItemAsync.mockResolvedValue('true');
      expect(await hasPrivacyAcknowledged()).toBe(true);
    });

    it('reads from correct key', async () => {
      mockGetItemAsync.mockResolvedValue(null);
      await hasPrivacyAcknowledged();
      expect(mockGetItemAsync).toHaveBeenCalledWith('privacy-acknowledged');
    });
  });

  describe('setPrivacyAcknowledged', () => {
    it('stores "true" at correct key', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);
      await setPrivacyAcknowledged();
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'privacy-acknowledged',
        'true',
      );
    });
  });

  describe('getSentryOptOut', () => {
    it('returns false when no value stored', async () => {
      mockGetItemAsync.mockResolvedValue(null);
      expect(await getSentryOptOut()).toBe(false);
    });

    it('returns true when opted out', async () => {
      mockGetItemAsync.mockResolvedValue('true');
      expect(await getSentryOptOut()).toBe(true);
    });

    it('returns false when value is "false"', async () => {
      mockGetItemAsync.mockResolvedValue('false');
      expect(await getSentryOptOut()).toBe(false);
    });
  });

  describe('setSentryOptOut', () => {
    it('stores "true" when opting out', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);
      await setSentryOptOut(true);
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'sentry-opt-out',
        'true',
      );
    });

    it('stores "false" when opting in', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);
      await setSentryOptOut(false);
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        'sentry-opt-out',
        'false',
      );
    });
  });
});
