/**
 * Auth Handler
 *
 * Verifies Apple and Google ID tokens using JWKS endpoints.
 * Creates or links user records in D1 on successful verification.
 */

import { jwtVerify, createRemoteJWKSet } from 'jose';
import { Env, AuthVerifyRequest, AuthVerifyResponse } from '../types';
import { jsonResponse, errorResponse } from '../middleware';

const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys')
);
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

export async function handleAuthVerify(request: Request, env: Env): Promise<Response> {
  let body: AuthVerifyRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { idToken, provider } = body;
  if (!idToken || !provider) {
    return errorResponse('Missing idToken or provider', 400);
  }
  if (provider !== 'apple' && provider !== 'google') {
    return errorResponse('Invalid provider', 400);
  }

  try {
    let email: string | null = null;
    let displayName: string | null = null;
    let providerUserId: string;

    if (provider === 'apple') {
      const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: env.APPLE_BUNDLE_ID,
      });
      email = (payload.email as string) || null;
      providerUserId = payload.sub as string;
    } else {
      const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: env.GOOGLE_WEB_CLIENT_ID,
      });
      email = (payload.email as string) || null;
      displayName = (payload.name as string) || null;
      providerUserId = payload.sub as string;
    }

    // Find or create user
    const now = Math.floor(Date.now() / 1000);
    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE provider = ? AND provider_id = ?'
    ).bind(provider, providerUserId).first<{ id: string }>();

    let userId: string;
    let isNewUser = false;

    if (existing) {
      userId = existing.id;
      await env.DB.prepare(
        'UPDATE users SET last_seen_at = ?, email = COALESCE(?, email), display_name = COALESCE(?, display_name) WHERE id = ?'
      ).bind(now, email, displayName, userId).run();
    } else {
      userId = crypto.randomUUID();
      isNewUser = true;
      await env.DB.prepare(
        'INSERT INTO users (id, provider, provider_id, email, display_name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(userId, provider, providerUserId, email, displayName, now, now).run();
    }

    const response: AuthVerifyResponse = {
      success: true,
      userId,
      provider,
      email,
      displayName,
      isNewUser,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Token verification failed:', error);
    return errorResponse('Invalid token', 401);
  }
}
