---
phase: 32
slug: achievement-system-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo |
| **Config file** | `jest.config.js` (existing) |
| **Quick run command** | `npm test -- --testPathPattern=achievement\|migrations\|gamification` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=achievement\|migrations\|gamification`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | ACHV-01 | unit | `npm test -- --testPathPattern=badgeRegistry` | ❌ W0 | ⬜ pending |
| 32-01-02 | 01 | 1 | ACHV-02 | unit | `npm test -- --testPathPattern=badgeEvaluation` | ❌ W0 | ⬜ pending |
| 32-01-03 | 01 | 1 | ACHV-03 | unit | `npm test -- --testPathPattern=achievementSlice` | ❌ W0 | ⬜ pending |
| 32-01-04 | 01 | 1 | ACHV-03 | unit | `npm test -- --testPathPattern=migrations` | Partially | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/achievement/badgeRegistry.test.ts` — stubs for ACHV-01 (catalog validation, unique IDs, valid skillId refs)
- [ ] `src/__tests__/achievement/badgeEvaluation.test.ts` — stubs for ACHV-02 (engine logic, skip already-earned, condition types)
- [ ] `src/__tests__/store/achievementSlice.test.ts` — stubs for ACHV-03 (slice actions, persistence)

*Existing test infrastructure covers migration tests partially — new v8→v9 migration tests needed.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
