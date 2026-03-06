---
phase: 39
slug: profile-management-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 39 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo + React Native Testing Library |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<changed_file_pattern>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 39-01-01 | 01 | 1 | STORE | unit | `npm test -- --testPathPattern=profilesSlice` | No - W0 | pending |
| 39-01-02 | 01 | 1 | PROF-01 | unit | `npm test -- --testPathPattern=ProfileSwitcherSheet` | No - W0 | pending |
| 39-01-03 | 01 | 1 | PROF-01 | unit | `npm test -- --testPathPattern=PinGate` | No - W0 | pending |
| 39-02-01 | 02 | 2 | PROF-02 | unit | `npm test -- --testPathPattern=ProfileCreationWizard` | No - W0 | pending |
| 39-02-02 | 02 | 2 | PROF-02 | unit | `npm test -- --testPathPattern=ProfileSetupScreen` | No - W0 | pending |
| 39-03-01 | 03 | 3 | PROF-03 | unit | `npm test -- --testPathPattern=ProfileManagement` | No - W0 | pending |
| 39-03-02 | 03 | 3 | PROF-04 | unit | `npm test -- --testPathPattern=ProfileManagement` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/components/profile/ProfileSwitcherSheet.test.tsx` — stubs for PROF-01
- [ ] `src/__tests__/components/profile/ProfileCreationWizard.test.tsx` — stubs for PROF-02
- [ ] `src/__tests__/components/profile/PinGate.test.tsx` — stubs for PIN verification
- [ ] `src/__tests__/screens/ProfileManagementScreen.test.tsx` — stubs for PROF-02, PROF-03, PROF-04
- [ ] `src/__tests__/screens/ProfileSetupScreen.test.tsx` — stubs for first-run flow
- [ ] `src/__tests__/store/profilesSlice.test.ts` — extend with updateChild tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Profile switcher bottom sheet animation | PROF-01 | Visual/animation quality | Open home screen, tap avatar, verify sheet slides up smoothly |
| PIN number pad tactile feedback | PROF-02 | Haptic/visual feedback | Tap PIN digits, verify visual press states |
| Navigation reset after first profile | PROF-02 | Navigation stack state | Create first profile, verify no back button to setup |
| Delete confirmation dialog UX | PROF-04 | Dialog interaction feel | Delete profile, verify name-typing confirmation works |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
