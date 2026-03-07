/**
 * Authentication Middleware
 *
 * Validates API key for app authentication.
 */

import { Env } from '../types';

export function validateApiKey(request: Request, env: Env): { valid: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return { valid: false, error: 'Missing API key' };
  if (apiKey !== env.APP_API_KEY) return { valid: false, error: 'Invalid API key' };
  return { valid: true };
}

/**
 * Extract authenticated user ID from request header.
 * Returns null if not present (endpoint decides if required).
 */
export function getUserId(request: Request): string | null {
  return request.headers.get('X-User-Id');
}
