---
phase: 85
slug: statistics-extensions-domain
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 85 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo preset) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=statisticsHs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds (quick) / ~90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=statisticsHs`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 85-01-01 | 01 | 0 | STATS-01 | unit | `npm test -- --testPathPattern=statisticsHs 2>&1 \| tail -20` | ❌ W0 | ⬜ pending |
| 85-01-02 | 01 | 0 | STATS-01 | unit | `npm test -- --testPathPattern="domainHandlerRegistry\|prerequisiteGating\|wordProblems" 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 85-02-01 | 02 | 1 | STATS-01 | unit | `npm run typecheck 2>&1 \| grep -c "error" \|\| echo "0 errors"` | ✅ | ⬜ pending |
| 85-02-02 | 02 | 1 | STATS-01,02 | unit | `npm test -- --testPathPattern=statisticsHs 2>&1 \| tail -30` | ❌ W0 | ⬜ pending |
| 85-02-03 | 02 | 1 | STATS-01,02 | unit | `npm run typecheck 2>&1 \| tail -10 && npm test -- --testPathPattern="statisticsHs\|domainHandlerRegistry" 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 85-03-01 | 03 | 2 | STATS-03 | unit | `npm test -- --testPathPattern=wordProblems 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 85-03-02 | 03 | 2 | STATS-04 | manual | `npm test -- --testPathPattern="statisticsHs\|domainHandlerRegistry\|wordProblems\|prerequisiteGating" 2>&1 \| tail -10` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/mathEngine/statisticsHs.test.ts` — RED test stubs for STATS-01 through STATS-04
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — operations count (21→22), skills count (170→175)
- [ ] Update `src/__tests__/adaptive/prerequisiteGating.test.ts` — skills count (170→175)
- [ ] Update `src/__tests__/mathEngine/wordProblems.test.ts` — add `statistics_hs` to ALL_OPERATIONS

*Existing jest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AI tutor hints distinguish conceptual questions (normal distribution properties) from computational ones (z-score calculation) in their framing | STATS-04 | LLM output quality — automated test verifies prompt template only | Trigger a z-score problem and a normal distribution property problem, request 3 hints each, verify conceptual hints ask "what does the bell curve tell you?" while computational hints ask about the formula structure |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-13
