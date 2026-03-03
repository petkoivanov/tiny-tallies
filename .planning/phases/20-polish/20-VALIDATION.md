---
phase: 20
slug: polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7 + jest-expo 54 + React Native Testing Library 13.3 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<changed_file>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 35 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | POL-01, POL-02 | unit | `npm test -- --testPathPattern="useActionHistory\|guidedSteps"` | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 1 | POL-02 | unit | `npm test -- --testPathPattern=ManipulativeShell` | ✅ | ⬜ pending |
| 20-01-03 | 01 | 1 | POL-01 | unit | `npm test -- --testPathPattern=GuidedHighlight` | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 2 | POL-01, POL-02 | unit + typecheck | `npm run typecheck && npm test -- --testPathPattern="Counters\|TenFrame\|BaseTenBlocks\|NumberLine\|FractionStrips\|BarModel"` | ✅ | ⬜ pending |
| 20-02-02 | 02 | 2 | POL-01 | unit | `npm test -- --testPathPattern=CpaSessionContent` | ✅ | ⬜ pending |
| 20-03-01 | 03 | 3 | POL-04 | unit | `npm test -- --testPathPattern="TenFrame\|CpaSessionContent\|SandboxScreen"` | ❌ W0 | ⬜ pending |
| 20-03-02 | 03 | 3 | POL-03 | unit | `npm test -- --testPathPattern="CountersGrid\|Counters"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/manipulatives/useActionHistory.test.ts` — stubs for POL-02 (undo hook logic)
- [ ] `src/__tests__/manipulatives/GuidedHighlight.test.tsx` — stubs for POL-01 (guided highlight rendering)
- [ ] `src/__tests__/cpa/guidedSteps.test.ts` — stubs for POL-01 (step lookup table)
- [ ] `src/__tests__/manipulatives/CountersGrid.test.tsx` — stubs for POL-03 (grid computation + rendering)
- [ ] `src/__tests__/manipulatives/TenFrame.test.tsx` — stubs for POL-04 (initialFrames prop)
- [ ] Extension to existing ManipulativeShell tests — covers POL-02 undo button

*Existing infrastructure covers test framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pulsing glow animation is visible and smooth on actual target zone/item | POL-01 | Animation visual quality is subjective | Trigger guided mode in concrete CPA, verify glow pulses smoothly on the target SnapZone/cell/counter inside the manipulative |
| Undo reverse animation plays correctly | POL-02 | Animation direction and feel is visual | Perform action then undo, verify item animates back to previous position |
| Counter grid/free toggle animation is smooth | POL-03 | Animation smoothness is device-dependent | Toggle grid/free mode, verify counters animate to/from grid positions |
| Guided hints don't block manipulative gestures | POL-01 | Gesture interaction is device-dependent | With guided mode active, verify child can still freely interact with non-highlighted areas |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 35s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
