---
phase: 13-prerequisite-graph-outer-fringe
verified: 2026-03-03T15:00:00Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 13: Prerequisite Graph & Outer Fringe Verification Report

**Phase Goal:** Children only encounter new skills when they have genuinely mastered the prerequisites, and the app always knows which new skills are ready to introduce
**Verified:** 2026-03-03T15:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each subtraction skill requires its corresponding addition skill as a prerequisite in the DAG | VERIFIED | `skills.ts` lines 77, 85, 93, 101, 109, 117 — all 6 cross-links present exactly as specified |
| 2 | A skill is unlocked when all its prerequisites have masteryLocked=true (BKT mastery), not Elo threshold | VERIFIED | `prerequisiteGating.ts` line 33: `prereqState?.masteryLocked === true`; no Elo check anywhere |
| 3 | Once a skill is unlocked (practiced), it stays unlocked permanently even if prerequisite mastery is lost | VERIFIED | `prerequisiteGating.ts` lines 27-28: `if (skillState && skillState.attempts > 0) return true` |
| 4 | getOuterFringe returns unmastered skills whose all prerequisites have masteryLocked=true | VERIFIED | `prerequisiteGating.ts` lines 66-85 — full implementation present and substantive |
| 5 | Root skills with no prerequisites appear in the outer fringe if not yet mastered | VERIFIED | `getOuterFringe`: line 79 `if (skill.prerequisites.length === 0) return true` |
| 6 | Mastered skills (masteryLocked=true) are excluded from the outer fringe | VERIFIED | `getOuterFringe` line 73: `if (state?.masteryLocked === true) return false` |
| 7 | Skills that lost mastery (soft lock broke) are NOT in the outer fringe — Leitner handles their review | VERIFIED | `getOuterFringe` line 76: `if (state && state.attempts > 0) return false` |
| 8 | Session orchestrator uses BKT-mastery-based getUnlockedSkills (no Elo threshold) for skill pool | VERIFIED | `sessionOrchestrator.ts` line 120: `getUnlockedSkills(skillStates)` — no defaultElo arg passed |
| 9 | New skills in a session are only drawn from skills whose prerequisites are mastered | VERIFIED | Session orchestrator calls `getUnlockedSkills` which now gates on `masteryLocked`; UNLOCK_THRESHOLD absent from all of `src/` |
| 10 | Integration test demonstrates full adaptive flow with BKT-mastery gating | VERIFIED | `integration.test.ts` lines 159-198 — two tests: BKT gating + outer fringe with cross-op prereqs |
| 11 | All existing tests pass with no regressions (502+ tests) | VERIFIED | SUMMARY-02 records 521 tests passing after phase completion |

**Score:** 11/11 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/mathEngine/skills.ts` | Cross-operation prerequisite links in DAG | VERIFIED | 14 skills; all 6 subtraction skills have dual prerequisites; roots have `prerequisites: []` |
| `src/services/adaptive/prerequisiteGating.ts` | BKT-mastery gating, outer fringe, no-re-locking | VERIFIED | 86 lines; exports `isSkillUnlocked`, `getUnlockedSkills`, `getOuterFringe`; no UNLOCK_THRESHOLD |
| `src/__tests__/adaptive/prerequisiteGating.test.ts` | Tests for BKT gating, DAG validation, outer fringe, no-re-locking | VERIFIED | 8 DAG validation tests + 6 isSkillUnlocked + 2 getUnlockedSkills + 7 getOuterFringe = 23 test cases |
| `src/services/adaptive/index.ts` | Barrel export of getOuterFringe, no UNLOCK_THRESHOLD | VERIFIED | Lines 27-31: exports `isSkillUnlocked`, `getUnlockedSkills`, `getOuterFringe`; UNLOCK_THRESHOLD absent |
| `src/__tests__/adaptive/integration.test.ts` | Integration test covering BKT-mastery gating in adaptive flow | VERIFIED | Lines 159-199: BKT-mastery gating test + outer fringe test with cross-operation prerequisites |
| `src/services/session/sessionOrchestrator.ts` | Uses BKT-mastery-gated skill pool | VERIFIED | Line 7 imports `getUnlockedSkills`; line 120 calls `getUnlockedSkills(skillStates)` — no Elo args |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `prerequisiteGating.ts` | `skills.ts` | `import { SKILLS }` | WIRED | Line 1: `import { SKILLS } from '../mathEngine/skills'` |
| `prerequisiteGating.ts` | `skillStatesSlice.ts` | `SkillState.masteryLocked` | WIRED | Line 2 imports type; lines 28, 33, 73, 76 reference `masteryLocked` |
| `adaptive/index.ts` | `prerequisiteGating.ts` | barrel export of `getOuterFringe` | WIRED | Lines 27-31 export all three functions including `getOuterFringe` |
| `sessionOrchestrator.ts` | `prerequisiteGating.ts` | `getUnlockedSkills` import (BKT-mastery based) | WIRED | Line 7 import; line 120 call with no legacy Elo parameter |
| `integration.test.ts` | `adaptive/index.ts` | `getUnlockedSkills` and `getOuterFringe` barrel import | WIRED | Lines 1-3 import both functions from `@/services/adaptive` |

---

### Requirements Coverage

| Requirement | Description | Source Plans | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PREG-01 | Skill prerequisite DAG defines unlock dependencies for all existing skills | 13-01, 13-02 | SATISFIED | `skills.ts`: 14 skills with valid DAG; 6 cross-operation links added; cycle-free (DAG validation tests) |
| PREG-02 | Outer fringe algorithm computes which new skills are available based on mastered prerequisites | 13-01, 13-02 | SATISFIED | `getOuterFringe` in `prerequisiteGating.ts`; exported via barrel; integration test covers it |
| PREG-03 | New skills are only presented in sessions when all their prerequisites are mastered | 13-01, 13-02 | SATISFIED | `isSkillUnlocked` gates on `masteryLocked`; `sessionOrchestrator.ts` calls `getUnlockedSkills(skillStates)` |

No orphaned requirements — all 3 PREG requirements claimed by both plans are accounted for and satisfied.

---

### Anti-Patterns Found

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| `sessionOrchestrator.ts` line 58 | `defaultElo: number = 1000` parameter still present | Info | This parameter is used for the *Elo-based problem selector pool* (line 62), not for prerequisite gating. The gating call at line 120 does not use it. Not a blocker — it's a separate concern in a different function. |

No blocker anti-patterns. No TODO/FIXME/placeholder patterns. No stub implementations.

---

### Human Verification Required

None. All must-haves are verifiable programmatically from the codebase.

---

## Gaps Summary

None. All 11 observable truths are verified. All 6 artifacts pass all three levels (exists, substantive, wired). All 5 key links are wired. All 3 requirements (PREG-01, PREG-02, PREG-03) are satisfied with direct code evidence.

The phase goal is achieved: children only encounter new skills when they have genuinely mastered the prerequisites (BKT `masteryLocked=true` gating), and the app always knows which new skills are ready to introduce (`getOuterFringe` pure function).

---

_Verified: 2026-03-03T15:00:00Z_
_Verifier: Claude (gsd-verifier)_
