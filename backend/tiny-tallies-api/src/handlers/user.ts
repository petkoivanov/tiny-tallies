/**
 * User Handlers
 *
 * Account deletion — wipes all user data from D1.
 */

import { Env } from '../types';
import { jsonResponse, errorResponse, getUserId } from '../middleware';

export async function handleDeleteUser(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return errorResponse('Missing X-User-Id header', 401);

  // Cascading deletes via foreign keys handle child data.
  // But D1 may not enforce FK cascades, so delete explicitly.
  const children = await env.DB.prepare(
    'SELECT id FROM child_profiles WHERE user_id = ?'
  ).bind(userId).all<{ id: string }>();

  for (const child of children.results) {
    await env.DB.prepare('DELETE FROM score_deltas WHERE child_id = ?').bind(child.id).run();
    await env.DB.prepare('DELETE FROM badges WHERE child_id = ?').bind(child.id).run();
    await env.DB.prepare('DELETE FROM skill_states WHERE child_id = ?').bind(child.id).run();
  }

  await env.DB.prepare('DELETE FROM child_profiles WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM consent_records WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

  return jsonResponse({ success: true, message: 'All user data deleted' });
}
