---
phase: 28
slug: session-mix-adaptation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo |
| **Config file** | `jest.config.js` (existing) |
| **Quick run command** | `npm test -- --testPathPattern=practiceMix` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=practiceMix`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 28-01-01 | 01 | 1 | INTV-01a | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests | ⬜ pending |
| 28-01-02 | 01 | 1 | INTV-01b | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests | ⬜ pending |
| 28-01-03 | 01 | 1 | INTV-01c | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests | ⬜ pending |
| 28-01-04 | 01 | 1 | INTV-01d | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests | ⬜ pending |
| 28-01-05 | 01 | 1 | INTV-01e | unit | `npm test -- --testPathPattern=practiceMix` | Existing tests | ⬜ pending |
| 28-01-06 | 01 | 1 | INTV-01f | unit | `npm test -- --testPathPattern=sessionOrchestrator` | Needs new tests | ⬜ pending |
| 28-01-07 | 01 | 1 | INTV-01g | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests | ⬜ pending |
| 28-01-08 | 01 | 1 | INTV-01h | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

New tests are added to existing test files (`practiceMix.test.ts`, `sessionOrchestrator.test.ts`), not new files. No new test framework configuration needed.

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
