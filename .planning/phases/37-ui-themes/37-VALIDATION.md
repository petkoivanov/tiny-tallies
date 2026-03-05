---
phase: 37
slug: ui-themes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 37 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + jest-expo + React Native Testing Library |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<pattern>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 37-01-01 | 01 | 1 | THME-01, THME-02 | unit | `npm test -- --testPathPattern=theme` | No - W0 | pending |
| 37-01-02 | 01 | 1 | THME-01 | unit | `npm test -- --testPathPattern=ThemeProvider` | No - W0 | pending |
| 37-01-03 | 01 | 1 | THME-05 | unit | `npm test -- --testPathPattern=themes` | No - W0 | pending |
| 37-01-04 | 01 | 1 | THME-01 | unit | `npm test -- --testPathPattern=theme` | No - W0 | pending |
| 37-02-01 | 02 | 2 | THME-03 | unit | `npm test -- --testPathPattern=SessionWrapper` | No - W0 | pending |
| 37-02-02 | 02 | 2 | THME-04 | unit | `npm test -- --testPathPattern=ThemePickerScreen` | No - W0 | pending |
| 37-02-03 | 02 | 2 | THME-05 | unit | `npm test -- --testPathPattern=themes` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/gamification/themeDefinitions.test.ts` — stubs for THME-02, THME-05
- [ ] `src/__tests__/components/ThemeProvider.test.tsx` — stubs for THME-01
- [ ] `src/__tests__/components/SessionWrapper.test.tsx` — stubs for THME-03
- [ ] `src/__tests__/screens/ThemePickerScreen.test.tsx` — stubs for THME-04
- [ ] `src/__tests__/store/themeIdMigration.test.ts` — stubs for store migration v12

*Existing infrastructure covers test framework — only test files need creation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme visual appearance matches intended palette | THME-02 | Aesthetic color judgment | Switch each theme, verify colors feel distinct and cohesive |
| Session wrapper animations are subtle/non-distracting | THME-03 | Subjective UX evaluation | Play a 5-problem session with each theme, verify animations don't pull attention from math |
| Theme picker preview gives representative snapshot | THME-04 | Visual fidelity judgment | Open picker, verify each theme preview looks like the actual theme |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
