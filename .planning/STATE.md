---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: High School Math Expansion
status: defining_requirements
stopped_at: Requirements definition in progress
last_updated: "2026-03-12T00:00:00.000Z"
last_activity: 2026-03-12 -- Milestone v1.2 started, defining requirements for K-12 expansion + high school math domains
progress:
  total_phases: 12
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12)

**Core value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles.
**Current focus:** v0.9 curriculum expansion — domain handler architecture complete, all 9 domains generating real problems; v0.8 phases 41-44 remaining

## Current Position

Phase: Pre-v0.9 domain handler work -- COMPLETE
Next: v0.8 Phase 41 (Session History) or v0.9 remaining phases (word problems, NumberPad, AnalogClock, CoinDisplay, etc.)
Status: All placeholder handlers replaced with domain-specific generators. 127 test suites, 1,932 tests passing.
Last activity: 2026-03-09 -- Implemented time, money, patterns domain handlers; updated bug libraries

```
v0.8: [====......] 43% (3/7 phases complete)
v0.9: [===.......] ~30% (domain handlers complete, UI/integration phases remaining)
```

## Performance Metrics

**Velocity:**
- v0.1: 12 plans in 2 days
- v0.2: 7 plans in 1 day
- v0.3: 15 plans in 2 days
- v0.4: 17 plans in 1 day
- v0.5: 13 plans in 1 day
- v0.6: 7 plans in 1 day
- v0.7: 17 plans in 2 days
- v0.8 (so far): 10 plans across 3 phases in 2 days

## Accumulated Context

### Decisions

Full decision log in PROJECT.md Key Decisions table.

**Pre-v0.9 math engine decisions:**
- Answer type changed from `number` to discriminated union (`NumericAnswer | FractionAnswer | ComparisonAnswer | CoordinateAnswer | ExpressionAnswer`)
- `DomainHandler` interface: each domain implements `generate(template, rng) → DomainProblemData`
- Grade type expanded from `1 | 2 | 3 | 4` to `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8`
- Fractions extended to grade 6 (4 new skills: add/subtract unlike, multiply fractions, divide unit fractions, divide fractions)
- All non-arithmetic answers framed as integers for MC compatibility (e.g., missing numerator, cents, elapsed minutes)
- Domain handler subdirectories for larger handlers (fractions: 5 files), single generators.ts for smaller ones
- Bug libraries updated with domain-specific operand semantics (not placeholder `a + b`)

**v0.8 execution decisions:**
- ChildData makes childName/childAge/childGrade non-nullable (new profiles always have values)
- Pre-mastered skills: eloRating 1100, masteryLocked true, leitnerBox 5, cpaLevel abstract
- Copy-on-switch pattern for multi-child store (keep flat slice interfaces, hydrate/dehydrate on switch)
- Cloudflare Workers + D1 backend (same pattern as Tiny Tales)
- JWT verification via jose JWKS (no Firebase dependency)
- Incremental delta sync (append-only scores, additive badges, MAX skill states)
- Module-level Sentry.init before Sentry.wrap (synchronous init, async opt-out)
- Privacy disclosure as step inside ProfileSetupScreen (PIN → Disclosure → Wizard)
- API key shared between mobile client and backend (set via wrangler secret)

**v0.8 infrastructure:**
- Backend URL: https://tiny-tallies-api.magic-mirror-works.workers.dev
- D1 database: tiny-tallies-db (ID: f871e708-9a2e-4d1d-b367-c5e14d4a25b6)
- Sentry DSN: https://2c43d29d84b9771541720d5df45c5477@o4510677327675392.ingest.us.sentry.io/4511004483977216
- STORE_VERSION: 14 (v12→v13 multi-child, v13→v14 auth state)
- Test count: 1,932 tests across 127 suites (LOC: ~55,500 TypeScript, 388 source files)
- All 9 math domains now have real domain-specific handlers (no more placeholders)

### Pending Todos

- EAS Build setup needed before Phase 43 (IAP does not work in Expo Go)
- RevenueCat account + App Store Connect / Play Console product setup needed before Phase 43
- Grandfathering product decision needed before Phase 43 (existing users have free AI tutor + themes)
- Privacy policy update for RevenueCat disclosure (COPPA compliance)

### Blockers/Concerns

- COPPA 2025 amendments expand scope (compliance deadline April 22, 2026)
- Apple Kids Category + subscription = heightened review scrutiny (budget for rejection cycles)

## Session Continuity

Last session: 2026-03-09T12:00:00.000Z
Stopped at: Completed all domain handler replacements (fractions, place value, time, money, patterns)
Resume file: None
Resume command: /gsd:progress (to check what's next)
