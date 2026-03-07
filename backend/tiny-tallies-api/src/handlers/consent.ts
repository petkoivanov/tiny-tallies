/**
 * Consent Handlers
 *
 * Stores and retrieves COPPA consent/privacy acknowledgment records.
 */

import { Env, ConsentAcknowledgeRequest, ConsentStatusResponse } from '../types';
import { jsonResponse, errorResponse, getUserId } from '../middleware';

export async function handleConsentAcknowledge(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return errorResponse('Missing X-User-Id header', 401);

  let body: ConsentAcknowledgeRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const validTypes = ['privacy_acknowledged', 'vpc_google', 'vpc_apple'];
  if (!validTypes.includes(body.type)) {
    return errorResponse('Invalid consent type', 400);
  }

  const now = Math.floor(Date.now() / 1000);

  // Check for duplicate (idempotent)
  const existing = await env.DB.prepare(
    'SELECT id FROM consent_records WHERE user_id = ? AND type = ?'
  ).bind(userId, body.type).first();

  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO consent_records (user_id, type, acknowledged_at) VALUES (?, ?, ?)'
    ).bind(userId, body.type, now).run();
  }

  return jsonResponse({ success: true, type: body.type, acknowledgedAt: now });
}

export async function handleConsentStatus(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return errorResponse('Missing X-User-Id header', 401);

  const records = await env.DB.prepare(
    'SELECT type, acknowledged_at FROM consent_records WHERE user_id = ?'
  ).bind(userId).all<{ type: string; acknowledged_at: number }>();

  let privacyAcknowledged = false;
  let vpcCompleted = false;
  let vpcProvider: string | null = null;
  let acknowledgedAt: number | null = null;
  let vpcAt: number | null = null;

  for (const r of records.results) {
    if (r.type === 'privacy_acknowledged') {
      privacyAcknowledged = true;
      acknowledgedAt = r.acknowledged_at;
    } else if (r.type === 'vpc_google' || r.type === 'vpc_apple') {
      vpcCompleted = true;
      vpcProvider = r.type === 'vpc_google' ? 'google' : 'apple';
      vpcAt = r.acknowledged_at;
    }
  }

  const response: ConsentStatusResponse = {
    privacyAcknowledged,
    vpcCompleted,
    vpcProvider: vpcProvider as ConsentStatusResponse['vpcProvider'],
    acknowledgedAt,
    vpcAt,
  };

  return jsonResponse(response);
}
