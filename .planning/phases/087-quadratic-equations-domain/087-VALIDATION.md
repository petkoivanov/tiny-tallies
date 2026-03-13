---
phase: 087
slug: quadratic-equations-domain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 087 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern=quadraticEquations` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=quadraticEquations`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 087-01-01 | 01 | 0 | QUAD-01 | unit | `npm test -- --testPathPattern=quadraticEquations` | ❌ W0 | ⬜ pending |
| 087-01-02 | 01 | 0 | QUAD-01 | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | ✅ | ⬜ pending |
| 087-02-01 | 02 | 1 | QUAD-01,QUAD-02 | unit | `npm test -- --testPathPattern=quadraticEquations` | ❌ W0 | ⬜ pending |
| 087-02-02 | 02 | 1 | QUAD-03 | unit | `npm test -- --testPathPattern=quadraticEquations` | ❌ W0 | ⬜ pending |
| 087-03-01 | 03 | 2 | QUAD-04 | unit | `npm test -- --testPathPattern=wordProblems` | ✅ | ⬜ pending |
| 087-03-02 | 03 | 2 | QUAD-05 | manual | AI tutor QA | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/mathEngine/quadraticEquations.test.ts` — stubs for QUAD-01, QUAD-02, QUAD-03
- [ ] Update `domainHandlerRegistry.test.ts` — new operation/skill counts
- [ ] Update `prerequisiteGating.test.ts` — new skill count
- [ ] Update `wordProblems.test.ts` — add quadratic_equations to ALL_OPERATIONS

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MultiSelectMC renders checkboxes for two-root problems | QUAD-02 | UI rendering requires device | Run app, navigate to quadratic problem, verify checkboxes |
| AI tutor BOOST shows both roots, HINT doesn't leak | QUAD-05 | LLM behavior | Trigger BOOST/HINT mode on quadratic problem |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
