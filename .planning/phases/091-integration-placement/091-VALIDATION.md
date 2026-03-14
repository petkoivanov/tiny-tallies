---
phase: 091
slug: integration-placement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 091 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern="placement\|prerequisite\|skillMap"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command
- **After every plan wave:** Run full suite
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 091-01-01 | 01 | 1 | INT-01 | unit | `npm test -- --testPathPattern=placement` | exists | pending |
| 091-01-02 | 01 | 1 | INT-02 | unit | `npm test -- --testPathPattern=prerequisite` | exists | pending |
| 091-02-01 | 02 | 2 | INT-03 | manual | Skill map visual check | N/A | pending |
| 091-02-02 | 02 | 2 | INT-04 | unit | `npm test -- --testPathPattern=migration` | W0 | pending |
| 091-02-03 | 02 | 2 | INT-05 | unit | `npm test -- --testPathPattern=problemIntro` | exists | pending |

---

## Wave 0 Requirements

- [ ] Migration test for v23->v24 store migration
- [ ] Existing placement/prerequisite tests cover INT-01/INT-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skill map renders 27 domains without overflow | INT-03 | Visual layout | Run app, open skill map, verify no node collisions |
| Re-assessment banner shows for grade-8 users | INT-04 | UI state | Create user at grade 8, verify banner appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
