---
phase: 35
slug: daily-challenges
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 35 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + jest-expo + RNTL |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test -- --testPathPattern=challenge` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=challenge`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 35-01-01 | 01 | 1 | CHAL-01 | unit | `npm test -- --testPathPattern=challengeThemes` | ❌ W0 | ⬜ pending |
| 35-01-02 | 01 | 1 | CHAL-02 | unit | `npm test -- --testPathPattern=challengeService` | ❌ W0 | ⬜ pending |
| 35-01-03 | 01 | 1 | CHAL-03 | unit | `npm test -- --testPathPattern=challengeService` | ❌ W0 | ⬜ pending |
| 35-01-04 | 01 | 1 | CHAL-04 | unit | `npm test -- --testPathPattern=challengeService` | ❌ W0 | ⬜ pending |
| 35-02-01 | 02 | 1 | CHAL-05 | unit | `npm test -- --testPathPattern=badgeEvaluation` | Partial | ⬜ pending |
| 35-03-01 | 03 | 2 | CHAL-06 | unit | `npm test -- --testPathPattern=DailyChallengeCard` | ❌ W0 | ⬜ pending |
| 35-03-02 | 03 | 2 | CHAL-07 | unit | `npm test -- --testPathPattern=DailyChallengeCard` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/challenge/challengeService.test.ts` — stubs for CHAL-01, CHAL-02, CHAL-03, CHAL-04
- [ ] `src/__tests__/gamification/challengeBadges.test.ts` — stubs for CHAL-05
- [ ] `src/__tests__/components/home/DailyChallengeCard.test.tsx` — stubs for CHAL-06, CHAL-07
- [ ] `src/__tests__/store/challengeSlice.test.ts` — store migration and actions

*Existing infrastructure covers test framework and config.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Challenge card visual celebration state | CHAL-06 | Animation/visual verification | Complete a challenge, verify card shows green/gold celebration with results |
| No guilt messaging on missed day | CHAL-07 | UX tone verification | Skip a day, verify next day shows only new challenge with no "missed" text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
