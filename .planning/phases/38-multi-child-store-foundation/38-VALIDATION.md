---
phase: 38
slug: multi-child-store-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 38 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + jest-expo + React Native Testing Library |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<pattern>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | PROF-05 | unit | `npm test -- --testPathPattern=profiles` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PROF-06 | unit | `npm test -- --testPathPattern=profiles` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PROF-07 | unit | `npm test -- --testPathPattern=profiles` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PROF-08 | unit | `npm test -- --testPathPattern=profiles` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PROF-05 | unit | `npm test -- --testPathPattern=migration` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Migration test fixtures (fresh install, full v12 state, minimal v12 state)
- [ ] profilesSlice unit tests
- [ ] Grade-appropriate initialization tests

*Existing infrastructure covers test framework — only new test files needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Profile switcher sheet opens on avatar tap | PROF-05 | UI interaction | Tap avatar on home screen, verify sheet opens with profiles |
| Auto-save on app background | PROF-08 | AppState listener | Switch to another app, reopen, verify data persisted |
| Migration prompt on upgrade | PROF-05 | One-time flow | Clear storage, set v12 data, launch app, verify prompt appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
