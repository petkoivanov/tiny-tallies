/**
 * Sync Handlers
 *
 * Push: Receive score deltas, badges, and skill states from device.
 * Pull: Return merged state for all children belonging to a user.
 */

import { Env, SyncPushRequest, SyncPullResponse, SyncedChild, SkillStateRecord, BadgeRecord } from '../types';
import { jsonResponse, errorResponse, getUserId } from '../middleware';

export async function handleSyncPush(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return errorResponse('Missing X-User-Id header', 401);

  let body: SyncPushRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { childId, profile, scoreDeltas, badges, skillStates, deviceId } = body;
  if (!childId || !profile || !deviceId) {
    return errorResponse('Missing required fields: childId, profile, deviceId', 400);
  }

  const now = Math.floor(Date.now() / 1000);

  // Upsert child profile (including benchmark demographics)
  await env.DB.prepare(`
    INSERT INTO child_profiles (id, user_id, child_name, child_age, child_grade, avatar_id, frame_id, theme_id, age_range, state_code, benchmark_opt_in, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      child_name = excluded.child_name,
      child_age = excluded.child_age,
      child_grade = excluded.child_grade,
      avatar_id = excluded.avatar_id,
      frame_id = excluded.frame_id,
      theme_id = excluded.theme_id,
      age_range = excluded.age_range,
      state_code = excluded.state_code,
      benchmark_opt_in = excluded.benchmark_opt_in,
      updated_at = excluded.updated_at
  `).bind(
    childId, userId,
    profile.childName, profile.childAge, profile.childGrade,
    profile.avatarId, profile.frameId, profile.themeId,
    profile.ageRange ?? null, profile.stateCode ?? null,
    profile.benchmarkOptIn ? 1 : 0, now
  ).run();

  // Insert score deltas (dedup by device_id + timestamp)
  if (scoreDeltas?.length) {
    for (const delta of scoreDeltas) {
      // Check for duplicate
      const dup = await env.DB.prepare(
        'SELECT id FROM score_deltas WHERE child_id = ? AND device_id = ? AND timestamp = ? AND skill_id = ?'
      ).bind(childId, deviceId, delta.timestamp, delta.skillId).first();

      if (!dup) {
        await env.DB.prepare(
          'INSERT INTO score_deltas (child_id, skill_id, elo_delta, xp_delta, correct, timestamp, device_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(childId, delta.skillId, delta.eloDelta, delta.xpDelta, delta.correct, delta.timestamp, deviceId).run();
      }
    }
  }

  // Upsert badges (idempotent by primary key)
  if (badges?.length) {
    for (const badge of badges) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO badges (child_id, badge_id, earned_at) VALUES (?, ?, ?)'
      ).bind(childId, badge.badgeId, badge.earnedAt).run();
    }
  }

  // Upsert skill states (take higher elo, more attempts, higher mastery)
  if (skillStates?.length) {
    for (const ss of skillStates) {
      await env.DB.prepare(`
        INSERT INTO skill_states (child_id, skill_id, elo, attempts, correct_count, mastery, leitner_box, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(child_id, skill_id) DO UPDATE SET
          elo = MAX(excluded.elo, skill_states.elo),
          attempts = MAX(excluded.attempts, skill_states.attempts),
          correct_count = MAX(excluded.correct_count, skill_states.correct_count),
          mastery = MAX(excluded.mastery, skill_states.mastery),
          leitner_box = CASE WHEN excluded.updated_at > skill_states.updated_at THEN excluded.leitner_box ELSE skill_states.leitner_box END,
          updated_at = MAX(excluded.updated_at, skill_states.updated_at)
      `).bind(
        childId, ss.skillId, ss.elo, ss.attempts, ss.correctCount,
        ss.mastery, ss.leitnerBox, ss.updatedAt
      ).run();
    }
  }

  // Recompute aggregates from deltas
  const xpResult = await env.DB.prepare(
    'SELECT COALESCE(SUM(xp_delta), 0) as total_xp FROM score_deltas WHERE child_id = ?'
  ).bind(childId).first<{ total_xp: number }>();

  const sessionsResult = await env.DB.prepare(
    'SELECT COUNT(DISTINCT timestamp) as count FROM score_deltas WHERE child_id = ?'
  ).bind(childId).first<{ count: number }>();

  const totalXp = xpResult?.total_xp ?? 0;
  const sessions = sessionsResult?.count ?? 0;
  const level = Math.floor(totalXp / 100) + 1;

  // Get average elo across skills
  const eloResult = await env.DB.prepare(
    'SELECT COALESCE(AVG(elo), 1000) as avg_elo FROM skill_states WHERE child_id = ?'
  ).bind(childId).first<{ avg_elo: number }>();

  await env.DB.prepare(
    'UPDATE child_profiles SET xp = ?, level = ?, sessions_completed = ?, elo_rating = ?, updated_at = ? WHERE id = ?'
  ).bind(totalXp, level, sessions, eloResult?.avg_elo ?? 1000, now, childId).run();

  // Recompute benchmark aggregates if this child opted in
  if (profile.benchmarkOptIn && profile.ageRange) {
    await recomputeBenchmarks(env, profile.ageRange, profile.stateCode, now);
  }

  return jsonResponse({ success: true, syncedAt: now });
}

/**
 * Recompute benchmark percentiles for a given age range and scope.
 * Uses all opted-in children's average Elo as the metric.
 */
async function recomputeBenchmarks(
  env: Env,
  ageRange: string,
  stateCode: string | null,
  now: number,
): Promise<void> {
  // Compute skill domain percentiles for national scope
  await computePercentiles(env, ageRange, 'national', null, now);

  // Compute state-level if state code provided
  if (stateCode) {
    await computePercentiles(env, ageRange, stateCode, stateCode, now);
  }
}

async function computePercentiles(
  env: Env,
  ageRange: string,
  scope: string,
  stateFilter: string | null,
  now: number,
): Promise<void> {
  // Get all opted-in children's skill Elo data in this cohort
  const baseQuery = stateFilter
    ? `SELECT ss.skill_id, ss.elo
       FROM skill_states ss
       JOIN child_profiles cp ON ss.child_id = cp.id
       WHERE cp.benchmark_opt_in = 1 AND cp.age_range = ? AND cp.state_code = ?`
    : `SELECT ss.skill_id, ss.elo
       FROM skill_states ss
       JOIN child_profiles cp ON ss.child_id = cp.id
       WHERE cp.benchmark_opt_in = 1 AND cp.age_range = ?`;

  const rows = stateFilter
    ? await env.DB.prepare(baseQuery).bind(ageRange, stateFilter).all<{ skill_id: string; elo: number }>()
    : await env.DB.prepare(baseQuery).bind(ageRange).all<{ skill_id: string; elo: number }>();

  // Group by skill domain (prefix before first dot, e.g. "addition" from "addition.singleDigit")
  const domainElos: Record<string, number[]> = { overall: [] };
  for (const row of rows.results) {
    const domain = row.skill_id.split('.')[0];
    if (!domainElos[domain]) domainElos[domain] = [];
    domainElos[domain].push(row.elo);
    domainElos['overall'].push(row.elo);
  }

  // Compute and upsert percentiles per domain
  for (const [domain, elos] of Object.entries(domainElos)) {
    if (elos.length === 0) continue;
    elos.sort((a, b) => a - b);
    const n = elos.length;
    const p25 = elos[Math.floor(n * 0.25)] ?? 0;
    const p50 = elos[Math.floor(n * 0.50)] ?? 0;
    const p75 = elos[Math.floor(n * 0.75)] ?? 0;
    const p90 = elos[Math.floor(n * 0.90)] ?? 0;

    await env.DB.prepare(`
      INSERT INTO benchmark_aggregates (age_range, scope, skill_domain, percentile_25, percentile_50, percentile_75, percentile_90, sample_size, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(age_range, scope, skill_domain) DO UPDATE SET
        percentile_25 = excluded.percentile_25,
        percentile_50 = excluded.percentile_50,
        percentile_75 = excluded.percentile_75,
        percentile_90 = excluded.percentile_90,
        sample_size = excluded.sample_size,
        updated_at = excluded.updated_at
    `).bind(ageRange, scope, domain, p25, p50, p75, p90, n, now).run();
  }
}

export async function handleSyncPull(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return errorResponse('Missing X-User-Id header', 401);

  const now = Math.floor(Date.now() / 1000);

  // Get all child profiles for this user
  const profiles = await env.DB.prepare(
    'SELECT * FROM child_profiles WHERE user_id = ?'
  ).bind(userId).all<Record<string, unknown>>();

  const children: SyncedChild[] = [];

  for (const p of profiles.results) {
    const childId = p.id as string;

    // Get skill states
    const skills = await env.DB.prepare(
      'SELECT skill_id, elo, attempts, correct_count, mastery, leitner_box, updated_at FROM skill_states WHERE child_id = ?'
    ).bind(childId).all<Record<string, unknown>>();

    const skillStates: SkillStateRecord[] = skills.results.map((s) => ({
      skillId: s.skill_id as string,
      elo: s.elo as number,
      attempts: s.attempts as number,
      correctCount: s.correct_count as number,
      mastery: s.mastery as number,
      leitnerBox: s.leitner_box as number,
      updatedAt: s.updated_at as number,
    }));

    // Get badges
    const badgeRows = await env.DB.prepare(
      'SELECT badge_id, earned_at FROM badges WHERE child_id = ?'
    ).bind(childId).all<Record<string, unknown>>();

    const badges: BadgeRecord[] = badgeRows.results.map((b) => ({
      badgeId: b.badge_id as string,
      earnedAt: b.earned_at as number,
    }));

    children.push({
      childId,
      profile: {
        childName: p.child_name as string,
        childAge: p.child_age as number,
        childGrade: p.child_grade as number,
        avatarId: (p.avatar_id as string) || null,
        frameId: (p.frame_id as string) || null,
        themeId: (p.theme_id as string) || null,
      },
      skillStates,
      badges,
      xp: (p.xp as number) || 0,
      level: (p.level as number) || 1,
      sessionsCompleted: (p.sessions_completed as number) || 0,
      eloRating: (p.elo_rating as number) || 1000,
      updatedAt: (p.updated_at as number) || now,
    });
  }

  const response: SyncPullResponse = { children, lastSyncAt: now };
  return jsonResponse(response);
}
