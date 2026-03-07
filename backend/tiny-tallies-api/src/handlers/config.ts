/**
 * Config Handler
 *
 * Returns feature flags and configuration for the mobile app.
 */

import { Env, AppConfig } from '../types';
import { jsonResponse } from '../middleware';

export async function handleGetConfig(env: Env): Promise<Response> {
  const config: AppConfig = {
    sentryEnabled: true,
  };
  return jsonResponse(config);
}
