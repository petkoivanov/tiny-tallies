---
phase: 84
slug: sequences-series-domain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 84 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo preset) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=sequencesSeries` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds (quick) / ~90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=sequencesSeries`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 84-01-01 | 01 | 0 | SEQ-01 | unit | `npm test -- --testPathPattern=sequencesSeries 2>&1 \| tail -20` | ❌ W0 | ⬜ pending |
| 84-01-02 | 01 | 0 | SEQ-01 | unit | `npm test -- --testPathPattern="domainHandlerRegistry\|prerequisiteGating\|wordProblems" 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 84-02-01 | 02 | 1 | SEQ-01 | unit | `npm run typecheck 2>&1 \| grep -c "error" \|\| echo "0 errors"` | ✅ | ⬜ pending |
| 84-02-02 | 02 | 1 | SEQ-01,02 | unit | `npm test -- --testPathPattern=sequencesSeries 2>&1 \| tail -30` | ❌ W0 | ⬜ pending |
| 84-02-03 | 02 | 1 | SEQ-01,02 | unit | `npm run typecheck 2>&1 \| tail -10 && npm test -- --testPathPattern="sequencesSeries\|domainHandlerRegistry" 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 84-03-01 | 03 | 2 | SEQ-03 | unit | `npm test -- --testPathPattern=wordProblems 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 84-03-02 | 03 | 2 | SEQ-04 | manual | `npm test -- --testPathPattern="sequencesSeries\|domainHandlerRegistry\|wordProblems\|prerequisiteGating" 2>&1 \| tail -10` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/mathEngine/sequencesSeries.test.ts` — RED test stubs for SEQ-01 through SEQ-04
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — operations count (20→21), skills count (165→170)
- [ ] Update `src/__tests__/mathEngine/prerequisiteGating.test.ts` — skills count (165→170)
- [ ] Update `src/__tests__/mathEngine/wordProblems.test.ts` — add `sequences_series` to ALL_OPERATIONS

*Existing jest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AI tutor hints ask about common difference/ratio without revealing formula | SEQ-04 | LLM output quality — automated test verifies prompt template only | Trigger arithmetic sequence problem, request 3 hints, verify none state "add d each time" as the answer |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
