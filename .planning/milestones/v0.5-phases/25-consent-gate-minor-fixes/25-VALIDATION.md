---
phase: 25
slug: consent-gate-minor-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7 + jest-expo 54.0.13 + @testing-library/react-native 13.3.3 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --testPathPattern=<pattern> --no-coverage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=<relevant-pattern> --no-coverage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | SAFE-06 | unit | `npx jest --testPathPattern="parentalPin" --no-coverage` | No — W0 | ⬜ pending |
| 25-01-02 | 01 | 1 | SAFE-06 | unit | `npx jest --testPathPattern="ConsentScreen" --no-coverage` | No — W0 | ⬜ pending |
| 25-01-03 | 01 | 1 | SAFE-06 | unit | `npx jest --testPathPattern="SessionScreen" --no-coverage` | ✅ exists (needs new cases) | ⬜ pending |
| 25-02-01 | 02 | 1 | SAFE-06 | unit | `npx jest --testPathPattern="SessionScreen" --no-coverage` | ✅ exists (needs new cases) | ⬜ pending |
| 25-02-02 | 02 | 1 | FIX-02 | unit | `npx jest --testPathPattern="SessionScreen" --no-coverage` | ✅ exists (needs new case) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/consent/__tests__/parentalPin.test.ts` — stubs for SAFE-06 PIN service
- [ ] `src/__tests__/screens/ConsentScreen.test.tsx` — stubs for SAFE-06 consent screen
- [ ] New test cases in `src/__tests__/screens/SessionScreen.test.tsx` — covers consent intercept, auto-fire, retry offline guard

*Existing infrastructure covers: appStore tests (STORE_VERSION already passing), useTutor tests (consent gate already tested).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Consent persists across app restarts | SAFE-06 | Requires real AsyncStorage persistence cycle | 1. Grant consent 2. Kill app 3. Relaunch 4. Tap Help — should work without re-consenting |
| Full E2E: child taps Help → consent → tutor responds | SAFE-06 | Requires Gemini API + real navigation + real SecureStore | 1. Fresh install 2. Start session 3. Tap Help 4. Complete consent flow 5. Verify tutor response appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
