---
phase: 088
slug: polynomial-operations-domain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 088 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern=polynomials` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=polynomials`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 088-01-01 | 01 | 0 | POLY-01 | unit | `npm test -- --testPathPattern=polynomials` | W0 | pending |
| 088-01-02 | 01 | 0 | POLY-01 | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | exists | pending |
| 088-02-01 | 02 | 1 | POLY-01,POLY-02 | unit | `npm test -- --testPathPattern=polynomials` | W0 | pending |
| 088-02-02 | 02 | 1 | POLY-02 | unit | `npm test -- --testPathPattern=polynomials` | W0 | pending |
| 088-03-01 | 03 | 2 | POLY-03 | unit | `npm test -- --testPathPattern=wordProblems` | exists | pending |
| 088-03-02 | 03 | 2 | POLY-04 | manual | AI tutor QA | N/A | pending |

---

## Wave 0 Requirements

- [ ] `src/__tests__/mathEngine/polynomials.test.ts` — stubs for POLY-01, POLY-02
- [ ] Update `domainHandlerRegistry.test.ts` — new operation/skill counts
- [ ] Update `prerequisiteGating.test.ts` — new skill count
- [ ] Update `wordProblems.test.ts` — add polynomials to ALL_OPERATIONS

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expression MC labels render correctly | POLY-02 | UI rendering | Run app, navigate to factoring problem, verify expression options display |
| AI tutor hints for factoring | POLY-04 | LLM behavior | Trigger HINT mode on polynomial factoring problem |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
