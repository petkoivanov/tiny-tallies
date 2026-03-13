---
phase: 089
slug: exponential-functions-domain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 089 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern=exponentialFunctions` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=exponentialFunctions`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 089-01-01 | 01 | 0 | EXP-01 | unit | `npm test -- --testPathPattern=exponentialFunctions` | W0 | pending |
| 089-01-02 | 01 | 0 | EXP-01 | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | exists | pending |
| 089-02-01 | 02 | 1 | EXP-01,EXP-02 | unit | `npm test -- --testPathPattern=exponentialFunctions` | W0 | pending |
| 089-02-02 | 02 | 1 | EXP-02 | unit | `npm test` | exists | pending |
| 089-03-01 | 03 | 2 | EXP-03 | unit | `npm test -- --testPathPattern=wordProblems` | exists | pending |
| 089-03-02 | 03 | 2 | EXP-04 | manual | AI tutor QA | N/A | pending |

---

## Wave 0 Requirements

- [ ] `src/__tests__/mathEngine/exponentialFunctions.test.ts` — stubs for EXP-01, EXP-02
- [ ] Update `domainHandlerRegistry.test.ts` — new operation/skill counts
- [ ] Update `prerequisiteGating.test.ts` — new skill count
- [ ] Update `wordProblems.test.ts` — add exponential_functions to ALL_OPERATIONS

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Growth/decay MC renders correctly | EXP-02 | UI rendering | Run app, navigate to growth factor problem |
| AI tutor hints for exponential reasoning | EXP-04 | LLM behavior | Trigger HINT mode on exponential problem |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
