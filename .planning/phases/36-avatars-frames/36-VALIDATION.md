---
phase: 36
slug: avatars-frames
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 36 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo + React Native Testing Library |
| **Config file** | jest.config.js (existing) |
| **Quick run command** | `npm test -- --testPathPattern=avatar` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=avatar`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 36-01-01 | 01 | 1 | AVTR-01 | unit | `npm test -- --testPathPattern=avatars` | No - W0 | pending |
| 36-01-02 | 01 | 1 | AVTR-02 | unit | `npm test -- --testPathPattern=avatars` | No - W0 | pending |
| 36-01-03 | 01 | 1 | AVTR-03 | unit | `npm test -- --testPathPattern=avatars` | No - W0 | pending |
| 36-02-01 | 02 | 2 | AVTR-04 | unit | `npm test -- --testPathPattern=AvatarPicker` | No - W0 | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/store/constants/avatars.test.ts` — stubs for AVTR-01, AVTR-02, AVTR-03 (constants + unlock logic)
- [ ] `src/__tests__/screens/AvatarPickerScreen.test.tsx` — stubs for AVTR-04
- [ ] `src/__tests__/store/migrations.test.ts` — add migration v10->v11 test case (file exists, add case)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sparkle animation renders on special avatars | AVTR-02 | Visual animation quality | Equip special avatar, verify sparkle plays on HomeScreen |
| Frame border renders correctly around avatar | AVTR-03 | Visual rendering | Equip frame, verify colored border on HomeScreen |
| Emoji rendering cross-platform | AVTR-01 | Platform-specific emoji fonts | Check avatar emoji on Android + iOS |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
