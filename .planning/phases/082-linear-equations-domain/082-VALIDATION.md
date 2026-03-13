---
phase: 82
slug: linear-equations-domain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 82 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo preset) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=linearEquations` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds (quick) / ~90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=linearEquations`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 82-01-01 | 01 | 0 | LIN-01 | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | ✅ | ⬜ pending |
| 82-01-02 | 01 | 1 | LIN-01 | unit | `npm test -- --testPathPattern=linearEquations` | ❌ W0 | ⬜ pending |
| 82-02-01 | 02 | 1 | LIN-02 | unit | `npm test -- --testPathPattern=linearEquations` | ❌ W0 | ⬜ pending |
| 82-03-01 | 03 | 1 | LIN-03 | unit | `npm test -- --testPathPattern=linearEquations` | ❌ W0 | ⬜ pending |
| 82-04-01 | 04 | 2 | LIN-04 | unit | `npm test -- --testPathPattern=linearEquations` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/mathEngine/domains/linearEquations/__tests__/linearEquations.test.ts` — test stubs for LIN-01 through LIN-04
- [ ] Update `src/services/mathEngine/__tests__/domainHandlerRegistry.test.ts` — update hardcoded counts (18→19 operations, 151→159 skills)

*Existing jest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AI tutor hints never reveal the solution step | LIN-04 | LLM prompt quality — automated test can only check prompt template, not LLM output | Open tutor for a linear equation, request 3 hints, verify none state "x = [answer]" directly |
| Word problem reading level calibration | LIN-03 | Readability scoring relies on prose judgment | Review 3 age/distance/money word problems and confirm grade 8-9 appropriate language |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
