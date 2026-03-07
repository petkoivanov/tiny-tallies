/**
 * Tiny Tallies API — Cloudflare Worker Entry Point
 *
 * Handles auth, consent, progress sync, and data deletion.
 */

import { router } from './router';

export type { Env } from './types';

export default {
  fetch: router,
};
