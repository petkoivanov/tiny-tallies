---
phase: 31
slug: pre-work-screen-refactoring
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + jest-expo + React Native Testing Library |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test -- --testPathPattern=SessionScreen` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=SessionScreen`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | PREP-01 | unit | `npm test -- --testPathPattern=SessionScreen` | ✅ | ⬜ pending |
| 31-01-02 | 01 | 1 | PREP-01 | unit | `npm test -- --testPathPattern=useChatOrchestration` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. SessionScreen test suite (40+ tests) serves as regression safety net. New hook tests will be created during extraction.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SessionScreen line count < 500 | PREP-01 | Line count check | Run `wc -l src/screens/SessionScreen.tsx` |

*All behavioral verification is automated through existing test suite.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
