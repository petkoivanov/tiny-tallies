---
phase: 19
slug: sandbox-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7 + jest-expo 54 + React Native Testing Library 13.3 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<changed_file>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | SAND-01 | unit | `npm test -- --testPathPattern=sandboxSlice` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | SAND-01 | unit | `npm test -- --testPathPattern=SandboxScreen` | ❌ W0 | ⬜ pending |
| 19-01-03 | 01 | 1 | SAND-02 | unit | `npm test -- --testPathPattern=SandboxScreen` | ❌ W0 | ⬜ pending |
| 19-01-04 | 01 | 1 | SAND-03 | unit | `npm test -- --testPathPattern=SandboxScreen` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 1 | SAND-01 | unit | `npm test -- --testPathPattern=HomeScreen` | ✅ | ⬜ pending |
| 19-02-02 | 02 | 1 | SAND-01 | unit | `npm test -- --testPathPattern=ExploreGrid` | ❌ W0 | ⬜ pending |
| 19-02-03 | 02 | 1 | SAND-01 | unit | `npm test -- --testPathPattern=ExploreCard` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/store/sandboxSlice.test.ts` — stubs for SAND-01 (explored tracking)
- [ ] `src/__tests__/screens/SandboxScreen.test.tsx` — stubs for SAND-01, SAND-02, SAND-03
- [ ] Extension to `src/__tests__/screens/HomeScreen.test.tsx` — covers Explore grid rendering
- [ ] `src/__tests__/components/home/ExploreGrid.test.tsx` — covers grid layout and navigation
- [ ] `src/__tests__/components/home/ExploreCard.test.tsx` — covers card press and new dot

*Existing infrastructure covers test framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card scale press animation feels responsive | SAND-01 | Animation smoothness is visual/subjective | Tap each card, verify scale-down feedback is visible and snappy |
| Tooltip auto-dismisses after 3 seconds | SAND-02 | Timing-sensitive animation behavior | Open each manipulative for the first time, verify tooltip appears and fades after ~3s |
| Manipulative gestures work in sandbox | SAND-02 | Gesture handler integration is device-dependent | Interact with each manipulative in sandbox, verify drag/tap gestures respond |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
