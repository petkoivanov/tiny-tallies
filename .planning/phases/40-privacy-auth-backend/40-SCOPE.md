# Phase 40 — Privacy, Auth, Backend & Cloud Sync

**Created:** 2026-03-07
**Status:** COMPLETE — All 7 waves implemented, backend deployed
**Completed:** 2026-03-07

---

## Deployment

- **Backend URL:** https://tiny-tallies-api.magic-mirror-works.workers.dev
- **D1 Database:** tiny-tallies-db (ID: f871e708-9a2e-4d1d-b367-c5e14d4a25b6, region: ENAM)
- **Secrets set:** APP_API_KEY, APPLE_BUNDLE_ID, GOOGLE_WEB_CLIENT_ID
- **Health check:** `GET /health` → `{"status":"ok"}`
- **STORE_VERSION:** 14 (v12→v13 multi-child, v13→v14 auth state)
- **Tests:** 1,597 passing across 113 test suites (including 45 new tests for Phase 40)
- **Commits:** 7 (feat 40-01/02 through 40-07) + Sentry init fix + backend deployment

---

## Overview

Add COPPA-compliant privacy disclosure, Google/Apple sign-in, Sentry error tracking, a Cloudflare Workers backend for auth/consent/progress sync, a ParentalControlsScreen, and cloud-synced progress data.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend tech | Cloudflare Workers | 3 of 4 existing projects use it; Tiny Tales backend is closest match |
| Database | Cloudflare D1 (SQLite) | Structured data, proven pattern |
| Auth | JWT verification (jose + JWKS) | Same as Tiny Tales; no Firebase dependency |
| Sign-in providers | Google + Apple | COPPA VPC methods; no Email OTP (no backend email infra yet) |
| Sync trigger | Automatic on session complete, rating change, badge earned | Background; graceful offline handling |
| Conflict resolution | Incremental deltas for scores; additive merge for badges | No data loss; works across devices |
| Sentry | Enabled by default, opt-out in ParentalControls | PII sanitized before submission |
| Privacy disclosure | Step inside ProfileSetupScreen (PIN → Disclosure → Wizard) | Minimal navigation restructuring |
| Existing users | None to worry about — fresh start |

---

## Work Breakdown

### Wave 1: Backend Foundation
1. **Backend scaffold** — `backend/tiny-tallies-api/`, wrangler.toml, TypeScript, D1 schema
2. **D1 schema** — users, consent_records, child_profiles, score_deltas, badges tables
3. **Health endpoint** — `GET /api/health`
4. **Auth middleware** — API key validation + JWT verification (Google/Apple JWKS)
5. **Auth endpoints** — `POST /api/auth/verify` (validate Google/Apple tokens, create/link user)

### Wave 2: Backend API Endpoints
6. **Consent endpoints** — `POST /api/consent/acknowledge`, `GET /api/consent/status`
7. **Sync endpoints** — `POST /api/sync/push` (receive deltas), `GET /api/sync/pull` (return merged state)
8. **Data deletion endpoint** — `DELETE /api/user/data` (wipe all user data from D1)
9. **Config endpoint** — `GET /api/config` (Sentry enabled flag, feature flags)

### Wave 3: Mobile — Privacy & Sentry
10. **Privacy disclosure component** — `PrivacyDisclosure.tsx` (shows inside ProfileSetupScreen between PinGate and Wizard)
11. **Secure storage for acknowledgment** — `privacyAcknowledged` flag in expo-secure-store
12. **ProfileSetupScreen update** — Add disclosure step: PIN → Disclosure → Wizard
13. **Sentry initialization** — DSN config, PII sanitization (scrub child names/ages), COPPA defaults
14. **Sentry opt-out** — Store preference, respect in capture calls

### Wave 4: Mobile — Google/Apple Sign-In
15. **Auth service** — `src/services/auth/authService.ts` (Google Sign-In, Apple Sign-In, token management)
16. **Auth store slice** — `authSlice.ts` (signed-in state, user info, tokens)
17. **Backend client** — `src/services/api/apiClient.ts` (fetch wrapper with auth headers, offline detection)

### Wave 5: Mobile — Cloud Sync
18. **Sync service** — `src/services/sync/syncService.ts` (push deltas, pull merged state, offline queue)
19. **Delta tracking** — Hook into store to capture score changes as deltas (not absolute values)
20. **Offline queue** — Persist pending deltas in AsyncStorage; flush when connectivity returns
21. **Sync triggers** — After session complete, rating change, badge earned, sign-in

### Wave 6: Mobile — ParentalControlsScreen
22. **ParentalControlsScreen** — PIN-gated, sections: Privacy & Data, Account, AI Helper
23. **Privacy & Data section** — Sentry toggle, view privacy info, delete all local data
24. **Account section** — Sign-in status, sign in/out buttons, delete account (local + remote)
25. **AI Helper section** — Tutor consent toggle
26. **Navigation update** — Add ParentalControls to navigator, entry point from Home

### Wave 7: Disclosure Content & Polish
27. **Privacy disclosure content** — Final copy covering: local storage, cloud sync, Gemini, Sentry, Google/Apple auth
28. **Data deletion flow** — PIN verification → confirmation dialog → wipe local (AsyncStorage + SecureStore) + remote (API call) + sign out

### Tests (per wave)
- Backend: Vitest tests for each endpoint
- Mobile: Jest tests for each new screen, component, service, and store slice

---

## D1 Schema (Draft)

```sql
-- Users (linked to Google/Apple identity)
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- server-generated UUID
  provider TEXT NOT NULL,        -- 'google' | 'apple'
  provider_id TEXT NOT NULL,     -- Google/Apple sub claim
  email TEXT,                    -- optional, from token
  display_name TEXT,             -- optional, from token
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  UNIQUE(provider, provider_id)
);

-- Privacy consent records
CREATE TABLE consent_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,            -- 'privacy_acknowledged' | 'vpc_google' | 'vpc_apple'
  acknowledged_at INTEGER NOT NULL
);

-- Child profiles (synced from device)
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,           -- matches local child ID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  child_grade INTEGER NOT NULL,
  avatar_id TEXT,
  frame_id TEXT,
  theme_id TEXT,
  elo_rating REAL NOT NULL DEFAULT 1000,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- Score deltas (append-only log for incremental sync)
CREATE TABLE score_deltas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  elo_delta REAL NOT NULL DEFAULT 0,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,    -- 1 or 0
  timestamp INTEGER NOT NULL,
  device_id TEXT NOT NULL               -- which device produced this delta
);

-- Badges (additive, idempotent by badge_id + child_id)
CREATE TABLE badges (
  child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at INTEGER NOT NULL,
  PRIMARY KEY (child_id, badge_id)
);

-- Skill states (latest snapshot per child per skill)
CREATE TABLE skill_states (
  child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  elo REAL NOT NULL DEFAULT 1000,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  mastery REAL NOT NULL DEFAULT 0,
  leitner_box INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (child_id, skill_id)
);
```

---

## Sync Strategy

### Push (device → server)
- On session complete / rating change / badge earned:
  1. Collect new score deltas since last sync
  2. Collect any new badges
  3. POST to `/api/sync/push` with deltas + badges + current skill states
  4. Server applies deltas, upserts badges (idempotent), updates skill states
  5. On success, mark deltas as synced locally

### Pull (server → device)
- On sign-in / app foreground (if signed in):
  1. GET `/api/sync/pull?since={lastSyncTimestamp}`
  2. Server returns merged skill states + all badges
  3. Device merges: take higher elo per skill, union of badges, max XP/level

### Offline Handling
- Deltas queued in AsyncStorage when offline
- NetInfo listener flushes queue when connectivity returns
- Idempotent push (server dedupes by device_id + timestamp)

---

## OAuth Client IDs

| Platform | Client ID |
|----------|-----------|
| Android | `83762615868-9vtfe09eo608o8d0prrk7dk9an6o7r10.apps.googleusercontent.com` |
| iOS | `83762615868-7m9m4hbfuke1n3lnp3dia3e49bplnu13.apps.googleusercontent.com` |
| Web | `83762615868-5so1eb9clpl2uvml1tiemhn664ft547h.apps.googleusercontent.com` |

## Sentry DSN
`https://2c43d29d84b9771541720d5df45c5477@o4510677327675392.ingest.us.sentry.io/4511004483977216`

## Keystore SHA-1
`B9:28:9A:77:22:7A:8D:17:8B:1B:D7:2D:1A:DB:2F:69:53:52:7B:79`
