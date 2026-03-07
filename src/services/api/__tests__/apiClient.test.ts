const mockNetInfoFetch = jest.fn();
jest.mock('@react-native-community/netinfo', () => ({
  fetch: () => mockNetInfoFetch(),
}));

jest.mock('../../auth/authService', () => ({
  getStoredToken: jest.fn().mockResolvedValue('mock-token'),
}));

import {
  ApiError,
  OfflineError,
  verifyAuth,
  getConsentStatus,
  getAppConfig,
  syncPush,
  syncPull,
  deleteUserData,
} from '../apiClient';

const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockNetInfoFetch.mockResolvedValue({ isConnected: true });
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch = originalFetch;
});

function mockFetchResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('apiClient', () => {
  describe('offline detection', () => {
    it('throws OfflineError when not connected', async () => {
      mockNetInfoFetch.mockResolvedValue({ isConnected: false });
      await expect(getAppConfig()).rejects.toThrow(OfflineError);
    });
  });

  describe('error handling', () => {
    it('throws ApiError on non-ok response', async () => {
      mockFetchResponse({ error: 'Not found' }, 404);
      await expect(getAppConfig()).rejects.toThrow(ApiError);
    });

    it('includes status code in ApiError', async () => {
      mockFetchResponse({ error: 'Unauthorized' }, 401);
      try {
        await getAppConfig();
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect((e as ApiError).status).toBe(401);
      }
    });
  });

  describe('verifyAuth', () => {
    it('sends POST with provider and idToken', async () => {
      mockFetchResponse({
        userId: 'u1',
        provider: 'google',
        email: 'a@b.com',
        displayName: 'A',
        isNewUser: true,
      });

      const result = await verifyAuth('google', 'id-tok-123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toContain('/api/auth/verify');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual({
        provider: 'google',
        idToken: 'id-tok-123',
      });
      expect(result.userId).toBe('u1');
      expect(result.isNewUser).toBe(true);
    });
  });

  describe('getConsentStatus', () => {
    it('sends GET with userId header', async () => {
      mockFetchResponse({
        privacyAcknowledged: true,
        vpcCompleted: false,
        vpcProvider: null,
        acknowledgedAt: 1000,
        vpcAt: null,
      });

      const result = await getConsentStatus('u1');

      const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(opts.headers['X-User-Id']).toBe('u1');
      expect(result.privacyAcknowledged).toBe(true);
    });
  });

  describe('syncPush', () => {
    it('sends push payload', async () => {
      mockFetchResponse({ success: true });

      const result = await syncPush('u1', {
        childId: 'c1',
        profile: {
          childName: 'Alex',
          childAge: 7,
          childGrade: 2,
          avatarId: 'cat',
          frameId: null,
          themeId: 'dark',
        },
        scoreDeltas: [],
        badges: [],
        skillStates: [],
        deviceId: 'dev-1',
      });

      expect(result.success).toBe(true);
      const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(opts.method).toBe('POST');
    });
  });

  describe('syncPull', () => {
    it('returns children data', async () => {
      mockFetchResponse({
        children: [{ childId: 'c1', xp: 100 }],
      });

      const result = await syncPull('u1');
      expect(result.children).toHaveLength(1);
    });
  });

  describe('deleteUserData', () => {
    it('sends DELETE with userId', async () => {
      mockFetchResponse({ success: true });

      await deleteUserData('u1');

      const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toContain('/api/user/data');
      expect(opts.method).toBe('DELETE');
      expect(opts.headers['X-User-Id']).toBe('u1');
    });
  });
});
