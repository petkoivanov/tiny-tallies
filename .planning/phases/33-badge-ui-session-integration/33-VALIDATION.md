---
phase: 33
slug: badge-ui-session-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 33 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo |
| **Config file** | `jest.config.js` (existing) |
| **Quick run command** | `npm test -- --testPathPattern="badge\|Badge\|Results\|Home\|useSession"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="badge|Badge|Results|Home|useSession"`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 33-01-01 | 01 | 1 | ACHV-06 | unit | `npm test -- --testPathPattern=BadgeUnlockPopup` | ❌ W0 | ⬜ pending |
| 33-01-02 | 01 | 1 | ACHV-07 | unit | `npm test -- --testPathPattern=BadgeCollection` | ❌ W0 | ⬜ pending |
| 33-02-01 | 02 | 2 | ACHV-04, ACHV-05 | integration | `npm test -- --testPathPattern=useSession` | ✅ partial | ⬜ pending |
| 33-02-02 | 02 | 2 | ACHV-06, ACHV-08 | unit | `npm test -- --testPathPattern=ResultsScreen` | ✅ partial | ⬜ pending |
| 33-02-03 | 02 | 2 | HOME | unit | `npm test -- --testPathPattern=HomeScreen` | ✅ partial | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/components/BadgeUnlockPopup.test.tsx` — stubs for ACHV-06 (popup render, sequential dismiss)
- [ ] `src/__tests__/screens/BadgeCollectionScreen.test.tsx` — stubs for ACHV-07 (grid, sections, detail overlay)
- [ ] `src/__tests__/components/BadgesSummary.test.tsx` — stubs for ACHV-08 (results badge section)
- [ ] New test cases in `src/__tests__/screens/ResultsScreen.test.tsx` — covers ACHV-06/ACHV-08
- [ ] New test cases in `src/__tests__/screens/HomeScreen.test.tsx` — covers HOME badge count

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge popup animation visual quality | ACHV-06 | Reanimated animations are mocked in tests | Run app, earn a badge, verify scale+glow animation |
| Locked badge dimmed appearance | ACHV-07 | Visual opacity verification | Open badge collection, check locked badges look dimmed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
