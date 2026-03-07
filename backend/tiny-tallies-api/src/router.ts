/**
 * Request Router for Tiny Tallies API
 */

import { Env } from './types';
import { CORS_HEADERS, jsonResponse, errorResponse, validateApiKey, getUserId } from './middleware';
import {
  handleAuthVerify,
  handleConsentAcknowledge,
  handleConsentStatus,
  handleSyncPush,
  handleSyncPull,
  handleDeleteUser,
  handleGetConfig,
} from './handlers';

export async function router(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Health check (no auth)
  if (path === '/health' || path === '/') {
    return jsonResponse({ status: 'ok', service: 'tiny-tallies-api', version: '1.0.0' });
  }

  // App config (no user auth, just API key)
  if (path === '/api/config' && method === 'GET') {
    const auth = validateApiKey(request, env);
    if (!auth.valid) return errorResponse(auth.error!, 401);
    return handleGetConfig(env);
  }

  // All other routes require API key
  const auth = validateApiKey(request, env);
  if (!auth.valid) return errorResponse(auth.error!, 401);

  // Auth — verify Google/Apple token and create/link user
  if (path === '/api/auth/verify' && method === 'POST') {
    return handleAuthVerify(request, env);
  }

  // Consent — acknowledge privacy/VPC
  if (path === '/api/consent/acknowledge' && method === 'POST') {
    return handleConsentAcknowledge(request, env);
  }
  if (path === '/api/consent/status' && method === 'GET') {
    return handleConsentStatus(request, env);
  }

  // Sync — push deltas from device
  if (path === '/api/sync/push' && method === 'POST') {
    return handleSyncPush(request, env);
  }
  // Sync — pull merged state
  if (path === '/api/sync/pull' && method === 'GET') {
    return handleSyncPull(request, env);
  }

  // User — delete all data
  if (path === '/api/user/data' && method === 'DELETE') {
    return handleDeleteUser(request, env);
  }

  return errorResponse('Not found', 404);
}
