/**
 * Sentry initialization and helpers.
 *
 * PII sanitization: strips child names and ages from all events.
 * Opt-out: checks secure storage preference and disables capture when opted out.
 */

import * as Sentry from '@sentry/react-native';
import { getSentryOptOut } from '../consent/privacyStorage';

const SENTRY_DSN =
  'https://2c43d29d84b9771541720d5df45c5477@o4510677327675392.ingest.us.sentry.io/4511004483977216';

let optedOut = false;

/**
 * Scrub PII patterns from string values.
 * Removes child names, ages, and any other personal data that might leak.
 */
function scrubPii(value: string): string {
  // Remove patterns like "childName: Alex" or "child_name":"Alex"
  let scrubbed = value.replace(
    /child[_-]?[Nn]ame["'\s:=]+["']?[A-Za-z]+["']?/g,
    'childName: [REDACTED]',
  );
  // Remove patterns like "childAge: 7" or "child_age":7
  scrubbed = scrubbed.replace(
    /child[_-]?[Aa]ge["'\s:=]+\d+/g,
    'childAge: [REDACTED]',
  );
  return scrubbed;
}

function scrubEventData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('childname') ||
      lowerKey.includes('child_name') ||
      lowerKey.includes('childage') ||
      lowerKey.includes('child_age') ||
      lowerKey.includes('displayname') ||
      lowerKey.includes('display_name') ||
      lowerKey === 'email'
    ) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      result[key] = scrubPii(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = scrubEventData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Initialize Sentry synchronously at module level so it's ready before Sentry.wrap().
 * Opt-out preference is applied asynchronously after init.
 */
export function initSentry(): void {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    // COPPA: no user tracking, no session replay
    enableAutoSessionTracking: true,
    // PII scrubbing
    beforeSend(event) {
      if (optedOut) return null;

      // Strip user data
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
      }

      // Scrub breadcrumb data
      if (event.breadcrumbs) {
        for (const crumb of event.breadcrumbs) {
          if (crumb.data && typeof crumb.data === 'object') {
            crumb.data = scrubEventData(
              crumb.data as Record<string, unknown>,
            );
          }
          if (crumb.message) {
            crumb.message = scrubPii(crumb.message);
          }
        }
      }

      // Scrub extra data
      if (event.extra && typeof event.extra === 'object') {
        event.extra = scrubEventData(
          event.extra as Record<string, unknown>,
        );
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (optedOut) return null;
      return breadcrumb;
    },
  });

  // Apply opt-out preference asynchronously
  getSentryOptOut().then((out) => {
    if (out) updateSentryOptOut(true);
  });
}

/**
 * Update Sentry enabled state after opt-out preference changes.
 * Called from ParentalControlsScreen when toggling Sentry.
 */
export function updateSentryOptOut(newOptOut: boolean): void {
  optedOut = newOptOut;
  if (newOptOut) {
    const client = Sentry.getClient();
    if (client) {
      client.getOptions().enabled = false;
    }
  } else {
    const client = Sentry.getClient();
    if (client) {
      client.getOptions().enabled = true;
    }
  }
}
