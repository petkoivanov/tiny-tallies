/**
 * Tiny Tallies API Tests
 *
 * Tests health, auth middleware, consent, sync, and user deletion endpoints.
 * Each test is self-contained — sets up its own D1 data.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';

const API_KEY = 'test-api-key';
const hdrs = (extra: Record<string, string> = {}) => ({
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json',
  ...extra,
});

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, provider TEXT NOT NULL, provider_id TEXT NOT NULL, email TEXT, display_name TEXT, created_at INTEGER NOT NULL, last_seen_at INTEGER NOT NULL, UNIQUE(provider, provider_id))`,
  `CREATE TABLE IF NOT EXISTS consent_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, type TEXT NOT NULL, acknowledged_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS child_profiles (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, child_name TEXT NOT NULL, child_age INTEGER NOT NULL, child_grade INTEGER NOT NULL, avatar_id TEXT, frame_id TEXT, theme_id TEXT, elo_rating REAL NOT NULL DEFAULT 1000, xp INTEGER NOT NULL DEFAULT 0, level INTEGER NOT NULL DEFAULT 1, sessions_completed INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS score_deltas (id INTEGER PRIMARY KEY AUTOINCREMENT, child_id TEXT NOT NULL, skill_id TEXT NOT NULL, elo_delta REAL NOT NULL DEFAULT 0, xp_delta INTEGER NOT NULL DEFAULT 0, correct INTEGER NOT NULL DEFAULT 0, timestamp INTEGER NOT NULL, device_id TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS badges (child_id TEXT NOT NULL, badge_id TEXT NOT NULL, earned_at INTEGER NOT NULL, PRIMARY KEY (child_id, badge_id))`,
  `CREATE TABLE IF NOT EXISTS skill_states (child_id TEXT NOT NULL, skill_id TEXT NOT NULL, elo REAL NOT NULL DEFAULT 1000, attempts INTEGER NOT NULL DEFAULT 0, correct_count INTEGER NOT NULL DEFAULT 0, mastery REAL NOT NULL DEFAULT 0, leitner_box INTEGER NOT NULL DEFAULT 1, updated_at INTEGER NOT NULL, PRIMARY KEY (child_id, skill_id))`,
];

async function setupDb() {
  for (const sql of TABLES) {
    await env.DB.exec(sql);
  }
}

async function insertUser(id: string, provider = 'google', providerId = 'prov-123') {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    'INSERT OR IGNORE INTO users (id, provider, provider_id, email, display_name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, provider, providerId, 'test@example.com', 'Test User', now, now).run();
}

async function pushChild(userId: string, childId: string, name = 'Alex') {
  await SELF.fetch('http://localhost/api/sync/push', {
    method: 'POST',
    headers: hdrs({ 'X-User-Id': userId }),
    body: JSON.stringify({
      childId,
      profile: { childName: name, childAge: 7, childGrade: 2, avatarId: 'cat', frameId: null, themeId: 'dark' },
      scoreDeltas: [
        { skillId: 'add-single', eloDelta: 15.5, xpDelta: 10, correct: 1, timestamp: 1000 },
        { skillId: 'add-single', eloDelta: -8.2, xpDelta: 5, correct: 0, timestamp: 1001 },
      ],
      badges: [{ badgeId: 'first-session', earnedAt: 1000 }],
      skillStates: [
        { skillId: 'add-single', elo: 1007.3, attempts: 2, correctCount: 1, mastery: 0.15, leitnerBox: 2, updatedAt: 1001 },
      ],
      deviceId: 'device-1',
    }),
  });
}

beforeEach(async () => {
  await setupDb();
});

// ==================== Health ====================

describe('Health', () => {
  it('returns ok on /', async () => {
    const res = await SELF.fetch('http://localhost/');
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('tiny-tallies-api');
  });

  it('returns ok on /health', async () => {
    const res = await SELF.fetch('http://localhost/health');
    expect(res.status).toBe(200);
  });
});

// ==================== Auth Middleware ====================

describe('Auth Middleware', () => {
  it('rejects requests without API key', async () => {
    const res = await SELF.fetch('http://localhost/api/consent/status');
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Missing API key');
  });

  it('rejects requests with wrong API key', async () => {
    const res = await SELF.fetch('http://localhost/api/consent/status', {
      headers: { 'X-API-Key': 'wrong-key' },
    });
    expect(res.status).toBe(401);
  });
});

// ==================== Config ====================

describe('Config', () => {
  it('returns config with sentryEnabled', async () => {
    const res = await SELF.fetch('http://localhost/api/config', { headers: hdrs() });
    expect(res.status).toBe(200);
    const body = await res.json() as { sentryEnabled: boolean };
    expect(body.sentryEnabled).toBe(true);
  });
});

// ==================== Consent ====================

describe('Consent', () => {
  it('returns empty consent status for new user', async () => {
    await insertUser('u1', 'google', 'p1');
    const res = await SELF.fetch('http://localhost/api/consent/status', {
      headers: hdrs({ 'X-User-Id': 'u1' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { privacyAcknowledged: boolean; vpcCompleted: boolean };
    expect(body.privacyAcknowledged).toBe(false);
    expect(body.vpcCompleted).toBe(false);
  });

  it('acknowledges privacy and reflects in status', async () => {
    await insertUser('u2', 'google', 'p2');

    // Acknowledge
    const ackRes = await SELF.fetch('http://localhost/api/consent/acknowledge', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'u2' }),
      body: JSON.stringify({ type: 'privacy_acknowledged' }),
    });
    expect(ackRes.status).toBe(200);

    // Check status
    const statusRes = await SELF.fetch('http://localhost/api/consent/status', {
      headers: hdrs({ 'X-User-Id': 'u2' }),
    });
    const body = await statusRes.json() as { privacyAcknowledged: boolean; vpcCompleted: boolean };
    expect(body.privacyAcknowledged).toBe(true);
    expect(body.vpcCompleted).toBe(false);
  });

  it('is idempotent on duplicate acknowledgment', async () => {
    await insertUser('u3', 'google', 'p3');

    await SELF.fetch('http://localhost/api/consent/acknowledge', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'u3' }),
      body: JSON.stringify({ type: 'privacy_acknowledged' }),
    });
    const res = await SELF.fetch('http://localhost/api/consent/acknowledge', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'u3' }),
      body: JSON.stringify({ type: 'privacy_acknowledged' }),
    });
    expect(res.status).toBe(200);
  });

  it('rejects invalid consent type', async () => {
    await insertUser('u4', 'google', 'p4');
    const res = await SELF.fetch('http://localhost/api/consent/acknowledge', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'u4' }),
      body: JSON.stringify({ type: 'invalid_type' }),
    });
    expect(res.status).toBe(400);
  });

  it('requires X-User-Id header', async () => {
    const res = await SELF.fetch('http://localhost/api/consent/status', {
      headers: hdrs(),
    });
    expect(res.status).toBe(401);
  });
});

// ==================== Sync ====================

describe('Sync', () => {
  it('pushes child profile and deltas', async () => {
    await insertUser('su1', 'apple', 'sp1');
    const res = await SELF.fetch('http://localhost/api/sync/push', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'su1' }),
      body: JSON.stringify({
        childId: 'c1',
        profile: { childName: 'Alex', childAge: 7, childGrade: 2, avatarId: 'cat', frameId: null, themeId: 'dark' },
        scoreDeltas: [
          { skillId: 'add-single', eloDelta: 15.5, xpDelta: 10, correct: 1, timestamp: 1000 },
        ],
        badges: [{ badgeId: 'first-session', earnedAt: 1000 }],
        skillStates: [
          { skillId: 'add-single', elo: 1015.5, attempts: 1, correctCount: 1, mastery: 0.1, leitnerBox: 2, updatedAt: 1000 },
        ],
        deviceId: 'dev-1',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('pulls synced data back', async () => {
    await insertUser('su2', 'apple', 'sp2');
    await pushChild('su2', 'c2');

    const res = await SELF.fetch('http://localhost/api/sync/pull', {
      headers: hdrs({ 'X-User-Id': 'su2' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { children: Array<Record<string, unknown>> };
    expect(body.children).toHaveLength(1);

    const child = body.children[0] as Record<string, unknown>;
    expect((child.profile as Record<string, unknown>).childName).toBe('Alex');
    expect(child.xp).toBe(15); // 10 + 5
    expect((child.badges as unknown[]).length).toBe(1);
    expect((child.skillStates as unknown[]).length).toBe(1);
  });

  it('deduplicates score deltas on re-push', async () => {
    await insertUser('su3', 'apple', 'sp3');
    await pushChild('su3', 'c3');

    // Push same delta again
    await SELF.fetch('http://localhost/api/sync/push', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'su3' }),
      body: JSON.stringify({
        childId: 'c3',
        profile: { childName: 'Alex', childAge: 7, childGrade: 2, avatarId: 'cat', frameId: null, themeId: 'dark' },
        scoreDeltas: [
          { skillId: 'add-single', eloDelta: 15.5, xpDelta: 10, correct: 1, timestamp: 1000 },
        ],
        badges: [],
        skillStates: [],
        deviceId: 'device-1',
      }),
    });

    const res = await SELF.fetch('http://localhost/api/sync/pull', {
      headers: hdrs({ 'X-User-Id': 'su3' }),
    });
    const body = await res.json() as { children: Array<Record<string, unknown>> };
    expect(body.children[0].xp).toBe(15); // Still 15, not 25
  });

  it('merges badges idempotently', async () => {
    await insertUser('su4', 'apple', 'sp4');
    await pushChild('su4', 'c4');

    // Push additional badge + duplicate
    await SELF.fetch('http://localhost/api/sync/push', {
      method: 'POST',
      headers: hdrs({ 'X-User-Id': 'su4' }),
      body: JSON.stringify({
        childId: 'c4',
        profile: { childName: 'Alex', childAge: 7, childGrade: 2, avatarId: 'cat', frameId: null, themeId: 'dark' },
        scoreDeltas: [],
        badges: [
          { badgeId: 'first-session', earnedAt: 1000 },
          { badgeId: 'streak-3', earnedAt: 2000 },
        ],
        skillStates: [],
        deviceId: 'device-1',
      }),
    });

    const res = await SELF.fetch('http://localhost/api/sync/pull', {
      headers: hdrs({ 'X-User-Id': 'su4' }),
    });
    const body = await res.json() as { children: Array<Record<string, unknown>> };
    expect((body.children[0].badges as unknown[]).length).toBe(2);
  });

  it('requires X-User-Id header', async () => {
    const res = await SELF.fetch('http://localhost/api/sync/pull', {
      headers: hdrs(),
    });
    expect(res.status).toBe(401);
  });
});

// ==================== User Deletion ====================

describe('User Deletion', () => {
  it('deletes all user data and returns empty on pull', async () => {
    await insertUser('du1', 'google', 'dp1');
    await pushChild('du1', 'dc1', 'Zara');

    // Delete
    const delRes = await SELF.fetch('http://localhost/api/user/data', {
      method: 'DELETE',
      headers: hdrs({ 'X-User-Id': 'du1' }),
    });
    expect(delRes.status).toBe(200);
    const delBody = await delRes.json() as { success: boolean };
    expect(delBody.success).toBe(true);

    // Pull — should be empty
    const pullRes = await SELF.fetch('http://localhost/api/sync/pull', {
      headers: hdrs({ 'X-User-Id': 'du1' }),
    });
    const pullBody = await pullRes.json() as { children: unknown[] };
    expect(pullBody.children).toHaveLength(0);

    // User record should be gone
    const row = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind('du1').first();
    expect(row).toBeNull();
  });
});

// ==================== 404 ====================

describe('Not Found', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await SELF.fetch('http://localhost/api/nonexistent', {
      headers: hdrs(),
    });
    expect(res.status).toBe(404);
  });
});
