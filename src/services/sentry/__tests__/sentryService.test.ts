/**
 * Tests for Sentry PII sanitization and opt-out behavior.
 *
 * We test the beforeSend callback logic by extracting and invoking it
 * from the Sentry.init call arguments.
 */

const mockInit = jest.fn();
const mockGetClient = jest.fn();

jest.mock('@sentry/react-native', () => ({
  init: (...args: unknown[]) => mockInit(...args),
  getClient: () => mockGetClient(),
}));

const mockGetSentryOptOut = jest.fn();
jest.mock('@/services/consent/privacyStorage', () => ({
  getSentryOptOut: () => mockGetSentryOptOut(),
}));

import { initSentry } from '../sentryService';

describe('sentryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset module state — initSentry guards against double init
    jest.resetModules();
  });

  it('calls Sentry.init with DSN', async () => {
    mockGetSentryOptOut.mockResolvedValue(false);
    // Re-import to reset initialized flag
    const { initSentry: freshInit } = require('../sentryService');
    await freshInit();
    expect(mockInit).toHaveBeenCalledTimes(1);
    const config = mockInit.mock.calls[0][0];
    expect(config.dsn).toContain('sentry.io');
  });

  it('disables Sentry when opted out', async () => {
    mockGetSentryOptOut.mockResolvedValue(true);
    const { initSentry: freshInit } = require('../sentryService');
    await freshInit();
    const config = mockInit.mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });

  it('enables Sentry when not opted out', async () => {
    mockGetSentryOptOut.mockResolvedValue(false);
    const { initSentry: freshInit } = require('../sentryService');
    await freshInit();
    const config = mockInit.mock.calls[0][0];
    expect(config.enabled).toBe(true);
  });

  describe('PII scrubbing via beforeSend', () => {
    let beforeSend: (event: any) => any;

    beforeEach(async () => {
      mockGetSentryOptOut.mockResolvedValue(false);
      const { initSentry: freshInit } = require('../sentryService');
      await freshInit();
      beforeSend = mockInit.mock.calls[0][0].beforeSend;
    });

    it('strips user email and ip_address', () => {
      const event = {
        user: {
          id: 'u1',
          email: 'parent@example.com',
          username: 'Parent',
          ip_address: '1.2.3.4',
        },
      };
      const result = beforeSend(event);
      expect(result.user.email).toBeUndefined();
      expect(result.user.username).toBeUndefined();
      expect(result.user.ip_address).toBeUndefined();
      expect(result.user.id).toBe('u1');
    });

    it('scrubs childName from extra data', () => {
      const event = {
        extra: {
          childName: 'Alex',
          score: 100,
        },
      };
      const result = beforeSend(event);
      expect(result.extra.childName).toBe('[REDACTED]');
      expect(result.extra.score).toBe(100);
    });

    it('scrubs childAge from extra data', () => {
      const event = {
        extra: {
          childAge: 7,
          level: 3,
        },
      };
      const result = beforeSend(event);
      expect(result.extra.childAge).toBe('[REDACTED]');
      expect(result.extra.level).toBe(3);
    });

    it('scrubs nested display_name', () => {
      const event = {
        extra: {
          profile: {
            display_name: 'Alex Parent',
            grade: 2,
          },
        },
      };
      const result = beforeSend(event);
      expect(result.extra.profile.display_name).toBe('[REDACTED]');
      expect(result.extra.profile.grade).toBe(2);
    });

    it('scrubs PII patterns from breadcrumb messages', () => {
      const event = {
        breadcrumbs: [
          {
            message: 'Setting childName: Alex for profile',
            data: { childAge: 7 },
          },
        ],
      };
      const result = beforeSend(event);
      expect(result.breadcrumbs[0].message).toContain('[REDACTED]');
      expect(result.breadcrumbs[0].message).not.toContain('Alex');
      expect(result.breadcrumbs[0].data.childAge).toBe('[REDACTED]');
    });

    it('passes through events without PII unchanged', () => {
      const event = {
        extra: {
          skillId: 'add-single',
          elo: 1050,
        },
      };
      const result = beforeSend(event);
      expect(result.extra.skillId).toBe('add-single');
      expect(result.extra.elo).toBe(1050);
    });
  });
});
